/* Turn CV text into facts, each one carrying the line it came from.
 *
 * This is the point where the product's whole promise is either kept or
 * broken, so the rules are strict:
 *
 *   A fact is only created when a term literally appears in the text.
 *   Nothing is inferred from a resemblance and nothing is implied by a
 *   job title.
 *
 *   Every fact's proof is the sentence it was found in, trimmed. Not a
 *   summary of it, not a rewrite of it. The profile can then show the
 *   user their own words when it explains a match.
 *
 *   Whatever is not found is simply absent. No defaults, no "probably",
 *   no filling a gap with something plausible.
 */

export type Found = {
  kind: "skill" | "role" | "achievement" | "years";
  term: string;
  label: string;
  proof: string;
};

/* The vocabulary we can honestly detect. Stems, because word boundaries
   anchor the start only: "prototyp" reaches prototyping and prototypes. */
const SKILLS: [term: string, label: string, also?: string[]][] = [
  ["product design", "Product design"],
  ["design system", "Design systems", ["component library", "design token"]],
  ["onboarding", "Onboarding", ["activation"]],
  ["fintech", "Fintech", ["banking"]],
  ["payment", "Payments"],
  ["prototyp", "Prototyping"],
  ["usability test", "Usability testing", ["user testing", "usability"]],
  ["figma", "Figma"],
  ["design token", "Design tokens"],
  ["accessibilit", "Accessibility", ["wcag"]],
  ["research", "Research"],
  ["motion", "Motion"],
  ["workshop", "Workshops", ["facilitat"]],
  ["mentor", "Mentoring", ["coaching"]],
  ["data viz", "Data visualisation", ["dashboard", "charts"]],
];

const word = (t: string) => new RegExp(`\\b${t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`, "i");

/* The line a term was found in, never reworded.
 *
 * Takes the most substantial match rather than the first. The first
 * match of "product design" in a CV is usually the job title in the
 * header, which proves a match with "Senior Product Designer ." and
 * tells the user nothing. A sentence describing work is a better proof
 * of the same fact, and it is still their own words. */
function sentenceWith(text: string, re: RegExp): string | null {
  const hits = text
    .split(/\n|(?<=\.)\s+/)
    .map((l) => l.trim())
    .filter((t) => t.length >= 12 && t.length <= 240 && re.test(t));
  if (hits.length === 0) return null;

  /* a line with a verb and a number beats a bare label, and a longer
     line beats a shorter one, but nothing beats a list of keywords */
  const score = (t: string) =>
    (/\d/.test(t) ? 40 : 0) +
    (t.split(",").length > 4 ? -30 : 0) +
    Math.min(t.length, 160);

  return hits.sort((a, b) => score(b) - score(a))[0];
}

const YEARS = /\b(\d{1,2})\s*\+?\s*years?\b/i;
const RANGE = /\b(19|20)\d{2}\s*(?:to|-|–|—)\s*((?:19|20)\d{2}|present|now)\b/gi;
/* a number worth claiming: a percentage, or a count with scale */
const NUMBER = /\b(\d{1,3}(?:[.,]\d+)?\s*%|\d{1,3}(?:,\d{3})+|\d+(?:\.\d+)?\s*(?:k|m|million|thousand)\b)/i;

export function readCv(text: string): { facts: Found[]; years: number | null } {
  const facts: Found[] = [];
  const seen = new Set<string>();

  for (const [term, label, also] of SKILLS) {
    for (const t of [term, ...(also ?? [])]) {
      const re = word(t);
      if (!re.test(text)) continue;
      const proof = sentenceWith(text, re);
      if (!proof || seen.has(term)) continue;
      seen.add(term);
      facts.push({ kind: "skill", term, label, proof });
      break;
    }
  }

  /* Achievements: a sentence with a number in it. The number is the
     thing a job application can actually use, and the proof is the line
     itself so nothing is claimed that the CV did not say. */
  for (const line of text.split(/\n|(?<=\.)\s+/)) {
    const t = line.trim();
    if (t.length < 25 || t.length > 240) continue;
    if (!NUMBER.test(t)) continue;
    if (facts.some((f) => f.kind === "achievement" && f.proof === t)) continue;
    facts.push({ kind: "achievement", term: "metric", label: t.slice(0, 60), proof: t });
    if (facts.filter((f) => f.kind === "achievement").length >= 6) break;
  }

  /* Years: stated outright, or the span of the dated roles. Stated wins,
     because the person wrote it on purpose. */
  let years: number | null = null;
  const stated = YEARS.exec(text);
  if (stated) years = Number(stated[1]);
  else {
    const spans = [...text.matchAll(RANGE)].map((m) => {
      const from = Number(m[0].slice(0, 4));
      const toRaw = m[2].toLowerCase();
      const to = /present|now/.test(toRaw) ? new Date().getFullYear() : Number(toRaw);
      return { from, to };
    });
    if (spans.length) {
      const from = Math.min(...spans.map((s) => s.from));
      const to = Math.max(...spans.map((s) => s.to));
      if (to > from && to - from < 60) years = to - from;
    }
  }

  return { facts, years };
}
