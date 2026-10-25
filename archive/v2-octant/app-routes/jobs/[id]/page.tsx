import Link from "next/link";
import { notFound } from "next/navigation";
import Frame from "../../../../components/Frame";
import { jobs } from "../../../../lib/data";

export default async function JobPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const job = jobs.find((j) => j.id === id);
  if (!job) notFound();

  return (
    <Frame word="Match" caption="WHY THIS FITS" step={0}>
      <>
      <div className="pane-body enter">
        <div className="inline between" style={{ gap: 16, marginBottom: 6 }}>
          <div className="grow">
            <h2 style={{ fontSize: 21, color: "var(--ink)" }}>{job.role}</h2>
            <p className="faint" style={{ fontSize: 14, margin: "4px 0 0" }}>
              {job.company} <span className="sep">·</span> {job.remote} <span className="sep">·</span> {job.salary}
            </p>
          </div>
          <span className="serif num" style={{ fontSize: 40, lineHeight: 1, color: job.match >= 85 ? "var(--mark)" : "var(--ink-3)" }}>
            {job.match}
            <span style={{ fontSize: 17 }}>%</span>
          </span>
        </div>

        <p className="label" style={{ margin: "24px 0 2px" }}>What they ask for, against what you have</p>

        <ul className="rows" style={{ listStyle: "none", margin: "6px 0 0", padding: 0 }}>
          {job.requirements.map((r) => (
            <li key={r.text} className="row" style={{ gridTemplateColumns: "14px minmax(0,1fr)", gap: 14, alignItems: "flex-start", padding: "13px 0" }}>
              <span
                aria-hidden="true"
                style={{
                  marginTop: 5, width: 7, height: 7, borderRadius: "50%",
                  background: r.evidence ? "var(--mark)" : "transparent",
                  border: r.evidence ? "0" : "1.5px solid var(--red)",
                  boxSizing: "border-box",
                }}
              />
              <span>
                <span style={{ color: "var(--ink-2)", display: "block" }}>{r.text}</span>
                <span style={{ fontSize: 14, color: r.evidence ? "var(--ink-4)" : "var(--red)" }}>
                  {r.evidence ?? "Nothing on your profile covers this"}
                </span>
              </span>
            </li>
          ))}
        </ul>

        <p className="muted" style={{ fontSize: 14, margin: "24px 0 0", lineHeight: 1.55 }}>{job.summary}</p>

        <div className="inline wrap" style={{ gap: 6, marginTop: 20 }}>
          <span className="faint" style={{ fontSize: 13, marginRight: 4 }}>Found in</span>
          {job.sources.map((s) => <span key={s} className="tag">{s}</span>)}
        </div>

      </div>
      <div className="pane-foot">
        <Link href={`/jobs/${job.id}/prepare`} className="btn-live">
          <span className="btn-label-italic">Prepare application &rarr;</span>
        </Link>
        <button className="btn btn-quiet" type="button">Save</button>
        <Link href="/jobs" className="btn btn-quiet">Back</Link>
      </div>
      </>
    </Frame>
  );
}
