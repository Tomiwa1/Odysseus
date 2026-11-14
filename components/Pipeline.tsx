"use client";

import { useState, useTransition } from "react";
import { moveStage } from "../app/actions";
import Logo from "./Logo";
import { NavBurger, NavDrawer } from "./Nav";
import { CaretDown, ArrowRight, Clock, Check } from "./icons";

/* Pipeline.
   This is where a job search feels worst: most of it is silence, and
   silence reads as failure. So waiting is made legible rather than
   hidden. Nothing here is a kanban board that implies you are not doing
   enough, and nothing that closed is swept out of sight. */

type Stage = "saved" | "applied" | "replied" | "interview" | "closed";
/* The card had four things in it: a container, a second container for an
   icon, the text, and an arrow. t-visual-noise-33 names that exactly:
   "avoid excessive containers... build hierarchy through proportion and
   restraint". The icon tile went, and with it an ambiguous glyph that
   said nothing the sentence had not (t-iconography-06).

   Settled 25 Oct on the labelled form: the company is a small label, a
   real gap below it, then the thing to do at full size.
   t-spacing-label-value-20261004 is the reason for the gap, since a
   difference in type size alone does not separate a label from what it
   names. */

/* The tinted card is gone. Nothing in the taste library supports it, and
   t-gradient-strong-to-white-20261014 scopes gradients to a page canvas
   when asked for, "not an instruction to add a gradient to every
   screen". These four take emphasis from what the library does say:
   light surfaces, subtle depth used sparingly, generous spacing, and
   one clear focal object. */

/* Every stage here is something Odysseus can actually observe. It was
   "In review" until 24 Oct, which claimed a human was reading your
   application. Nothing in the system knows that. Same rule as the rest
   of the product: never state what you cannot show. */
const STAGES: Record<Stage, { label: string; step: number }> = {
  saved: { label: "Saved", step: 0 },
  applied: { label: "Applied", step: 1 },
  replied: { label: "They replied", step: 2 },
  interview: { label: "Interview", step: 3 },
  closed: { label: "Closed", step: 4 },
};

const HEAT = { warm: "Warm", cooling: "Cooling", cold: "Cold" } as const;

export type Row = {
  id: string; org: string; role: string; stage: Stage;
  days: number; normal?: string; heat: "warm" | "cooling" | "cold";
  needs?: { what: string; act: string; from: string };
  closedWhy?: string;
};

