/* The mark you approved: the bird's head with its crest, round enough to
   stand in for the O in Odysseus. Same silhouette as before — only the
   lavender became the product's blue. */
export default function Mark({ size = 46 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="mkBody" x1="50" y1="18" x2="50" y2="94" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFFFFF" />
          <stop offset="1" stopColor="#D8E3F8" />
        </linearGradient>
        <radialGradient id="mkShade" cx=".5" cy=".3" r=".76">
          <stop offset=".54" stopColor="#8DA4D2" stopOpacity="0" />
          <stop offset="1" stopColor="#7B93C6" stopOpacity=".4" />
        </radialGradient>
        <linearGradient id="mkCrest" x1="0" y1="0" x2="0" y2="1">
          <stop style={{ stopColor: "var(--brand-2)" }} />
          <stop offset="1" style={{ stopColor: "var(--brand)" }} />
        </linearGradient>
        <linearGradient id="mkGold" x1="0" y1="0" x2="0" y2="1">
          <stop style={{ stopColor: "var(--beak)" }} />
          <stop offset="1" style={{ stopColor: "var(--beak-2)" }} />
        </linearGradient>
      </defs>
      <g fill="url(#mkCrest)">
        <path d="M50 2c4 0 7 5 6 11l-2 12-8-2 1-14c0-4 1-7 3-7Z" />
        <path d="M37 9c3-2 8 2 10 8l3 9-8 2-6-11c-2-4-1-7 1-8Z" />
        <path d="M63 9c-3-2-8 2-10 8l-3 9 8 2 6-11c2-4 1-7-1-8Z" />
      </g>
      <circle cx="50" cy="56" r="38" fill="url(#mkBody)" />
      <circle cx="50" cy="56" r="38" fill="url(#mkShade)" />
      <ellipse cx="37" cy="51" rx="4.6" ry="5.4" fill="#0B1537" />
      <ellipse cx="63" cy="51" rx="4.6" ry="5.4" fill="#0B1537" />
      <circle cx="38.5" cy="48.8" r="1.6" fill="#fff" />
      <circle cx="64.5" cy="48.8" r="1.6" fill="#fff" />
      <path d="M50 60c4.4 0 7.6 2.6 7.6 5.2S54.4 71 50 71s-7.6-3.2-7.6-5.8S45.6 60 50 60Z" fill="url(#mkGold)" />
    </svg>
  );
}
