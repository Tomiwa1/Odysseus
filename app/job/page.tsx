import { redirect } from "next/navigation";
import { JOBS } from "../../lib/jobs";
import { myFacts, myGaps, myYears, myPrefs } from "../../lib/me";
import { requireUser } from "../../lib/user";
import { pickForToday } from "../../lib/match";

/* /job on its own opens the role the top card on Today points at. */
export const dynamic = "force-dynamic";

export default async function TopJob() {
  const u = await requireUser();
  const me = { facts: myFacts(u), gaps: myGaps(), years: myYears(u) };
  const job = pickForToday(JOBS, myPrefs(u), me, 1)[0]?.job ?? JOBS[0];
  redirect(`/job/${encodeURIComponent(job.id)}`);
}
