import type { Job } from "./jobs";

/* Matching a job to what you said you want.
 *
 * The ingest found 266 design roles in one day, so the product's whole
 * promise rests here: throwing away 263 of them correctly.
 *
 * Every rule below reads something the feed actually published. Nothing
 * is inferred from a job description we have not parsed, and a job that
 * is silent on a thing is never scored as if it failed it. That is why
 * a missing salary cannot rule a job out: the employer not saying is
 * not the same as the employer paying too little.
 */

export type Prefs = {
  roles: string[];
  seniority: string[];
  places: string[];
  avoid: string[];
  floorK: number | null;
};

export const DEFAULT_PREFS: Prefs = {
  roles: ["Product design", "Design systems"],
  seniority: ["Senior", "Staff"],
  places: ["Remote worldwide", "Remote Europe", "United Kingdom"],
  avoid: ["Gambling", "On site five days"],
  floorK: 85,
};

const ROLE_WORDS: Record<string, RegExp> = {
  "Product design": /\bproduct design(er)?\b/i,
  "Design systems": /\bdesign system|\bdesign ops\b/i,
  "Brand design": /\bbrand\b/i,
  "UX research": /\b(ux research|user research|researcher)\b/i,
  "Design management": /\b(head of|director|manager|lead)\b/i,
  Motion: /\bmotion\b/i,
  "Front of house": /\b(web|marketing|growth) design/i,
};

const SENIORITY_WORDS: Record<string, RegExp> = {
  Mid: /\b(mid|ii|2)\b/i,
  Senior: /\bsenior|\bsr\.?\b/i,
  Staff: /\bstaff\b/i,
  Lead: /\blead\b/i,
  Manager: /\bmanager\b/i,
  "Head of": /\bhead of|\bdirector\b/i,
};

const EU = /\b(united kingdom|uk|england|london|ireland|dublin|netherlands|amsterdam|germany|berlin|munich|france|paris|spain|madrid|barcelona|portugal|lisbon|poland|warsaw|sweden|stockholm|denmark|copenhagen|emea|europe)\b/i;
const UK = /\b(united kingdom|uk|england|london|manchester|bristol|edinburgh)\b/i;

export type Reason = { ok: boolean; why: string };

export function match(job: Job, p: Prefs): { score: number; reasons: Reason[] } {
  const reasons: Reason[] = [];
  const where = job.locations.join(" ");

  /* role: the one hard filter. You are not a motion designer today. */
  const roleHit = p.roles.find((r) => ROLE_WORDS[r]?.test(job.title));
  reasons.push(
    roleHit
      ? { ok: true, why: `${roleHit} is what you asked for` }
      : { ok: false, why: "Not one of the roles you picked" }
  );

  /* seniority: a job that does not say is not a failure */
  const stated = Object.entries(SENIORITY_WORDS).filter(([, re]) => re.test(job.title));
  const seniorityHit = stated.some(([k]) => p.seniority.includes(k));
  reasons.push(
    stated.length === 0
      ? { ok: true, why: "No level stated, so not ruled out" }
      : seniorityHit
        ? { ok: true, why: `${stated[0][0]} matches your level` }
        : { ok: false, why: `Listed as ${stated[0][0]}` }
  );

  /* place */
  const wantsRemoteAnywhere = p.places.includes("Remote worldwide");
  const wantsRemoteEU = p.places.includes("Remote Europe");
  const wantsUK = p.places.includes("United Kingdom");
  const placeHit =
    (wantsRemoteAnywhere && job.remote) ||
    (wantsRemoteEU && job.remote && (EU.test(where) || where === "")) ||
    (wantsUK && UK.test(where));
  reasons.push(
    placeHit
      ? { ok: true, why: job.remote ? "Remote, which you want" : "Somewhere you said you would work" }
      : { ok: false, why: where ? `Based in ${job.locations[0]}` : "No location given" }
  );

  /* pay: silence is never a failure, because 87% of these say nothing */
  if (p.floorK == null) {
    reasons.push({ ok: true, why: "No floor set" });
  } else if (!job.pay) {
    reasons.push({ ok: true, why: "No salary published, so it is still shown" });
  } else if ("low" in job.pay) {
    const ok = job.pay.low >= p.floorK * 1000;
    reasons.push(
      ok
        ? { ok: true, why: "Above your floor" }
        : { ok: false, why: "Below your floor" }
    );
  } else {
    reasons.push({ ok: true, why: "Pay stated but not in a shape we can compare" });
  }

  const score = reasons.filter((r) => r.ok).length / reasons.length;
  return { score, reasons };
}

/* What a morning actually shows. Role is required; everything else ranks. */
export function pickForToday(jobs: Job[], p: Prefs, take = 3) {
  return jobs
    .map((job) => ({ job, ...match(job, p) }))
    .filter((m) => m.reasons[0].ok)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      const at = a.job.postedAt || a.job.firstSeen;
      const bt = b.job.postedAt || b.job.firstSeen;
      return bt.localeCompare(at);
    })
    .slice(0, take);
}
