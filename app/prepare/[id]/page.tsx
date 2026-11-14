import { notFound } from "next/navigation";
import Prepare from "../../../components/Prepare";
import { jobs } from "../../../lib/jobs";
import { prepare } from "../../../lib/prepare";
import { myFacts, myGaps, myYears, myPrefs } from "../../../lib/me";
import { requireUser } from "../../../lib/user";

export const dynamic = "force-dynamic";

/* Preparing one real job. The rules run here, so the screen receives
   the pieces to review and nothing else. */
export default async function PreparePage({ params }: { params: Promise<{ id: string }> }) {
  const u = await requireUser();
  const me = { facts: myFacts(u), gaps: myGaps(), years: myYears(u) };
  const { id } = await params;
  const job = jobs().find((j) => j.id === decodeURIComponent(id));
  if (!job) notFound();

  return (
    <Prepare
      job={{ id: job.id, company: job.company, title: job.title }}
      prep={prepare(job, me)}
    />
  );
}
