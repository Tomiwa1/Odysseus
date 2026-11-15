import { all, one, run, now, today } from "./index";

/* Everything the app asks of storage, in one place.
 *
 * The screens never see SQL. That is not tidiness: it is what made
 * moving from a synchronous local driver to one that can also talk to a
 * hosted database a change in two files rather than in every screen.
 *
 * Every function is async, because a hosted database cannot be anything
 * else.
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

export async function ensureUser(id: string, email: string, name: string) {
  await run(
    `INSERT INTO users (id, email, name, created_at) VALUES (?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET email = excluded.email, name = excluded.name`,
    [id, email, name, now()]
  );
  return id;
}

/* ---- what we know about you ----------------------------------------- */

export async function facts(userId: string, onlyActive = true): Promise<Fact[]> {
  const rows = await all(
    `SELECT id, kind, term, label, proof, source, active FROM facts
      WHERE user_id = ? ${onlyActive ? "AND active = 1" : ""}
      ORDER BY kind, id`,
    [userId]
  );
  return rows.map((r) => ({ ...r, active: Number(r.active) === 1 }) as Fact);
}

export async function addFact(userId: string, f: Omit<Fact, "id" | "active">) {
  await run(
    `INSERT INTO facts (user_id, kind, term, label, proof, source, active, created_at)
     VALUES (?, ?, ?, ?, ?, ?, 1, ?)`,
    [userId, f.kind, f.term, f.label, f.proof, f.source, now()]
  );
}

export async function setFactActive(userId: string, id: number, active: boolean) {
  await run(`UPDATE facts SET active = ? WHERE id = ? AND user_id = ?`,
    [active ? 1 : 0, id, userId]);
}

/* ---- what you are looking for --------------------------------------- */

export async function prefs(userId: string): Promise<Record<string, string[]>> {
  const rows = await all<{ category: string; value: string }>(
    `SELECT category, value FROM prefs WHERE user_id = ?`, [userId]);
  const out: Record<string, string[]> = {};
  for (const r of rows) (out[r.category] ??= []).push(r.value);
  return out;
}

export async function togglePref(userId: string, category: string, value: string, on: boolean) {
  if (on) {
    await run(`INSERT OR IGNORE INTO prefs (user_id, category, value) VALUES (?, ?, ?)`,
      [userId, category, value]);
  } else {
    await run(`DELETE FROM prefs WHERE user_id = ? AND category = ? AND value = ?`,
      [userId, category, value]);
  }
}

export async function setting(userId: string, key: string): Promise<string | null> {
  const row = await one<{ value: string }>(
    `SELECT value FROM settings WHERE user_id = ? AND key = ?`, [userId, key]);
  return row?.value ?? null;
}

