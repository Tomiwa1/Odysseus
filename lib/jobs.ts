import snapshot from "../data/jobs.json";

/* The real jobs, from ingest/. Regenerate with:
     node ingest/run.mjs --design && node ingest/snapshot.mjs

   Every field here is something a feed actually said. pay is null when
   the employer did not publish one, which is most of the time (13% do),
   and the screens have to say that rather than hide the job or guess. */

export type Pay =
  | { note: string; source: string }
  | { currency: string | null; low: number; high: number; source: string };

export type Job = {
  id: string;
  company: string;
  companySlug: string;
  title: string;
  titleKey: string;
  locations: string[];
  remote: boolean;
  hybrid: boolean;
  pay: Pay | null;
  postedAt: string | null;
  firstSeen: string;
  sources: { ats: string; url: string }[];
};

export const JOBS = snapshot.jobs as Job[];
export const RAN_AT = snapshot.ranAt as string;

export function payLabel(pay: Pay | null): string | null {
  if (!pay) return null;
  if ("note" in pay) return pay.note;
  const fmt = (n: number) =>
    n >= 1000 ? `${Math.round(n / 1000)}K` : String(n);
  const sym = { GBP: "£", USD: "$", EUR: "€" }[pay.currency ?? ""] ?? "";
  return `${sym}${fmt(pay.low)} to ${sym}${fmt(pay.high)}`;
}

export function whereLabel(job: Job): string {
  if (job.locations.length === 0) return job.remote ? "Remote" : "Not stated";
  if (job.locations.length <= 2) return job.locations.join(" or ");
  return `${job.locations[0]} and ${job.locations.length - 1} more`;
}

/* "2 days ago", from the date the employer posted it where we have one
   and the date we first saw it otherwise. Never invented. */
export function agoLabel(job: Job): string {
  const when = job.postedAt || job.firstSeen;
  const days = Math.floor((Date.now() - new Date(when).getTime()) / 86_400_000);
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 30) return `${days} days ago`;
  const months = Math.round(days / 30);
  return months === 1 ? "last month" : `${months} months ago`;
}
