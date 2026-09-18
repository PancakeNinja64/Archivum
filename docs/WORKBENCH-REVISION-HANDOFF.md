# Workbench revision — handoff

Date: 2026-09-16. Author: Claude Code (Opus 5). Scope: `src/components/workbench/**` and its tests, while a separate session rebuilds the homepage. Nothing committed, pushed, deployed or zipped; no dependency manifests, global styles, homepage or chronicle files touched; no memory written; the other session's uncommitted work was left as found.

## What changed

### Saved tray (`ShortlistTray.tsx`, `tray.module.css`, `trayModel.ts`)

- Three modes, derived by `trayMode()`: `reading` (store not yet read — never flashes "empty"), `empty`, `filled`.
- **Empty** is one compact line: label, `0 of 4`, one sentence saying how to fill it, and the Shelf link. Desktop height 44 px (was ~52–95 px with a full row of disabled controls); phone 40–70 px depending on the hint wrap.
- **Filled** shows record chips (name in sans, publisher beneath in sans, current record outlined in blue), **Compare N** (a real link once two are saved; disabled with a stated reason at one), **Brief → Markdown / JSON**, and **Shelf**. Desktop keeps it to one row; the chip strip scrolls with a thin scrollbar so overflow is visible.
- **Phones**: the bar holds the label, Compare and a **Show / Hide** toggle (`aria-expanded`, `aria-controls`). Chips and the brief/shelf row fold by default. A save made while the page is open unfolds them so the new chip is seen; opening a different record folds them again so they never sit over that record's own actions.
- The tray measures itself with a `ResizeObserver` and publishes `--wb-tray` on its parent. On single-column viewports every focusable in the desk, the comparison main column and the shelf gets `scroll-margin-bottom: calc(var(--wb-tray) + 12px)`, so keyboard focus and `scrollIntoView` land above the tray rather than under it.
- Compare and export remain reachable from the tray on every surface where they apply; the Compare link is hidden only on `/compare/` itself.

### Initial workspace state (`IdleGuide.tsx`, `guide.ts`, `labels.ts`, `Workbench.tsx`, `Inspector.tsx`)

- The evidence desk's idle state is now a numbered guide built from what is actually beside it:
  1. **Find records** — "N records are listed on the left, ordered by documentation coverage, highest first" (live count, live sort; loading / error / no-match phrasings), a Search button, and **Narrow by domain** chips taken from the real catalog facets (largest first, excluding domains already applied, capped at six).
  2. **Open one** — keyboard hints and **Open the first listed record**, captioned with the record's name and "first under the current order, which is an ordering, not a recommendation". With no matches under a search/filter it offers **Clear search and filters** instead.
  3. **Save, compare, export** — what the tray is for.
  Then a compact 2×2 of what each tab holds and the `/` shortcut.
- Nothing is ranked, scored or called best; coverage is named as an ordering only. `startingPoints()` is pure and tested.
- `Inspector` no longer owns the idle branch (`InspectorState` dropped `idle`); `Workbench` renders `IdleGuide` when no record is selected.

### Typography (`recordMeta.ts` + every surface)

- One helper, `splitRecordMeta()`, splits record metadata into **names** (publisher, platform → sans) and **identifiers** (licence, version, `upd <date>` → mono), naming unstated values instead of leaving blanks.
- Applied to: result rows (two lines: sans names, mono identifiers), the record header eyebrow (publisher/platform sans, version mono), tray chips, comparison column headers, the compare picker, and the shelf.
- Explanatory text moved from tiny mono to 12–13 px sans: filter fold label, "Reset filters", the evidence legend, licence lookup terms (attribution/share-alike), lineage actor, version author, scroll hints, the Brief group labels, the comparison corner summary.
- Mono kept, with 10.5 px floors raised to 11–11.5 px where they were counts: section counts, drawer counts, evidence states, stage/date/hash in lineage, version numbers, tray count, table captions.

### Hierarchy, boundaries, selected states

- Record header actions are two tiers: decisions (Save on this device — filled; Compare with saved — outlined) above utilities (Brief Markdown/JSON, Copy link, Open at source — quiet).
- Selected result row: existing blue wash and rail, plus the record name in accent and a visible `:focus-visible` ring.
- Tray: hairline-strong top border, surface background, current chip in accent wash — reads as a distinct dock without a new colour.

No new dependencies, no scroll-driven animation, no 3D, no new colours; the existing Motion fade on tray chips and record change is unchanged and still gated by `useReducedMotion`.

## Files

