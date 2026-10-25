import Frame from "../../../components/Frame";

const colours: [string, string, string][] = [
  ["Page", "--page", "#171717 — the ground"],
  ["Panel", "--panel", "#0D0D0D — recessed, never raised"],
  ["Raise", "--raise", "#252524 — buttons only"],
  ["Grid", "--grid", "#343433 — ornament"],
  ["Line", "--line", "#2B2B29 — controls"],
  ["Ink", "--ink", "#FEFDF4 — warm, not white"],
  ["Ink 3", "--ink-3", "#A3A29B — 7.6:1 on panel"],
  ["Mark", "--mark", "#FF9602 — the only accent"],
];

export default function System() {
  return (
    <Frame word="Marks" caption="THE DESIGN LANGUAGE" step={-1} wide>
      <div className="enter stack" style={{ gap: 32 }}>
        <section>
          <p className="label" style={{ margin: "0 0 4px" }}>Colour</p>
          <p className="faint" style={{ fontSize: 14, margin: "0 0 16px", maxWidth: 560 }}>
            Sampled from the reference, not invented. One accent. The working panel is cut into
            the page rather than floated on it, so nothing needs a shadow.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
            {colours.map(([name, token, use]) => (
              <div key={token}>
                <div style={{ height: 52, background: `var(${token})`, border: "1px solid var(--line)", borderRadius: "var(--r)" }} />
                <p style={{ margin: "9px 0 2px", fontSize: 14, color: "var(--ink-2)" }}>{name}</p>
                <p className="faint" style={{ margin: 0, fontSize: 12.5 }}>{use}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <p className="label" style={{ margin: "0 0 4px" }}>Type</p>
          <p className="faint" style={{ fontSize: 14, margin: "0 0 16px", maxWidth: 560 }}>
            Playfair Display names the place you are standing and labels the one action that moves
            you forward. Inter does everything you operate. Nothing in between.
          </p>
          <div className="rows">
            <div className="row" style={{ gridTemplateColumns: "minmax(0,1fr) 200px" }}>
              <span className="word" style={{ fontSize: 44 }}>Pitch</span>
              <span className="faint" style={{ fontSize: 13 }}>Playfair 58 · the place</span>
            </div>
            <div className="row" style={{ gridTemplateColumns: "minmax(0,1fr) 200px" }}>
              <span className="btn-label-italic" style={{ color: "var(--ink)" }}>Approve and copy &rarr;</span>
              <span className="faint" style={{ fontSize: 13 }}>Playfair italic 17 · the one action</span>
            </div>
            <div className="row" style={{ gridTemplateColumns: "minmax(0,1fr) 200px" }}>
              <span style={{ color: "var(--ink)", fontSize: 16 }}>Your full name</span>
              <span className="faint" style={{ fontSize: 13 }}>Inter 16 · field label</span>
            </div>
            <div className="row" style={{ gridTemplateColumns: "minmax(0,1fr) 200px" }}>
              <span className="label">Built from</span>
              <span className="faint" style={{ fontSize: 13 }}>Inter 12/.1em caps · section</span>
            </div>
          </div>
        </section>

        <section>
          <p className="label" style={{ margin: "0 0 16px" }}>Controls</p>
          <div className="inline wrap" style={{ gap: 10, alignItems: "center" }}>
            <button className="btn-live" type="button"><span className="btn-label-italic">Live edge &rarr;</span></button>
            <button className="btn" type="button">Secondary</button>
            <button className="btn btn-quiet" type="button">Quiet</button>
            <button className="choice" type="button" aria-pressed="true">Chosen</button>
            <button className="choice" type="button">Not chosen</button>
            <span className="tag">Fact</span>
            <span className="tag tag--mark">Verified</span>
            <span className="tag tag--gap">Gap</span>
          </div>
          <input className="control" style={{ maxWidth: 360, marginTop: 16 }} placeholder="Outlined, never filled" />
          <p className="faint" style={{ fontSize: 13.5, margin: "14px 0 0", maxWidth: 560 }}>
            The gradient edge appears exactly once per screen, on the thing that moves you forward.
            If two of them are visible, one is wrong.
          </p>
        </section>

        <section>
          <p className="label" style={{ margin: "0 0 12px" }}>The contract</p>
          <ul className="stack" style={{ gap: 9, margin: 0, padding: 0, listStyle: "none" }}>
            <li className="muted" style={{ fontSize: 14 }}><span style={{ color: "var(--ink)" }}>Nothing generated appears without its sources.</span> Every draft carries a Built from row.</li>
            <li className="muted" style={{ fontSize: 14 }}><span style={{ color: "var(--ink)" }}>Missing stays missing.</span> A gap gets a hollow red mark and a plain sentence, never a plausible one.</li>
            <li className="muted" style={{ fontSize: 14 }}><span style={{ color: "var(--ink)" }}>Three verbs on every draft.</span> Use this · Edit · Try again.</li>
            <li className="muted" style={{ fontSize: 14 }}><span style={{ color: "var(--ink)" }}>Confidence is labelled.</span> Verified, Likely or Unknown — never implied.</li>
            <li className="muted" style={{ fontSize: 14 }}><span style={{ color: "var(--ink)" }}>Nothing is sent for you.</span> Outreach is drafted and copied.</li>
          </ul>
        </section>
      </div>
    </Frame>
  );
}
