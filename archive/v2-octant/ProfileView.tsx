"use client";

import { useState } from "react";
import { user, experience, skills, facts } from "../lib/data";
import { DraftActions } from "./Draft";

const effects = ["Users", "Revenue", "Transactions", "Transaction volume", "Conversion", "Retention", "Efficiency", "Product launch", "Something else"];

export default function ProfileView() {
  const [input, setInput] = useState("I ran the design for a card product launch at Kuda.");
  const [asked, setAsked] = useState(false);
  const [picked, setPicked] = useState<string[]>([]);

  return (
    <div className="enter stack" style={{ gap: 30 }}>
      <div>
        <div className="inline between" style={{ marginBottom: 8 }}>
          <span style={{ color: "var(--ink)" }}>{user.name}</span>
          <span className="faint num" style={{ fontSize: 13.5 }}>{user.completeness}% complete</span>
        </div>
        <span className="meter" style={{ display: "block" }}>
          <i style={{ width: `${user.completeness}%` }} />
        </span>
        <p className="faint" style={{ fontSize: 13.5, margin: "10px 0 0" }}>
          You do not need all of it. Odysseus asks for the rest when a specific job needs it.
        </p>
      </div>

      <section>
        <p className="label" style={{ margin: "0 0 12px" }}>Add experience <span className="sep">·</span> Kuda</p>

        <div className="field">
          <span className="field-label">What did you do? One sentence is enough.</span>
          <textarea
            className="control"
            rows={2}
            value={input}
            onChange={(e) => { setInput(e.target.value); setAsked(false); }}
          />
        </div>

        <div className="inline wrap" style={{ gap: 6, marginTop: 12 }}>
          <span className="faint" style={{ fontSize: 13 }}>Already understood:</span>
          {["Card product", "Launch", "Design lead", "Kuda", "Fintech"].map((t) => (
            <span key={t} className="tag">{t}</span>
          ))}
        </div>

        {!asked ? (
          <button type="button" className="btn-live" style={{ marginTop: 18 }} onClick={() => setAsked(true)}>
            <span className="btn-label-italic">Continue &rarr;</span>
          </button>
        ) : (
          <div className="enter" style={{ marginTop: 22, paddingTop: 20, borderTop: "1px solid var(--line)" }}>
            <p style={{ margin: "0 0 3px", color: "var(--ink)" }}>One question: what did the launch affect?</p>
            <p className="faint" style={{ fontSize: 13.5, margin: "0 0 14px" }}>
              Select all that apply, or skip. This is the only thing missing.
            </p>
            <div className="inline wrap" style={{ gap: 8 }}>
              {effects.map((e) => (
                <button
                  key={e}
                  type="button"
                  className="choice"
                  aria-pressed={picked.includes(e)}
                  onClick={() => setPicked((p) => (p.includes(e) ? p.filter((x) => x !== e) : [...p, e]))}
                >
                  {e}
                </button>
              ))}
            </div>

            {picked.length > 0 && (
              <div className="enter" style={{ marginTop: 22 }}>
                <p className="field-label" style={{ marginBottom: 10 }}>
                  Any numbers? Leave blank if you do not know — nothing will be invented.
                </p>
                <div className="inline wrap" style={{ gap: 10, marginBottom: 20 }}>
                  {picked.slice(0, 3).map((p) => (
                    <label key={p} className="inline" style={{ gap: 10 }}>
                      <span className="faint" style={{ fontSize: 13.5, minWidth: 92 }}>{p}</span>
                      <input className="control" style={{ width: 150, height: 40 }} placeholder="e.g. 12,000" />
                    </label>
                  ))}
                </div>

                <div className="draft">
                  <div className="draft-body">
                    <p style={{ margin: 0 }}>
                      Led design for the launch of Kuda&apos;s card product, owning the experience from
                      application through to first use
                      {picked.includes("Users") ? ", measured on new card activations" : ""}.
                    </p>
                    <p className="faint" style={{ fontSize: 13.5, margin: "12px 0 0" }}>
                      No numbers given, so none were claimed. Add one later and this line gets stronger.
                    </p>
                  </div>
                  <DraftActions />
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      <section>
        <p className="label" style={{ margin: "0 0 4px" }}>Experience</p>
        <div className="rows">
          {experience.map((e) => (
            <div key={e.company} className="row" style={{ gridTemplateColumns: "minmax(0,1fr)", gap: 0, alignItems: "stretch" }}>
              <div className="inline between" style={{ marginBottom: e.bullets.length ? 12 : 0 }}>
                <span>
                  <span style={{ color: "var(--ink)" }}>{e.role}</span>
                  <span className="faint"> at {e.company}</span>
                  <span className="sep" style={{ display: "block", fontSize: 13 }}>{e.period}</span>
                </span>
                {e.gaps > 0 && <span className="tag tag--mark">{e.gaps} unanswered</span>}
              </div>
              {e.bullets.map((b) => (
                <div key={b.text} style={{ marginTop: 10 }}>
                  <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.55 }}>{b.text}</p>
                  <div className="inline wrap" style={{ gap: 6, marginTop: 9 }}>
                    {b.facts.map((id) => {
                      const f = facts.find((x) => x.id === id)!;
                      return <span key={id} className="tag" title={f.source}>{f.label}</span>;
                    })}
                  </div>
                </div>
              ))}
              {e.bullets.length === 0 && (
                <p className="faint" style={{ fontSize: 13.5, margin: "10px 0 0" }}>
                  Nothing written yet. Two short answers turn this into resume language.
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      <section>
        <p className="label" style={{ margin: "0 0 12px" }}>Skills</p>
        <div className="inline wrap" style={{ gap: 6 }}>
          {skills.map((s) => <span key={s} className="tag">{s}</span>)}
        </div>
      </section>
    </div>
  );
}
