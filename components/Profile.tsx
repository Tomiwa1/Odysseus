"use client";

import { useState } from "react";
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

const accounts = [
  { Ic: LinkedinLogo, t: "LinkedIn", s: "Your history and your headline", on: true },
  { Ic: Envelope, t: "Gmail", s: "So replies from companies reach your pipeline", on: true },
  { Ic: Calendar, t: "Calendar", s: "So interviews show up on Today", on: true },
];

/* What you are looking for. The fourth input, and the one the overnight
   search actually runs against: without it the product matches you to
   everything it can read.

   The probe says supply is not the problem. 253 companies returned 269
   unique design roles in one day, so the daily promise of three things
   depends entirely on filtering. This block is that filter.

   Same picker control as the skills, because it is the same gesture:
   nothing to add, nothing to delete, only on or off. */
const WANT = {
  "Roles": [
    "Product design", "Design systems", "Brand design", "UX research",
    "Design management", "Motion", "Front of house",
  ],
  "Seniority": ["Mid", "Senior", "Staff", "Lead", "Manager", "Head of"],
  "Where": [
    "Remote worldwide", "Remote Europe", "United Kingdom", "Ireland",
    "Netherlands", "Germany", "Hybrid, London", "Will relocate",
  ],
  "Not for you": [
    "Agencies", "Crypto", "Gambling", "Defence", "Under 10 people", "On site five days",
  ],
};
const WANT_ON = [
  "Product design", "Design systems", "Senior", "Staff",
  "Remote worldwide", "Remote Europe", "United Kingdom",
  "Gambling", "On site five days",
];

/* One list, not two. Yours are on, the rest are off, and the whole set
   is the same tap. Nothing is added or removed, only switched. */
const allSkills = [
  "Product design", "Design systems", "Onboarding", "Fintech", "Payments",
  "Prototyping", "Usability testing", "Figma", "Design tokens",
  "Research ops", "Motion", "Data viz", "Accessibility", "Workshops", "Mentoring",
];
const fromCv = allSkills.slice(0, 9);

export default function Profile() {
  const [menu, setMenu] = useState(false);
  const [have, setHave] = useState<string[]>(fromCv);
  const [want, setWant] = useState<string[]>(WANT_ON);

  const toggle = (s: string) =>
    setHave((v) => (v.includes(s) ? v.filter((x) => x !== s) : [...v, s]));
  const toggleWant = (s: string) =>
    setWant((v) => (v.includes(s) ? v.filter((x) => x !== s) : [...v, s]));
  const [floor, setFloor] = useState("85");

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
              <b>Tomiwa-Akinbode-2026.pdf</b>
              <i>Read 3 October · 3 roles, 11 skills found</i>
            </span>
            <button className="pr-ghost" type="button">
              <ArrowClockwise size={14} weight="bold" aria-hidden="true" />
              Replace
            </button>
          </div>

          <h2 className="j-sec">Connected accounts</h2>
          <div className="pr-accts">
            {accounts.map(({ Ic, t, s, on }) => (
              <button className="pr-acct" type="button" key={t}>
                <span className="pr-acct-ic" aria-hidden="true"><Ic size={17} weight="fill" /></span>
                <span className="pr-acct-t">
                  <b>{t}</b>
                  <i>{s}</i>
                </span>
                <span className="pr-acct-on" data-on={on}>
                  {on && <Check size={12} weight="bold" aria-hidden="true" />}
                  {on ? "On" : "Off"}
                </span>
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
            {Object.entries(WANT).map(([group, opts]) => (
              <div className="pr-want-g" key={group}>
                <h3 className="pr-want-h" data-no={group === "Not for you"}>{group}</h3>
                <div className="pr-skills">
                  {opts.map((o) => (
                    <button
                      className="pr-skill"
                      type="button"
                      key={o}
                      data-no={group === "Not for you"}
                      aria-pressed={want.includes(o)}
                      onClick={() => toggleWant(o)}
                    >
                      {want.includes(o) && <Check size={11} weight="bold" aria-hidden="true" />}
                      {o}
                    </button>
                  ))}
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
                  onChange={(e) => setFloor(e.target.value.replace(/[^0-9]/g, ""))}
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
