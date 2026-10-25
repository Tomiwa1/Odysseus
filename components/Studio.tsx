"use client";

import { useState, type ReactNode } from "react";

/* Not shipped. The panel exists so a decision can be judged on the real
   screen instead of in a swatch. One row per open question. If a variant
   only shows after an interaction, put the screen in that state first. */

export function Studio({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <aside className="studio">
      <button className="studio-toggle" type="button" onClick={() => setOpen((o) => !o)}>
        {open ? "Hide" : "Control"}
      </button>
      {open && <div className="studio-body">{children}</div>}
    </aside>
  );
}

export function StudioRow<T extends string>({
  label, options, value, onChange,
}: {
  label: string;
  options: [T, string, string][];
  value: T;
  onChange: (v: T) => void;
}) {
  const note = options.find(([k]) => k === value)?.[2];
  return (
    <div className="studio-row">
      <span className="studio-label">{label}</span>
      <div className="studio-opts">
        {options.map(([k, name]) => (
          <button key={k} type="button" className="studio-opt" aria-pressed={k === value} onClick={() => onChange(k)}>
            {name}
          </button>
        ))}
      </div>
      {note && <p className="studio-note">{note}</p>}
    </div>
  );
}
