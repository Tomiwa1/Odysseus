/* The master resume, as structure rather than a document.

   Every bullet names the profile facts it rests on, by their term in
   profile.ts, and says nothing those facts do not. That is what lets
   Prepare reorder and check it without a model: it can see which line
   answers which requirement. Roles with no bullets stay empty rather
   than being written around; the gap is the profile's to fill. */

export type Bullet = { text: string; facts: string[] };
export type Role = { company: string; role: string; bullets: Bullet[] };

export const TITLE = "Product Designer";

export const RESUME: Role[] = [
  {
    company: "Kuda",
    role: "Product Designer",
    bullets: [
      { text: "Built and maintained the design system the product team worked from.", facts: ["design system"] },
      { text: "Ran usability tests on the flows I designed.", facts: ["usability test"] },
      {
        text: "Rebuilt onboarding in 2023. 400,000 people went through the new flow and completion rose 18%.",
        facts: ["onboarding", "at scale", "metric"],
      },
      { text: "Worked embedded in two product squads, alongside engineering.", facts: ["cross-functional"] },
    ],
  },
  { company: "Paga", role: "Product Designer", bullets: [] },
  { company: "Freelance", role: "Product design", bullets: [] },
];

export const SKILLS: Bullet = {
  text: "Product design, Prototyping",
  facts: ["product design", "prototyp"],
};

/* The facts that are words a screen reads for, and so can go in the
   skills line. "Portfolio" or "at scale" are true of you but are not
   skills; naming them there would read as padding. */
export const SKILL_TERMS = ["product design", "design system", "figma", "prototyp", "usability test"];
