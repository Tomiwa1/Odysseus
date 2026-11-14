"use client";

import { useState, useTransition } from "react";
import { moveStage } from "../app/actions";
import Link from "next/link";
import Logo from "./Logo";
import {
  CaretLeft, Check, Minus, Question, PencilSimple, ArrowClockwise, ShieldCheck,
} from "./icons";

/* Prepare.
   Applying is the part that feels like bragging or lying, so this screen
   is built as reviewing rather than writing. Nothing is sent. Every piece
   names the facts it was built from, and every piece carries the same
   three controls in the same order. Approve them and the page empties,
   the same way the morning does.

   The pieces come from lib/prepare.ts, which runs on rules alone: it
   reorders and names what is already on your profile. Answers and
   outreach need drafting, which is not connected yet, so those tabs say
   that instead of showing sample prose on a real job. */

type Tab = "resume" | "answers" | "outreach";

const TABS: [Tab, string][] = [
  ["resume", "Resume"],
  ["answers", "Answers"],
  ["outreach", "Outreach"],
];

type Verdict = "have" | "part" | "gap";
const MARK = { have: Check, part: Minus, gap: Question } as const;

export type Prep = {
  known: boolean;
  pieces: { id: string; t: string; body: string; list?: string[]; from: string[]; note?: string }[];
  checks: { verdict: Verdict; t: string; proof: string }[];
  gaps: { ask: string; proof: string }[];
  url: string | null;
};

const PENDING: Record<Exclude<Tab, "resume">, string> = {
  answers: "Answers to their questions need drafting, and drafting is not connected yet. Nothing is written until it is, so nothing here is made up.",
  outreach: "Finding the right people and drafting a note to them is not connected yet. When it is, every contact will say whether it is Verified, Likely or Unknown.",
};

const NUMBERS = ["No", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"];

export default function Prepare({
  job, prep,
}: {
  job: { id: string; company: string; title: string };
  prep: Prep;
}) {
  const [tab, setTab] = useState<Tab>("resume");
  const [ok, setOk] = useState<string[]>([]);
  const [, start] = useTransition();

  const { pieces } = prep;
  const left = pieces.filter((p) => !ok.includes(p.id)).length;
  const approve = (id: string) => setOk((v) => (v.includes(id) ? v : [...v, id]));

  const Controls = ({ id }: { id: string }) => (
    <div className="p-acts">
      <button className="p-act p-act--go" type="button" onClick={() => approve(id)}>
        Use this
      </button>
      <button className="p-act" type="button" aria-label="Edit">
        <PencilSimple size={15} weight="bold" aria-hidden="true" />
        <span>Edit</span>
      </button>
      <button className="p-act" type="button" aria-label="Try again">
        <ArrowClockwise size={15} weight="bold" aria-hidden="true" />
        <span>Try again</span>
      </button>
    </div>
  );

  const Row = ({ v, head, proof }: { v: Verdict; head: string; proof: string }) => {
    const Glyph = MARK[v];
    return (
      <li className="j-req" data-v={v}>
        <div className="j-req-head">
          <span className="j-mark" aria-hidden="true"><Glyph size={13} weight="bold" /></span>
          <span className="j-ask">{head}</span>
        </div>
        <p className="j-proof">{proof}</p>
      </li>
    );
  };

  const headline =
    left === 0 ? "Ready when you are." : `${NUMBERS[left] ?? left} ${left === 1 ? "piece" : "pieces"} to check.`;

  return (
    <div className="flow p-prep">
      <header className="flow-top hdr3">
        <Link className="j-back" href={`/job/${encodeURIComponent(job.id)}`} aria-label="Back to the job">
          <CaretLeft size={18} weight="bold" />
        </Link>
        <Logo kind="letter" size={34} />
        <span className="p-spacer" aria-hidden="true" />
      </header>

      <main className="flow-body">
        <div className="flow-inner j-inner">
          <p className="eyebrow">{job.company} · {job.title}</p>
          <h1 className="display p-h1">{headline}</h1>
          <p className="flow-sub p-sub">
            {!prep.known
              ? "They did not publish a requirements list, so there is nothing to tailor against. Your resume goes as it is."
              : left === 0
                ? "Everything here came from something you actually gave us. Nothing has been sent."
                : "Read each one and keep it, change it, or ask for another. Nothing is sent for you."}
          </p>

          <div className="p-tabs" role="tablist">
            {TABS.map(([k, label]) => (
              <button
                key={k}
                role="tab"
                type="button"
                className="p-tab"
                aria-selected={tab === k}
                onClick={() => setTab(k)}
              >
                {label}
                {k === "resume" && left > 0 && <i className="p-dot">{left}</i>}
              </button>
            ))}
          </div>

          {tab !== "resume" ? (
            <div className="p-list">
              <p className="p-pending">{PENDING[tab]}</p>
            </div>
          ) : (
            <>
              <div className="p-list">
                {pieces.map((p) => {
                  /* Kept pieces collapse to a line, so the page gets shorter
                     as you work through it, the same way the morning does. */
                  if (ok.includes(p.id)) {
                    return (
                      <div className="p-folded" key={p.id}>
                        <span className="j-mark" aria-hidden="true"><Check size={13} weight="bold" /></span>
                        <span className="p-folded-t">{p.t}</span>
                      </div>
                    );
                  }
                  return (
                    <article className="p-piece" key={p.id}>
                      <h2 className="p-t">{p.t}</h2>
                      <p className="p-body">{p.body}</p>
                      {p.list && (
                        <ol className="p-order">
                          {p.list.map((b) => <li key={b}>{b}</li>)}
                        </ol>
                      )}
                      {p.note && (
                        <p className="p-note">
                          <ShieldCheck size={14} weight="fill" aria-hidden="true" />
                          {p.note}
                        </p>
                      )}
                      <div className="p-from">
                        <span className="p-from-k">Based on</span>
                        {p.from.map((f) => <span className="p-from-v" key={f}>{f}</span>)}
                      </div>
                      <Controls id={p.id} />
                    </article>
                  );
                })}
              </div>

              {/* The check is a report, not a draft, so it carries no
                  controls. Each line says what it read. */}
              <h2 className="j-sec">ATS check</h2>
              <ul className="j-reqs">
                {prep.checks.map((c) => <Row key={c.t} v={c.verdict} head={c.t} proof={c.proof} />)}
              </ul>

              {prep.gaps.length > 0 && (
                <>
                  <h2 className="j-sec">Not claimed</h2>
                  <ul className="j-reqs">
                    {prep.gaps.map((g) => <Row key={g.ask} v="gap" head={g.ask} proof={g.proof} />)}
                  </ul>
                  <p className="j-honest">
                    These stay out of your resume. If you have done them,{" "}
                    <Link href="/profile">add them to your profile</Link> and this changes.
                  </p>
                </>
              )}
            </>
          )}

          <div className="flow-foot j-foot">
            {left > 0 || !prep.url ? (
              <button className="btn btn-primary" type="button" disabled>
                {left > 0 ? `${left} left to check` : "No application link found"}
              </button>
            ) : (
              /* Opening the posting is the moment the job stops being
                 saved and starts being applied for. Recording it here
                 means Pipeline is right without anyone remembering to
                 tell it. Odysseus still submits nothing. */
              <a
                className="btn btn-primary"
                href={prep.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => { start(() => { moveStage(job.id, "applied"); }); }}
              >
                Open the application
              </a>
            )}
          </div>
          <p className="flow-note p-foot">
            Odysseus never submits anything. The posting opens and you apply.
          </p>
        </div>
      </main>
    </div>
  );
}
