import Link from "next/link";
import Spark from "./Spark";

export type StepState = "done" | "now" | "todo";

export const LOOP = [
  "Find a job worth it",
  "Tailor what you send",
  "Reach the right person",
  "Track what happened",
] as const;

function Check() {
  return (
    <svg width="9" height="7" viewBox="0 0 9 7" fill="none" aria-hidden="true">
      <path d="M1 3.4 3.3 5.7 8 1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* Every screen is this object. The word and caption name where you are;
   the four steps never change, so the product always says where you are
   in the loop. */
export default function Frame({
  word,
  caption,
  step,
  wide = false,
  flush = false,
  children,
}: {
  word: string;
  caption: string;
  step: 0 | 1 | 2 | 3 | -1;
  wide?: boolean;
  flush?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={`screen${wide ? " wide" : ""}`}>
      <nav className="navbar">
        <Link href="/" className="wordmark">
          <span className="wordmark-mark" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
              <circle cx="11" cy="11" r="2.4" fill="currentColor" />
            </svg>
          </span>
          <span className="wordmark-name">Odysseus</span>
        </Link>

        <div className="nav-right">
          <Link href="/jobs" className="nav-link">Jobs</Link>
          <span className="nav-sep" />
          <Link href="/pipeline" className="nav-link">Track</Link>
          <span className="nav-sep" />
          <Link href="/profile" className="nav-link">You</Link>
          <span className="nav-sep" />
          <Link href="/system" className="nav-link faint">Marks</Link>
        </div>
      </nav>

      <div className="stage">
        <div className="ornament" aria-hidden="true" />
        <div className="panel">
          <aside className="panel-left">
            <h1 className="word">
              <Spark className="spark spark--l" />
              {word}
              <Spark className="spark spark--r" />
              <Spark className="spark spark--r2" />
            </h1>
            <p className="word-caption">{caption}</p>
            <span className="word-rule" aria-hidden="true" />

            <ol className="steps">
              {LOOP.map((s, i) => {
                const state: StepState = step === -1 ? "todo" : i < step ? "done" : i === step ? "now" : "todo";
                return (
                  <li key={s} className={`step step--${state}`}>
                    <span className="step-ring" aria-hidden="true">{state === "done" ? <Check /> : null}</span>
                    {s}
                  </li>
                );
              })}
            </ol>
          </aside>

          <span className="panel-rule" aria-hidden="true" />

          <div className={`panel-right${flush ? " panel-right--flush" : ""}`}>{children}</div>
        </div>
        <div className="ornament ornament--bottom" aria-hidden="true" />
      </div>
    </div>
  );
}