export default function Pipeline({ rows }: { rows: Row[] }) {
  const [menu, setMenu] = useState(false);
  const [showClosed, setShowClosed] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [, start] = useTransition();

  const needs = rows.filter((r) => r.needs);
  const moving = rows.filter((r) => !r.needs && r.stage !== "closed" && r.heat !== "cold");
  const quiet = rows.filter((r) => !r.needs && r.stage !== "closed" && r.heat === "cold");
  const closed = rows.filter((r) => r.stage === "closed");

  /* Every number here is counted, not written. The screen used to open
     with "Two need you today" and "Eight applications out" whatever was
     actually in it, which is the one thing a tracker cannot do. */
  const live = rows.filter((r) => r.stage !== "closed").length;
  const headline =
    rows.length === 0
      ? "Nothing in here yet."
      : needs.length > 0
        ? `${needs.length === 1 ? "One needs" : `${needs.length} need`} you today.`
        : `${live} still open.`;
  const subline =
    rows.length === 0
      ? "Save a role from Today and it will show up here, with how long it has been waiting."
      : `${rows.length} ${rows.length === 1 ? "role" : "roles"} tracked. Most of a search is waiting, so this says how long you have waited and whether that is normal yet.`;

  /* The stage marker is the control.
   *
   * It already sits on every row saying where a job is, so making it the
   * thing you tap to change that adds no furniture, which is what
   * t-visual-noise-33 asks for. A separate "Move" button would be a
   * second container doing the same job. */
  const Marker = ({ r }: { r: Row }) => {
    const open = editing === r.id;
    return (
      <button
        className="pl-dot"
        type="button"
        data-stage={r.stage}
        aria-expanded={open}
        aria-label={`${STAGES[r.stage].label}. Change where this is.`}
        onClick={() => setEditing(open ? null : r.id)}
      >
        <i aria-hidden="true" />
        {STAGES[r.stage].label}
        <CaretDown size={12} weight="bold" aria-hidden="true" data-open={open} />
      </button>
    );
  };

  /* Only what the system can observe, same vocabulary as the labels.
     Closed asks why, because Pipeline shows that reason back and a
     closed row with no reason teaches nothing. */
  const Stages = ({ r }: { r: Row }) => (
    <div className="fold" data-open={editing === r.id}>
      <div className="fold-in">
        <div className="pl-stages">
          {(Object.keys(STAGES) as Stage[]).map((k) => (
            <button
              key={k}
              type="button"
              className="pl-stage"
              aria-pressed={k === r.stage}
              onClick={() => {
                setEditing(null);
                if (k === r.stage) return;
                const why =
                  k === "closed"
                    ? window.prompt("What happened? This shows on the closed list.") ?? undefined
                    : undefined;
                start(() => { moveStage(r.id, k, why); });
              }}
            >
              {k === r.stage && <Check size={11} weight="bold" aria-hidden="true" />}
              {STAGES[k].label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  /* One quiet line: the feeling, then the number, then the reason on a
     line of its own so nothing is crowded. */
  const Wait = ({ r }: { r: Row }) => (
    <span className="pl-wait">
      <span className="pl-heat">{HEAT[r.heat]}</span>
      <span className="pl-when">
        <Clock size={12} weight="fill" aria-hidden="true" />
        {r.days} days
      </span>
      {r.normal && <em className="pl-normal">{r.normal}</em>}
    </span>
  );

  const Item = ({ r }: { r: Row }) => (
    <article className="pl-row" data-stage={r.stage} data-heat={r.heat}>
      <div className="pl-head">
        <span className="pl-txt">
          <h3 className="pl-org">{r.org}</h3>
          <p className="pl-role">{r.role}</p>
        </span>
        <Marker r={r} />
      </div>
      {r.closedWhy ? <p className="pl-why">{r.closedWhy}</p> : <Wait r={r} />}
      <Stages r={r} />
    </article>
  );

  return (
    <div className="flow pl-pipe" data-menu={menu}>
      <header className="flow-top hdr3">
        <NavBurger open={menu} onToggle={() => setMenu((v) => !v)} />
        <Logo kind="letter" size={40} />
        <span className="nav-spacer" aria-hidden="true" />
      </header>

      <main className="flow-body">
        <div className="flow-inner j-inner">
          <p className="eyebrow">Your pipeline</p>
          <h1 className="display pl-h1">{headline}</h1>
          <p className="flow-sub p-sub">{subline}</p>

          {needs.length > 0 && <h2 className="j-sec">Waiting on you</h2>}
          <div className="pl-list">
            {needs.map((r) => (
              <article className="pl-row pl-row--needs" key={r.id}>
                <span className="pl-txt">
                  <h3 className="pl-org">{r.org}</h3>
                  <p className="pl-need">{r.needs!.what}</p>
                </span>
                <ArrowRight size={16} weight="bold" aria-hidden="true" />
              </article>
            ))}
          </div>

          {moving.length > 0 && (
            <>
              <h2 className="j-sec">Still moving</h2>
              <div className="pl-list">{moving.map((r) => <Item r={r} key={r.id} />)}</div>
            </>
          )}

          {quiet.length > 0 && (
            <>
              <h2 className="j-sec">Gone quiet</h2>
              <div className="pl-list">{quiet.map((r) => <Item r={r} key={r.id} />)}</div>
              <p className="pl-note">
                Silence is not a no. It is also not a yes. These are the ones worth a
                nudge, or worth letting go.
              </p>
            </>
          )}

          {closed.length > 0 && (
          <button
            className="pl-closed"
            type="button"
            aria-expanded={showClosed}
            onClick={() => setShowClosed((v) => !v)}
          >
            <span>{closed.length} did not go anywhere</span>
            <CaretDown size={15} weight="bold" aria-hidden="true" data-open={showClosed} />
          </button>
          )}
          <div className="fold" data-open={showClosed}>
            <div className="fold-in">
              <div className="pl-list" style={{ paddingTop: 8 }}>
                {closed.map((r) => <Item r={r} key={r.id} />)}
              </div>
            </div>
          </div>
        </div>
      </main>

      <NavDrawer open={menu} onClose={() => setMenu(false)} here="/pipeline" />
    </div>
  );
}
