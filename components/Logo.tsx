import Mark from "./Mark";

export type LogoKind = "letter" | "badge";

/* The bird is the O. The name cannot be set without it. */
export default function Logo({ kind = "letter", size = 40 }: { kind?: LogoKind; size?: number }) {
  if (kind === "badge") {
    return (
      <span className="logo">
        <Mark size={size} />
        <span className="logo-word" style={{ marginLeft: 10 }}>Odysseus</span>
      </span>
    );
  }
  return (
    <span className="logo logo-letter">
      <Mark size={size} />
      <span className="logo-word">dysseus</span>
    </span>
  );
}
