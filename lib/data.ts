/* Demo data for the Odysseus prototype. One fictional candidate, eight jobs,
   a populated pipeline. Everything the AI "generates" here is traceable to a
   fact on the profile — that provenance is the point of the design. */

export const user = {
  name: "Sam Adeyemi",
  title: "Product Designer",
  location: "London, UK",
  years: 4,
  completeness: 78,
};

export type Fact = { id: string; label: string; source: string };

export const facts: Fact[] = [
  { id: "f1", label: "Payment wallet", source: "PRYYD · role summary" },
  { id: "f2", label: "120 users", source: "You answered, 12 Oct" },
  { id: "f3", label: "~$5K transaction volume", source: "You answered, 12 Oct" },
  { id: "f4", label: "Beta launch", source: "PRYYD · role summary" },
  { id: "f5", label: "Product design", source: "CV import" },
  { id: "f6", label: "Design system, 40+ components", source: "Kuda · CV import" },
  { id: "f7", label: "Onboarding redesign", source: "Kuda · CV import" },
  { id: "f8", label: "+18% completion", source: "You answered, 12 Oct" },
];

export const experience = [
  {
    company: "PRYYD",
    role: "Product Designer",
    period: "2024 — now",
    bullets: [
      {
        text: "Designed and launched the beta experience for a username-based USDC payment wallet, supporting 120 users and approximately $5K in transaction volume.",
        facts: ["f1", "f2", "f3", "f4"],
      },
    ],
    gaps: 0,
  },
  {
    company: "Kuda",
    role: "Product Designer",
    period: "2022 — 2024",
    bullets: [
      {
        text: "Rebuilt the account onboarding flow, lifting completion by 18% across mobile and web.",
        facts: ["f7", "f8"],
      },
      {
        text: "Built and maintained a 40+ component design system used by three product squads.",
        facts: ["f6"],
      },
    ],
    gaps: 1,
  },
  {
    company: "Freelance",
    role: "Product & brand design",
    period: "2021 — 2022",
    bullets: [],
    gaps: 2,
  },
];

export const skills = [
  "Product design", "Figma", "Design systems", "UX research", "Prototyping",
  "Fintech", "Mobile", "Design engineering", "Accessibility",
];

export type Job = {
  id: string;
  role: string;
  company: string;
  logo: string;
  location: string;
  remote: string;
  salary: string;
  posted: string;
  match: number;
  sources: string[];
  strengths: string[];
  gaps: string[];
  summary: string;
  requirements: { text: string; evidence: string | null }[];
  saved?: boolean;
};

export const jobs: Job[] = [
  {
    id: "monzo-spd",
    role: "Senior Product Designer",
    company: "Monzo",
    logo: "M",
    location: "London, UK",
    remote: "Remote · UK",
    salary: "£75,000 – £95,000",
    posted: "8 hours ago",
    match: 92,
    sources: ["Company site", "LinkedIn", "Indeed"],
    strengths: ["4 years product design", "Fintech background", "Design systems", "Mobile"],
    gaps: ["Enterprise experience preferred"],
    summary:
      "Own end-to-end design for the payments surface — from problem definition through to shipped, measured product. You will work alongside a design-systems team and two researchers.",
    requirements: [
      { text: "4+ years designing consumer products", evidence: "4 years across PRYYD and Kuda" },
      { text: "Experience with payments or financial products", evidence: "USDC payment wallet at PRYYD" },
      { text: "Worked within a design system", evidence: "Built a 40+ component system at Kuda" },
      { text: "Shipped measurable improvements", evidence: "+18% onboarding completion at Kuda" },
      { text: "Enterprise or B2B exposure", evidence: null },
    ],
  },
  {
    id: "wise-pd",
    role: "Product Designer, Payments",
    company: "Wise",
    logo: "W",
    location: "London, UK",
    remote: "Hybrid · 2 days",
    salary: "£68,000 – £82,000",
    posted: "yesterday",
    match: 88,
    sources: ["Company site", "LinkedIn"],
    strengths: ["Payments", "Mobile", "Fintech"],
    gaps: ["Multi-market experience preferred"],
    summary:
      "Design money movement for customers sending across 40+ currencies. Heavy emphasis on clarity under regulatory constraint.",
    requirements: [
      { text: "3+ years product design", evidence: "4 years across PRYYD and Kuda" },
      { text: "Payments or transfers experience", evidence: "USDC payment wallet at PRYYD" },
      { text: "Comfortable with research", evidence: "UX research listed on profile" },
      { text: "Worked across multiple markets", evidence: null },
    ],
  },
  {
    id: "linear-de",
    role: "Design Engineer",
    company: "Linear",
    logo: "L",
    location: "Remote",
    remote: "Remote · Europe",
    salary: "$120,000 – $150,000",
    posted: "2 days ago",
    match: 74,
    sources: ["Company site"],
    strengths: ["Design systems", "Prototyping", "Front-end"],
    gaps: ["Production React at scale", "No shipped engineering role"],
    summary:
      "Sit between design and engineering, building the interface layer of Linear in production React.",
    requirements: [
      { text: "Strong visual and interaction design", evidence: "Product design across two fintechs" },
      { text: "Production React experience", evidence: null },
      { text: "Design systems", evidence: "Built a 40+ component system at Kuda" },
    ],
  },
  {
    id: "revolut-spd",
    role: "Senior Product Designer, Wealth",
    company: "Revolut",
    logo: "R",
    location: "London, UK",
    remote: "On-site · 3 days",
    salary: "£80,000 – £100,000",
    posted: "3 days ago",
    match: 71,
    sources: ["LinkedIn", "Indeed"],
    strengths: ["Fintech", "Mobile", "Product design"],
    gaps: ["Investing or wealth products", "5+ years preferred"],
    summary: "Design trading and wealth products for 40m customers.",
    requirements: [
      { text: "5+ years product design", evidence: null },
      { text: "Fintech experience", evidence: "PRYYD and Kuda" },
      { text: "Investing or wealth products", evidence: null },
    ],
  },
  {
    id: "form3-pd",
    role: "Product Designer",
    company: "Form3",
    logo: "F",
    location: "Remote",
    remote: "Remote · UK",
    salary: "£65,000 – £78,000",
    posted: "4 days ago",
    match: 69,
    sources: ["Company site", "Otta"],
    strengths: ["Payments", "Design systems"],
    gaps: ["Enterprise / B2B SaaS", "Developer-facing products"],
    summary: "Payments infrastructure for banks. Developer-facing, API-first.",
    requirements: [
      { text: "3+ years product design", evidence: "4 years across PRYYD and Kuda" },
      { text: "B2B or developer-facing products", evidence: null },
      { text: "Payments domain knowledge", evidence: "USDC payment wallet at PRYYD" },
    ],
  },
];

