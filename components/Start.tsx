"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Logo from "./Logo";
import Portal from "./Portal";
import { UploadSimple, FileText, LinkedinLogo, PencilSimple, Check } from "./icons";

type State = "idle" | "over" | "busy" | "done";

const read = [
  { k: "Name", v: "Sam Adeyemi", missing: false },
  { k: "Current role", v: "Product Designer, PRYYD", missing: false },
  { k: "Experience", v: "3 roles · 2021 to now", missing: false },
  { k: "Skills", v: "11 found", missing: false },
  { k: "Portfolio", v: "No link found", missing: true },
];

export default function Start() {
  const [state, setState] = useState<State>("idle");
  const [pct, setPct] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  /* The upload is faked, but the states are the real ones the well has to
     carry: idle, something hovering over it, reading, and read.
     Progress is read off the clock rather than counted in ticks, so a
     throttled background tab still lands on 100 at the right moment. */
  function begin() {
    if (state === "busy" || state === "done") return;
    const started = Date.now();
    const RUN = 1500;
    setState("busy");
    setPct(0);
    timer.current = setInterval(() => {
      const p = Math.min(100, ((Date.now() - started) / RUN) * 100);
      setPct(p);
      if (p >= 100 && timer.current) {
        clearInterval(timer.current);
        timer.current = null;
        setTimeout(() => setState("done"), 300);
      }
    }, 40);
  }

  useEffect(() => () => { if (timer.current) clearInterval(timer.current); }, []);

  return (
    <div className="flow">
      <header className="flow-top">
        <Logo kind="letter" size={40} />
        <div className="steps" aria-label="Step 1 of 3">
          <i data-on={state !== "done"} data-done={state === "done"} />
          <i data-on={state === "done"} />
          <i />
        </div>
      </header>

      <main className="flow-body">
        <div className="flow-inner">
          <Portal size="flow" />

          {state !== "done" ? (
            <>
              <h1 className="display">Start with your CV.</h1>
              <p className="flow-sub">
                Odysseus reads it once, then stops asking you the same things.
              </p>

              <div
                className="well"
                data-state={state}
                role="button"
                tabIndex={0}
                aria-label="Upload your CV"
                onClick={begin}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); begin(); } }}
                onDragOver={(e) => { e.preventDefault(); if (state === "idle") setState("over"); }}
                onDragLeave={() => { if (state === "over") setState("idle"); }}
                onDrop={(e) => { e.preventDefault(); begin(); }}
              >
                {state === "busy" ? (
                  <>
                    <span className="well-file">
                      <FileText size={19} weight="fill" aria-hidden="true" style={{ color: "var(--brand)" }} />
                      sam-adeyemi-cv.pdf
                    </span>
                    <span className="track" aria-hidden="true"><i style={{ width: `${pct}%` }} /></span>
                    <span className="well-hint" style={{ marginTop: 12 }}>
                      {pct < 55 ? "Reading…" : pct < 100 ? "Pulling out roles and skills…" : "Almost there"}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="well-icon" aria-hidden="true">
                      <UploadSimple size={25} weight="bold" />
                    </span>
                    <span className="well-t">
                      Drop it here, or <b>browse</b>
                    </span>
                    <span className="well-hint">PDF or Word · up to 10MB</span>
                  </>
                )}
              </div>

              {state !== "busy" && (
                <div className="alts">
                  <button className="alt" type="button">
                    <span className="alt-icon alt-icon--in" aria-hidden="true"><LinkedinLogo size={21} weight="fill" /></span>
                    <span>
                      <span className="alt-t" style={{ display: "block" }}>Import from LinkedIn</span>
                      <span className="alt-s">Paste your profile link</span>
                    </span>
                  </button>
                  <button className="alt" type="button">
                    <span className="alt-icon alt-icon--pen" aria-hidden="true"><PencilSimple size={20} weight="fill" /></span>
                    <span>
                      <span className="alt-t" style={{ display: "block" }}>Start from scratch</span>
                      <span className="alt-s">A few questions, then you&apos;re in</span>
                    </span>
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="rise">
              <h1 className="display">Here&apos;s what we read.</h1>
              <p className="flow-sub">Fix anything wrong. The rest can wait.</p>

              <div className="well" data-state="done" style={{ minHeight: 0, display: "block", padding: "22px 26px" }}>
                <span className="well-file" style={{ marginBottom: 4 }}>
                  <Check size={18} weight="bold" aria-hidden="true" style={{ color: "var(--brand)" }} />
                  sam-adeyemi-cv.pdf
                </span>
                <div className="read-list">
                  {read.map((r) => (
                    <div className="read-row" key={r.k}>
                      <span className="read-k">{r.k}</span>
                      <span className="read-v" data-missing={r.missing}>{r.v}</span>
                      <button className="btn btn-quiet btn-sm" type="button">{r.missing ? "Add" : "Edit"}</button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flow-foot">
                <Link className="btn btn-primary" href="/question">Looks right</Link>
                <button
                  className="btn btn-quiet"
                  type="button"
                  onClick={() => { setState("idle"); setPct(0); }}
                >
                  Upload a different one
                </button>
              </div>

              <p className="flow-note">
                One question left, then you&apos;re searching.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
