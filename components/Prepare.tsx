"use client";

import { useState } from "react";
import Logo from "./Logo";
import {
  CaretLeft, Check, PencilSimple, ArrowClockwise, ShieldCheck, Copy,
} from "./icons";

/* Prepare.
   Applying is the part that feels like bragging or lying, so this screen
   is built as reviewing rather than writing. Nothing is sent. Every piece
   names the facts it was built from, and every piece carries the same
   three controls in the same order. Approve them and the page empties,
   the same way the morning does. */

type Tab = "resume" | "answers" | "outreach";

const TABS: [Tab, string][] = [
  ["resume", "Resume"],
  ["answers", "Answers"],
  ["outreach", "Outreach"],
];

type Piece = { id: string; tab: Tab; t: string; body: string; from: string[]; note?: string };

const pieces: Piece[] = [
  {
    id: "summary", tab: "resume", t: "Your summary, rewritten for them",
    body: "Product designer, seven years in Nigerian fintech. I rebuilt onboarding at Kuda for 400,000 people and lifted completion by 18%, and I built the design system the rest of the team worked from.",
    from: ["Your CV, Kuda 2023", "The 18% you gave on Tuesday", "What Paystack asked for"],
  },
  {
    id: "bullets", tab: "resume", t: "Your Kuda bullets, reordered",
    body: "Onboarding moved to the top and the design system to second, because those are the first two things in their list. Nothing was reworded and nothing was added.",
    from: ["Your CV, Kuda 2023"],
    note: "Order changed. Wording untouched.",
  },
  {
    id: "why", tab: "answers", t: "Why do you want to work at Paystack?",
    body: "I have spent seven years making money move for people who did not trust it to. Paystack is the layer underneath most of what I already admire in this market, and onboarding is the part I keep coming back to.",
    from: ["Your CV", "What you said about Kuda"],
  },
  {
    id: "gap", tab: "answers", t: "Have you managed designers?",
    body: "No, and the draft says so. You have mentored informally at Kuda, which is what it says instead.",
    from: ["The gap you have not filled"],
    note: "This is one of the two gaps. It answers honestly.",
  },
  {
    id: "contact", tab: "outreach", t: "Ada Nwosu, Design Lead at Paystack",
    body: "Hello Ada. I saw the Senior Product Designer role. I rebuilt onboarding at Kuda for 400,000 people, which looks close to the first thing on your list. Happy to send the detail if it is useful.",
    from: ["Her LinkedIn, updated 3 weeks ago", "Your Kuda work"],
    note: "Verified contact. Copied to you, never sent for you.",
  },
];

export default function Prepare() {
  const [tab, setTab] = useState<Tab>("resume");
  const [ok, setOk] = useState<string[]>([]);

  const mine = pieces.filter((p) => p.tab === tab);
  const left = pieces.filter((p) => !ok.includes(p.id)).length;
  const approve = (id: string) => setOk((v) => (v.includes(id) ? v : [...v, id]));
  const count = (t: Tab) => pieces.filter((p) => p.tab === t && !ok.includes(p.id)).length;

  const Controls = ({ id }: { id: string }) => (
    <div className="p-acts">
      <button className="p-act p-act--go" type="button" onClick={() => approve(id)}>
        {tab === "outreach" ? <Copy size={15} weight="bold" aria-hidden="true" /> : null}
        {tab === "outreach" ? "Copy it" : "Use this"}
      </button>
      <button className="p-act" type="button">
        <PencilSimple size={15} weight="bold" aria-hidden="true" />
        <span>Edit</span>
      </button>
      <button className="p-act" type="button">
        <ArrowClockwise size={15} weight="bold" aria-hidden="true" />
        <span>Try again</span>
      </button>
    </div>
  );

  return (
    <div className="flow p-prep">
      <header className="flow-top hdr3">
        <button className="j-back" type="button" aria-label="Back to the job">
          <CaretLeft size={18} weight="bold" />
        </button>
        <Logo kind="letter" size={34} />
        <span className="p-spacer" aria-hidden="true" />
      </header>

      <main className="flow-body">
        <div className="flow-inner j-inner">
          <p className="eyebrow">Paystack · Senior Product Designer</p>
          <h1 className="display p-h1">
            {left === 0 ? "Ready when you are." : `${left} pieces to check.`}
          </h1>
          <p className="flow-sub p-sub">
            {left === 0
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
                {count(k) > 0 && <i className="p-dot">{count(k)}</i>}
              </button>
            ))}
          </div>

          <div className="p-list">
            {mine.map((p) => {
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

          <div className="flow-foot j-foot">
            <button className="btn btn-primary" type="button" disabled={left > 0}>
              {left > 0 ? `${left} left to check` : "Open the application"}
            </button>
          </div>
          <p className="flow-note p-foot">
            Odysseus never submits anything. The form opens, filled in, and you press send.
          </p>
        </div>
      </main>
    </div>
  );
}
