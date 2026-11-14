"use client";

import { useState, useTransition } from "react";
import { setSkill, setPref, setFloor as saveFloor } from "../app/actions";
import Logo from "./Logo";
import { NavBurger, NavDrawer } from "./Nav";
import {
  FileText, LinkedinLogo, Envelope, Calendar, Check,
  ArrowClockwise, CaretRight,
} from "./icons";

/* Profile.
   Narrowed 25 Oct to the three inputs the user controls: the CV, the
   connected accounts, the skills. Nothing else.

   Reading the profile back already happens elsewhere and with better
   context: the job screen states it requirement by requirement, Prepare
   shows how it was used, Pipeline says why a role closed. A second
   screen that only re-presents those facts under a different framing is
   what t-repeated-figures-20261004 warns about. Experience lives with
   the CV that produced it, not as a fourth editable list here. */

/* None of these are connected. They showed "On" in green, which was a
   drawing of a feature rather than a feature, on the one screen whose
   job is to say exactly what the product is working from. */
const accounts = [
  { Ic: LinkedinLogo, t: "LinkedIn", s: "Your history and your headline" },
  { Ic: Envelope, t: "Gmail", s: "So replies from companies reach your pipeline" },
  { Ic: Calendar, t: "Calendar", s: "So interviews show up on Today" },
];

/* What you are looking for. The fourth input, and the one the overnight
   search actually runs against: without it the product matches you to
   everything it can read.

   The probe says supply is not the problem. 253 companies returned 269
   unique design roles in one day, so the daily promise of three things
   depends entirely on filtering. This block is that filter.

   Same picker control as the skills, because it is the same gesture:
   nothing to add, nothing to delete, only on or off. */
/* The group names double as the stored category, so the screen and the
   database cannot drift apart. */
const WANT: Record<string, { cat: string; opts: string[] }> = {
  "Roles": { cat: "role", opts: [
    "Product design", "Design systems", "Brand design", "UX research",
    "Design management", "Motion", "Front of house",
  ] },
  "Seniority": { cat: "seniority", opts: ["Mid", "Senior", "Staff", "Lead", "Manager", "Head of"] },
  "Where": { cat: "place", opts: [
    "Remote worldwide", "Remote Europe", "United Kingdom", "Ireland",
    "Netherlands", "Germany", "Hybrid, London", "Will relocate",
  ] },
  "Not for you": { cat: "avoid", opts: [
    "Agencies", "Crypto", "Gambling", "Defence", "Under 10 people", "On site five days",
  ] },
};

/* Skills the CV did not find, offered so the list can grow without a
   text box. Switching one on is still a fact with a source: you said so. */
const EXTRA = ["Research ops", "Motion", "Data viz", "Accessibility", "Workshops", "Mentoring"];

export type Skill = { id: number; label: string; active: boolean };

