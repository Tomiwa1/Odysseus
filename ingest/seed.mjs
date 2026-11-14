/* Put the snapshot and the profile into the database, once.
 *
 *   node ingest/seed.mjs
 *
 * Safe to re-run: jobs upsert on (company, title), the user upserts on
 * id, and facts are only inserted if the table is empty, so switching a
 * skill off in the app is not undone by a reseed.
 */
import { open, count, DB_URL } from "./db.mjs";

/* open() applies the schema and the same additive migrations the app
   runs, so a database made before a column existed is upgraded wherever
   it is opened from */
const db = await open();

const now = new Date().toISOString();
const USER = "u_tomiwa";

await db.execute({
  sql: `INSERT INTO users (id, email, name, created_at) VALUES (?, ?, ?, ?)
        ON CONFLICT(id) DO NOTHING`,
  args: [USER, "tomiwa@odysseus.app", "Tomiwa Akinbode", now],
});

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

const factCount = await count(db, `SELECT COUNT(*) AS n FROM facts WHERE user_id = ?`, [USER]);
if (factCount === 0) {
  const sql = `INSERT INTO facts (user_id, kind, term, label, proof, source, active, created_at)
               VALUES (?, ?, ?, ?, ?, ?, 1, ?)`;
  for (const [kind, term, label, proof, source] of FACTS) {
    await db.execute({ sql, args: [USER, kind, term, label, proof, source, now] });
  }
}

const PREFS = {
  role: ["Product design", "Design systems"],
  seniority: ["Senior", "Staff"],
  place: ["Remote worldwide", "Remote Europe", "United Kingdom"],
  avoid: ["Gambling", "On site five days"],
};
const prefCount = await count(db, `SELECT COUNT(*) AS n FROM prefs WHERE user_id = ?`, [USER]);
if (prefCount === 0) {
  const sql = `INSERT OR IGNORE INTO prefs (user_id, category, value) VALUES (?, ?, ?)`;
  for (const [cat, vals] of Object.entries(PREFS)) {
    for (const v of vals) await db.execute({ sql, args: [USER, cat, v] });
  }
  await db.execute({
    sql: `INSERT INTO settings (user_id, key, value) VALUES (?, 'salary_floor_k', '85')
          ON CONFLICT(user_id, key) DO NOTHING`,
    args: [USER],
  });
}

/* Jobs are not seeded any more. ingest/run.mjs owns them and writes
   straight to this database, so there is one path in and no snapshot to
   fall out of date. */

const n = (q) => count(db, q);
console.log(`users        ${await n("SELECT COUNT(*) AS n FROM users")}`);
console.log(`facts        ${await n("SELECT COUNT(*) AS n FROM facts")}`);
console.log(`preferences  ${await n("SELECT COUNT(*) AS n FROM prefs")}`);
console.log(`jobs         ${await n("SELECT COUNT(*) AS n FROM jobs")}  (run ingest/run.mjs to fill)`);
console.log(`\n-> ${DB_URL}`);
