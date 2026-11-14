import { db, now, today } from "./index";

/* Everything the app asks of storage, in one place.
 *
 * The screens never see SQL. That is not tidiness: it is what makes the
 * driver swappable when this stops running on one laptop.
 */

export type Stage = "saved" | "applied" | "replied" | "interview" | "closed";

export type Fact = {
  id: number; kind: string; term: string; label: string;
  proof: string; source: string; active: boolean;
};

export type StoredJob = {
  id: string; company: string; companySlug: string; title: string;
  titleKey: string; locations: string[]; remote: boolean; hybrid: boolean;
  pay: unknown | null; requirements: string[];
  postedAt: string | null; firstSeen: string;
  sources: { ats: string; url: string }[];
};

/* ---- the user ------------------------------------------------------- */

export function ensureUser(id: string, email: string, name: string) {
  db()
    .prepare(
      `INSERT INTO users (id, email, name, created_at) VALUES (?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET email = excluded.email, name = excluded.name`
    )
    .run(id, email, name, now());
  return id;
}

/* ---- what we know about you ----------------------------------------- */

export function facts(userId: string, onlyActive = true): Fact[] {
  const rows = db()
    .prepare(
      `SELECT id, kind, term, label, proof, source, active FROM facts
        WHERE user_id = ? ${onlyActive ? "AND active = 1" : ""}
        ORDER BY kind, id`
    )
    .all(userId) as Record<string, unknown>[];
  return rows.map((r) => ({ ...r, active: r.active === 1 }) as Fact);
}

export function addFact(userId: string, f: Omit<Fact, "id" | "active">) {
  db()
    .prepare(
      `INSERT INTO facts (user_id, kind, term, label, proof, source, active, created_at)
       VALUES (?, ?, ?, ?, ?, ?, 1, ?)`
    )
    .run(userId, f.kind, f.term, f.label, f.proof, f.source, now());
}

export function setFactActive(userId: string, id: number, active: boolean) {
  db()
    .prepare(`UPDATE facts SET active = ? WHERE id = ? AND user_id = ?`)
    .run(active ? 1 : 0, id, userId);
}

/* ---- what you are looking for --------------------------------------- */

export function prefs(userId: string): Record<string, string[]> {
  const rows = db()
    .prepare(`SELECT category, value FROM prefs WHERE user_id = ?`)
    .all(userId) as { category: string; value: string }[];
  const out: Record<string, string[]> = {};
  for (const r of rows) (out[r.category] ??= []).push(r.value);
  return out;
}

export function togglePref(userId: string, category: string, value: string, on: boolean) {
  if (on) {
    db()
      .prepare(`INSERT OR IGNORE INTO prefs (user_id, category, value) VALUES (?, ?, ?)`)
      .run(userId, category, value);
  } else {
    db()
      .prepare(`DELETE FROM prefs WHERE user_id = ? AND category = ? AND value = ?`)
      .run(userId, category, value);
  }
}

export function setting(userId: string, key: string): string | null {
  const row = db()
    .prepare(`SELECT value FROM settings WHERE user_id = ? AND key = ?`)
    .get(userId, key) as { value: string } | undefined;
  return row?.value ?? null;
}

export function setSetting(userId: string, key: string, value: string | null) {
  db()
    .prepare(
      `INSERT INTO settings (user_id, key, value) VALUES (?, ?, ?)
       ON CONFLICT(user_id, key) DO UPDATE SET value = excluded.value`
    )
    .run(userId, key, value);
}

/* ---- jobs ------------------------------------------------------------ */

function hydrate(r: Record<string, unknown>): StoredJob {
  return {
    id: r.id as string,
    company: r.company as string,
    companySlug: r.company_slug as string,
    title: r.title as string,
    titleKey: r.title_key as string,
    locations: JSON.parse((r.locations as string) || "[]"),
    remote: r.remote === 1,
    hybrid: r.hybrid === 1,
    pay: r.pay ? JSON.parse(r.pay as string) : null,
    requirements: JSON.parse((r.requirements as string) || "[]"),
    postedAt: (r.posted_at as string) ?? null,
    firstSeen: r.first_seen as string,
    sources: [],
  };
}

/* Jobs still on offer.
 *
 * The table accumulates: a job stays after it vanishes from its feed,
 * which is right, because an application still points at it. But a role
 * nobody has seen in days is probably filled, and putting it in front of
 * someone as this morning's work wastes their morning.
 *
 * last_seen moves on every ingest run, so staleness is measured rather
 * than guessed. Seven days is two missed runs plus room for a feed
 * hiccup, so a job does not vanish because one fetch timed out. */
const STALE_DAYS = 7;

export function allJobs(): StoredJob[] {
  const cutoff = new Date(Date.now() - STALE_DAYS * 86_400_000).toISOString();
  const rows = db()
    .prepare(`SELECT * FROM jobs WHERE last_seen >= ?`)
    .all(cutoff) as Record<string, unknown>[];
  const jobs = rows.map(hydrate);
  const srcs = db()
    .prepare(`SELECT job_id, ats, url FROM job_sources`)
    .all() as { job_id: string; ats: string; url: string }[];
  const byJob = new Map<string, { ats: string; url: string }[]>();
  for (const s of srcs) {
    const list = byJob.get(s.job_id) ?? [];
    list.push({ ats: s.ats, url: s.url });
    byJob.set(s.job_id, list);
  }
  for (const j of jobs) j.sources = byJob.get(j.id) ?? [];
  return jobs;
}

