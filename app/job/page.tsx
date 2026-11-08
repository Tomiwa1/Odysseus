import { redirect } from "next/navigation";
import { JOBS } from "../../lib/jobs";
import { pickForToday, DEFAULT_PREFS } from "../../lib/match";

/* /job on its own opens the role the top card on Today points at. */
export const dynamic = "force-dynamic";

export default async function TopJob() {
  const job = pickForToday(JOBS, DEFAULT_PREFS, 1)[0]?.job ?? JOBS[0];
  redirect(`/job/${encodeURIComponent(job.id)}`);
}
