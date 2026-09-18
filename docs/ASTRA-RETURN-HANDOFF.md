# Homepage candidate — return handoff for the Codex/Astra pass

Date: September 16, 2026. Branch `redesign/product-workspace` (upstream base `d083ed9`), working tree only — nothing committed, pushed, deployed, zipped, or written to model memory. A recoverable checkpoint of the whole pre-rebuild tree (including every untracked file) is at `refs/checkpoints/pre-homepage-2026-09-16` (`2f4e8b0`); restore any file with `git checkout refs/checkpoints/pre-homepage-2026-09-16 -- <path>`.

Direction built: **a living atlas of evidence.** One selected record flows through every chapter; choosing another point re-resolves the whole page to it.

## 1. What was built, and why

### Materials and light (shared by canvas and CSS)
- Graphite stage. Records are **mineral objects** (`#f3f3f0` plates with graphite text) — the identity's "graphite reading surfaces, mineral objects" — so a mineral point on the globe growing into a mineral plate is materially continuous. Silver is reserved for reference geometry; Signal Blue appears only at selection, connection and action.
- One key light from the upper left and toward the viewer (`LIGHT` in `atlas/geometry.ts`) lights the globe's points; the same direction gives every plate its top-left inset highlight and lower-right shadow, and the CSS perspective origin sits above centre. Depth fog dims the far hemisphere of the globe and the graticule's back half.

### Chapter 0 · Entrance (`AtlasStage.tsx`, `atlas/AtlasCanvas.tsx`)
- Headline "See beyond the dataset." / "Explore public datasets through their sources, documentation, and history." / search (`/workspace/?q=`) / four example queries — all present at t=0 in the first viewport on desktop **and** phone. No spectacle gate.
- Atlas: a wire-globe graticule (5 latitudes, 6 meridians, limb) with depth-attenuated back half; ≤80 Fibonacci-placed points; only real shared-publisher edges; a selected point in blue with a breathing halo, pulses travelling along its edges, and a leader line to the docked **record plate**. Labels for the selected, hovered, and up to three nearest points; label placement avoids the plate. Floor cue and key-light gradient are deliberately faint.
- Entrance ≈1.4 s once: graticule draws → points assemble front-first → edges draw → selection ring and leader line last. Skipped under reduced motion and when the page loads already scrolled. Then ambient: one revolution per ≈100 s, halo breath, edge pulses — paused when offscreen, in hidden tabs, under reduced motion, while dragging, and on **Pause rotation**.
- Interaction: hover shows a ring and name; click/tap selects; mouse drag orbits; touch scrolls natively (`touch-action: pan-y`); a styled native `<select>` in the plate gives keyboard and screen-reader users the same choice.

### Chapter 1 · Resolve (scroll progress .14→.50)
Rotation decays to zero; the camera dollies in ×1.45 and glides so the selected point lands on a fixed target; the rest of the network recedes into fog but its edges stay attached; the plate travels from its dock, widens 300→372 px, and lands with the point as its marker. Same DOM element throughout, so identity, connection and selection are all preserved. Chapter copy ("Every point is a record.") fades in as the headline scrolls away.

### Chapter 2 · Evidence (.56→.88)
The plate's four seed rows — Source, Licence, Structure, History — become four cards that fan out in a perspective cascade (each card's near edge forward, later cards in front, lifted clear of the plate's plane) and expand to real facts read from the record (`record-facts.ts`): publisher, platform, source host, first published; SPDX identifier with its evidence label, commercial use, attribution, share-alike; records, size, documented field count with the first names, languages; current version, last source update, versions recorded, lineage completeness with undocumented stages named. Marks: filled = retrieved, half = stated in prose, hollow = **not stated** (value shown in silver, never hidden), hairline = still loading. Each card links to its workspace tab. The plate's own body fades as its rows leave; head and cards then carry their own material and shadows.

### Chapter 3 · Record surface (`RecordSurface.tsx`, flow)
The same record read as a document, carrying what the plate does not: description, coverage by section with retrieved/stated/not-found counts, the latest recorded versions, "Open in workspace ↗" and "Compare with another record", and the coverage caveat. The old research-desk specimen, workflow trio and method line — which repeated the same demonstration — are gone.

