"use client";

import { useState } from "react";
import Link from "next/link";
import { jobs } from "../lib/data";
import { Source, DraftActions } from "./Draft";
import Outreach from "./Outreach";

const tabs = ["Resume", "Answers", "Outreach"] as const;
type Tab = (typeof tabs)[number];

const tailored = [
  {
    id: "b1",
    after:
      "Designed and launched the beta payments experience for a username-based USDC wallet, supporting 120 users and approximately $5K in transaction volume.",
    change: "Moved “payments” forward — the job description uses it 11 times.",
    facts: ["f1", "f2", "f3", "f4"],
  },
  {
    id: "b2",
    after:
      "Built and maintained a 40+ component design system used by three product squads, including shared payment and account patterns.",
    change: "Added the payment patterns you described on 12 Oct.",
    facts: ["f6", "f1"],
  },
];

const ats = [
  { ok: false, title: "“Design systems” appears once on your resume, nine times in the post", detail: "Your Kuda line already describes one. The exact phrase would help the parser.", action: "Apply" },
  { ok: false, title: "No enterprise or B2B experience found", detail: "Listed as preferred, not required. Odysseus will not write it in for you.", action: null },
  { ok: true, title: "Title aligns", detail: "Product Designer against Senior Product Designer.", action: null },
];

const options = ["KYC or identity checks", "Payment limits", "Fraud or risk flows", "Accessibility requirements", "Data consent", "None of these"];

