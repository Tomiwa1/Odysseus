import { notFound } from "next/navigation";
import Prepare from "../../../components/Prepare";
import { JOBS } from "../../../lib/jobs";
import { prepare } from "../../../lib/prepare";

/* Preparing one real job. The rules run here, so the screen receives
   the pieces to review and nothing else. */
export default async function PreparePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const job = JOBS.find((j) => j.id === decodeURIComponent(id));
  if (!job) notFound();

  return (
    <Prepare
      job={{ id: job.id, company: job.company, title: job.title }}
      prep={prepare(job)}
    />
  );
}
