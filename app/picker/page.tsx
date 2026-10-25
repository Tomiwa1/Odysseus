import Image from "next/image";

type Ref = { file: string; n: string; app: string; title: string; how: string; note: string; url: string };

/* Ten ways to build the same control, deliberately far apart. Pick by
   pointing. The mechanic matters more than the styling — that's what the
   headings describe. */
const refs: Ref[] = [
  {
    file: "01-pills", n: "01", app: "Artsy", title: "Outlined pills, no checkbox",
    how: "Left-aligned pills that fill in when chosen. Nothing else on screen.",
    note: "Quietest of the ten. Closest to what we have now, which you didn't like.",
    url: "https://mobbin.com/screens/bfcf7b58-8627-4f38-9da3-70efa997f463",
  },
  {
    file: "02-tagcloud", n: "02", app: "happn", title: "Tag cloud, grouped",
    how: "Dense little tags in rows under category headings, wrapping freely.",
    note: "Best when there are forty options. Ours has six, so it would look thin.",
    url: "https://mobbin.com/screens/750c23bb-d7d5-4d95-b58e-c5434a0fcf4f",
  },
  {
    file: "03-bare-rows", n: "03", app: "Superpower", title: "Bare rounded rows",
    how: "Full-width white rows. No control visible at all until one is selected.",
    note: "Very calm and very premium. The risk is people not knowing it's multi-select.",
    url: "https://mobbin.com/screens/190d8a82-8506-43e3-accd-a9b8d8072bec",
  },
  {
    file: "04-row-square", n: "04", app: "Bumble", title: "Row with a trailing square",
    how: "White rounded rows, a square checkbox on the right that fills in black.",
    note: "Unmistakably multi-select. The checkbox on the right is the convention people already know.",
    url: "https://mobbin.com/screens/3a128987-f0df-4e17-b00e-4d7c0822fa8d",
  },
  {
    file: "05-hairline", n: "05", app: "Wealthsimple", title: "Hairline rows, no card",
    how: "Rows divided by hairlines, rounded checkbox at the right. No container.",
    note: "The most fintech of the set, and the least decorated. Reads as serious.",
    url: "https://mobbin.com/screens/794e36c9-30e6-4798-a8ba-aa1ea1228379",
  },
  {
    file: "06-leading-box", n: "06", app: "Nike Run Club", title: "Checkbox first, grouped",
    how: "Checkbox on the left, label after, options under section headings.",
    note: "Scans fastest when there are many. Feels like a form, which is the trade.",
    url: "https://mobbin.com/screens/6a13da15-12f1-4a1c-8174-1b4b15f38817",
  },
  {
    file: "07-icon-row", n: "07", app: "Marriott Bonvoy", title: "Icon, label, trailing box",
    how: "An icon carries each option, label beside it, checkbox at the right.",
    note: "The icons make it browsable. Needs ten good icons, and ours are abstract outcomes.",
    url: "https://mobbin.com/screens/68f03466-8843-4f88-98ab-bad3403812c8",
  },
  {
    file: "08-tinted-card", n: "08", app: "Airwallex", title: "Bordered card that tints",
    how: "Each option is a card with an icon. Selected cards turn the brand colour, border and all.",
    note: "The clearest selected state here, and premium fintech. Also the heaviest.",
    url: "https://mobbin.com/screens/e5088edc-c7f7-4fde-a004-8c02ae5f5b20",
  },
  {
    file: "09-tinted-row", n: "09", app: "BitePal", title: "Row that tints, circular tick",
    how: "Rounded rows with a small illustration; selected rows tint and the circle ticks.",
    note: "Warmest and most playful. Closest to the mascot side of Odysseus.",
    url: "https://mobbin.com/screens/63c2bcab-bd00-4ae8-a670-aaa3382d4342",
  },
  {
    file: "10-tile-grid", n: "10", app: "Recime", title: "Two-column tile grid",
    how: "Square tiles, icon above the label, two per row.",
    note: "Good for short labels. Ours are sentences, so they'd wrap badly.",
    url: "https://mobbin.com/screens/95e295b2-fd77-419e-af12-4c6faa5c4030",
  },
];

export default function Picker() {
  return (
    <div className="board">
      <header className="board-head">
        <h1>Ten ways to ask the same question</h1>
        <p>
          All multi-select, all on mobile. Point at one, or mix, like &ldquo;04&rsquo;s checkbox
          with 09&rsquo;s tint&rdquo;. Each card says what the mechanic is and where it falls down,
          because the mechanic matters more than the styling.
        </p>
      </header>

      <div className="board-grid board-grid--tall">
        {refs.map((r) => (
          <article key={r.file} className="ref">
            <a href={r.url} target="_blank" rel="noreferrer" className="ref-shot ref-shot--phone">
              <Image src={`/picker/${r.file}.webp`} alt={r.title} width={1179} height={2676} />
            </a>
            <div className="ref-body">
              <p className="ref-n">{r.n} · {r.app}</p>
              <h2>{r.title}</h2>
              <p className="ref-what">{r.how}</p>
              <p className="ref-note ref-risk"><b>Trade</b> {r.note}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
