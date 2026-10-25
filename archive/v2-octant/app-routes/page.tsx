import Link from "next/link";
import Frame from "../../components/Frame";

const waiting = [
  { title: "Finish the Monzo application", detail: "Resume tailored · 2 answers left", href: "/jobs/monzo-spd/prepare", cta: "Continue" },
  { title: "Follow up with Starling Bank", detail: "Applied 6 days ago · recruiter found · nothing sent", href: "/pipeline", cta: "Draft it" },
  { title: "Find someone at GoCardless", detail: "Applied 9 days ago · no contact on record", href: "/pipeline", cta: "Find" },
];

/* Today answers one question: what do I do now. How the search is going
   lives with the record on /pipeline, so no figure is stated twice. */
export default function Today() {
  return (
    <Frame word="Today" caption="WHAT NEEDS YOU" step={-1}>
      <div className="enter stack" style={{ height: "100%" }}>
        <p className="label" style={{ margin: "0 0 12px" }}>Three things, then you are done</p>

        <div className="rows">
          {waiting.map((w) => (
            <Link
              key={w.title}
              href={w.href}
              className="row row-link"
              style={{ gridTemplateColumns: "minmax(0,1fr) auto", padding: "18px 0" }}
            >
              <span className="grow">
                <span style={{ color: "var(--ink)", display: "block" }}>{w.title}</span>
                <span className="faint" style={{ fontSize: 14 }}>{w.detail}</span>
              </span>
              <span className="btn btn-sm btn-quiet">{w.cta} &rarr;</span>
            </Link>
          ))}
        </div>

        <p className="muted" style={{ fontSize: 14, margin: "24px 0 0", lineHeight: 1.55 }}>
          Thirty-one jobs you called relevant were saved and never opened again. Applying is the
          leak in your search, not discovery.
        </p>

        <div className="inline" style={{ gap: 12, marginTop: "auto", paddingTop: 24 }}>
          <Link href="/jobs" className="btn-live">
            <span className="btn-label-italic">7 new matches &rarr;</span>
          </Link>
          <Link href="/pipeline" className="btn btn-quiet">Open the tracker</Link>
        </div>
      </div>
    </Frame>
  );
}
