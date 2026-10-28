/* The store is generated and gitignored. The app needs something it can
 * read on any machine, including a Vercel builder, so this writes a
 * trimmed, committed snapshot.
 *
 * Trimmed on purpose: the screens need a title, a company, where it is,
 * what it pays and a link back. They do not need the full posting body,
 * which is most of the bytes.
 *
 *   node ingest/snapshot.mjs
 */
import { readFile, writeFile, mkdir } from "node:fs/promises";

const HERE = new URL(".", import.meta.url);
const OUT = new URL("../data/jobs.json", HERE);

const { ranAt, jobs } = JSON.parse(
  await readFile(new URL("store/jobs.json", HERE), "utf8")
);

const trimmed = jobs.map((j) => ({
  id: `${j.companySlug}-${j.sources[0].sourceId}`.slice(0, 64),
  company: j.company,
  companySlug: j.companySlug,
  title: j.title,
  titleKey: j.titleKey,
  locations: j.locations,
  remote: j.remote,
  hybrid: j.hybrid,
  pay: j.pay,
  postedAt: j.postedAt,
  requirements: j.requirements || [],
  firstSeen: j.firstSeen,
  /* every link, because the product promises to say where it found a job */
  sources: j.sources.map((s) => ({ ats: s.ats, url: s.url })),
}));

await mkdir(new URL("../data/", HERE), { recursive: true });
await writeFile(OUT, JSON.stringify({ ranAt, count: trimmed.length, jobs: trimmed }, null, 2));

const bytes = JSON.stringify(trimmed).length;
console.log(`${trimmed.length} jobs -> data/jobs.json  (${Math.round(bytes / 1024)} KB)`);
