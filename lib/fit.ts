import type { Job } from "./jobs";
import { FACTS, GAPS, YEARS } from "./profile";

/* How well you fit a role, requirement by requirement.
 *
 * Every verdict here is a term the employer wrote matched against a fact
 * you gave us, and the proof shown is that fact and where it came from.
 * Nothing is inferred from a resemblance. A requirement that matches
 * nothing is a gap, and it says so rather than being quietly dropped or
 * softened into a maybe.
 *
 * This is deliberately conservative. The failure it is built to avoid is
 * telling you that you meet something you do not, because that is the
 * failure that costs you an interview and the product its credibility.
 */

export type Verdict = "have" | "part" | "gap";

export type Line = {
  ask: string;      // verbatim, as the employer wrote it
  verdict: Verdict;
  proof: string;    // a fact of yours, and its source
};

const YEARS_RE = /(\d{1,2})\s*\+?\s*(?:-|–|to)?\s*(\d{1,2})?\s*\+?\s*years?/i;

/* Word boundaries, not substrings. Matching "at scale" with includes()
   found it inside "standards that scale across teams" and told you a
   requirement about tooling was answered by 400,000 users. No trailing
   boundary, so "prototyp" still matches "prototyping". */
const EDGE = new Map<string, RegExp>();
function re(term: string) {
  let r = EDGE.get(term);
  if (!r) {
    r = new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`, "i");
    EDGE.set(term, r);
  }
  return r;
}

function hits(text: string, f: { term: string; also?: string[] }) {
  if (re(f.term).test(text)) return f.term;
  return f.also?.find((a) => re(a).test(text)) ?? null;
}

export function readLine(ask: string): Line {
  const text = ask.toLowerCase();

  /* a years requirement is the one thing we can compare numerically */
  const y = YEARS_RE.exec(text);
  if (y) {
    const asked = Number(y[1]);
    if (Number.isFinite(asked)) {
      return asked <= YEARS.value
        ? { ask, verdict: "have", proof: YEARS.proof }
        : { ask, verdict: "gap", proof: `They want ${asked}. ${YEARS.proof}` };
    }
  }

  /* a named gap beats a partial match: if a line asks for people
     management, matching the word "design" in it would be a lie */
  for (const g of GAPS) {
    if (hits(text, g)) return { ask, verdict: "gap", proof: g.proof };
  }

  const found = FACTS.filter((f) => hits(text, f));
  if (found.length === 0) {
    return { ask, verdict: "gap", proof: "Nothing you gave us speaks to this" };
  }
  if (found.length === 1) {
    /* one weak signal in a long sentence is a partial, not a yes */
    const weak = ask.length > 150;
    return { ask, verdict: weak ? "part" : "have", proof: found[0].proof };
  }
  return { ask, verdict: "have", proof: found.slice(0, 2).map((f) => f.proof).join(". ") };
}

export function readJob(job: Job) {
  const lines = job.requirements.map(readLine);
  const have = lines.filter((l) => l.verdict === "have").length;
  const part = lines.filter((l) => l.verdict === "part").length;
  const gaps = lines.filter((l) => l.verdict === "gap").length;
  return {
    lines,
    have,
    part,
    gaps,
    /* no requirements parsed means we do not know, not that you fit */
    known: lines.length > 0,
    pct: lines.length ? Math.round((have / lines.length) * 100) : null,
  };
}
