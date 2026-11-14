import { redirect } from "next/navigation";
import { jobs } from "../../lib/jobs";
import { myFacts, myGaps, myYears, myPrefs } from "../../lib/me";
import { requireUser } from "../../lib/user";
import { pickForToday } from "../../lib/match";

/* /prepare on its own prepares the role the top card on Today points at. */
export const dynamic = "force-dynamic";

export default async function TopPrepare() {
  const u = await requireUser();
  const me = { facts: myFacts(u), gaps: myGaps(), years: myYears(u) };
  const job = pickForToday(jobs(), myPrefs(u), me, 1)[0]?.job ?? jobs()[0];
  redirect(`/prepare/${encodeURIComponent(job.id)}`);
}
