import { extractRequirements } from "./requirements.mjs";
/* One job shape, whatever feed it came from.
 *
 * Every field here is something a feed actually said. Nothing is guessed
 * and nothing is filled in with a plausible default: an unknown salary is
 * null, not zero, and an unknown location is an empty list, not "Remote".
 * The job detail screen has to be able to say "they did not publish it",
 * and it can only do that if we did not quietly invent it.
 */

const REMOTE = /\b(remote|anywhere|distributed|work from home|wfh)\b/i;
const HYBRID = /\bhybrid\b/i;

/* Salary lines are written by humans in a hundred formats. This reads the
 * common ones and gives up loudly rather than guessing wrong. */
const PAY = /(?:^|[^\d])(?:(£|\$|€)\s?)(\d[\d,.]*)\s*(k|m)?\s*(?:-|to|–)\s*(?:(?:£|\$|€)\s?)?(\d[\d,.]*)\s*(k|m)?/i;
const CUR = { "£": "GBP", $: "USD", "€": "EUR" };

function money(n, suffix) {
  let v = Number(String(n).replace(/[,\s]/g, ""));
  if (!Number.isFinite(v)) return null;
  if (suffix?.toLowerCase() === "k") v *= 1_000;
  if (suffix?.toLowerCase() === "m") v *= 1_000_000;
  /* a "salary" under 1000 a year is a parse failure, not a wage */
  return v >= 1000 ? Math.round(v) : null;
}

export function readPay(text) {
  if (!text) return null;
  const m = PAY.exec(text);
  if (!m) return null;
  const low = money(m[2], m[3]);
  const high = money(m[4], m[5] || m[3]);
  if (low == null || high == null || high < low) return null;
  return { currency: CUR[m[1]] || null, low, high, source: "parsed from the posting" };
}

/* "London, UK; Berlin" is a list. "Remote (US or Canada)" is not: the
   "or" sits inside brackets and splitting on it produced "Remote (US"
   and "Canada)". So split, then stitch back any fragment that left a
   bracket open. */
export function readLocations(raw) {
  if (!raw) return [];
  const parts = String(raw).split(/[;|]|\sor\s|\//i);
  const out = [];
  let open = "";

  for (const part of parts) {
    const piece = open ? `${open} or ${part}` : part;
    const balanced =
      (piece.match(/\(/g) || []).length === (piece.match(/\)/g) || []).length;
    if (balanced) {
      out.push(piece);
      open = "";
    } else {
      open = piece;
    }
  }
  if (open) out.push(open);

  return out
    .map((s) => s.replace(/\s+/g, " ").trim())
    /* feeds append the employer to the place: "London, United Kingdom -
       Deliveroo". The company is already on the screen. */
    .map((s) => s.replace(/\s+[-–]\s+[A-Z][\w&. ]{1,24}$/, "").trim())
    .filter(Boolean)
    .slice(0, 6);
}

/* Titles carry location and noise that stop two copies of one job from
 * matching. Strip only what is reliably decoration. */
export function keyTitle(title) {
  return String(title)
    .toLowerCase()
    .replace(/\((?:remote|hybrid|onsite|on-site|[^)]*\b(?:uk|us|emea|eu)\b[^)]*)\)/gi, "")
    .replace(/[‐-―]/g, "-")
    .replace(/[,–-]\s*(remote|hybrid|onsite|on-site).*$/i, "")
    .replace(/[^a-z0-9+#]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function normalise({ company, ats, raw }) {
  const locations = readLocations(raw.location);
  const blob = `${raw.title} ${raw.location} ${String(raw.body).slice(0, 4000)}`;

  return {
    company: company.name,
    companySlug: company.slug,
    title: String(raw.title || "").trim(),
    titleKey: keyTitle(raw.title || ""),
    locations,
    remote: raw.remote === true || REMOTE.test(`${raw.title} ${raw.location}`),
    hybrid: raw.hybrid === true || HYBRID.test(`${raw.title} ${raw.location}`),
    pay: raw.pay ? { note: raw.pay, source: "stated by the employer" } : readPay(blob),
    postedAt: raw.postedAt,
    /* verbatim lines the employer wrote under a requirements heading.
       Empty when the parse could not find one, which the screen says
       out loud rather than filling in. */
    requirements: extractRequirements(raw.body),
    /* every place this job was found, which is what lets the product say
       where it came from rather than asking to be trusted */
    sources: [{ ats, sourceId: raw.sourceId, url: raw.url, seenAt: new Date().toISOString() }],
  };
}
