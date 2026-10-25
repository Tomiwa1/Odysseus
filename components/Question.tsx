"use client";

import { useState } from "react";
import Link from "next/link";
import Logo from "./Logo";
import Portal from "./Portal";
import { Check, Sparkle } from "./icons";

/* The one gap worth asking about. Structured answers, never a text box —
   and "I don't know" is a real option, styled exactly like the others,
   because most people genuinely don't have the number. */
const options = [
  "More people finished",
  "Fewer dropped out",
  "It got faster",
  "Fewer support tickets",
  "No measurable change",
];
const UNSURE = "I don't know";
const UNITS = ["%", "people", "hours"];
const measurable = new Set(["More people finished", "Fewer dropped out", "It got faster", "Fewer support tickets"]);

export default function Question() {
  const [picked, setPicked] = useState<string[]>([]);
  const [unit, setUnit] = useState("%");
  const [amount, setAmount] = useState("");
  const [done, setDone] = useState(false);

  const toggle = (o: string) =>
    setPicked((p) => {
      if (o === UNSURE || o === "No measurable change") return p.includes(o) ? [] : [o];
      const next = p.filter((x) => x !== UNSURE && x !== "No measurable change");
      return next.includes(o) ? next.filter((x) => x !== o) : [...next, o];
    });

  const asksForNumber = picked.some((p) => measurable.has(p));
  const answered = picked.length > 0;

  const Option = ({ o }: { o: string }) => (
    <button type="button" className="opt" aria-pressed={picked.includes(o)} onClick={() => toggle(o)}>
      <span className="opt-box" aria-hidden="true"><Check size={13} weight="bold" /></span>
      <span className="opt-label">{o}</span>
    </button>
  );

  return (
    <div className="flow">
      <header className="flow-top">
        <Logo kind="letter" size={40} />
        <div className="steps" aria-label={done ? "Done" : "Step 3 of 3"}>
          <i data-done="true" />
          <i data-done="true" />
          <i data-on={!done} data-done={done} />
        </div>
      </header>

      <main className="flow-body">
        <div className="flow-inner">
          <Portal size="flow" />

          {!done ? (
            <>
              <h1 className="display">Did the redesign change anything?</h1>
              <p className="flow-sub">
                Your CV says you rebuilt Kuda&apos;s onboarding. This is the difference between a
                duty and an achievement, and it&apos;s the only thing missing.
              </p>

              <div className="opts" style={{ marginTop: 26 }}>
                {options.map((o) => <Option key={o} o={o} />)}
                <span className="opt-or">or</span>
                <Option o={UNSURE} />
              </div>

              {asksForNumber && (
                <div className="amount rise">
                  <p className="flow-sub" style={{ marginTop: 0, fontSize: 15 }}>
                    Roughly how much? Leave it blank if you&apos;re not sure. Nothing gets made up.
                  </p>
                  <div className="amount-row" style={{ marginTop: 14 }}>
                    <input
                      className="field"
                      inputMode="numeric"
                      placeholder="18"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      aria-label="Amount"
                    />
                    {UNITS.map((u) => (
                      <button key={u} type="button" className="unit" aria-pressed={unit === u} onClick={() => setUnit(u)}>
                        {u}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flow-foot">
                <button className="btn btn-primary" type="button" disabled={!answered} onClick={() => setDone(true)}>
                  {amount ? "Save and finish" : answered ? "Finish" : "Pick all that are true"}
                </button>
              </div>

              <button type="button" className="skip" onClick={() => setDone(true)}>Skip this question</button>
            </>
          ) : (
            <div className="rise">
              <h1 className="display">That&apos;s everything.</h1>
              <p className="flow-sub">
                You can keep filling your profile in as you go. Odysseus only asks again when a
                specific job actually needs something.
              </p>

              <div className="known">
                {[
                  { t: "3 roles, 11 skills", s: "Read from your CV" },
                  {
                    t: amount
                      ? `Onboarding redesign, ${amount}${unit === "%" ? "%" : ` ${unit}`}`
                      : picked.includes(UNSURE) || picked.length === 0
                        ? "Onboarding redesign, no number yet"
                        : `Onboarding redesign, ${picked[0].toLowerCase()}`,
                    s: amount ? "You answered just now" : "Nothing will be claimed without it",
                  },
                  { t: "Searching from tomorrow morning", s: "You'll have a short list waiting" },
                ].map((r) => (
                  <div className="known-row" key={r.t}>
                    <span className="known-tick" aria-hidden="true"><Check size={13} weight="bold" /></span>
                    <span>
                      <span className="known-t" style={{ display: "block" }}>{r.t}</span>
                      <span className="known-s">{r.s}</span>
                    </span>
                  </div>
                ))}
              </div>

              <div className="flow-foot">
                <Link className="btn btn-primary" href="/today">
                  <Sparkle size={18} weight="fill" aria-hidden="true" />
                  Find me jobs
                </Link>
                <button className="btn btn-quiet" type="button" onClick={() => setDone(false)}>Back</button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
