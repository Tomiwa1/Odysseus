"use client";

import { useState } from "react";
import Logo from "./Logo";
import {
  CaretLeft, Check, Minus, Question, Clock, CaretDown,
  PencilSimple, ArrowClockwise, PaperPlane,
} from "./icons";

/* Job detail.
   Two jobs, in this order: say honestly how well this fits, then show that
   anything drafted came from facts the user actually gave. A score on its
   own is a guess you are asked to trust. Every line here can be checked. */

type Verdict = "have" | "part" | "gap";

/* The three facts anyone actually decides on, set as a row, with the
   trivia demoted to one line underneath. Pressed into the page rather
   than raised off it: the requirement cards below are the things you
   read, and this is the ground they sit on. */
const pairs = [
  { k: "Salary", v: "₦18m to ₦24m" },
  { k: "Where", v: "Lagos or remote" },
  { k: "Type", v: "Full time" },
];


const MARK = { have: Check, part: Minus, gap: Question } as const;

const reqs: { v: Verdict; ask: string; proof: string }[] = [
  { v: "have", ask: "5+ years in product design", proof: "7 years across Kuda, Paga, and freelance before that." },
  { v: "have", ask: "Fintech or payments", proof: "Kuda (banking) and Paga (payments), back to back." },
  { v: "have", ask: "Owned onboarding or activation", proof: "You rebuilt Kuda's onboarding in 2023 and owned it end to end." },
  { v: "have", ask: "Built a design system", proof: "Kuda's component library. You built it, and you maintained it for two years." },
  { v: "have", ask: "Shipped at scale", proof: "400,000 people went through the flow you rebuilt." },
  { v: "part", ask: "Research and usability testing", proof: "You ran usability tests at Kuda. Nothing on your CV about running research as a practice." },
  { v: "gap", ask: "Figma variables and advanced prototyping", proof: "Not mentioned anywhere in what you gave us. If you've done it, it belongs on the CV." },
  { v: "gap", ask: "Managed or mentored designers", proof: "Nothing in your history says you've led people." },
];

export default function Job() {
  const [showHave, setShowHave] = useState(false);
  const [saved, setSaved] = useState(false);

  const have = reqs.filter((r) => r.v === "have").length;
  const pct = Math.round((have / reqs.length) * 100);

  /* Five of the eight rows said "you have this" and read identically.
     They fold into one line that opens, so the three worth reading are
     not buried in five that are not. The verdict label went with them:
     the mark says it, and the proof underneath says it properly. */
  const haveRows = reqs.filter((r) => r.v === "have");
  const otherRows = reqs.filter((r) => r.v !== "have");

  const Row = ({ r }: { r: (typeof reqs)[number] }) => {
    const Glyph = MARK[r.v];
    return (
      <li className="j-req" data-v={r.v}>
        <div className="j-req-head">
          <span className="j-mark" aria-hidden="true"><Glyph size={13} weight="bold" /></span>
          <span className="j-ask">{r.ask}</span>
        </div>
        <p className="j-proof">{r.proof}</p>
      </li>
    );
  };

  const FactsBlock = () => (
    <div className="j-facts">
      <span className="j-pairs">
        {pairs.map(({ k, v }) => (
          <span className="j-pair" key={k}>
            <span className="j-pair-k">{k}</span>
            <span className="j-pair-v">{v}</span>
          </span>
        ))}
      </span>
      <span className="j-tail">
        <Clock size={13} weight="fill" aria-hidden="true" />
        Permanent · Posted 2 days ago on LinkedIn
      </span>
    </div>
  );

  return (
    <div className="flow j-job">
      <header className="flow-top hdr3">
        <button className="j-back" type="button" aria-label="Back to today">
          <CaretLeft size={18} weight="bold" />
        </button>
        <Logo kind="letter" size={34} />
        <button
          className="j-save"
          type="button"
          aria-pressed={saved}
          aria-label={saved ? "Saved to your list" : "Save this role"}
          onClick={() => setSaved((v) => !v)}
        >
          {saved ? "Saved" : "Save"}
        </button>
      </header>

      <main className="flow-body">
        <div className="flow-inner j-inner">
          <p className="eyebrow">Paystack</p>
          <h1 className="display j-h1">Senior Product Designer</h1>
          <FactsBlock />

          {/* The dial never stands alone. The sentence beside it says the
              same thing in words, and the list underneath is what can
              actually be checked. */}
          <div className="j-score">
            <span className="j-ring" style={{ ["--p" as string]: `${pct}%` }} aria-hidden="true">
              <b>{pct}%</b>
            </span>
            <span className="j-score-t">
              <b>{have} of {reqs.length} things they asked for, you have done.</b>
              <span>One you&apos;ve partly done. Two you haven&apos;t.</span>
            </span>
          </div>

          <h2 className="j-sec">What they asked for</h2>
          <button
            className="j-fold"
            type="button"
            aria-expanded={showHave}
            onClick={() => setShowHave((v) => !v)}
          >
            <span className="j-mark" aria-hidden="true"><Check size={13} weight="bold" /></span>
            <span className="j-fold-t">
              <b>Five of these you clearly have</b>
              <span>{haveRows.map((r) => r.ask).join(" · ")}</span>
            </span>
            <CaretDown size={15} weight="bold" aria-hidden="true" data-open={showHave} />
          </button>

          <div className="fold" data-open={showHave}>
            <div className="fold-in">
              <ul className="j-reqs" style={{ paddingTop: 8 }}>
                {haveRows.map((r) => <Row r={r} key={r.ask} />)}
              </ul>
            </div>
          </div>

          <p className="j-needs">The three worth reading</p>
          <ul className="j-reqs">
            {otherRows.map((r) => <Row r={r} key={r.ask} />)}
          </ul>

          {/* The sources contract: nothing drafted appears without the facts
              it was built from, named. */}
          <h2 className="j-sec">What Odysseus would say for you</h2>
          <div className="j-draft">
            <p className="j-draft-t">
              “Rebuilt onboarding at Kuda, taking 400,000 people through a flow I owned
              end to end, and lifting completion by 18%.”
            </p>
            <div className="j-based">
              <span className="j-based-k">Based on</span>
              <span className="j-based-v">Your CV, Kuda 2023</span>
              <span className="j-based-v">The 18% you gave on Tuesday</span>
            </div>
            <div className="j-draft-acts">
              <button className="j-act j-act--go" type="button">Use this</button>
              <button className="j-act" type="button">
                <PencilSimple size={14} weight="bold" aria-hidden="true" />Edit
              </button>
              <button className="j-act" type="button">
                <ArrowClockwise size={14} weight="bold" aria-hidden="true" />Try again
              </button>
            </div>
          </div>

          <p className="j-honest">
            The two gaps stay gaps. Nothing here will claim you have done something you
            haven&apos;t. Fill them in and the draft changes.
          </p>

          <div className="flow-foot j-foot">
            <button className="btn btn-primary" type="button">
              <PaperPlane size={17} weight="fill" aria-hidden="true" />
              Prepare application
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
