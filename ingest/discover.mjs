/* Work out which ATS each company is on, once, and write companies.json.
 * The run script then goes straight to the right feed instead of probing
 * six hosts every time.
 *
 *   node ingest/discover.mjs
 */
import { writeFile } from "node:fs/promises";
import { COMPANIES } from "./company-list.mjs";

const SOURCES = [
  { ats: "greenhouse", url: (s) => `https://boards-api.greenhouse.io/v1/boards/${s}/jobs`, ok: (j) => Array.isArray(j?.jobs) },
  { ats: "lever", url: (s) => `https://api.lever.co/v0/postings/${s}?mode=json`, ok: (j) => Array.isArray(j) },
  { ats: "ashby", url: (s) => `https://api.ashbyhq.com/posting-api/job-board/${s}`, ok: (j) => Array.isArray(j?.jobs) },
  { ats: "workable", url: (s) => `https://apply.workable.com/api/v1/widget/accounts/${s}?details=true`, ok: (j) => Array.isArray(j?.jobs) },
];

async function find(slug) {
  for (const s of SOURCES) {
    try {
      const r = await fetch(s.url(slug), {
        signal: AbortSignal.timeout(10_000),
        headers: { "user-agent": "odysseus (job aggregator, reads public ATS feeds)" },
      });
      if (!r.ok) continue;
      const j = await r.json();
      if (s.ok(j)) return { slug, ats: s.ats, name: j?.name || slug };
    } catch {}
  }
  return null;
}

async function pool(items, size, fn) {
  const out = [];
  let i = 0;
  await Promise.all(Array.from({ length: size }, async () => {
    while (i < items.length) out.push(await fn(items[i++]));
  }));
  return out.filter(Boolean);
}

const found = await pool(COMPANIES, 10, find);
found.sort((a, b) => a.slug.localeCompare(b.slug));
await writeFile(new URL("companies.json", import.meta.url), JSON.stringify(found, null, 2));

const byAts = {};
for (const f of found) byAts[f.ats] = (byAts[f.ats] || 0) + 1;
console.log(`${found.length} of ${COMPANIES.length} on a public feed`);
console.log(JSON.stringify(byAts));
console.log(`Missing: ${COMPANIES.filter((c) => !found.some((f) => f.slug === c)).join(", ")}`);
