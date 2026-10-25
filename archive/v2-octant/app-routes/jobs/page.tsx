import Link from "next/link";
import Frame from "../../../components/Frame";
import { jobs } from "../../../lib/data";

export default function JobsPage() {
  return (
    <Frame word="Jobs" caption="MATCHED TO YOU" step={0} wide>
      <div className="enter stack" style={{ gap: 0, height: "100%" }}>
        <div className="inline between" style={{ marginBottom: 18 }}>
          <p className="label" style={{ margin: 0 }}>
            68 relevant <span className="sep">·</span> 7 new since Tuesday
          </p>
          <div className="inline" style={{ gap: 8 }}>
            <button className="btn btn-sm btn-quiet" type="button">Filters</button>
            <button className="btn btn-sm btn-quiet" type="button">Sorted by match &darr;</button>
          </div>
        </div>

        <div className="rows">
          {jobs.map((j) => (
            <Link
              key={j.id}
              href={`/jobs/${j.id}`}
              className="row row-link"
              style={{ gridTemplateColumns: "48px minmax(0,1fr) 148px 104px 84px 58px" }}
            >
              <span
                aria-hidden="true"
                style={{
                  width: 40, height: 40, borderRadius: 4, border: "1px solid var(--line)",
                  display: "grid", placeItems: "center", color: "var(--ink-3)", fontSize: 15,
                }}
              >
                {j.logo}
              </span>

              <span className="truncate">
                <span style={{ color: "var(--ink)", display: "block" }}>{j.role}</span>
                <span className="faint" style={{ fontSize: 14 }}>
                  {j.company} <span className="sep">·</span> {j.remote}
                </span>
              </span>

              <span className="muted truncate" style={{ fontSize: 14 }}>{j.salary}</span>

              <span>
                {j.gaps.length > 0 ? (
                  <span className="tag tag--gap">{j.gaps.length} gap{j.gaps.length > 1 ? "s" : ""}</span>
                ) : (
                  <span className="faint" style={{ fontSize: 13 }}>Nothing missing</span>
                )}
              </span>

              <span className="faint num" style={{ fontSize: 13, textAlign: "right" }}>{j.posted}</span>

              <span
                className="num serif"
                style={{ fontSize: 26, textAlign: "right", color: j.match >= 85 ? "var(--mark)" : "var(--ink-3)" }}
              >
                {j.match}
                <span style={{ fontSize: 13 }}>%</span>
              </span>
            </Link>
          ))}
        </div>

        <p className="faint" style={{ fontSize: 13, marginTop: 20, marginBottom: 0 }}>
          Duplicates across LinkedIn, Indeed and company sites are already folded into one row.
        </p>
      </div>
    </Frame>
  );
}
