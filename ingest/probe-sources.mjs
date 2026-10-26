/* Does free, legitimate job data actually exist for this market?
 *
 * Most companies run their careers page on an ATS, and those ATSs serve
 * public JSON that is meant to be read by the company's own site. No
 * scraping, no bot evasion, no terms broken.
 *
 * This probes a list of companies against six ATSs and reports what is
 * really there. It answers the viability question with numbers instead
 * of an assumption. Read only; nothing is stored.
 *
 *   node ingest/probe-sources.mjs
 */

/* Worldwide, with Europe and the UK weighted, plus remote-first
   companies that hire across borders. The first run was African fintech
   only, which was an assumption carried over from the prototype's mock
   data rather than anything about the product. */
const COMPANIES = [
  // UK and Ireland
  "monzo", "starlingbank", "wise", "revolut", "tide", "thoughtmachine",
  "octopusenergy", "deliveroo", "trustpilot", "onfido", "gocardless",
  "checkout", "zopa", "cleo", "marshmallow", "lendable", "freetrade",
  "moneybox", "curve", "wayve", "babylonhealth", "depop", "bulb",
  "improbable", "snyk", "darktrace", "graphcore", "elvie", "farfetch",
  "intercom", "workhuman", "flipdish", "stripe",
  // Europe
  "klarna", "spotify", "n26", "personio", "pleo", "qonto", "payfit",
  "wolt", "bolt", "backbase", "adyen", "messagebird", "miro", "typeform",
  "glovo", "cabify", "factorial", "jobandtalent", "contentful",
  "celonis", "sennder", "forto", "taxfix", "raisin", "solarisbank",
  "trade-republic", "scalable", "gorillas", "zalando", "hellofresh",
  "getyourguide", "sumup", "mollie", "picnic", "remote", "docplanner",
  "preply", "productboard", "rohlik", "vinted", "bolttech", "lightyear",
  // North America
  "figma", "notion", "airbnb", "dropbox", "asana", "gitlab", "hashicorp",
  "cloudflare", "twilio", "robinhood", "coinbase", "doordash",
  "instacart", "lyft", "pinterest", "reddit", "squarespace", "zapier",
  "1password", "algolia", "amplitude", "benchling", "brex", "calendly",
  "canva", "carta", "checkr", "chime", "circleci", "clickup",
  "confluent", "databricks", "datadog", "discord", "docker", "duolingo",
  "elastic", "faire", "fivetran", "flexport", "grammarly", "gusto",
  "kraken", "linear", "loom", "mercury", "mural", "netlify", "okta",
  "plaid", "postman", "quora", "samsara", "sentry", "shopify",
  "smartsheet", "sourcegraph", "superhuman", "toast", "twitch", "udemy",
  "unity", "upwork", "vercel", "vimeo", "wealthsimple", "webflow",
  "whoop", "workato", "zendesk", "ramp", "vanta", "deel", "posthog",
  "supabase", "replit", "retool", "census", "whatnot", "hex", "clay",
  "airtable", "amplitudeinc", "attentive", "automattic", "bitly",
  "box", "bubble", "cedar", "clearbit", "coda", "crossbeam", "customerio",
  "dbtlabs", "descript", "dialpad", "drata", "equinix", "expel",
  "fastly", "flatiron", "front", "gem", "getdbt", "github", "gong",
  "grafana", "greenhouse", "guild", "handshake", "heap", "honeycomb",
  "hopin", "ironclad", "jasper", "launchdarkly", "lattice", "lightspeed",
  "lob", "lucid", "mixpanel", "modernhealth", "mongodb", "newfront",
  "nylas", "olo", "ondeck", "outreach", "pagerduty", "pendo",
  "pilot", "pollyex", "productplan", "pulley", "render", "rippling",
  "scaleai", "segment", "semgrep", "sift", "snowflake", "sonder",
  "splash", "sprig", "stord", "strava", "stytch", "temporal", "tempus",
  "thirdlove", "tigera", "tinybird", "tremendous", "truework", "turing",
  "vercelinc", "verkada", "via", "vouch", "warby", "wealthfront",
  "wistia", "workramp", "writer", "zip", "zuora",
  // Remote-first and global
  "automattic", "doist", "gitpod", "hotjar", "invisible", "nuvei",
  "oyster", "remotecom", "sourcegraph", "strapi", "toptal", "zapierinc",
];

