/* Pull the requirements out of a posting.
 *
 * This is the part the job screen rests on: it claims to know what a
 * role asked for, line by line. So the rule is that every line it shows
 * must be a sentence the employer actually wrote. Nothing is summarised,
 * reworded or inferred. If the parse cannot find a requirements section,
 * it returns nothing and the screen says so, which is the honest
 * failure rather than a plausible-looking invention.
 */

const ENTITIES = {
  "&lt;": "<", "&gt;": ">", "&amp;": "&", "&quot;": '"', "&#39;": "'",
  "&nbsp;": " ", "&rsquo;": "’", "&lsquo;": "‘",
  "&rdquo;": "”", "&ldquo;": "“", "&mdash;": ", ", "&ndash;": ", ",
};

export function toText(html) {
  if (!html) return "";
  let s = String(html);
  /* feeds double-encode, so decode until it stops changing */
  for (let i = 0; i < 3; i++) {
    const before = s;
    s = s.replace(/&[a-z#0-9]+;/gi, (e) => ENTITIES[e.toLowerCase()] ?? e);
    if (s === before) break;
  }
  return s
    .replace(/<li[^>]*>/gi, "\n• ")
    .replace(/<\/(p|div|h[1-6]|ul|ol|li|tr)>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/ /g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/* The headings employers actually use. Ordered so the most specific win. */
const WANTED = /^\s*(?:what\s+you(?:['’]?ll)?\s+(?:need|bring|have)|what\s+we(?:['’]?re)?\s+looking\s+for|who\s+you\s+are|require(?:d|ments?)|qualifications?|minimum\s+qualifications?|basic\s+qualifications?|about\s+you|you\s+(?:have|will\s+have)|skills?\s+(?:and|&)\s+(?:experience|qualifications?)|your\s+experience|experience)\b.{0,40}$/i;
const STOP = /^\s*(?:benefits?|what\s+we\s+offer|perks?|compensation|salary|pay|about\s+(?:us|the\s+team|reddit|the\s+company)|equal\s+opportunity|eeo|our\s+values|why\s+join|how\s+to\s+apply|application\s+process|nice\s+to\s+have|bonus|preferred\s+qualifications?|interview\s+process)\b/i;

const BULLET = /^\s*(?:[•·▪◦‣*\-–—]|\d+[.)])\s+/;

/* A requirement is a sentence about the candidate, not a paragraph about
   the company. These are the tells that it is neither. */
const TOO_LONG = 320;
const TOO_SHORT = 18;

export function extractRequirements(body, { max = 10 } = {}) {
  const text = toText(body);
  if (!text) return [];

  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);

  const out = [];
  let inside = false;

  for (const line of lines) {
    const bare = line.replace(BULLET, "").replace(/:$/, "").trim();

    if (WANTED.test(bare) && bare.length < 70) { inside = true; continue; }
    if (inside && STOP.test(bare)) { inside = false; continue; }
    if (!inside) continue;

    /* Not every employer marks requirements as a list. Deliveroo writes
       each one as its own paragraph, so requiring a bullet threw the
       whole section away. A line inside a requirements section counts if
       it is a bullet, or if it reads like a sentence rather than a
       sub-heading: long enough, and punctuated or clearly a clause. */
    const looksLikeHeading = bare.length < 45 && !/[.!?,;]/.test(bare);
    if (!BULLET.test(line) && looksLikeHeading) continue;
    if (bare.length < TOO_SHORT || bare.length > TOO_LONG) continue;

    /* exactly what the employer wrote, trimmed of its bullet only */
    if (!out.includes(bare)) out.push(bare);
    if (out.length >= max) break;
  }

  return out;
}
