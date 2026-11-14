import Pipeline, { type Row } from "../../components/Pipeline";
import { applications, job as findJob, daysSinceMoved } from "../../lib/db/queries";
import { requireUser } from "../../lib/user";
import { whereLabel } from "../../lib/jobs";

export const dynamic = "force-dynamic";

/* What is normal, said as a sentence.
 *
 * These are ranges, not promises, and the copy says which. The thing
 * the screen must never do is make silence feel like a verdict. */
function normalFor(stage: string, days: number) {
  if (stage === "saved") return days < 7 ? "Saved, not sent yet." : "Still only saved.";
  if (stage === "applied") {
    if (days <= 3) return "Early. Nothing to read into.";
    if (days <= 10) return "Most replies come inside ten days.";
    if (days <= 21) return "Past the point most people hear back.";
    return "Nothing has moved in over three weeks.";
  }
  if (stage === "replied") return "They replied. It is your turn.";
  if (stage === "interview") return "Booked. Worth preparing for.";
  return "";
}

function heatFor(stage: string, days: number): Row["heat"] {
  if (stage === "replied" || stage === "interview") return "warm";
  if (stage === "closed") return "cold";
  if (days <= 5) return "warm";
  if (days <= 14) return "cooling";
  return "cold";
}

export default async function PipelinePage() {
  const u = await requireUser();

  /* one await per application rather than a flatMap over promises: the
     job and the elapsed time both come from storage now */
  const rows: Row[] = (
    await Promise.all(
      (await applications(u)).map(async (a) => {
        const j = await findJob(a.jobId);
        if (!j) return null;
        const days = (await daysSinceMoved(a.id)) ?? 0;
        const row: Row = {
      id: a.jobId,
      org: j.company,
      role: j.title,
      stage: a.stage,
      days,
      normal: normalFor(a.stage, days),
      heat: heatFor(a.stage, days),
      /* "waiting on you" needs a connected inbox or calendar to be real,
         and neither is connected, so nothing claims it yet. */
      needs: a.stage === "replied"
        ? { what: `They replied about ${j.title}.`, act: "Reply", from: "" }
        : undefined,
          closedWhy: a.closedWhy ?? undefined,
        };
        return row;
      })
    )
  ).filter((r) => r !== null);

  return <Pipeline rows={rows} />;
}