export default function Prepare({ jobId }: { jobId: string }) {
  const job = jobs.find((j) => j.id === jobId)!;
  const [tab, setTab] = useState<Tab>("Resume");
  const [accepted, setAccepted] = useState<string[]>([]);
  const [picked, setPicked] = useState<string[]>([]);

  const foot =
    tab === "Resume" ? (
      <>
        <button type="button" className="btn-live" onClick={() => setTab("Answers")}>
          <span className="btn-label-italic">Next: answers &rarr;</span>
        </button>
        <button type="button" className="btn btn-quiet">Download PDF</button>
        <span className="faint" style={{ fontSize: 13, marginLeft: "auto" }}>{accepted.length}/2 accepted</span>
      </>
    ) : tab === "Answers" ? (
      <>
        <button type="button" className="btn-live" onClick={() => setTab("Outreach")}>
          <span className="btn-label-italic">Next: people &rarr;</span>
        </button>
        <button type="button" className="btn btn-quiet" onClick={() => setTab("Resume")}>Back</button>
      </>
    ) : (
      <>
        <button type="button" className="btn-live">
          <span className="btn-label-italic">Approve and copy &rarr;</span>
        </button>
        <button type="button" className="btn btn-quiet">Mark as applied</button>
        <span className="faint" style={{ fontSize: 13, marginLeft: "auto" }}>Never sent for you</span>
      </>
    );

  return (
    <>
      <div className="pane-head">
      <div className="inline between" style={{ gap: 16, marginBottom: 20 }}>
        <div className="grow truncate">
          <h2 style={{ fontSize: 19, color: "var(--ink)" }}>{job.role}</h2>
          <p className="faint" style={{ fontSize: 14, margin: "3px 0 0" }}>{job.company} <span className="sep">·</span> {job.salary}</p>
        </div>
        <Link href={`/jobs/${job.id}`} className="btn btn-sm btn-quiet">Back to match</Link>
      </div>

      <div className="inline" style={{ gap: 4, borderBottom: "1px solid var(--line)" }}>
        {tabs.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className="btn btn-sm btn-quiet"
            style={{
              borderRadius: 0, border: 0, borderBottom: `1px solid ${t === tab ? "var(--mark)" : "transparent"}`,
              color: t === tab ? "var(--ink)" : "var(--ink-4)", marginBottom: -1,
            }}
            aria-current={t === tab ? "page" : undefined}
          >
            {t}
          </button>
        ))}
      </div>
      </div>

      <div className="pane-body enter">
      {tab === "Resume" && (
        <div className="enter stack" style={{ gap: 26 }}>
          <section>
            <p className="label" style={{ margin: "0 0 4px" }}>Two changes suggested</p>
            <p className="faint" style={{ fontSize: 14, margin: "0 0 16px" }}>
              Nothing was invented. Each line is assembled from facts already on your profile.
            </p>
            <div className="stack" style={{ gap: 14 }}>
              {tailored.map((t) => (
                <div key={t.id} className="draft">
                  <div className="draft-body">
                    <p style={{ margin: 0 }}>{t.after}</p>
                    <p className="faint" style={{ fontSize: 13.5, margin: "12px 0 0" }}>{t.change}</p>
                    <Source ids={t.facts} />
                  </div>
                  <DraftActions
                    accepted={accepted.includes(t.id)}
                    onAccept={() => setAccepted((a) => (a.includes(t.id) ? a.filter((x) => x !== t.id) : [...a, t.id]))}
                    extra={<span className="faint" style={{ fontSize: 13, marginLeft: "auto" }}>Keep original</span>}
                  />
                </div>
              ))}
            </div>
          </section>

          <section>
            <div className="inline between" style={{ marginBottom: 12 }}>
              <p className="label" style={{ margin: 0 }}>ATS check</p>
              <span className="serif num mark" style={{ fontSize: 20 }}>94<span style={{ fontSize: 12 }}>%</span></span>
            </div>
            <div className="rows">
              {ats.map((a) => (
                <div key={a.title} className="row" style={{ gridTemplateColumns: "10px minmax(0,1fr) auto", gap: 14, alignItems: "flex-start" }}>
                  <span
                    aria-hidden="true"
                    style={{
                      marginTop: 6, width: 7, height: 7, borderRadius: "50%",
                      background: a.ok ? "var(--ink-5)" : "var(--mark)",
                    }}
                  />
                  <span>
                    <span style={{ color: "var(--ink-2)", display: "block", fontSize: 14.5 }}>{a.title}</span>
                    <span className="faint" style={{ fontSize: 13.5 }}>{a.detail}</span>
                  </span>
                  {a.action && <button type="button" className="btn btn-sm">{a.action}</button>}
                </div>
              ))}
            </div>
          </section>

        </div>
      )}

      {tab === "Answers" && (
        <div className="enter stack" style={{ gap: 22 }}>
          <div>
            <p className="label" style={{ margin: "0 0 4px" }}>Three answered from your profile, one left</p>
            <p style={{ margin: "10px 0 0", color: "var(--ink)", fontSize: 16 }}>
              “Tell us about a time you designed for a regulated constraint.”
            </p>
          </div>

          <div className="field">
            <span className="field-label">
              Which applied to your work at PRYYD or Kuda?
              <span className="hint" aria-hidden="true">?</span>
            </span>
            <div className="inline wrap" style={{ gap: 8, marginTop: 4 }}>
              {options.map((o) => (
                <button
                  key={o}
                  type="button"
                  className="choice"
                  aria-pressed={picked.includes(o)}
                  onClick={() => setPicked((p) => (p.includes(o) ? p.filter((x) => x !== o) : [...p, o]))}
                >
                  {o}
                </button>
              ))}
            </div>
            <p className="faint" style={{ fontSize: 13, margin: "6px 0 0" }}>
              Whatever you pick is saved to your profile, so this is the last time it is asked.
            </p>
          </div>

          {picked.length > 0 && picked[0] !== "None of these" && (
            <div className="draft enter">
              <div className="draft-body">
                <p style={{ margin: 0 }}>
                  At Kuda I rebuilt account onboarding around {picked.map((p) => p.toLowerCase()).join(" and ")},
                  working inside requirements I could not change. Completion rose 18% without removing
                  a single required step — the gain came from sequencing, and from explaining each
                  check at the moment it was asked for.
                </p>
                <Source ids={["f7", "f8"]} extra={picked} />
              </div>
              <DraftActions />
            </div>
          )}

        </div>
      )}

      {tab === "Outreach" && <Outreach jobId={jobId} />}
      </div>

      <div className="pane-foot">{foot}</div>
    </>
  );
}
