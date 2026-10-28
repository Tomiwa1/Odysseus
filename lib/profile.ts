/* The profile, in one place, so the screens and the matcher cannot drift
   apart. Every entry names where it came from, because nothing in this
   product is allowed to claim a fact without a source. */

export type Fact = { term: string; also?: string[]; proof: string };

export const YEARS = { value: 7, proof: "7 years across Kuda, Paga and freelance, from your CV" };

export const FACTS: Fact[] = [
  { term: "product design", also: ["product designer"], proof: "Product design, from your CV" },
  { term: "design system", also: ["design systems", "component library", "design token"], proof: "You built and maintained Kuda's design system" },
  { term: "onboarding", also: ["activation", "sign up", "signup"], proof: "You rebuilt Kuda's onboarding in 2023" },
  { term: "fintech", also: ["financial", "banking", "payments", "payment"], proof: "Kuda and Paga, back to back" },
  { term: "prototyp", proof: "Prototyping, from your CV" },
  { term: "usability test", also: ["user testing", "usability"], proof: "You ran usability tests at Kuda" },
  { term: "figma", proof: "Figma, from your CV" },
  /* "scale" on its own matched "tools and standards that scale", where
     the proof about 400,000 users does not answer the ask at all. The
     term has to be the noun sense to count. */
  { term: "at scale", also: ["high-scale", "high scale", "millions of", "large-scale"], proof: "400,000 people went through the flow you rebuilt" },
  { term: "cross-functional", also: ["engineers", "engineering", "squad", "partner with"], proof: "You were embedded in two squads at Kuda" },
  { term: "portfolio", proof: "Your portfolio is on your CV" },
  { term: "metric", also: ["measurable", "impact", "data-informed", "data informed"], proof: "Completion rose 18%, the number you gave" },
];

/* Things that are genuinely not in the profile. Named, so a gap can say
   what it is rather than only that something is missing. */
export const GAPS: Fact[] = [
  { term: "manag", also: ["mentor", "line management", "direct report", "people leadership", "hiring"], proof: "Nothing in your history says you have led people" },
  { term: "variable", also: ["advanced prototyping", "figma variables"], proof: "Figma variables are not mentioned anywhere you gave us" },
];