export default function Profile({
  cv, skills, want: initialWant, floor: initialFloor,
}: {
  cv: { name: string; readOn: string; found: string } | null;
  skills: Skill[];
  want: Record<string, string[]>;
  floor: string;
}) {
  const [menu, setMenu] = useState(false);
  const [pending, start] = useTransition();

  /* the stored values lead; local state only covers the moment between
     the tap and the server answering */
  const [have, setHave] = useState(() => skills.filter((s) => s.active).map((s) => s.label));
  const [want, setWant] = useState<Record<string, string[]>>(initialWant);
  const [floor, setFloorLocal] = useState(initialFloor);

  const byLabel = new Map(skills.map((s) => [s.label, s]));
  const allSkills = [...skills.map((s) => s.label), ...EXTRA.filter((e) => !byLabel.has(e))];

  const toggle = (label: string) => {
    const on = !have.includes(label);
    setHave((v) => (on ? [...v, label] : v.filter((x) => x !== label)));
    const row = byLabel.get(label);
    if (row) start(() => { setSkill(row.id, on); });
  };

  const toggleWant = (cat: string, value: string) => {
    const on = !(want[cat] ?? []).includes(value);
    setWant((v) => ({
      ...v,
      [cat]: on ? [...(v[cat] ?? []), value] : (v[cat] ?? []).filter((x) => x !== value),
    }));
    start(() => { setPref(cat, value, on); });
  };

  return (
    <div className="flow pr-prof" data-menu={menu}>
      <header className="flow-top hdr3">
        <NavBurger open={menu} onToggle={() => setMenu((v) => !v)} />
        <Logo kind="letter" size={40} />
        <span className="nav-spacer" aria-hidden="true" />
      </header>

      <main className="flow-body">
        <div className="flow-inner j-inner">
          <p className="eyebrow">Your profile</p>
          <h1 className="display pr-h1">What Odysseus works from.</h1>
          <p className="flow-sub p-sub">
            Three things, and nothing else. Change them here and every job, every
            draft and every message changes with them.
          </p>

          <h2 className="j-sec">Your CV</h2>
          <div className="pr-cv">
            <span className="pr-cv-ic" aria-hidden="true"><FileText size={18} weight="fill" /></span>
            <span className="pr-cv-t">
              <b>{cv?.name ?? "No CV yet"}</b>
              <i>{cv ? `${cv.readOn} · ${cv.found}` : "Everything below was seeded, not read from a CV"}</i>
            </span>
            <button className="pr-ghost" type="button">
              <ArrowClockwise size={14} weight="bold" aria-hidden="true" />
              {cv ? "Replace" : "Upload"}
            </button>
          </div>

          <h2 className="j-sec">Connected accounts</h2>
          <div className="pr-accts">
            {accounts.map(({ Ic, t, s }) => (
              <button className="pr-acct" type="button" key={t}>
                <span className="pr-acct-ic" aria-hidden="true"><Ic size={17} weight="fill" /></span>
                <span className="pr-acct-t">
                  <b>{t}</b>
                  <i>{s}</i>
                </span>
                <span className="pr-acct-on" data-on={false}>Connect</span>
                <CaretRight size={15} weight="bold" aria-hidden="true" />
              </button>
            ))}
          </div>

          <h2 className="j-sec">Your skills</h2>
          <p className="pr-hint">{have.length} on. Tap any to switch it.</p>
          <div className="pr-skills">
            {allSkills.map((s) => (
              <button
                className="pr-skill"
                type="button"
                key={s}
                aria-pressed={have.includes(s)}
                onClick={() => toggle(s)}
              >
                {have.includes(s) && <Check size={11} weight="bold" aria-hidden="true" />}
                {s}
              </button>
            ))}
          </div>

          <h2 className="j-sec">What you are looking for</h2>
          <p className="pr-hint">
            This is what the overnight search runs against. Without it, everything
            matches.
          </p>

          <div className="pr-want">
            {Object.entries(WANT).map(([group, { cat, opts }]) => (
              <div className="pr-want-g" key={group}>
                <h3 className="pr-want-h" data-no={group === "Not for you"}>{group}</h3>
                <div className="pr-skills">
                  {opts.map((o) => {
                    const on = (want[cat] ?? []).includes(o);
                    return (
                      <button
                        className="pr-skill"
                        type="button"
                        key={o}
                        data-no={group === "Not for you"}
                        aria-pressed={on}
                        onClick={() => toggleWant(cat, o)}
                      >
                        {on && <Check size={11} weight="bold" aria-hidden="true" />}
                        {o}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            <div className="pr-want-g">
              <h3 className="pr-want-h">Salary floor</h3>
              <div className="pr-floor">
                <span className="pr-floor-cur">£</span>
                <input
                  className="field pr-floor-f"
                  inputMode="numeric"
                  value={floor}
                  onChange={(e) => {
                    const v = e.target.value.replace(/[^0-9]/g, "");
                    setFloorLocal(v);
                    start(() => { saveFloor(v); });
                  }}
                  aria-label="Salary floor, thousands"
                />
                <span className="pr-floor-k">thousand</span>
              </div>
              <p className="pr-floor-n">
                Roles that do not say are still shown, and say so. Nothing is
                filtered out on a number nobody published.
              </p>
            </div>
          </div>

          <p className="flow-note pr-foot">
            Nothing here is shared with anyone until you send an application.
          </p>
        </div>
      </main>

      <NavDrawer open={menu} onClose={() => setMenu(false)} here="/profile" />
    </div>
  );
}
