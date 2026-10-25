"use client";

import { useState } from "react";
import Logo from "./Logo";
import Phoenix from "./Phoenix";
import { NavBurger, NavDrawer } from "./Nav";
import { Sparkle, Envelope, FileText, ArrowRight, Check, Streak } from "./icons";

/* Today.
   The problem this screen exists to solve is that a job search never feels
   finished. So today is FINITE and it is small. Three things, and the
   headline counts them down as they go. No feed, no infinite list, no
   number that only ever goes up. */

type Kind = "match" | "reply" | "draft";

const ICON = { match: Sparkle, reply: Envelope, draft: FileText } as const;
const GROUP: Record<Kind, string> = {
  match: "Worth a look",
  reply: "Waiting on you",
  draft: "Ready to read",
};

const items: { id: string; kind: Kind; title: string; meta: string; why: string; cta: string }[] = [
  {
    id: "paystack",
    kind: "match",
    title: "Senior Product Designer",
    meta: "Paystack · Lagos or remote",
    why: "Closest thing to the onboarding work you did at Kuda. They asked for it by name.",
    cta: "Look at it",
  },
  {
    id: "chidi",
    kind: "reply",
    title: "Chidi hasn't replied",
    meta: "Moniepoint · 6 days ago",
    why: "You asked about the Design Lead role. Six days is the point where a short nudge is normal.",
    cta: "Send the follow-up",
  },
  {
    id: "flutterwave",
    kind: "draft",
    title: "Your resume for Flutterwave",
    meta: "Drafted overnight",
    why: "Built only from things you have actually done. Read it before it goes anywhere.",
    cta: "Read it through",
  },
];

const WORDS = ["That's today", "One thing", "Two things", "Three things"];

export default function Today() {
  const [menu, setMenu] = useState(false);
  const [done, setDone] = useState<string[]>([]);

  const left = items.filter((i) => !done.includes(i.id));
  const finished = left.length === 0;
  const finish = (id: string) => setDone((d) => (d.includes(id) ? d : [...d, id]));

  const Card = ({ i }: { i: (typeof items)[number] }) => {
    const Glyph = ICON[i.kind];
    const isDone = done.includes(i.id);

    return (
      <article className="t-card" data-kind={i.kind} data-done={isDone}>
        <header className="t-head">
          <span className="t-ic" aria-hidden="true">
            {isDone ? <Check size={15} weight="bold" /> : <Glyph size={15} weight="fill" />}
          </span>
          <span className="t-head-txt">
            <h2 className="t-title">{i.title}</h2>
            <p className="t-meta">{i.meta}</p>
          </span>
        </header>

        {!isDone && (
          <>
            <p className="t-why">{i.why}</p>
            <button className="t-go" type="button" onClick={() => finish(i.id)}>
              {i.cta}
              <ArrowRight size={15} weight="bold" aria-hidden="true" />
            </button>
          </>
        )}
      </article>
    );
  };

  /* One mark per thing. Countable at a glance, and it cannot imply there
     is more behind it the way a part-filled bar can. */
  const Meter = () =>
    finished ? null : (
      <div className="t-meter">
        <span className="t-dots" aria-hidden="true">
          {items.map((i) => <i key={i.id} data-on={done.includes(i.id)} />)}
        </span>
        <span className="t-count">{done.length} of {items.length} done</span>
      </div>
    );

  return (
    <div className="flow t-day" data-menu={menu}>
      <header className="flow-top hdr3">
        <NavBurger open={menu} onToggle={() => setMenu((v) => !v)} />
        <Logo kind="letter" size={40} />
        <span className="t-streak" title="Six mornings in a row">
          <Streak size={15} weight="fill" aria-hidden="true" />
          6
        </span>
      </header>

      <main className="flow-body">
        <div className="flow-inner t-inner">
          <p className="eyebrow">Thursday morning</p>
          <h1 className="display t-h1">{WORDS[left.length]}.</h1>
          <p className="flow-sub t-sub">
            {finished
              ? "Nothing else needs you. The next search runs at six tomorrow."
              : "Overnight it read 1,240 jobs and kept three. The rest never reached you."}
          </p>

          <Meter />

          {finished ? (
            <div className="t-end rise">
              <Phoenix className="t-end-bird" />
              <p className="t-end-t">Go and do something else.</p>
              <p className="t-end-s">
                You've applied to 4 roles this week. Two are still warm, and Odysseus is watching both.
              </p>
            </div>
          ) : (
            <div className="t-groups">
              {(["match", "reply", "draft"] as Kind[]).map((k) => {
                const group = items.filter((i) => i.kind === k);
                if (!group.length) return null;
                return (
                  <section className="t-group" key={k}>
                    <h3 className="t-group-h">{GROUP[k]}</h3>
                    {group.map((i) => <Card i={i} key={i.id} />)}
                  </section>
                );
              })}
            </div>
          )}

          {!finished && (
            <p className="flow-note t-foot">
              That is everything for today. Nothing else is waiting behind it.
            </p>
          )}
        </div>
      </main>

      <NavDrawer open={menu} onClose={() => setMenu(false)} here="/today" />
    </div>
  );
}
