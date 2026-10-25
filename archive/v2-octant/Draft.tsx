"use client";

import { facts } from "../lib/data";

/* Generated text, and the facts it was built from. The source row is not
   optional decoration — it is the only thing separating tailoring from
   invention, so it ships with every draft. */
export function Source({ ids, extra = [] }: { ids: string[]; extra?: string[] }) {
  const items = ids.map((id) => facts.find((f) => f.id === id)!).filter(Boolean);
  return (
    <div className="draft-source">
      <p className="label" style={{ margin: "0 0 9px" }}>Built from</p>
      <div className="inline wrap" style={{ gap: 6 }}>
        {items.map((f) => (
          <span key={f.id} className="tag" title={f.source}>
            {f.label}
            <span className="sep" style={{ fontSize: 12 }}>{f.source.split("·")[0].trim()}</span>
          </span>
        ))}
        {extra.map((e) => (
          <span key={e} className="tag tag--mark" title="You answered just now">
            {e}
            <span style={{ fontSize: 12, opacity: .7 }}>just now</span>
          </span>
        ))}
      </div>
    </div>
  );
}

export function DraftActions({
  accepted, onAccept, extra,
}: { accepted?: boolean; onAccept?: () => void; extra?: React.ReactNode }) {
  return (
    <div className="draft-foot">
      <button type="button" className="btn btn-sm" onClick={onAccept} style={accepted ? { borderColor: "var(--mark)", color: "var(--mark)" } : undefined}>
        {accepted ? "Using this" : "Use this"}
      </button>
      <button type="button" className="btn btn-sm btn-quiet">Edit</button>
      <button type="button" className="btn btn-sm btn-quiet">Try again</button>
      {extra}
    </div>
  );
}
