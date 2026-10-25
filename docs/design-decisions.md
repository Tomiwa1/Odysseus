# Odysseus — design decisions

v0.2, 22 October 2026. The visual language comes from the reference Tomiwa
supplied; see [design-language.md](design-language.md) for what was extracted
and what had to be extended. This file records the product decisions.

## History

v0.1 used a light chart-paper palette with a left rail and a split-pane job
feed. Tomiwa rejected the whole direction and supplied the Octant application
flow as the reference instead. v0.1 is gone, not layered over — the frame, the
palette, the type and the navigation were all replaced.

## Screens

| Route | Word | Step |
| --- | --- | --- |
| `/` | Today | — |
| `/jobs` | Jobs | Find |
| `/jobs/[id]` | Match | Find |
| `/jobs/[id]/prepare` | Pitch | Tailor |
| `/pipeline` | Track | Track |
| `/profile` | You | — |
| `/onboarding` | Start / Read / Gap | — |
| `/system` | Marks | — |

## Decisions worth keeping

**The loop is the left column, on every screen.** Find a job worth it → tailor
what you send → reach the right person → track what happened. The reference
uses its step list to show progress through one application; Odysseus uses it
to show position in a repeating loop, which is what the PRD's core loop
actually is. It is the single strongest argument that this is a system rather
than a job board.

**The job feed is a list, not a split pane.** The reference frame has one
content block, and a list-plus-detail pane would break it. Selecting a job
opens `/jobs/[id]`, where the match gets a full screen and the requirements are
read against your profile one line at a time. The score is never shown without
those lines.

**The tracker is a table, not a board.** Every tracking reference on Mobbin is
recruiter-side, where a kanban compares many candidates inside one stage. A job
seeker has one stage per application and asks "what is waiting on me" — the
orange-marked group at the top answers that; a board could not without
horizontal scrolling.

**The funnel lives with the record, not on Today.** Today answers "what do I do
now" in three rows. How the search is going sits on `/pipeline` beside the
response-rate findings, so no figure is stated twice.

**Generated text carries its sources.** Every draft has a *Built from* row
naming the facts it used and where each came from, and three verbs on the
bottom edge: Use this · Edit · Try again. A missing requirement gets a hollow
red mark and a plain sentence — the product never writes the plausible version.

## Taste entries

The project reference outranks generic preferences, which matters in three
places where this design contradicts the taste library and does so knowingly:

- `t-color-11` — *default to true white for appropriate light interfaces.* This
  interface is not light. The reference is near-black, so the entry does not
  apply rather than being overridden.
- `t-typography-rounded-20261004` — Playfair Display and Inter are not rounded
  faces. The reference's type is the instruction here.
- `t-layout-centred-column-20261004` — now honoured, by accident of the
  reference: one measured block, centred, at every viewport.

Still applied: `t-cards-25` (nothing is decorated equally — there are no cards
at all), `t-radius-09` (4px and 6px, chosen because this language is drawn
rather than rounded), `t-ai-products-23` (review, undo and uncertainty are all
exposed), `t-spacing-label-value-20261004`.

## Accessibility

Every text colour was checked against the surface it sits on: body `#E6E5DD` is
15.4:1 on the panel, muted `#A3A29B` is 7.6:1, faint `#8F8F8A` is 6.0:1, the
orange is 8.9:1. The reference's `#434340` pending-label grey is 2.0:1 and was
not used for text. Status never depends on colour alone — each mark has a shape
and a sentence. All motion is suppressed under `prefers-reduced-motion`.

## Not done

- The reference's ink illustrations. They carry much of its character and are
  not reproducible here; the slot is left empty rather than filled badly.
- A motion pass through `motion-system`. There are duration and easing tokens
  and one entry animation, no matrix and no documented modes.
- Empty, loading and error states.
- Anything below 1440. The frame is fixed-width by design and has no responsive
  behaviour yet; the reference shows none either.