export type Contact = {
  name: string;
  title: string;
  role: "Hiring manager" | "Recruiter" | "Team member";
  confidence: "Verified" | "Likely" | "Unknown";
  email: string | null;
  emailConfidence: "Verified" | "Likely" | "Unknown";
  why: string;
};

export const contacts: Record<string, Contact[]> = {
  "monzo-spd": [
    {
      name: "Priya Raman",
      title: "Design Lead, Payments",
      role: "Hiring manager",
      confidence: "Likely",
      email: "p.raman@monzo.com",
      emailConfidence: "Likely",
      why: "Named on the job post as the role's reporting line.",
    },
    {
      name: "Tom Castle",
      title: "Talent Partner, Design",
      role: "Recruiter",
      confidence: "Verified",
      email: null,
      emailConfidence: "Unknown",
      why: "Posted this role on LinkedIn 8 hours ago.",
    },
    {
      name: "Aoife Byrne",
      title: "Senior Product Designer, Payments",
      role: "Team member",
      confidence: "Verified",
      email: null,
      emailConfidence: "Unknown",
      why: "On the team you would join. Also worked in design systems.",
    },
  ],
};

export type Stage =
  | "Saved" | "Preparing" | "Applied" | "Outreach"
  | "Interview" | "Offer" | "Rejected" | "Ghosted";

export const pipeline: {
  company: string; role: string; stage: Stage; applied: string;
  resume: string; contact: string | null; next: string | null; nextDue: number | null;
}[] = [
  { company: "Monzo", role: "Senior Product Designer", stage: "Preparing", applied: "—", resume: "Fintech PD v3", contact: "Priya Raman", next: "Finish it", nextDue: 0 },
  { company: "Starling Bank", role: "Product Designer", stage: "Applied", applied: "6 days ago", resume: "Fintech PD v3", contact: "Dan Whitfield", next: "Follow up", nextDue: 0 },
  { company: "Cleo", role: "Senior Product Designer", stage: "Interview", applied: "12 days ago", resume: "Fintech PD v2", contact: "Maya Osei", next: "Review on Thursday", nextDue: 2 },
  { company: "Wise", role: "Product Designer, Payments", stage: "Outreach", applied: "3 days ago", resume: "Fintech PD v3", contact: "Lukas Brandt", next: "No reply yet", nextDue: 1 },
  { company: "GoCardless", role: "Product Designer", stage: "Applied", applied: "9 days ago", resume: "General PD v1", contact: null, next: "Find a contact", nextDue: 0 },
  { company: "Zilch", role: "Senior Product Designer", stage: "Ghosted", applied: "21 days ago", resume: "General PD v1", contact: null, next: null, nextDue: null },
  { company: "Checkout.com", role: "Product Designer", stage: "Rejected", applied: "18 days ago", resume: "General PD v1", contact: "Ana Ferreira", next: null, nextDue: null },
  { company: "Plaid", role: "Product Designer", stage: "Saved", applied: "—", resume: "—", contact: null, next: "Prepare it", nextDue: 4 },
];

export const funnel = [
  { label: "Discovered", value: 412 },
  { label: "Relevant", value: 68 },
  { label: "Applied", value: 24 },
  { label: "Responses", value: 5 },
  { label: "Interviews", value: 3 },
  { label: "Offers", value: 0 },
];