export async function setSetting(userId: string, key: string, value: string | null) {
  await run(
    `INSERT INTO settings (user_id, key, value) VALUES (?, ?, ?)
     ON CONFLICT(user_id, key) DO UPDATE SET value = excluded.value`,
    [userId, key, value]
  );
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
    remote: Number(r.remote) === 1,
    hybrid: Number(r.hybrid) === 1,
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

export async function allJobs(): Promise<StoredJob[]> {
  const cutoff = new Date(Date.now() - STALE_DAYS * 86_400_000).toISOString();
  const rows = await all(`SELECT * FROM jobs WHERE last_seen >= ?`, [cutoff]);
  const jobs = rows.map(hydrate);

  const srcs = await all<{ job_id: string; ats: string; url: string }>(
    `SELECT job_id, ats, url FROM job_sources`);
  const byJob = new Map<string, { ats: string; url: string }[]>();
  for (const s of srcs) {
    const list = byJob.get(s.job_id) ?? [];
    list.push({ ats: s.ats, url: s.url });
    byJob.set(s.job_id, list);
  }
  for (const j of jobs) j.sources = byJob.get(j.id) ?? [];
  return jobs;
}

export async function job(id: string): Promise<StoredJob | null> {
  const r = await one(`SELECT * FROM jobs WHERE id = ?`, [id]);
  if (!r) return null;
  const j = hydrate(r);
  j.sources = await all<{ ats: string; url: string }>(
    `SELECT ats, url FROM job_sources WHERE job_id = ?`, [id]);
  return j;
}

/* ---- what you did about them ----------------------------------------- */

export type Application = {
  id: number; jobId: string; stage: Stage; closedWhy: string | null;
  createdAt: string; updatedAt: string;
};

export async function applications(userId: string): Promise<Application[]> {
  const rows = await all(
    `SELECT id, job_id, stage, closed_why, created_at, updated_at
       FROM applications WHERE user_id = ? ORDER BY updated_at DESC`,
    [userId]
  );
  return rows.map((r) => ({
    id: Number(r.id),
    jobId: r.job_id as string,
    stage: r.stage as Stage,
    closedWhy: (r.closed_why as string) ?? null,
    createdAt: r.created_at as string,
    updatedAt: r.updated_at as string,
  }));
}

export async function setStage(userId: string, jobId: string, stage: Stage, why?: string) {
  const t = now();
  await run(
    `INSERT INTO applications (user_id, job_id, stage, closed_why, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?)
     ON CONFLICT(user_id, job_id) DO UPDATE SET
       stage = excluded.stage,
       closed_why = COALESCE(excluded.closed_why, applications.closed_why),
       updated_at = excluded.updated_at`,
    [userId, jobId, stage, why ?? null, t, t]
  );

  const app = await one<{ id: number }>(
    `SELECT id FROM applications WHERE user_id = ? AND job_id = ?`, [userId, jobId]);

  /* every change is recorded, so the wait on Pipeline is measured */
  await run(`INSERT INTO events (application_id, kind, detail, at) VALUES (?, 'stage', ?, ?)`,
    [app!.id, stage, t]);
  return Number(app!.id);
}

export async function unsave(userId: string, jobId: string) {
  await run(`DELETE FROM applications WHERE user_id = ? AND job_id = ?`, [userId, jobId]);
}

/* How long since anything moved. Measured from the events, never guessed. */
export async function daysSinceMoved(applicationId: number): Promise<number | null> {
  const row = await one<{ at: string | null }>(
    `SELECT MAX(at) AS at FROM events WHERE application_id = ?`, [applicationId]);
  if (!row?.at) return null;
  return Math.floor((Date.now() - new Date(row.at).getTime()) / 86_400_000);
}

/* ---- the daily loop --------------------------------------------------- */

export async function markDone(userId: string, kind: string, jobId: string | null) {
  /* Update first, insert if there was nothing.
   *
   * ON CONFLICT cannot do this: a card with no job stores job_id as
   * null, and SQLite treats two nulls as different values in a unique
   * index, so the conflict clause would never fire and every tap would
   * add another row. `IS` compares nulls as equal, which is what is
   * meant here. */
  const touched = await run(
    `UPDATE today SET done_at = ?
     WHERE user_id = ? AND day = ? AND kind = ? AND job_id IS ?`,
    [now(), userId, today(), kind, jobId]
  );
  if (Number(touched.rowsAffected) === 0) {
    await run(
      `INSERT INTO today (user_id, day, kind, job_id, done_at) VALUES (?, ?, ?, ?, ?)`,
      [userId, today(), kind, jobId, now()]
    );
  }
}

export async function doneToday(userId: string): Promise<string[]> {
  const rows = await all<{ kind: string; job_id: string | null }>(
    `SELECT kind, job_id FROM today WHERE user_id = ? AND day = ? AND done_at IS NOT NULL`,
    [userId, today()]
  );
  return rows.map((r) => r.job_id ?? r.kind);
}

/* Mornings in a row, counted rather than claimed.
 *
 * A day counts when something on it was actually finished. Today is
 * allowed to be empty without breaking the run, because the morning is
 * not over yet; any earlier gap ends it. */
export async function streak(userId: string): Promise<number> {
  const days = (
    await all<{ day: string }>(
      `SELECT DISTINCT day FROM today
       WHERE user_id = ? AND done_at IS NOT NULL
       ORDER BY day DESC`,
      [userId]
    )
  ).map((r) => r.day);
  if (days.length === 0) return 0;

  const asDay = (d: Date) => d.toISOString().slice(0, 10);
  const back = (n: number) => {
    const d = new Date(`${today()}T00:00:00Z`);
    d.setUTCDate(d.getUTCDate() - n);
    return asDay(d);
  };

  let run = 0;
  /* start at today if it already has something, otherwise at yesterday */
  let step = days[0] === today() ? 0 : 1;
  while (days.includes(back(step))) {
    run++;
    step++;
  }
  return run;
}
