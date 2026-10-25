"use client";

import Link from "next/link";
import {
  House, ListChecks, User, List, Bookmark, Envelope,
  Question, People, Gear, ArrowUpRight,
} from "./icons";

/* Navigation.
   Settled 25 Oct: the drawer is the navigation. There is no bottom bar.
   The burger opens a left drawer that pushes the page, and the drawer
   holds the destinations first, then account and utility.

   This overrides t-navigation-28, which prefers a labelled bottom bar on
   mobile. Tomiwa's call, and the trade is real: destinations now cost a
   tap and the drawer has to carry the active state the bar used to show,
   which is why the current place is marked rather than merely listed.

   The drawer PUSHES the page, after Wispr Flow. In their open frame the
   burger has travelled exactly the drawer's width, so the page and
   everything fixed to it slide right together and a dimmed sliver stays
   on screen. The burger therefore lives top left, or it rides off the
   edge. Duration and easing are not knowable from static frames: 320ms
   out on a decelerating curve, 260ms back on an even one. */

const DESTS: [string, string, typeof House][] = [
  ["Today", "/today", House],
  ["Pipeline", "/pipeline", ListChecks],
  ["Profile", "/profile", User],
];

const GROUPS: [string, typeof House, boolean][][] = [
  [["Saved jobs", Bookmark, false], ["Connected accounts", Envelope, false]],
  [["Help centre", Question, true], ["Talk to us", People, false]],
  [["Settings", Gear, false], ["Account", User, false]],
];

/* Left of the logo, because the page slides right under it.

   The glyph does not change when the drawer is open: it is the same
   control in the same place, and the page having travelled already says
   the drawer is open. Tapping it or the dimmed page closes. */
export function NavBurger({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  return (
    <button className="nav-burger" type="button" aria-expanded={open} aria-label="Menu" onClick={onToggle}>
      <List size={19} weight="bold" />
    </button>
  );
}

export function NavDrawer({
  open, onClose, here,
}: { open: boolean; onClose: () => void; here?: string }) {
  return (
    <div className="nav-shade" data-open={open} aria-hidden={!open}>
      <button className="nav-scrim" type="button" aria-label="Close menu" onClick={onClose} />
      <aside className="nav-draw" role="dialog" aria-modal="true" aria-label="Menu">
        {/* A panel that covers the screen carries its own way out, and it
            is the only dismiss a keyboard or screen reader can reach. */}
        <button className="nav-close" type="button" aria-label="Close menu" onClick={onClose}>
          <span aria-hidden="true">&#10005;</span>
        </button>

        <div className="nav-who">
          <span className="nav-face" aria-hidden="true"><User size={26} weight="fill" /></span>
          <h2 className="nav-name">
            Tomiwa Akinbode
            <i className="nav-plan">Free</i>
          </h2>
          <p className="nav-mail">tomiwa@odysseus.app</p>
          <p className="nav-state">Searching 21 days · 8 applications out</p>
        </div>

        {/* destinations first, and the current one is marked, because
            nothing else on the screen says where you are any more */}
        <nav className="nav-group nav-group--dest" aria-label="Sections">
          {DESTS.map(([label, href, Icon]) => {
            const on = here === href;
            return (
              <Link
                key={href}
                href={href}
                className="nav-row nav-row--dest"
                aria-current={on ? "page" : undefined}
                onClick={onClose}
              >
                <Icon size={19} weight={on ? "fill" : "regular"} aria-hidden="true" />
                {label}
              </Link>
            );
          })}
        </nav>

        {GROUPS.map((group, n) => (
          <div className="nav-group" key={n}>
            {group.map(([label, Icon, out]) => (
              <button className="nav-row" type="button" key={label}>
                <Icon size={19} aria-hidden="true" />
                {label}
                {out && <ArrowUpRight className="nav-out" size={15} weight="bold" aria-hidden="true" />}
              </button>
            ))}
          </div>
        ))}
      </aside>
    </div>
  );
}
