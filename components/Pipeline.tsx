"use client";

import { useState } from "react";
import Logo from "./Logo";
import { NavBurger, NavDrawer } from "./Nav";
import { CaretDown, ArrowRight, Clock } from "./icons";

/* Pipeline.
   This is where a job search feels worst: most of it is silence, and
   silence reads as failure. So waiting is made legible rather than
   hidden. Nothing here is a kanban board that implies you are not doing
   enough, and nothing that closed is swept out of sight. */

type Stage = "applied" | "replied" | "interview" | "closed";
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
  applied: { label: "Applied", step: 1 },
  replied: { label: "They replied", step: 2 },
  interview: { label: "Interview", step: 3 },
  closed: { label: "Closed", step: 4 },
};

type Row = {
  id: string; org: string; role: string; stage: Stage;
  days: number; normal?: string; heat: "warm" | "cooling" | "cold";
  needs?: { what: string; act: string; from: string };
  closedWhy?: string;
};

const rows: Row[] = [
  { id: "paystack", org: "Paystack", role: "Senior Product Designer", stage: "interview",
    days: 2, normal: "They move fast. Two days is nothing.", heat: "warm",
    needs: { what: "Interview Thursday, 10am. Nothing prepared yet.",
             act: "Prepare for it", from: "From your calendar" } },
  { id: "flutterwave", org: "Flutterwave", role: "Product Designer", stage: "replied",
    days: 2, normal: "They replied. It is your turn.", heat: "warm",
    needs: { what: "Chidi asked for your portfolio two days ago.",
             act: "Reply to Chidi", from: "From your inbox" } },
  /* applied, not replied: nine days of silence is not a review */
  { id: "moniepoint", org: "Moniepoint", role: "Design Lead", stage: "applied",
    days: 9, normal: "Most replies here come inside 10 days.", heat: "cooling" },
  { id: "piggyvest", org: "PiggyVest", role: "Senior Designer", stage: "applied",
    days: 4, normal: "Early. Nothing to read into.", heat: "warm" },
  { id: "carbon", org: "Carbon", role: "Product Designer", stage: "applied",
    days: 23, normal: "Past the point most people hear back.", heat: "cold" },
  { id: "opay", org: "OPay", role: "Senior Product Designer", stage: "applied",
    days: 31, normal: "Nothing has moved in a month.", heat: "cold" },
  { id: "kuda", org: "Kuda", role: "Design Manager", stage: "closed",
    days: 12, heat: "cold", closedWhy: "They wanted someone who has managed a team." },
  { id: "chipper", org: "Chipper Cash", role: "Product Designer", stage: "closed",
    days: 18, heat: "cold", closedWhy: "Role was filled internally." },
];

const HEAT = { warm: "Warm", cooling: "Cooling", cold: "Cold" } as const;

export default function Pipeline() {
  const [menu, setMenu] = useState(false);
  const [showClosed, setShowClosed] = useState(false);

  const needs = rows.filter((r) => r.needs);
  const moving = rows.filter((r) => !r.needs && r.stage !== "closed" && r.heat !== "cold");
  const quiet = rows.filter((r) => !r.needs && r.stage !== "closed" && r.heat === "cold");
  const closed = rows.filter((r) => r.stage === "closed");

  const Marker = ({ r }: { r: Row }) => (
    <span className="pl-dot" data-stage={r.stage}>
      <i aria-hidden="true" />
      {STAGES[r.stage].label}
    </span>
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
          <h1 className="display pl-h1">Two need you today.</h1>
          <p className="flow-sub p-sub">
            Eight applications out. Most of a search is waiting, so this says how
            long you have waited and whether that is normal yet.
          </p>

          <h2 className="j-sec">Waiting on you</h2>
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

          <h2 className="j-sec">Still moving</h2>
          <div className="pl-list">{moving.map((r) => <Item r={r} key={r.id} />)}</div>

          <h2 className="j-sec">Gone quiet</h2>
          <div className="pl-list">{quiet.map((r) => <Item r={r} key={r.id} />)}</div>
          <p className="pl-note">
            Silence is not a no. It is also not a yes. These are the ones worth a
            nudge, or worth letting go.
          </p>

          <button
            className="pl-closed"
            type="button"
            aria-expanded={showClosed}
            onClick={() => setShowClosed((v) => !v)}
          >
            <span>Two did not go anywhere</span>
            <CaretDown size={15} weight="bold" aria-hidden="true" data-open={showClosed} />
          </button>
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
