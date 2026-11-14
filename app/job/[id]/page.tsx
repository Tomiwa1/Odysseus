import { notFound } from "next/navigation";
import Job from "../../../components/Job";
import { JOBS, payLabel, whereLabel, agoLabel } from "../../../lib/jobs";
import { readJob } from "../../../lib/fit";
import { applications } from "../../../lib/db/queries";
import { myFacts, myGaps, myYears, myPrefs } from "../../../lib/me";
import { requireUser } from "../../../lib/user";

export const dynamic = "force-dynamic";

/* One job, read for real: the employer's own requirement lines, each
   matched against a fact from the profile. All of it on the server, so
   neither the snapshot nor the matcher ships to the browser. */
export default async function JobPage({ params }: { params: Promise<{ id: string }> }) {
  const u = await requireUser();
  const me = { facts: myFacts(u), gaps: myGaps(), years: myYears(u) };
  const { id } = await params;
  const job = JOBS.find((j) => j.id === decodeURIComponent(id));
  if (!job) notFound();

  const saved = applications(u).some((a) => a.jobId === job.id);

  return (
    <Job
      job={{
        id: job.id,
        saved,
        company: job.company,
        title: job.title,
        where: whereLabel(job),
        remote: job.remote,
        pay: payLabel(job.pay),
        ago: agoLabel(job),
        sources: job.sources,
      }}
      fit={readJob(job, me)}
    />
  );
}
