# Odysseus — design language

Extracted from the reference Tomiwa supplied on 22 October 2026:
[Octant application flow](https://www.figma.com/design/5pvfrrnoESjfK28sUYK8vb/My-LLms-Cooking.?node-id=29-13004),
node `29:13004`. Geometry read from the file's own node tree; colour sampled
from the rendered PNGs, not estimated by eye.

## What the reference actually is

A linear application wizard: `start → intro → round → proof → success`, with a
`dashboard` section that is an empty placeholder. Nine sections, 60 top-level
frames, all 1440 × 900. So the reference covers forms and milestone screens
thoroughly and lists, tables and dashboards not at all — everything in Odysseus
that is a list is an extension, noted at the bottom.

## Geometry, read from the file

| Element | Value |
| --- | --- |
| Screen | 1440 × 900 |
| Navbar | full width, 88 tall |
| Content block | 880 × 645 at x 280, y 172 |
| Ornament band | 880 × 80, above and below the panel |
| Panel | 880 × 485 |
| Left container | 320 wide |
| Divider | 1px, full panel height |
| Right container | 560 wide, 32 inset → 496 of form |
| Input row | 496 × 71 (label + control) |
| Control / button | 48 tall |

Everything is a multiple of 8; the ornament cell is 80. Odysseus keeps all of
it and adds one variant: a 1280-wide panel (16 cells) for the two list screens.

## Colour, sampled

| Token | Value | Role |
| --- | --- | --- |
| `--page` | `#171717` | the ground |
| `--panel` | `#0D0D0D` | the working panel, **cut into** the page |
| `--raise` | `#252524` | buttons, the only surface above the page |
| `--grid` | `#343433` | ornament lines |
| `--line` | `#2B2B29` | control and divider hairlines |
| `--ink` | `#FEFDF4` | display — warm, never `#FFF` |
| `--ink-2` | `#E6E5DD` | body |
| `--ink-3` | `#A3A29B` | muted, 7.6:1 on panel |
| `--ink-4` | `#8F8F8A` | faint, 6.0:1 on panel |
| `--mark` | `#FF9602` | the single accent |

The panel is *darker* than the page. Nothing is raised on a card and nothing
casts a shadow — depth comes from cutting in, which is why there is no
elevation scale in this product.

The reference's dim grey `#434340` for pending step labels is 2.0:1 and fails
for text. Odysseus uses it for rings and disabled glyphs only, and lifts
pending labels to `--ink-4`.

## The devices worth copying

1. **The ornament band.** An 80px ruled grid directly above and below the
   panel, with a small `+` crosshair at the panel's top-left and bottom-right.
   It is what makes the thing feel drafted rather than designed.
2. **The display word.** One serif word naming where you are — *You, Pitch,
   Goals, Proof, Done* — flanked by small orange ink marks, with a letterspaced
   caps caption and a short rule beneath. Odysseus uses *Today, Jobs, Match,
   Pitch, Track, You, Start, Marks*.
3. **The persistent step list** pinned to the bottom of the left column:
   filled ring for done, bright ring for current, hollow for pending. Odysseus
   runs its own loop through it — find, tailor, reach, track — so the product
   always says where you are.
4. **The live edge.** The one action that moves you forward gets a 1.5px
   orange→green→orange gradient border and an *italic serif* label. Exactly one
   per screen. Two visible means one is wrong.
5. **Outlined controls.** Inputs are the panel colour with a `--line` border —
   no fill change. Grouped controls share one outline split by hairlines.
6. **Internal scrolling.** The frame never grows. Dense screens scroll inside
   the right container, with the forward action pinned below it.

## Typography

Playfair Display for the display word and for the one italic action label.
Inter for everything you operate. Nothing in between, and the serif never
appears in a label, a row or a field.

## What had to be extended

- **Lists and tables.** The reference has none. Odysseus uses the same hairline
  rows as the form's input rows, on the 1280 panel, with the orange mark used
  only for the group that is waiting on the user.
- **A match number.** Shown in Playfair, orange above 85, `--ink-3` below.
- **Illustration.** The reference's ink dragons and adventurers carry a lot of
  its character and cannot be reproduced here. Odysseus ships the ornament
  system and a small three-stroke orange mark instead, and leaves the
  illustration slot genuinely empty rather than filling it badly.
