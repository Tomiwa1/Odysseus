import Today, { type Item } from "../../components/Today";
import { JOBS, payLabel, whereLabel, agoLabel } from "../../lib/jobs";
import { pickForToday, DEFAULT_PREFS } from "../../lib/match";
import { requireUser } from "../../lib/user";

/* The matching runs on the server, so the 266-job snapshot never ships
   to the browser. The screen receives three cards and nothing else. */
export const dynamic = "force-dynamic";

export default async function TodayPage() {
  await requireUser();
  const picks = pickForToday(JOBS, DEFAULT_PREFS, 3);

  const matches: Item[] = picks.map(({ job, reasons }) => {
    const kept = reasons.filter((r) => r.ok).map((r) => r.why);
    const pay = payLabel(job.pay);
    return {
      id: job.id,
      kind: "match",
      title: job.title,
      meta: [job.company, whereLabel(job), pay ?? "salary not published"].join(" · "),
      /* the reasons come from the matcher, so the card can only claim
         what the feed actually said */
      why: `${kept[0]}. ${kept.slice(1, 3).join(". ")}. Posted ${agoLabel(job)}.`,
      cta: "Look at it",
      href: `/job/${encodeURIComponent(job.id)}`,
    };
  });

  const read = `Overnight it read ${JOBS.length.toLocaleString()} roles and kept ${picks.length}. The rest never reached you.`;

  return <Today matches={matches} read={read} />;
}
