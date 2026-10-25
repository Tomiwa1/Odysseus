# Odysseus

A job-search operating system. Design prototype, Next.js App Router, built from
`docs/prd.md` (PRD v0.2).

## Running it

```bash
npm --prefix odysseus run dev
```

Port 3100. Registered in the workspace `.claude/launch.json` as `odysseus`.

## Routes

| Route | What it shows |
| --- | --- |
| `/` | Today — what needs the user, then the search funnel |
| `/jobs` | The matched list |
| `/jobs/[id]` | The match, requirement by requirement |
| `/jobs/[id]/prepare` | Resume · Answers · Outreach |
| `/pipeline` | Applications, waiting-on-you first, then the funnel |
| `/profile` | Profile and the structured experience builder |
| `/onboarding` | Upload, review what was read, fill one gap |
| `/system` | Colour, type, controls, and the AI contract |

## Rules for this project

- **Nothing generated appears without its source.** Every drafted line carries a
  *Based on* row naming the facts it used. If a fact is missing, the gap is
  shown; the sentence is not written around it.
- **Confidence is labelled, not implied** — Verified, Likely, Unknown on every
  contact and email.
- **Nothing is sent for the user.** Outreach is drafted and copied, never sent.
- **Three controls on every draft, always the same three**: Use this · Edit ·
  Try again.
- **The frame never changes.** Navbar, ornament band, panel, two crosshairs.
  Dense screens scroll inside the right container; the forward action is pinned
  below it and is never off-screen.
- **One live edge per screen.** The gradient-bordered italic button marks the
  single action that moves you forward. Two visible means one is wrong.
- **One accent.** `#FF9602`, and nothing else. The panel is cut into the page,
  so nothing is raised and nothing casts a shadow.
- **Icons come from the central set** via `components/icons.ts`, which re-exports
  `icons/`. Those files are **generated, not authored**: run `scripts/sync-icons.sh`
  to pull them from `~/Desktop/Design Sorcery/icons`, which stays the source of
  truth. Add new icons there, then sync. Never hand-edit anything in `icons/`.
  It was a symlink until 25 Oct; that only built on one machine and Vercel failed
  with `ENOENT ... stat '/vercel/path0/icons'`.
  This design uses almost none — the reference draws its marks instead.
- **The left column is the loop**, on every screen: find → tailor → reach →
  track. It is what makes this a system rather than a job board.
- Functional labels stay literal — stages are Applied and Interview, never
  nautical. The display word is the only place with any voice.

The visual language and where it came from: `docs/design-language.md`.
Product decisions and the taste entries applied: `docs/design-decisions.md`.
Workspace taste rules in `../TASTE.md` still apply; where this file disagrees
with a generic preference, this file is the project rule and wins.
