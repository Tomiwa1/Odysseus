import Phoenix from "./Phoenix";

/* The bird, climbing out of the page. */
export default function Portal({ size = "hero" }: { size?: "hero" | "flow" }) {
  return (
    <div className={`portal portal--${size}`}>
      <span className="portal-hole" aria-hidden="true" />
      <span className="portal-cast" aria-hidden="true" />
      <Phoenix className={size === "hero" ? "phoenix" : "flow-bird"} />
      <span className="portal-lip" aria-hidden="true" />
    </div>
  );
}
