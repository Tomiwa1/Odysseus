import type { Job } from "./jobs";
import { FACTS, type Fact } from "./profile";
import { readJob, type Me, factsIn, wordIn, type Verdict } from "./fit";
import { RESUME, SKILLS, SKILL_TERMS, TITLE } from "./resume";
import { YEARS } from "./profile";

/* Preparing an application, with rules only.
 *
 * The PRD splits this in two. Reordering, keyword checks and title
 * checks are deterministic, so they run here and nothing is drafted.
 * Writing a summary, answers and outreach needs a model, and until one
 * is connected those parts say so rather than showing sample prose on
 * a real job.
 *
 * Every change proposed here moves or names something already on the
 * profile. Nothing is reworded and nothing new is claimed.
 */

export type Piece = {
  id: string;
  t: string;
  body: string;
  list?: string[];
  from: string[];
  note?: string;
};

export type Check = { verdict: Verdict; t: string; proof: string };

const ASKED = (job: Job) => `What ${job.company} asked for`;

export function prepare(job: Job, me: Me) {
  const fit = readJob(job, me);

  /* Where each fact first matters in their list. The employer leads with
     what they care about most, so an earlier line ranks higher. A line
     that is a gap promotes nothing: matching "design" inside a line
     about managing designers would be a lie. */
  const rank = new Map<string, number>();
  const asked = new Map<string, { fact: Fact; word: string }>();
  fit.lines.forEach((l, i) => {
    if (l.verdict === "gap") return;
    for (const f of factsIn(l.ask, me)) {
      if (!rank.has(f.term)) rank.set(f.term, i);
      if (SKILL_TERMS.includes(f.term) && !asked.has(f.term)) {
        asked.set(f.term, { fact: f, word: wordIn(l.ask, f) ?? f.term });
      }
    }
  });

  const pieces: Piece[] = [];

  /* ---- bullets, reordered within each role ------------------------- */
  for (const role of RESUME) {
    if (role.bullets.length < 2) continue;
    const score = (facts: string[]) =>
      Math.min(...facts.map((t) => rank.get(t) ?? Infinity));
    const sorted = [...role.bullets].sort((a, b) => score(a.facts) - score(b.facts));
    const moved = sorted.some((b, i) => b !== role.bullets[i]);
    if (!moved) continue;

    const idle = sorted.filter((b) => score(b.facts) === Infinity).length;
    pieces.push({
      id: `order-${role.company}`,
      t: `Your ${role.company} bullets, reordered`,
      body: "The ones that answer their list come first, in the order they asked. Nothing was reworded and nothing was added.",
      list: sorted.map((b) => b.text),
      from: [`Your CV, ${role.company}`, ASKED(job)],
      note: idle
        ? `Order changed. Wording untouched. ${idle} of these speak to nothing they asked for, so ${idle === 1 ? "it stays" : "they stay"} at the bottom.`
        : "Order changed. Wording untouched.",
    });
  }

  /* ---- their words, where the profile has them and the resume does not */
  const onResume = [TITLE, SKILLS.text, ...RESUME.flatMap((r) => r.bullets.map((b) => b.text))].join(" ");
  const said = new Set(factsIn(onResume, me).map((f) => f.term));
  const missing = [...asked.values()].filter(({ fact }) => !said.has(fact.term));

  for (const { fact, word: raw } of missing) {
    /* their spelling, but a skills line starts each word with a capital */
    const word = raw.charAt(0).toUpperCase() + raw.slice(1);
    pieces.push({
      id: `word-${fact.term}`,
      t: `Name ${word} on your resume`,
      body: `They ask for ${word}. Your profile has it, but this resume never says so, and a screen that reads for keywords will not find it. It goes in your skills line, in their word.`,
      from: [fact.proof, ASKED(job)],
      note: "Added from your profile. Nothing new is claimed.",
    });
  }

  /* ---- the ATS check, as a report rather than a draft -------------- */
  const checks: Check[] = [];

  const theirs = job.title.toLowerCase();
  const mine = TITLE.toLowerCase();
  checks.push(
    theirs === mine
      ? { verdict: "have", t: "Title", proof: `They call it ${job.title}, and so does your CV.` }
      : theirs.includes(mine)
        ? { verdict: "part", t: "Title", proof: `They call it ${job.title}. Your CV says ${TITLE}. It stays that way: changing your title to match would be a claim.` }
        : { verdict: "gap", t: "Title", proof: `They call it ${job.title}. Your CV says ${TITLE}, which a title filter may not read as the same role.` },
  );

  const years = fit.lines.find((l) => /\byears?\b/i.test(l.ask) && /\d/.test(l.ask));
  const span = years && /\d{1,2}\s*\+?\s*(?:(?:-|–|to)\s*\d{1,2}\s*)?\+?\s*years?/i.exec(years.ask);
  if (years && span) {
    checks.push({
      verdict: years.verdict,
      t: "Experience",
      proof: years.verdict === "gap"
        ? years.proof
        : `They ask for ${span[0].replace(/\s+/g, " ")}. ${YEARS.proof}.`,
    });
  }

  if (asked.size > 0) {
    const have = asked.size - missing.length;
    checks.push({
      verdict: missing.length === 0 ? "have" : "part",
      t: "Their words",
      proof: missing.length === 0
        ? `All ${asked.size} of the words they use that your profile covers are on your resume.`
        : missing.length === 1
          ? `${have} of ${asked.size} of their words are on your resume. The other one is on your profile, and suggested above.`
          : `${have} of ${asked.size} of their words are on your resume. The other ${missing.length} are on your profile, and suggested above.`,
    });
  }

  /* every line must trace to a fact, or it is the unsupported claim the
     check exists to catch */
  const known = new Set(FACTS.map((f) => f.term));
  const loose = RESUME.flatMap((r) => r.bullets).filter((b) => !b.facts.every((t) => known.has(t)));
  checks.push(
    loose.length === 0
      ? { verdict: "have", t: "Unsupported claims", proof: "None. Every line on this resume traces to something on your profile." }
      : { verdict: "gap", t: "Unsupported claims", proof: `${loose.length} ${loose.length === 1 ? "line rests" : "lines rest"} on nothing in your profile.` },
  );

  const empty = RESUME.filter((r) => r.bullets.length === 0).map((r) => r.company);
  if (empty.length) {
    checks.push({
      verdict: "gap",
      t: "Missing information",
      proof: `${empty.join(" and ")} ${empty.length === 1 ? "has" : "have"} no bullets yet, so ${empty.length === 1 ? "it shows" : "they show"} as a title and nothing else.`,
    });
  }

  /* what they asked for that you have not done. Shown, never written around */
  const gaps = fit.lines.filter((l) => l.verdict === "gap");

  return { known: fit.known, pieces, checks, gaps, url: job.sources[0]?.url ?? null };
}
