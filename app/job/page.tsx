import Job from "../../components/Job";
import { JOBS, payLabel, whereLabel, agoLabel } from "../../lib/jobs";
import { pickForToday, DEFAULT_PREFS } from "../../lib/match";
import { readJob } from "../../lib/fit";

/* The job the top card on Today points at, read for real: the employer's
   own requirement lines, each matched against a fact from the profile.
   All of it on the server, so neither the snapshot nor the matcher ships
   to the browser. */
export default function JobPage() {
  const picks = pickForToday(JOBS, DEFAULT_PREFS, 3);
  const job = picks[0]?.job ?? JOBS[0];
  const fit = readJob(job);

  return (
    <Job
      job={{
        company: job.company,
        title: job.title,
        where: whereLabel(job),
        remote: job.remote,
        pay: payLabel(job.pay),
        ago: agoLabel(job),
        sources: job.sources,
      }}
      fit={fit}
    />
  );
}