### Chapter 4 · Preservation (`PreservationScene.tsx`, plays once in view)
"Sources change. Their history should remain." with an immediate "Open the archive ↗". The example is the illustrative fixture's highest-coverage *unreachable* record (Prism Fin V3): the source ring and preserved plate are connected and pulsing; after 1.7 s the connection breaks to a dashed silver wire and the source hollows with its observed end state; the plate stays lit with its last-confirmed date and "The record remains." Labelled fictional on the page; nothing invents history for a live dataset.

### Chapter 5 · Resolution (`Resolution.tsx`)
Concise search, six example queries the desk understands (text, licence filter, commercial+coverage floor), three plain links, then the global footer. No slogan sections.

### Modes and rules
- **Choreography** needs `(min-width: 1180px) and (min-height: 600px) and (prefers-reduced-motion: no-preference)` (`useStageMode.ts`, mirrored in the CSS). Everything else is **flow**: no pinning; ≥900 px gets a two-column composition (globe beside copy + plate), phones get headline → search → compact globe → the record card with all facts → surface → preservation → search.
- Every scroll-linked value is a pure function of one JS-observed progress value (`useScroll` passed through an identity transform, as the earlier fix required), so fast, reversed and direct-navigation scrolling all render the correct state. Track length is `100svh + 250svh`, chosen from the choreography (≈1 viewport for the resolve, ≈1.2 for the layers, short holds).
- Native scrolling only; search, controls and the plate's actions never move with scroll except as part of the plate's travel.
- Full records load lazily on selection (`getDataset`, cached); summary facts render immediately and deep facts show a hairline "…" until they arrive. The initial record is chosen on the server (`chooseFeatured`: a record with a shared-publisher connection and partial coverage demonstrates the most — edges to follow and gaps that must stay visible) and server-rendered complete.

## 2. Changed files and preview

**Owned and rewritten** (`src/components/product/`): `ProductHome.tsx`, `AtlasStage.tsx` + `.module.css`, `RecordPlate.tsx` + `.module.css`, `RecordSurface.tsx` + `.module.css`, `PreservationScene.tsx` + `.module.css`, `Resolution.tsx` + `.module.css`, `SearchForm.tsx` + `.module.css`, `record-facts.ts` + `record-facts.test.ts`, `useStageMode.ts`, `atlas/AtlasCanvas.tsx` + `.module.css`, `atlas/geometry.ts` + `geometry.test.ts`.
**Removed:** `EvidenceJourney.tsx/.module.css`, `ArchivePortal.tsx`, `AtlasConstellation.tsx`, `ProductHome.module.css`.
**Route:** `src/app/page.tsx` (fetches summaries, the featured full record and the illustrative preserved example).
**Docs:** `PROJECT-STATUS.md`, `README.md`, `START-HERE.md` (homepage sentences only), this file, `docs/evidence/homepage-2026-09-16/` (before/after captures, `_results.json`, and `capture.mjs`).
**Not touched:** shared tokens (`globals.css`), layout, navigation, footer, dependencies, backend contracts, `chronicle/`, `workbench/`, `lib/`.

Preview: `npm run dev -- -p 3130` then `http://localhost:3130/`. Useful positions at 1440×900: scroll 720 (resolving), 1125 (resolved), 1620 (spreading), 2030 (evidence), `#record`, `#delisted`, `#search`. Reproduce the captures with `node docs/evidence/homepage-2026-09-16/capture.mjs <plan.json> <outDir>` against a running server (plans are plain JSON; see the header of the script).

## 3. Verification actually performed (integrated tree, Node 24.20)

Automated:
- `npx vitest run` — 15 files, 128 tests pass (adds 15 for atlas geometry, featured-record choice, fact derivation, null/zero handling, host validation).
- `npx tsc --noEmit` — 0 errors.
- `npx eslint .` — 0 errors; the two pre-existing intentional wordmark `<img>` warnings remain.
- `npx next build` — passes; 32 routes registered.
- `next start` route matrix: `/`, `/workspace/`, `/workspace/?dataset=…&tab=history`, `/delisted/`, `/delisted/?demo=1`, `/compare/`, `/collections/`, `/docs/` → 200; `/explore/?q=clinical` and `/datasets/biomed-abstracts-open/` → 307 to the workspace; `/no-such-page/` → 404.

