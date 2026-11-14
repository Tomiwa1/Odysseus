import { allJobs, type StoredJob } from "./db/queries";

/* The jobs, read from the database.
 *
 * They used to come from a committed JSON snapshot while the database
 * held a copy of the same rows. Two homes for one thing, so a scheduled
 * ingest would have updated one and left the screens reading the other.
 * There is one home now, and the snapshot is gone.
 *
 * Server only. Every caller is a server component, which is what keeps
 * a few hundred postings out of the browser. */

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
  requirements: string[];
  postedAt: string | null;
  firstSeen: string;
  sources: { ats: string; url: string }[];
};

export async function jobs(): Promise<Job[]> {
  return (await allJobs()) as unknown as Job[];
}

export function payLabel(pay: Pay | null): string | null {
  if (!pay) return null;
  if ("note" in pay) return pay.note;
  const fmt = (n: number) => (n >= 1000 ? `${Math.round(n / 1000)}K` : String(n));
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
