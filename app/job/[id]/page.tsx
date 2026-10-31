import { notFound } from "next/navigation";
import Job from "../../../components/Job";
import { JOBS, payLabel, whereLabel, agoLabel } from "../../../lib/jobs";
import { readJob } from "../../../lib/fit";

/* One job, read for real: the employer's own requirement lines, each
   matched against a fact from the profile. All of it on the server, so
   neither the snapshot nor the matcher ships to the browser. */
export default async function JobPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const job = JOBS.find((j) => j.id === decodeURIComponent(id));
  if (!job) notFound();

  return (
    <Job
      job={{
        id: job.id,
        company: job.company,
        title: job.title,
        where: whereLabel(job),
        remote: job.remote,
        pay: payLabel(job.pay),
        ago: agoLabel(job),
        sources: job.sources,
      }}
      fit={readJob(job)}
    />
  );
}