export function job(id: string): StoredJob | null {
  const r = db().prepare(`SELECT * FROM jobs WHERE id = ?`).get(id) as
    | Record<string, unknown>
    | undefined;
  if (!r) return null;
  const j = hydrate(r);
  j.sources = db()
    .prepare(`SELECT ats, url FROM job_sources WHERE job_id = ?`)
    .all(id) as { ats: string; url: string }[];
  return j;
}

/* An ingest run upserts. first_seen survives so "posted 2 days ago"
   keeps meaning it; last_seen moves so a job that stops appearing in
   the feed can be noticed later. */
export function upsertJob(j: StoredJob) {
  const t = now();
  db()
    .prepare(
      `INSERT INTO jobs (id, company, company_slug, title, title_key, locations,
                         remote, hybrid, pay, requirements, posted_at, first_seen, last_seen)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(company_slug, title_key) DO UPDATE SET
         title = excluded.title,
         locations = excluded.locations,
         remote = excluded.remote,
         hybrid = excluded.hybrid,
         pay = COALESCE(excluded.pay, jobs.pay),
         requirements = CASE
           WHEN json_array_length(excluded.requirements) > 0
           THEN excluded.requirements ELSE jobs.requirements END,
         posted_at = COALESCE(jobs.posted_at, excluded.posted_at),
         last_seen = excluded.last_seen`
    )
    .run(
      j.id, j.company, j.companySlug, j.title, j.titleKey,
      JSON.stringify(j.locations), j.remote ? 1 : 0, j.hybrid ? 1 : 0,
      j.pay ? JSON.stringify(j.pay) : null, JSON.stringify(j.requirements),
      j.postedAt, j.firstSeen || t, t
    );

  const row = db()
    .prepare(`SELECT id FROM jobs WHERE company_slug = ? AND title_key = ?`)
    .get(j.companySlug, j.titleKey) as { id: string };

  for (const s of j.sources) {
    db()
      .prepare(`INSERT OR IGNORE INTO job_sources (job_id, ats, url) VALUES (?, ?, ?)`)
      .run(row.id, s.ats, s.url);
  }
  return row.id;
}

/* ---- what you did about them ----------------------------------------- */

export type Application = {
  id: number; jobId: string; stage: Stage; closedWhy: string | null;
  createdAt: string; updatedAt: string;
};

export function applications(userId: string): Application[] {
  const rows = db()
    .prepare(
      `SELECT id, job_id, stage, closed_why, created_at, updated_at
         FROM applications WHERE user_id = ? ORDER BY updated_at DESC`
    )
    .all(userId) as Record<string, unknown>[];
  return rows.map((r) => ({
    id: r.id as number,
    jobId: r.job_id as string,
    stage: r.stage as Stage,
    closedWhy: (r.closed_why as string) ?? null,
    createdAt: r.created_at as string,
    updatedAt: r.updated_at as string,
  }));
}

export function setStage(userId: string, jobId: string, stage: Stage, why?: string) {
  const t = now();
  db()
    .prepare(
      `INSERT INTO applications (user_id, job_id, stage, closed_why, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?)
       ON CONFLICT(user_id, job_id) DO UPDATE SET
         stage = excluded.stage,
         closed_why = COALESCE(excluded.closed_why, applications.closed_why),
         updated_at = excluded.updated_at`
    )
    .run(userId, jobId, stage, why ?? null, t, t);

  const app = db()
    .prepare(`SELECT id FROM applications WHERE user_id = ? AND job_id = ?`)
    .get(userId, jobId) as { id: number };

  /* every change is recorded, so the wait on Pipeline is measured */
  db()
    .prepare(`INSERT INTO events (application_id, kind, detail, at) VALUES (?, 'stage', ?, ?)`)
    .run(app.id, stage, t);
  return app.id;
}

export function unsave(userId: string, jobId: string) {
  db().prepare(`DELETE FROM applications WHERE user_id = ? AND job_id = ?`).run(userId, jobId);
}

/* How long since anything moved. Measured from the events, never guessed. */
export function daysSinceMoved(applicationId: number): number | null {
  const row = db()
    .prepare(`SELECT MAX(at) AS at FROM events WHERE application_id = ?`)
    .get(applicationId) as { at: string | null };
  if (!row?.at) return null;
  return Math.floor((Date.now() - new Date(row.at).getTime()) / 86_400_000);
}

/* ---- the daily loop --------------------------------------------------- */

export function markDone(userId: string, kind: string, jobId: string | null) {
  db()
    .prepare(
      `INSERT INTO today (user_id, day, kind, job_id, done_at) VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(user_id, day, kind, job_id) DO UPDATE SET done_at = excluded.done_at`
    )
    .run(userId, today(), kind, jobId, now());
}

export function doneToday(userId: string): string[] {
  const rows = db()
    .prepare(`SELECT kind, job_id FROM today WHERE user_id = ? AND day = ? AND done_at IS NOT NULL`)
    .all(userId, today()) as { kind: string; job_id: string | null }[];
  return rows.map((r) => r.job_id ?? r.kind);
}
