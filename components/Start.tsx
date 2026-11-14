"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Logo from "./Logo";
import Portal from "./Portal";
import { UploadSimple, FileText, LinkedinLogo, PencilSimple, Check } from "./icons";
import { uploadCv, type CvResult } from "../app/cv-actions";

type State = "idle" | "over" | "busy" | "done" | "failed";

export default function Start() {
  const [state, setState] = useState<State>("idle");
  const [pct, setPct] = useState(0);
  const [result, setResult] = useState<CvResult | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const picker = useRef<HTMLInputElement>(null);

  /* The file is read for real now. The progress bar is still a clock
     rather than a byte count, because the work is parsing on the server
     and there is nothing honest to measure. It never claims 100 until
     the server has actually answered. */
  function stopTimer() {
    if (timer.current) { clearInterval(timer.current); timer.current = null; }
  }

  async function send(file: File) {
    if (state === "busy") return;
    setState("busy");
    setResult(null);
    setPct(0);

    const started = Date.now();
    timer.current = setInterval(() => {
      /* eases towards 90 and waits there: the last stretch belongs to
         the server, and a bar that sits at 100 while nothing has come
         back is a lie about where the work is */
      const elapsed = Date.now() - started;
      setPct(90 * (1 - Math.exp(-elapsed / 900)));
    }, 40);

    const body = new FormData();
    body.append("cv", file);
    const res = await uploadCv(body);

    stopTimer();
    setPct(100);
    setResult(res);
    setTimeout(() => setState(res.ok ? "done" : "failed"), 250);
  }

  function pick(files: FileList | null) {
    const file = files?.[0];
    if (file) void send(file);
  }

  useEffect(() => () => stopTimer(), []);

  /* what the CV actually yielded, never a template */
  const read = result?.ok
    ? [
        { k: "File", v: result.filename, missing: false },
        { k: "Skills", v: `${result.skills} found`, missing: result.skills === 0 },
        {
          k: "Things you did",
          v: result.achievements === 1
            ? "1, with a number in it"
            : `${result.achievements}, with numbers in them`,
          missing: result.achievements === 0,
        },
        {
          k: "Experience",
          v: result.years != null ? `${result.years} years` : "No dates found",
          missing: result.years == null,
        },
      ]
    : [];

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

          {state !== "done" && state !== "failed" ? (
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
                onClick={() => picker.current?.click()}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); picker.current?.click(); } }}
                onDragOver={(e) => { e.preventDefault(); if (state === "idle") setState("over"); }}
                onDragLeave={() => { if (state === "over") setState("idle"); }}
                onDrop={(e) => { e.preventDefault(); pick(e.dataTransfer.files); }}
              >
                <input
                  ref={picker}
                  type="file"
                  accept="application/pdf,.pdf"
                  hidden
                  onChange={(e) => pick(e.target.files)}
                />
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
          ) : state === "failed" ? (
            /* nothing was written. The old profile is untouched, which is
               why this can afford to say plainly that it did not work. */
            <div className="rise">
              <h1 className="display">That one could not be read.</h1>
              <p className="flow-sub">
                {result && !result.ok ? result.why : "Something went wrong reading it."}
              </p>
              <p className="flow-sub" style={{ marginTop: 14 }}>
                Nothing has changed. Your profile is exactly as it was.
              </p>
              <div className="flow-foot">
                <button
                  className="btn btn-primary"
                  type="button"
                  onClick={() => { setState("idle"); setPct(0); setResult(null); }}
                >
                  Try another file
                </button>
              </div>
            </div>
          ) : (
            <div className="rise">
              <h1 className="display">Here&apos;s what we read.</h1>
              <p className="flow-sub">
                Only what your CV actually said. Nothing was added to fill a gap.
              </p>

              <div className="well" data-state="done" style={{ minHeight: 0, display: "block", padding: "22px 26px" }}>
                <span className="well-file" style={{ marginBottom: 4 }}>
                  <Check size={18} weight="bold" aria-hidden="true" style={{ color: "var(--brand)" }} />
                  {result?.ok ? result.filename : ""}
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
                  onClick={() => { setState("idle"); setPct(0); setResult(null); }}
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