Rendered (headless Chrome over CDP against the production build; the same runs collected console errors — none — and document width — no horizontal overflow at 1440, 1280, 1024 or 390):
- 1440×900: entrance at rest and mid-assembly; resolve at p=.32 and .50; evidence at p=.72 and .90; record surface; preservation before and after the break; resolution; **reverse scroll** (2250 → 720) and a **fast scrub** (0 → 2250 → 0) land on the exact states; **direct navigation** to a mid-track offset renders a coherent intermediate; reduced motion (flow, everything visible); dark theme.
- 1280×720: entrance, resolved, evidence (fan fits above the foot after making the target height-aware).
- 390×844: entrance with search in the first viewport, record card with every fact, preservation played, full page.
- 1024×768: two-column flow.

Interactive (in-app browser pane at 1440×900, dev build): hover ring + name + pointer cursor; click selects and the plate, leader line, layers and record surface all follow; the `<select>` changes the record and the deep facts resolve from the summary-only state; **Pause rotation ↔ Resume rotation**; keyboard order search → submit → examples → record select → four layer links → Inspect record → foot controls, with no focus-induced scrolling; console clean.

## 4. Known defects and unverified boundaries

- **Browser-pane tooling limitation:** the app's `preview_start` bound this repo's `dev` config to a different project on port 3000 twice, so the dev server was run directly (`next dev -p 3130`). The pane's tab is also hidden while tools run (`document.hidden === true`), which throttles `requestAnimationFrame` and makes scroll-linked values lag there; scroll states were therefore verified with the CDP captures, not the pane.
- **Not exercised:** the empty/unavailable catalog branch (stage message, surface fallback, "catalog unavailable" copy) — code paths are simple but were not rendered; live Supabase data (record names longer than the illustrative ones may wrap the plate head to three lines); assistive-technology runs beyond the accessibility-tree reads; physical touch devices (touch selection is hit-tested with an 18 px slack but only mouse events were driven).
- **Design boundaries to know:** choreography starts at 1180×600, so iPad landscape gets the two-column flow rather than the pinned stage; the fan's rightmost card sits within ~40 px of the stage edge at 1280; when a record's seed line is long the folded row shows an ellipsis (full text appears when the card fans out); the "Continue ↓" target lands with ~40 px of the stage foot visible above the record surface because of the site-wide `scroll-padding-top`.
- **Integration boundary:** `chronicle/` and `workbench/` were taken as found (their handoffs are `docs/DELISTED-REVISION-HANDOFF.md` and `docs/WORKBENCH-REVISION-HANDOFF.md`, last edits 16:33 today); I ran the gates above over the combined tree but did not re-review their behaviour beyond the route matrix. The Delisted page still uses Instrument Serif for "The record remains."; the homepage no longer uses the serif anywhere.
- The Next.js dev indicator ("N" badge) appears in dev captures only.

## 5. Before / after

Before (`docs/evidence/homepage-2026-09-16/before/`): `1440-hero.png` (the previous observatory with domain rail, glass focus card and the ATLAS watermark), `1440-journey-source/evidence/perspective.png` (the crossfading Evidence Journey — mid-transition the candidate cards overlapped the document), `1440-research.png`, `1440-archive.png`, `1280x720-hero.png`, `390-hero.png` and `390-full.png` (the phone page was 441 px wide at a 390 px viewport — horizontal overflow, and search below the first viewport).

After (`docs/evidence/homepage-2026-09-16/after/`): `1440-01…12`, `1280x720-01…03`, `390-01…04`, `1024x768-flow.png`; `_results.json` records scroll position, document width and console errors per capture.

## 6. Questions for Astra (three)

1. **Material.** Record plates are mineral (light) on the graphite stage; the Delisted field still uses dark glass plates. Should Delisted adopt the mineral material for one system, or should the homepage plate return to graphite glass to match it?
2. **Choreography threshold.** Pinned choreography begins at 1180×600; 900–1179 px (iPad landscape, small laptops) gets the two-column flow. Is that the right cut, or is a lighter pinned version worth building for that band?
3. **Featured record rule.** `chooseFeatured` prefers a connected, partial-coverage record (Code Review Comment Threads in the illustrative catalog). Against the live catalog that rule will surface whichever record fits first. Keep the rule, or editorially pin the opening record?