const SOURCES = [
  { ats: "greenhouse", url: (s) => `https://boards-api.greenhouse.io/v1/boards/${s}/jobs`,
    count: (j) => j?.jobs?.length, titles: (j) => (j?.jobs || []).map((x) => x.title) },
  { ats: "lever", url: (s) => `https://api.lever.co/v0/postings/${s}?mode=json`,
    count: (j) => (Array.isArray(j) ? j.length : undefined),
    titles: (j) => (Array.isArray(j) ? j : []).map((x) => x.text) },
  { ats: "ashby", url: (s) => `https://api.ashbyhq.com/posting-api/job-board/${s}`,
    count: (j) => j?.jobs?.length, titles: (j) => (j?.jobs || []).map((x) => x.title) },
  { ats: "workable", url: (s) => `https://apply.workable.com/api/v1/widget/accounts/${s}?details=true`,
    count: (j) => j?.jobs?.length, titles: (j) => (j?.jobs || []).map((x) => x.title) },
  { ats: "recruitee", url: (s) => `https://${s}.recruitee.com/api/offers/`,
    count: (j) => j?.offers?.length, titles: (j) => (j?.offers || []).map((x) => x.title) },
  /* SmartRecruiters answers 200 with totalFound 0 for ANY slug, including
     nonsense, so an empty result there is not evidence of an account.
     Everything else 404s properly. Only count it when it has roles. */
  { ats: "smartrecruiters", url: (s) => `https://api.smartrecruiters.com/v1/companies/${s}/postings`,
    count: (j) => (j?.totalFound > 0 ? j.totalFound : undefined),
    titles: (j) => (j?.content || []).map((x) => x.name) },
];

const TIMEOUT = 8000;

async function probe(company, source) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), TIMEOUT);
  try {
    const res = await fetch(source.url(company), {
      signal: ctl.signal,
      headers: { "user-agent": "odysseus-source-probe (evaluating public ATS feeds)" },
    });
    if (!res.ok) return null;
    const json = await res.json();
    const n = source.count(json);
    return typeof n === "number"
      ? { ats: source.ats, n, titles: (source.titles?.(json) || []).filter(Boolean) }
      : null;
  } catch {
    return null;
  } finally {
    clearTimeout(t);
  }
}

/* a small pool, so we stay polite rather than hammering six hosts */
async function pool(items, size, fn) {
  const out = [];
  let i = 0;
  await Promise.all(
    Array.from({ length: size }, async () => {
      while (i < items.length) out.push(await fn(items[i++]));
    })
  );
  return out;
}

const DESIGN = /\b(design|designer|ux|ui|researcher)\b/i;
const NOT_DESIGN = /\b(engineer|engineering|sales|account|legal|finance|recruit)\b/i;

const results = await pool(COMPANIES, 10, async (c) => {
  for (const s of SOURCES) {
    const hit = await probe(c, s);
    if (hit) return { company: c, ...hit };
  }
  return { company: c, ats: null, n: 0, titles: [] };
});

const found = results.filter((r) => r.ats);
const live = found.filter((r) => r.n > 0);
const byAts = {};
for (const r of found) byAts[r.ats] = (byAts[r.ats] || 0) + 1;

console.log(`\nProbed ${COMPANIES.length} companies across ${SOURCES.length} ATSs\n`);
console.log(`On a public ATS feed : ${found.length}`);
console.log(`With live roles now  : ${live.length}`);
console.log(`Total open roles     : ${found.reduce((a, r) => a + r.n, 0)}`);
console.log(`\nBy ATS: ${JSON.stringify(byAts)}\n`);

const allDesign = [];
for (const r of live.sort((a, b) => b.n - a.n)) {
  const d = r.titles.filter((t) => DESIGN.test(t) && !NOT_DESIGN.test(t));
  allDesign.push(...d.map((t) => `${r.company}: ${t}`));
  console.log(`  ${r.company.padEnd(16)} ${String(r.n).padStart(4)} roles  ${String(d.length).padStart(2)} design  ${r.ats}`);
}

/* the same role posted for three locations is one job, and the probe
   found that on its first run, so count both numbers */
const uniq = new Set(allDesign.map((d) => d.toLowerCase().replace(/\s+/g, " ").trim()));
console.log(`\nDesign titles: ${allDesign.length}  |  unique after trivial dedupe: ${uniq.size}`);
for (const d of [...uniq].slice(0, 40)) console.log(`  ${d}`);
if (uniq.size > 40) console.log(`  ... and ${uniq.size - 40} more`);

const misses = results.filter((r) => !r.ats).map((r) => r.company);
if (misses.length) console.log(`\nNo public feed under that slug: ${misses.join(", ")}`);
