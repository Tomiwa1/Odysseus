import Frame from "../../../components/Frame";
import { pipeline, funnel, type Stage } from "../../../lib/data";

const stageTone: Record<Stage, string> = {
  Saved: "var(--ink-5)", Preparing: "var(--mark)", Applied: "var(--ink-3)",
  Outreach: "var(--ink-3)", Interview: "var(--ink)", Offer: "var(--ink)",
  Rejected: "var(--red)", Ghosted: "var(--ink-5)",
};

const cols = "minmax(0,1.25fr) 94px 94px 100px 108px minmax(0,1fr) 62px";

function Head() {
  return (
    <div className="row row-head" style={{ gridTemplateColumns: cols }}>
      <span className="label">Company</span>
      <span className="label">Stage</span>
      <span className="label">Applied</span>
      <span className="label">Resume</span>
      <span className="label">Contact</span>
      <span className="label">Next</span>
      <span />
    </div>
  );
}

function Row({ a }: { a: (typeof pipeline)[number] }) {
  const due = a.nextDue === 0;
  return (
    <div className="row" style={{ gridTemplateColumns: cols }}>
      <span className="truncate">
        <span style={{ color: "var(--ink)", display: "block" }}>{a.company}</span>
        <span className="faint" style={{ fontSize: 13.5 }}>{a.role}</span>
      </span>
      <span className="inline" style={{ gap: 8, fontSize: 14 }}>
        <i aria-hidden="true" style={{ width: 6, height: 6, borderRadius: "50%", background: stageTone[a.stage], flex: "none" }} />
        <span style={{ color: "var(--ink-3)" }}>{a.stage}</span>
      </span>
      <span className="faint num" style={{ fontSize: 13.5 }}>{a.applied}</span>
      <span className="faint truncate" style={{ fontSize: 13.5 }}>{a.resume}</span>
      <span className="faint truncate" style={{ fontSize: 13.5 }}>{a.contact ?? <span className="sep">None</span>}</span>
      <span className="truncate" style={{ fontSize: 13.5, color: due ? "var(--mark)" : "var(--ink-4)" }}>
        {a.next ?? <span className="sep">—</span>}
      </span>
      <span style={{ textAlign: "right" }}>
        {a.next && <button type="button" className="btn btn-sm btn-quiet">{due ? "Do it" : "Open"}</button>}
      </span>
    </div>
  );
}

export default function Pipeline() {
  const due = pipeline.filter((a) => a.nextDue === 0);
  const rest = pipeline.filter((a) => a.nextDue !== 0);

  return (
    <Frame word="Track" caption="EVERY APPLICATION" step={3} wide>
      <div className="enter stack" style={{ height: "100%" }}>
        <p className="label" style={{ margin: "0 0 18px" }}>
          24 sent <span className="sep">·</span> 8 this week <span className="sep">·</span> 5 answered
          <span className="sep"> · </span><span className="mark">3 waiting on you</span>
        </p>

        <Head />
        <div className="rows" style={{ borderLeft: "2px solid var(--mark)", paddingLeft: 14, marginLeft: -16 }}>
          {due.map((a) => <Row key={a.company} a={a} />)}
        </div>

        <p className="label" style={{ margin: "28px 0 0" }}>Waiting on them</p>
        <div className="rows" style={{ marginTop: 8 }}>
          {rest.map((a) => <Row key={a.company} a={a} />)}
        </div>

        <div style={{ marginTop: 28, paddingTop: 20, borderTop: "1px solid var(--line)" }}>
          <p className="label" style={{ margin: "0 0 14px" }}>Where the search leaks</p>
          <div className="stack" style={{ gap: 8, marginBottom: 26 }}>
            {funnel.map((s, i) => {
              const prev = i > 0 ? funnel[i - 1].value : null;
              const rate = prev ? Math.round((s.value / prev) * 100) : null;
              const worst = s.label === "Applied";
              return (
                <div key={s.label} className="inline" style={{ gap: 14 }}>
                  <span style={{ width: 86, flex: "none", fontSize: 14, color: worst ? "var(--ink)" : "var(--ink-3)" }}>{s.label}</span>
                  <span className="num" style={{ width: 36, flex: "none", textAlign: "right", color: "var(--ink-2)" }}>{s.value}</span>
                  <span className="grow">
                    <span className="meter" style={{ display: "block" }}>
                      <i style={{ width: `${Math.max(1.5, (s.value / funnel[0].value) * 100)}%`, background: worst ? "var(--mark)" : "var(--ink-5)" }} />
                    </span>
                  </span>
                  <span className="num faint" style={{ width: 40, flex: "none", textAlign: "right", fontSize: 13 }}>
                    {rate === null ? "" : `${rate}%`}
                  </span>
                </div>
              );
            })}
          </div>

          <p className="label" style={{ margin: "0 0 12px" }}>What the record says</p>
          <ul className="stack" style={{ gap: 9, margin: 0, padding: 0, listStyle: "none" }}>
            <li className="muted" style={{ fontSize: 14 }}>
              Applications sent with outreach get a reply <span className="mark">3.2&times;</span> more often.
              Nine of your 24 had no contact at all.
            </li>
            <li className="muted" style={{ fontSize: 14 }}>
              <span style={{ color: "var(--ink)" }}>Fintech PD v3</span> answers at 31%.
              General PD v1 answers at 8% across twelve sends.
            </li>
            <li className="muted" style={{ fontSize: 14 }}>
              Roles asking for 5+ years have replied once in nine attempts.
            </li>
          </ul>
          <p className="faint" style={{ fontSize: 13, margin: "14px 0 0" }}>
            Drawn from 24 applications. These get trustworthy past 40.
          </p>
        </div>
      </div>
    </Frame>
  );
}