New under `src/components/workbench/`: `IdleGuide.tsx`, `guide.ts`, `labels.ts`, `recordMeta.ts`, `trayModel.ts`, `useSingleColumn.ts`, `workbench.test.ts`.
Modified under `src/components/workbench/`: `ShortlistTray.tsx`, `tray.module.css`, `Workbench.tsx`, `Inspector.tsx`, `inspector.module.css`, `ResultsPanel.tsx`, `desk.module.css`, `CompareDesk.tsx`, `compare.module.css`, `ResearchShelf.tsx`, `shelf.module.css`.
Also: `.claude/launch.json` was edited while trying to get the preview tool to start this repo's server and then restored to its original content.

## Verification

Commands (Node from the Codex runtime path):

- `npx tsc --noEmit -p tsconfig.json` — 0 errors.
- `npx eslint src/components/workbench src/lib/workbench src/app/workspace src/app/compare src/app/collections` — clean (the `react-hooks/set-state-in-effect` rule shaped the tray's fold logic: it uses a `useSyncExternalStore` media-query hook and the "adjust state during render" pattern already used by `SearchField`).
- `npx vitest run` — 15 files, 128 tests pass; `workbench.test.ts` adds 14 (tray mode/compare/labels, metadata split and unstated fallbacks, idle-guide starting points incl. loading/error/empty, domain ordering/exclusion/cap, sort wording).

Browser (this repo's dev server on `localhost:3130`, illustrative catalog, desktop ~800×600 and emulated 375×812 phone, light and dark):

- Search → inspect → save → compare: opened the first listed record from the guide, saved it, opened a second from the list, saved it (tray went to one row with two chips and **Compare 2**), followed Compare 2 to `/compare/?datasets=…`.
- Exports: with `URL.createObjectURL` intercepted, the tray's Markdown brief (scope Shortlist, 2 records, illustrative origin stated) and the comparison brief (scope Comparison) both produced Markdown blobs and the status lines read "Markdown brief downloaded · 2 records · illustrative origin stated."
- Removal: removed both records from the tray on `/compare/`; column headers flipped to "Save"; tray returned to the compact empty line (44 px plus the lingering export status line).
- Shelf `/collections/`: sans names, mono identifiers; tray with one record shows disabled Compare (reason in title) and Brief.
- Phone: list first with filters folded; tray folded at 55 px with Compare and Show; Show unfolds to ~160 px with chips and brief/shelf; opening a record moved focus to the record name, URL `?dataset=…`, tray folded; focusing "Copy link" placed it above the tray (bottom 745 px vs tray top 757 px, `scroll-margin-bottom: 67px`); saving unfolded the tray with the new chip highlighted; **Back to results** returned focus to that row and folded the tray; document width stayed 375 px on desk, compare (differences-only, 14 rows) and shelf.
- Dark theme rendered from tokens on all three surfaces (the pane switched to dark mid-session, which gave a free check).
- Idle guide with `?q=zzzz&domain=legal`: "Nothing matches…", domain chips exclude `legal`, Clear search and filters offered.
- Console: no errors from the revised code. The only errors seen were stale HMR messages from a transient missing import during editing, fixed before verification.

## Known limitations

- **Preview tool**: `preview_start` attached to another chat's server for a different project on port 3000 and would not start this repo's config on 3130; the 3130 server used here was already running from the other session (I did not start or stop it). `preview_logs` therefore could not be read for this server; console and DOM were checked instead.
- **No DOM test runner** (vitest env is `node`, no testing library, and manifests are out of scope): component behaviour — fold/unfold, `ResizeObserver` publishing `--wb-tray`, focus clearance — is verified in the browser only; the pure helpers are unit-tested.
- The tray's export status line lingers until navigation (pre-existing `useBriefExport` behaviour), so an empty tray reads as two lines right after an export.
- Idle-guide domain chips use catalog-wide facet counts, like the filter panel; they are not counts within the current result set.
- Lineage actors are set in sans as "who"; in the illustrative catalog they look like identifiers (`archivum-ingest`). If live actors are mostly ids, `stageActor` can be switched to mono in one line.
- Reduced motion checked by code path (unchanged guards), not emulated. Production build not run, to avoid building concurrently with the other session. Live catalog mode unverified (no credentials).
- The Next dev indicator badge overlaps the tray's label in development only.

## Requests for the coordinator

1. **Next dev indicator**: if it keeps overlapping docked UI, `devIndicators.position` in `next.config.ts` (shell-owned) moves it; not a production concern.
2. **`useBriefExport` notice** (`src/lib/workbench/useBriefExport.ts`, outside this scope): consider clearing the notice on route change or after a delay so the tray's compact line stays compact after an export.
3. **Header height**: the desk still reads `var(--header-height, 64px)`; if the rebuilt homepage/shell changes the header, define the variable on `:root`.
4. Carried over from the original workspace report: indexing `slug` in mock/live search; whether app routes hide the footer; sitemap treatment of `/compare/` and `/collections/`.
