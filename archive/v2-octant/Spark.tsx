/* The orange mark. The reference flanks each display word with small ink
   sparks; this is ours — three strokes, never more than three per word. */
export default function Spark({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="16" viewBox="0 0 20 16" fill="none" aria-hidden="true">
      <path
        d="M9.6 8.2C7.9 5.4 5.3 3.6 2.6 4.3c-2 .5-2.9 2.6-1.5 4 1.6 1.7 5.6 1.3 8.5-.1Z"
        fill="currentColor"
      />
      <path
        d="M10.4 7.8c1.3-3 3.6-5.3 6.4-5.1 2 .2 3.2 2.1 2.1 3.7-1.3 1.9-5.3 2.3-8.5 1.4Z"
        fill="currentColor"
      />
      <path d="M10 8.4c-.5 2.3-.3 4.5.6 6.6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}
