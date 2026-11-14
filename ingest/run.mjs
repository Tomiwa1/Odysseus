/* Fetch every confirmed feed, normalise, dedupe, store.
 *
 *   node ingest/run.mjs           every company in companies.json
 *   node ingest/run.mjs --design  only design titles, for a quick read
 *
 * Writes straight into the database. Nothing is deleted between runs: a
 * job already stored keeps its first_seen date and gains any new source
 * link, so "posted 2 days ago" means what it says. last_seen moves every
 * run, so a role that stops appearing in a feed can be noticed later.
 */
import { readFile } from "node:fs/promises";
import { open, count, one, DB_URL } from "./db.mjs";
import { ADAPTERS } from "./sources/index.mjs";
import { normalise } from "./normalise.mjs";
import { dedupe } from "./dedupe.mjs";

const HERE = new URL(".", import.meta.url);
const DESIGN = /\b(design|designer|ux|researcher)\b/i;
const NOT_DESIGN = /\b(engineer|engineering|sales|account executive|legal|finance|recruit|construction|facilit)\b/i;

const onlyDesign = process.argv.includes("--design");

async function pool(items, size, fn) {
  const out = [];
  let i = 0;
  await Promise.all(
    Array.from({ length: size }, async () => {
      while (i < items.length) {
        const item = items[i++];
        try { out.push(await fn(item)); } catch { out.push(null); }
      }
    })
  );
  return out.filter(Boolean);
}

const companies = JSON.parse(await readFile(new URL("companies.json", HERE), "utf8"));
console.log(`Fetching ${companies.length} feeds\n`);

const batches = await pool(companies, 10, async (c) => {
  const adapter = ADAPTERS[c.ats];
  if (!adapter) return null;
  const raws = await adapter.fetchJobs(c.slug);
  return raws.map((raw) => normalise({ company: c, ats: c.ats, raw }));
});

let all = batches.flat();
const fetched = all.length;

if (onlyDesign) {
  all = all.filter((j) => DESIGN.test(j.title) && !NOT_DESIGN.test(j.title));
}

const { jobs, merged } = dedupe(all);

const db = await open();

const before = await count(db, "SELECT COUNT(*) AS n FROM jobs");
const t = new Date().toISOString();

/* Update first, insert only if nothing was there.
 *
 * A single INSERT ... ON CONFLICT cannot cover this: the row can clash
 * on the primary key and on the (company, title) dedupe key, and the
 * clause only takes one target, so the other raises. Explicit is both
 * correct and readable. */
const UPDATE = `UPDATE jobs SET
     title = ?, locations = ?, remote = ?, hybrid = ?,
     pay = COALESCE(?, pay),
     requirements = CASE WHEN json_array_length(?) > 0 THEN ? ELSE requirements END,
     posted_at = COALESCE(posted_at, ?),
     last_seen = ?
   WHERE company_slug = ? AND title_key = ?`;
const INSERT = `INSERT INTO jobs (id, company, company_slug, title, title_key, locations,
                     remote, hybrid, pay, requirements, posted_at, first_seen, last_seen)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
const ADD_SOURCE = `INSERT OR IGNORE INTO job_sources (job_id, ats, url) VALUES (?, ?, ?)`;
const FIND_ID = `SELECT id FROM jobs WHERE company_slug = ? AND title_key = ?`;

const tx = await db.transaction("write");
try {
  for (const j of jobs) {
    const locations = JSON.stringify(j.locations);
    const pay = j.pay ? JSON.stringify(j.pay) : null;
    const reqs = JSON.stringify(j.requirements ?? []);

    const changed = await tx.execute({
      sql: UPDATE,
      args: [
        j.title, locations, j.remote ? 1 : 0, j.hybrid ? 1 : 0,
        pay, reqs, reqs, j.postedAt, t,
        j.companySlug, j.titleKey,
      ],
    });

    if (Number(changed.rowsAffected) === 0) {
      await tx.execute({
        sql: INSERT,
        args: [
          j.id, j.company, j.companySlug, j.title, j.titleKey, locations,
          j.remote ? 1 : 0, j.hybrid ? 1 : 0, pay, reqs, j.postedAt, t, t,
        ],
      });
    }

    const found = await tx.execute({ sql: FIND_ID, args: [j.companySlug, j.titleKey] });
    const id = found.rows[0].id;
    for (const src of j.sources) await tx.execute({ sql: ADD_SOURCE, args: [id, src.ats, src.url] });
  }
  await tx.commit();
} catch (e) {
  await tx.rollback();
  throw e;
}

const after = await count(db, "SELECT COUNT(*) AS n FROM jobs");
const withPay = jobs.filter((j) => j.pay).length;
const remote = jobs.filter((j) => j.remote).length;
const withReqs = jobs.filter((j) => j.requirements?.length).length;

console.log(`Fetched        ${fetched} postings`);
if (onlyDesign) console.log(`Design only    ${all.length}`);
console.log(`Merged         ${merged} duplicates`);
console.log(`Stored         ${jobs.length} jobs   (${after - before} new)`);
console.log(`With a salary  ${withPay}  (${Math.round((withPay / jobs.length) * 100)}%)`);
console.log(`Remote         ${remote}  (${Math.round((remote / jobs.length) * 100)}%)`);
console.log(`Requirements   ${withReqs}  (${Math.round((withReqs / jobs.length) * 100)}%)`);
console.log(`\n-> ${DB_URL}`);
