"use client";

import { useState } from "react";
import Link from "next/link";
import Frame from "./Frame";

const extracted = [
  { field: "Name", value: "Sam Adeyemi", sure: true },
  { field: "Current role", value: "Product Designer, PRYYD", sure: true },
  { field: "Experience", value: "3 roles, 2021 — now", sure: true },
  { field: "Skills", value: "11 found", sure: true },
  { field: "Education", value: "BSc, University of Leeds", sure: true },
  { field: "Portfolio", value: "No link found", sure: false },
];

const answers = ["Higher conversion", "More completed applications", "Faster onboarding", "Fewer support issues", "No measurable result", "I don't know"];

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const [picked, setPicked] = useState<string[]>([]);

  const word = step === 0 ? "Start" : step === 1 ? "Read" : "Gap";
  const caption = step === 0 ? "BRING WHAT YOU HAVE" : step === 1 ? "CHECK OUR WORK" : "ONE THING MISSING";

  return (
    <Frame word={word} caption={caption} step={-1}>
      {step === 0 && (
        <div className="enter stack" style={{ gap: 0, height: "100%" }}>
          <h2 className="serif" style={{ fontSize: 28, color: "var(--ink)", marginBottom: 6 }}>
            Start with what you already have.
          </h2>
          <p className="muted" style={{ margin: "0 0 26px", fontSize: 15 }}>
            Odysseus reads it once, then stops asking you the same things.
          </p>

          <div className="stack" style={{ gap: 10 }}>
            {[
              { t: "Upload a resume", d: "PDF or Word — the fastest way in", go: 1 },
              { t: "Import from LinkedIn", d: "Paste your profile URL", go: 1 },
              { t: "Start from scratch", d: "A few questions, then you are in", go: 2 },
            ].map((o) => (
              <button
                key={o.t}
                type="button"
                className="row row-link"
                onClick={() => setStep(o.go)}
                style={{
                  display: "flex", alignItems: "center", gap: 14, textAlign: "left",
                  background: "none", border: "1px solid var(--line)", borderRadius: "var(--r)",
                  padding: "16px 18px", cursor: "pointer",
                }}
              >
                <span className="grow">
                  <span style={{ color: "var(--ink)", display: "block" }}>{o.t}</span>
                  <span className="faint" style={{ fontSize: 13.5 }}>{o.d}</span>
                </span>
                <span className="sep">&rarr;</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="enter stack" style={{ height: "100%" }}>
          <span className="tag tag--mark" style={{ alignSelf: "flex-start", marginBottom: 16 }}>
            sam-adeyemi-cv.pdf
          </span>
          <h2 className="serif" style={{ fontSize: 26, color: "var(--ink)", marginBottom: 6 }}>
            Here is what we read.
          </h2>
          <p className="muted" style={{ margin: "0 0 20px", fontSize: 15 }}>
            Correct anything wrong. The rest can wait.
          </p>

          <div className="rows">
            {extracted.map((e) => (
              <div key={e.field} className="row" style={{ gridTemplateColumns: "128px minmax(0,1fr) auto", padding: "12px 0" }}>
                <span className="faint" style={{ fontSize: 13.5 }}>{e.field}</span>
                <span style={{ fontSize: 14.5, color: e.sure ? "var(--ink-2)" : "var(--ink-5)" }}>{e.value}</span>
                <button type="button" className="btn btn-sm btn-quiet">{e.sure ? "Edit" : "Add"}</button>
              </div>
            ))}
          </div>

          <div className="inline" style={{ gap: 12, marginTop: "auto", paddingTop: 26 }}>
            <button type="button" className="btn-live" onClick={() => setStep(2)}>
              <span className="btn-label-italic">Looks right &rarr;</span>
            </button>
            <button type="button" className="btn btn-quiet" onClick={() => setStep(0)}>Back</button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="enter stack" style={{ height: "100%" }}>
          <p className="label" style={{ margin: "0 0 12px" }}>1 of 2</p>
          <h2 className="serif" style={{ fontSize: 25, color: "var(--ink)", marginBottom: 8, lineHeight: 1.2 }}>
            Your CV says you redesigned Kuda&apos;s onboarding.
          </h2>
          <p className="muted" style={{ margin: "0 0 22px", fontSize: 15 }}>
            Did it change anything measurable? That is the whole difference between a duty and an
            achievement.
          </p>

          <div className="inline wrap" style={{ gap: 8 }}>
            {answers.map((a) => (
              <button
                key={a}
                type="button"
                className="choice"
                aria-pressed={picked.includes(a)}
                onClick={() => setPicked((p) => (p.includes(a) ? p.filter((x) => x !== a) : [...p, a]))}
              >
                {a}
              </button>
            ))}
          </div>

          <div className="inline" style={{ gap: 12, marginTop: "auto", paddingTop: 26 }}>
            <Link href="/" className="btn-live">
              <span className="btn-label-italic">Find me jobs &rarr;</span>
            </Link>
            <Link href="/" className="btn btn-quiet">Skip for now</Link>
          </div>

          <p className="faint" style={{ fontSize: 13, margin: "16px 0 0" }}>
            78% complete. Enough to start — the rest is asked for when a job needs it.
          </p>
        </div>
      )}
    </Frame>
  );
}
