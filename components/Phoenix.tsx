/* The mascot you approved, grown up. Same silhouette — round body, low eyes,
   crest — but the palette is the product's: white body, deep blue wings and
   crest, gold beak and feet. Original artwork. */
export default function Phoenix({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 240 230" fill="none" role="img" aria-label="The Odysseus bird">
      <defs>
        <linearGradient id="bdBody" x1="120" y1="28" x2="120" y2="196" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFFFFF" />
          <stop offset=".56" stopColor="#F4F7FE" />
          <stop offset="1" stopColor="#D8E3F8" />
        </linearGradient>
        <radialGradient id="bdShade" cx=".5" cy=".3" r=".78">
          <stop offset=".54" stopColor="#8DA4D2" stopOpacity="0" />
          <stop offset="1" stopColor="#7B93C6" stopOpacity=".42" />
        </radialGradient>
        <radialGradient id="bdGloss" cx=".38" cy=".16" r=".4">
          <stop stopColor="#FFFFFF" stopOpacity=".95" />
          <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="bdWing" x1="0" y1="0" x2="0" y2="1">
          <stop style={{ stopColor: "var(--brand-2)" }} />
          <stop offset="1" style={{ stopColor: "var(--brand-deep)" }} />
        </linearGradient>
        <linearGradient id="bdCrest" x1="0" y1="0" x2="0" y2="1">
          <stop style={{ stopColor: "var(--brand-2)" }} />
          <stop offset="1" style={{ stopColor: "var(--brand)" }} />
        </linearGradient>
        <linearGradient id="bdGold" x1="0" y1="0" x2="0" y2="1">
          <stop style={{ stopColor: "var(--beak)" }} />
          <stop offset="1" style={{ stopColor: "var(--beak-2)" }} />
        </linearGradient>
      </defs>

      {/* tail, tucked behind */}
      <path d="M186 148c15-7 31-16 41-27-2 18-9 33-20 44-8 8-18 7-23-1-4-7-3-13 2-16Z" fill="url(#bdWing)" opacity=".85" />

      {/* crest — taller than a chick's tuft; this is what makes it a bird of myth */}
      <g fill="url(#bdCrest)">
        <path d="M120 2c6 0 11 8 10 17l-3 20-12-2 2-25c0-7 1-10 3-10Z" />
        <path d="M99 11c5-3 12 4 15 12l5 15-12 3-9-18c-3-7-2-11 1-12Z" />
        <path d="M141 11c-5-3-12 4-15 12l-5 15 12 3 9-18c3-7 2-11-1-12Z" />
      </g>

      {/* feet */}
      <g fill="url(#bdGold)">
        <path d="M100 186h9v13h8a4.5 4.5 0 0 1 0 9H98a4.5 4.5 0 0 1-4.5-4.5v-9a8.5 8.5 0 0 1 6.5-8.5Z" />
        <path d="M140 186h-9v13h-8a4.5 4.5 0 0 0 0 9h19a4.5 4.5 0 0 0 4.5-4.5v-9a8.5 8.5 0 0 0-6.5-8.5Z" />
      </g>

      {/* body */}
      <ellipse cx="120" cy="118" rx="70" ry="80" fill="url(#bdBody)" />
      <ellipse cx="120" cy="118" rx="70" ry="80" fill="url(#bdShade)" />
      <ellipse cx="120" cy="118" rx="70" ry="80" fill="url(#bdGloss)" />

      {/* wings */}
      <path d="M55 104c-10 7-13 22-8 37 5 14 15 24 24 24 7 0 10-5 9-12l-10-43c-2-8-8-10-15-6Z" fill="url(#bdWing)" />
      <path d="M185 104c10 7 13 22 8 37-5 14-15 24-24 24-7 0-10-5-9-12l10-43c2-8 8-10 15-6Z" fill="url(#bdWing)" />

      {/* eyes */}
      <g className="bird-eyes">
        <ellipse cx="99" cy="106" rx="8" ry="9" fill="#0B1537" />
        <ellipse cx="141" cy="106" rx="8" ry="9" fill="#0B1537" />
        <circle cx="101.6" cy="102.4" r="2.8" fill="#FFFFFF" />
        <circle cx="143.6" cy="102.4" r="2.8" fill="#FFFFFF" />
      </g>

      {/* beak */}
      <path d="M120 122c8 0 13 4 13 9s-5 9-13 9-13-4-13-9 5-9 13-9Z" fill="url(#bdGold)" />
      <path d="M107 131c3 3 8 5 13 5s10-2 13-5c0 5-6 9-13 9s-13-4-13-9Z" fill="#B9842A" opacity=".5" />
    </svg>
  );
}
