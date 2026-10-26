/* Fetch every confirmed feed, normalise, dedupe, store.
 *
 *   node ingest/run.mjs           every company in companies.json
 *   node ingest/run.mjs --design  only design titles, for a quick read
 *
 * Writes ingest/store/jobs.json. Nothing is deleted between runs: a job
 * already stored keeps its first-seen date and gains any new source link,
 * so "posted 2 days ago" means what it says.
 */
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { ADAPTERS } from "./sources/index.mjs";
import { normalise } from "./normalise.mjs";
import { dedupe } from "./dedupe.mjs";

const HERE = new URL(".", import.meta.url);
const STORE = new URL("store/jobs.json", HERE);
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

/* carry forward what we already knew, so first-seen dates survive */
let previous = [];
try { previous = JSON.parse(await readFile(STORE, "utf8")).jobs || []; } catch {}
const before = new Map(previous.map((j) => [`${j.companySlug}::${j.titleKey}`, j]));

let fresh = 0;
for (const j of jobs) {
  const old = before.get(`${j.companySlug}::${j.titleKey}`);
  if (old) {
    j.firstSeen = old.firstSeen;
    for (const s of old.sources) {
      if (!j.sources.some((x) => x.ats === s.ats && x.sourceId === s.sourceId)) j.sources.push(s);
    }
  } else {
    j.firstSeen = new Date().toISOString();
    fresh++;
  }
}

await mkdir(new URL("store/", HERE), { recursive: true });
await writeFile(STORE, JSON.stringify({ ranAt: new Date().toISOString(), jobs }, null, 2));

const withPay = jobs.filter((j) => j.pay).length;
const remote = jobs.filter((j) => j.remote).length;

console.log(`Fetched        ${fetched} postings`);
if (onlyDesign) console.log(`Design only    ${all.length}`);
console.log(`Merged         ${merged} duplicates`);
console.log(`Stored         ${jobs.length} jobs   (${fresh} new since last run)`);
console.log(`With a salary  ${withPay}  (${Math.round((withPay / jobs.length) * 100)}%)`);
console.log(`Remote         ${remote}  (${Math.round((remote / jobs.length) * 100)}%)`);
console.log(`\n-> ingest/store/jobs.json`);
