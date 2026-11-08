/* Put the snapshot and the profile into the database, once.
 *
 *   node ingest/seed.mjs
 *
 * Safe to re-run: jobs upsert on (company, title), the user upserts on
 * id, and facts are only inserted if the table is empty, so switching a
 * skill off in the app is not undone by a reseed.
 */
import { readFile } from "node:fs/promises";
import { DatabaseSync } from "node:sqlite";

const FILE = process.env.ODYSSEUS_DB ?? "data/odysseus.db";
const db = new DatabaseSync(FILE);
db.exec("PRAGMA journal_mode = WAL");
db.exec("PRAGMA foreign_keys = ON");
db.exec(await readFile("lib/db/schema.sql", "utf8"));

/* same additive migration the app runs, so a database made before a
   column existed is upgraded wherever it is opened from */
for (const [table, column, def] of [["users", "password", "TEXT"]]) {
  const has = db.prepare(`PRAGMA table_info(${table})`).all().some((c) => c.name === column);
  if (!has) db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${def}`);
}

const now = new Date().toISOString();
const USER = "u_tomiwa";

db.prepare(
  `INSERT INTO users (id, email, name, created_at) VALUES (?, ?, ?, ?)
   ON CONFLICT(id) DO NOTHING`
).run(USER, "tomiwa@odysseus.app", "Tomiwa Akinbode", now);

/* The profile, with a source on every line, same as the screens show. */
const FACTS = [
  ["years", "7", "7 years", "7 years across Kuda, Paga and freelance, from your CV", "cv"],
  ["skill", "product design", "Product design", "Product design, from your CV", "cv"],
  ["skill", "design system", "Design systems", "You built and maintained Kuda's design system", "cv"],
  ["skill", "onboarding", "Onboarding", "You rebuilt Kuda's onboarding in 2023", "cv"],
  ["skill", "fintech", "Fintech", "Kuda and Paga, back to back", "cv"],
  ["skill", "payment", "Payments", "Kuda and Paga, back to back", "cv"],
  ["skill", "prototyp", "Prototyping", "Prototyping, from your CV", "cv"],
  ["skill", "usability test", "Usability testing", "You ran usability tests at Kuda", "cv"],
  ["skill", "figma", "Figma", "Figma, from your CV", "cv"],
  ["skill", "design token", "Design tokens", "You built and maintained Kuda's design system", "cv"],
  ["achievement", "at scale", "Shipped at scale", "400,000 people went through the flow you rebuilt", "cv"],
  ["achievement", "metric", "Moved a number", "Completion rose 18%, the number you gave", "answer"],
  ["role", "cross-functional", "Worked with engineers", "You were embedded in two squads at Kuda", "cv"],
  ["role", "portfolio", "Portfolio", "Your portfolio is on your CV", "cv"],
];

const factCount = db.prepare(`SELECT COUNT(*) AS n FROM facts WHERE user_id = ?`).get(USER).n;
if (factCount === 0) {
  const ins = db.prepare(
    `INSERT INTO facts (user_id, kind, term, label, proof, source, active, created_at)
     VALUES (?, ?, ?, ?, ?, ?, 1, ?)`
  );
  for (const [kind, term, label, proof, source] of FACTS) {
    ins.run(USER, kind, term, label, proof, source, now);
  }
}

const PREFS = {
  role: ["Product design", "Design systems"],
  seniority: ["Senior", "Staff"],
  place: ["Remote worldwide", "Remote Europe", "United Kingdom"],
  avoid: ["Gambling", "On site five days"],
};
const prefCount = db.prepare(`SELECT COUNT(*) AS n FROM prefs WHERE user_id = ?`).get(USER).n;
if (prefCount === 0) {
  const ins = db.prepare(`INSERT OR IGNORE INTO prefs (user_id, category, value) VALUES (?, ?, ?)`);
  for (const [cat, vals] of Object.entries(PREFS)) for (const v of vals) ins.run(USER, cat, v);
  db.prepare(
    `INSERT INTO settings (user_id, key, value) VALUES (?, 'salary_floor_k', '85')
     ON CONFLICT(user_id, key) DO NOTHING`
  ).run(USER);
}

/* Jobs */
const snap = JSON.parse(await readFile("data/jobs.json", "utf8"));
const upsert = db.prepare(
  `INSERT INTO jobs (id, company, company_slug, title, title_key, locations,
                     remote, hybrid, pay, requirements, posted_at, first_seen, last_seen)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
   ON CONFLICT(company_slug, title_key) DO UPDATE SET
     title = excluded.title, locations = excluded.locations,
     remote = excluded.remote, hybrid = excluded.hybrid,
     pay = COALESCE(excluded.pay, jobs.pay),
     requirements = CASE WHEN json_array_length(excluded.requirements) > 0
       THEN excluded.requirements ELSE jobs.requirements END,
     posted_at = COALESCE(jobs.posted_at, excluded.posted_at),
     last_seen = excluded.last_seen`
);
const src = db.prepare(`INSERT OR IGNORE INTO job_sources (job_id, ats, url) VALUES (?, ?, ?)`);
const findId = db.prepare(`SELECT id FROM jobs WHERE company_slug = ? AND title_key = ?`);

for (const j of snap.jobs) {
  upsert.run(
    j.id, j.company, j.companySlug, j.title, j.titleKey,
    JSON.stringify(j.locations ?? []), j.remote ? 1 : 0, j.hybrid ? 1 : 0,
    j.pay ? JSON.stringify(j.pay) : null, JSON.stringify(j.requirements ?? []),
    j.postedAt ?? null, j.firstSeen ?? now, now
  );
  const id = findId.get(j.companySlug, j.titleKey).id;
  for (const s of j.sources ?? []) src.run(id, s.ats, s.url);
}

const n = (q) => db.prepare(q).get().n;
console.log(`users        ${n("SELECT COUNT(*) AS n FROM users")}`);
console.log(`facts        ${n("SELECT COUNT(*) AS n FROM facts")}`);
console.log(`preferences  ${n("SELECT COUNT(*) AS n FROM prefs")}`);
console.log(`jobs         ${n("SELECT COUNT(*) AS n FROM jobs")}`);
console.log(`job sources  ${n("SELECT COUNT(*) AS n FROM job_sources")}`);
console.log(`\n-> ${FILE}`);
