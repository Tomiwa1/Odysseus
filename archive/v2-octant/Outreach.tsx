"use client";

import { useState } from "react";
import { contacts, jobs, type Contact } from "../lib/data";
import { DraftActions } from "./Draft";

const tone: Record<Contact["confidence"], string> = {
  Verified: "tag tag--mark",
  Likely: "tag",
  Unknown: "tag",
};

export default function Outreach({ jobId }: { jobId: string }) {
  const job = jobs.find((j) => j.id === jobId)!;
  const people = contacts[jobId] ?? [];
  const [selected, setSelected] = useState(people[0]?.name ?? null);
  const person = people.find((p) => p.name === selected);

  return (
    <div className="enter stack" style={{ gap: 22 }}>
      <div>
        <p className="label" style={{ margin: "0 0 4px" }}>Three people worth contacting</p>
        <p className="faint" style={{ fontSize: 14, margin: 0 }}>
          Taken from the post and public profiles. Anything marked <em>Likely</em> is a guess —
          check it before you use it.
        </p>
      </div>

      <div className="rows">
        {people.map((p) => (
          <button
            key={p.name}
            type="button"
            className="row row-link"
            aria-pressed={selected === p.name}
            onClick={() => setSelected(p.name)}
            style={{
              gridTemplateColumns: "minmax(0,1fr) auto", textAlign: "left",
              background: "none", border: 0, borderTop: "1px solid var(--line)",
              borderLeft: `2px solid ${selected === p.name ? "var(--mark)" : "transparent"}`,
              paddingLeft: 14, cursor: "pointer",
            }}
          >
            <span>
              <span className="inline" style={{ gap: 10 }}>
                <span style={{ color: "var(--ink)" }}>{p.name}</span>
                <span className={tone[p.confidence]}>{p.confidence}</span>
              </span>
              <span className="faint" style={{ display: "block", fontSize: 14, marginTop: 2 }}>
                {p.title} <span className="sep">·</span> {p.role}
              </span>
              <span className="faint" style={{ display: "block", fontSize: 13.5, marginTop: 6 }}>{p.why}</span>
            </span>
            <span className="faint" style={{ fontSize: 13, textAlign: "right" }}>
              {p.email ? <>{p.email}<br /><span className="sep">pattern guess</span></> : "No email found"}
            </span>
          </button>
        ))}
      </div>

      {person && (
        <div>
          <div className="inline between" style={{ marginBottom: 10 }}>
            <p className="label" style={{ margin: 0 }}>Message to {person.name.split(" ")[0]}</p>
            <span className="faint" style={{ fontSize: 13 }}>LinkedIn <span className="sep">·</span> 94 words</span>
          </div>

          <div className="draft">
            <div className="draft-body" style={{ whiteSpace: "pre-line" }}>
{`Hi ${person.name.split(" ")[0]},

I saw the ${job.role} role on the payments team. I have spent two years on payments products — most recently the beta of a username-based USDC wallet, and before that Kuda's account onboarding, where completion went up 18%.

The line about working alongside the design-systems team is what caught me. I built and kept Kuda's 40-component system, so I know the trade between moving fast on one surface and keeping the system honest.

I have applied. Happy to send work if it helps.

Sam`}
              <div className="draft-source">
                <p className="label" style={{ margin: "0 0 9px" }}>Built from</p>
                <div className="inline wrap" style={{ gap: 6 }}>
                  <span className="tag">Payment wallet <span className="sep" style={{ fontSize: 12 }}>PRYYD</span></span>
                  <span className="tag">+18% completion <span className="sep" style={{ fontSize: 12 }}>Kuda</span></span>
                  <span className="tag">40+ component system <span className="sep" style={{ fontSize: 12 }}>Kuda</span></span>
                  <span className="tag">“design systems” <span className="sep" style={{ fontSize: 12 }}>this post</span></span>
                </div>
              </div>
            </div>
            <DraftActions
              extra={<span className="faint" style={{ fontSize: 13, marginLeft: "auto" }}>Odysseus never sends it for you</span>}
            />
          </div>
        </div>
      )}

      <p className="faint" style={{ fontSize: 13, margin: 0 }}>
        Once applied, this becomes a tracked row at {job.company}, with a follow-up suggested for
        29 October if nobody replies.
      </p>
    </div>
  );
}
