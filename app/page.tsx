import Link from "next/link";
import Logo from "../components/Logo";
import Portal from "../components/Portal";

const proofs = [
  { k: "It looks", t: "Every morning it reads the boards you'd never get through, and keeps the few that are actually yours." },
  { k: "It writes", t: "Your resume, tailored to the role, built only from things you have actually done." },
  { k: "It remembers", t: "Who you spoke to, what you sent, and who owes you a reply." },
];

export default function Landing() {
  return (
    <div className="page">
      <header className="top rise">
        <Logo kind="letter" size={44} />
        <button className="btn btn-quiet btn-sm" type="button">Sign in</button>
      </header>

      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow rise">The long search</p>
          <h1 className="display rise-2">
            Ten years of looking, <em>handled in a morning.</em>
          </h1>
          <p className="rise-3">
            Odysseus searches while you sleep, keeps only the roles worth your name on them,
            and writes the parts nobody enjoys. You decide. Nothing is ever sent for you.
          </p>
          <div className="hero-actions rise-4">
            <Link href="/start" className="btn btn-primary">Begin the search</Link>
            <button className="btn btn-quiet" type="button">See how it works</button>
          </div>
          <p className="hero-note rise-4">Free while we build it. No card.</p>
        </div>

        <div className="hero-art rise-2">
          <Portal size="hero" />
        </div>
      </section>

      <div className="proofs">
        {proofs.map((p) => (
          <div className="proof" key={p.k}>
            <p className="proof-k">{p.k}</p>
            <p className="proof-t">{p.t}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
