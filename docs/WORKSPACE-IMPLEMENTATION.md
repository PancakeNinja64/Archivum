# Research workspace — implementation report

Date: 2026-09-13/14. Author: Claude Code (Opus 5) under `CLAUDE-WORKSPACE-MISSION.md`. Branch `redesign/product-workspace`. Nothing committed; no deployment; no memory writes; no new dependencies.

## What was built

Three routes and the library beneath them, all under the owned paths only.

| Route | Purpose |
| --- | --- |
| `/workspace/` | The research desk: search + filters + result list on the left, a full record inspector (Overview / Evidence / History / Structure) on the right, the shortlist tray docked below. All state lives in the query string. |
| `/compare/?datasets=a,b[,c,d]` | Two to four records side by side, one fact per row, a genuine "differences only" filter, column removal, add-from-saved, export. With fewer than two slugs it becomes a picker built from the shortlist. |
| `/collections/` | "Saved on this device": the actual local shortlist with open / evidence / compare / remove / export / clear. Honest empty state. |

Every surface shares one shortlist store, one export path, and one URL contract. Record links everywhere are `/workspace/?dataset=<slug>` (optionally `&tab=evidence|history|structure`). The old `/datasets/[slug]/` dossier is never linked from the new surfaces.

## Files (all new)

```
src/lib/workbench/
  query.ts               URL contract: parse/serialise/patch the desk state; compare slug list
  shortlist.ts           validated localStorage store (limit 4), status reporting, pure normaliser
  useShortlist.ts        useSyncExternalStore hook — identical state on every surface, hydration-safe
  compare.ts             aligned row model for the comparison desk (unknown ≠ zero, differs flag)
  export.ts              research brief: structured JSON + escaped Markdown + browser download
  useBriefExport.ts      resolves targets against the catalog, builds, downloads, reports gaps
  query.test.ts          URL contract (11 tests)
  shortlist.test.ts      normalisation, storage failure modes, store semantics (10 tests)
  compare.test.ts        row alignment, unknown-vs-zero, differences (4 tests)
  export.test.ts         JSON fidelity, Markdown escaping, filenames (5 tests)

src/components/workbench/
  Workbench.tsx          desk orchestrator: history API URL state, fetching, cache, focus, mobile mode
  ResultsPanel.tsx       search (debounced), filter chip groups, coverage floor, sort, list, pager
  Inspector.tsx          record header + tabbed inspector + idle/loading/absent/error states
  ShortlistTray.tsx      persistent "Saved on this device" tray with compare / shelf / export
  CompareDesk.tsx        comparison table, column states, picker
  ResearchShelf.tsx      /collections
  Glyph.tsx              hairline SVG glyphs + evidence marks (shape carries meaning)
  desk.module.css        primitives + two-pane geometry + results panel
  inspector.module.css   evidence desk
  compare.module.css     comparison desk
  shelf.module.css       collections
  tray.module.css        shortlist tray

src/app/workspace/page.tsx   Suspense boundary around the desk (useSearchParams), metadata
src/app/compare/page.tsx     Suspense boundary, metadata
src/app/collections/page.tsx metadata
docs/WORKSPACE-IMPLEMENTATION.md
```

Imports from outside the owned paths are read-only and limited to `@/lib/api/client` (`dataMode`, `getDatasets`, `getDataset`, `getFacets`), `@/lib/types`, `@/lib/coverage/rules` (check catalogue, section labels), `@/lib/utils` (formatters, labels, `safeExternalUrl`), `next/*`, `react`, and `motion/react`.

## Design

- **Geometry.** Beneath the 64 px fixed header (`var(--header-height, 64px)`), the desk is `100svh − header` on ≥ 900 px: a 372/408 px results column and a generous evidence pane, each its own scroll container (`overscroll-behavior: contain`), the tray docked at the bottom. Below 900 px it is one column in page flow with `data-mode="list" | "record"`: a record shows a sticky "Back to results" bar and hides the list; there is never a squeezed three-column layout. The footer that the shell renders sits below the desk and is reached by scrolling past it.
- **Language.** Mineral paper (`--background`) with white reading surfaces, Graphite ink, hairlines (`--border`), Geist Mono for metadata at 10.5–12 px, one blue (`--accent`, `--accent-wash`) for selection and action. Light and dark both come from the existing tokens; no new colours were introduced. Display type: all workbench headings, record names, column titles and empty states are set in Geist Sans (weight 450–500) under the final typography policy in `docs/DESIGN-AUDIT-FINAL.md`; the workbench uses no serif.
- **Motion.** CSS transitions of 150–300 ms on selection rails, chips, drawers, and the tab underline; one Motion fade/rise on record change and layout/exit on tray chips, both gated by `useReducedMotion`. The global `prefers-reduced-motion` rule in `globals.css` collapses the CSS transitions.
- **Not a hero page.** There is no hero, card grid, or CTA band. The first thing on the desk is the search field, the filters, and the records.

## Workflows

### Discover (`/workspace/`)

- Query from `q` (debounced 300 ms → `history.replaceState`; Enter or Escape/clear → `pushState`). Filters: published licence (facet chips, including "Not stated"), **commercial use permitted by lookup** (a static SPDX lookup of the identifier; the caption says it is not permission), platform, modality, domain, documentation-coverage floor (Any / ≥ 40 % / ≥ 75 %, captioned as a documentation measure, not quality or permission), and sort. Every filter is a URL parameter; back/forward restore both the URL and the pressed chips.
- Pagination (24/page) appears only when the total exceeds a page; an out-of-range page is corrected to the last page.
- Stale-request guard: results are keyed by the result-changing part of the URL plus a retry counter; only the response for the current key renders. Selected records go through a small insertion-ordered cache (32 entries) with an in-flight set so a slug is fetched once.
- States are designed: skeleton rows with `role="status"`, an error state with retry that keeps the link intact, an empty state that offers to clear search and filters, and facet failure with its own retry.
- Keyboard: `/` focuses search (ignored while typing in a field), ↑/↓/Home/End move through rows, Enter opens (native button activation), tabs use roving tabindex with ←/→/Home/End. Primary actions, rows, tabs, and inputs are ≥ 44 px everywhere; secondary quiet buttons and chips are 36/32 px with a mouse and grow to 44/40 px under `@media (pointer: coarse)`, as do the tray's remove buttons and the check drawers. On phones, opening a record moves focus to the record name; "Back to results" returns focus to the row that was open.
- Filters fold. They ship open in server markup and fold before first paint on single-column viewports (a layout effect on a `<details>`; no hydration mismatch), so a phone shows results first.

### Inspect (Inspector tabs)

- **Overview**: publisher, platform, version, description (clamped, expandable), coverage figure + band, published licence with evidence label, records/size, source-updated/first-published, Archivum-checked/method version, modality, languages, domain, content hash, commercial use (labelled as lookup), source link only in live mode with a valid `http(s)` URL, and the four documentation sections with documented/reported/not-found counts and a gap count linking to Evidence.
- **Evidence**: the 28 checks in four expandable drawers; each check opens to its method, the observation date, and whether it is excluded (n/a) or unavailable in the record. Evidence marks are shapes (filled / half / ring / dash / cross) with text labels. Licence context: published identifier + evidence label; static-lookup terms (commercial, attribution, share-alike) with "not established" for nulls; unresolved upstream notes. Recorded lineage as a numbered stage list with actor, date, hash, evidence, and named undocumented stages — or a plain statement that none is recorded. The coverage disclaimer names the platform and check date and links to `/docs/#methodology`.
- **History**: observed versions with note, author, rows added/removed (`null` → "not measured", never 0), and coverage at the time; fixed points (dates, hash).
- **Structure**: schema table and preview rows, each in a labelled, focusable `role="region"` that scrolls sideways; `null` cells are shown as `null` in the unknown style; preview caveat and illustrative label.
- **Absent / error**: a shared link to a slug not in the catalog gets a designed "nothing is filed under …" state with a clear-selection action and a Delisted link; a failed request gets a retry that keeps the selection in the URL.

### Shortlist ("Saved on this device")

- `localStorage["archivum.shortlist.v1"]` → `{ version: 1, items: ShortlistItem[] }` holding only slug, name, publisher, platform, licence identifier, coverage total + check date at save time, and `savedAt`. Limit 4; a fifth add is refused with an explanation; duplicates are refused.
- `normalizeShortlist` never throws: malformed JSON, wrong shapes, foreign versions, bad slugs, duplicates and overflow are repaired or dropped and the reasons reported. Storage that is unavailable, unreadable, or refuses writes is reported in `status` and described in the tray and shelf ("Records you add stay only until you leave this page", "The change could not be saved to this device (…)"). A malformed store is repaired in place.
- `useSyncExternalStore` with a frozen server snapshot: server and hydrating client render the same empty markup with `hydrated: false` ("reading…"), then the stored list arrives — no hydration errors, no false "nothing saved" flash. A `storage` event listener follows other tabs.
- Links never depend on the shortlist: compare links carry slugs; "Copy link" copies the desk URL (search, record, tab).

### Compare (`/compare/`)

- `parseCompareSlugs` accepts comma lists and repeated keys, validates slugs, de-duplicates, caps at four, and reports what it ignored ("Ignored: …", "Trimmed: …").
- Rows (25) in groups: Identity, Licence (published identifier with evidence mark; commercial / attribution / share-alike as lookups; unresolved notes), Size (records, download size), Recency (source updated, first published, Archivum checked), Content (modality, languages, domains), Documentation (total with the "completeness, not quality" note and the four sections with counts), Record (lineage completeness, versions observed, schema fields, preview rows).
- `differs` is computed from rendered cell text across loaded columns only; "Not stated" is a distinct value, so unknown versus 12,000 differs and unknown versus 0 differs. Differing rows carry a blue marker in the field column; "Differences only" hides the rest and lives in the URL as `diff=1`. No badge, rank, or recommendation is derived from coverage — the header says so.
- Per-column states: loading skeleton, "Not in this catalog" with remove + Delisted link, error with retry + remove, and ready with open-in-workspace / save / remove. Removing a column rewrites the link; saved records not in the comparison appear under "Add from saved on this device".
- On phones the table scrolls sideways inside a labelled, focusable region with a visible hint; the field column stays pinned; the page never overflows horizontally (verified: document width 375 px with a 752 px table).

### Export

- `buildBrief` → `{ format, formatVersion, generatedAt, origin, originNote, scope, caveats, records[], unavailable[], comparison }`. Each record carries its absolute record URL, the source URL only for live records with a valid `http(s)` link, licence with evidence label and lookup terms, size and dates with nulls preserved, the four sections and all 28 check results, `gaps` (labels of checks not found), lineage summary, history summary, schema, and content hash. Caveats state the coverage semantics, the licence-lookup caveat, the illustrative warning in demo mode, and any unavailable records.
- Markdown escapes every Markdown-significant character in prose and table cells (`| * _ \` [ ] < > # + ~ { }`), strips control characters, collapses newlines, and URL-encodes hostile characters in links; `javascript:` sources never appear because only `http(s)` passes `safeExternalUrl`.
- The download is a Blob URL handed to a hidden anchor — no endpoint, no submission. Filenames are `archivum-brief-<scope-or-slug>-<yyyymmdd-hhmm>.<json|md>`.
- Shelf and tray exports resolve full records with `Promise.allSettled`; records that fail or are absent are listed in the brief and in the notice rather than silently dropped.

## Checks run

- `npx eslint src/lib/workbench src/components/workbench src/app/workspace src/app/compare src/app/collections` — clean (react-hooks v7 recommended rules included).
- `npx tsc --noEmit -p tsconfig.json` — no errors in owned paths.
- `npx vitest run` — 13 files, 91 tests pass; 30 of them are the four new suites above.
- Browser (Codex's dev server on `localhost:3130`, illustrative catalog, desktop 800×600 and emulated 375×812 phone):
  - Desk: search, licence + commercial + platform filters change results and URL (`?license=CC-BY-4.0&commercial=1` → 7 records); back/forward restore chips; `/` focuses search (real keydown); ↑/↓ move rows; record selection pushes `?dataset=…`; tabs write `&tab=…`; the loading, absent, and idle states render as designed.
  - Shortlist: save/remove from the inspector, the tray, and the shelf; the fifth save is refused with the explanation; storage shape verified in `localStorage`; malformed JSON reported and repaired; state identical across the three routes.
  - Compare: picker with one slug, three-column comparison, differences-only (12 → 19 rows in the tested sets), column removal rewrites the link, absent column state, add-from-saved.
  - Export: JSON and Markdown briefs captured through the Blob API in-page — origin, caveats, record URLs, null source links, 25 comparison rows, catalog names resolved for shelf exports.
  - Phone: filters fold by default, list → record mode with back control and focus management, four tabs fit, comparison table contained, shelf and tray fit.
  - Dark theme via `next-themes` (`theme=dark`): all surfaces render from tokens.
  - Console: no errors or warnings on any of the three routes.

## Limitations and honest notes

- **Production build not run**, per the instruction not to build concurrently with Codex. Nothing in the routes needs a server (`useSearchParams` sits inside Suspense boundaries), but the build has not been observed.
- **Live mode unverified.** No staging credentials; everything above was exercised against the illustrative catalog. Live-specific paths (source links, `commercialOnly`/`license` in the `search_datasets` RPC, facet payload shapes, missing `coverageDetail` keys → "Unavailable") are typed and handled but not observed.
- **Reduced motion** was verified by code path (global CSS rule + `useReducedMotion` guards), not by emulation — the preview pane offers no such toggle.
- **Enter-to-open** was verified as native button activation by reasoning; the automation's synthetic key events (`keyCode 0`) do not trigger native activation, so it could not be observed end-to-end. Arrow keys, `/`, and focus movement were observed.
- **Document title** is set client-side (`"<record> · Research desk · Archivum"`). Next's metadata re-applies the page title on router refreshes (observed during HMR); a server `generateMetadata` reading `searchParams` would be the alternative but would make the route dynamic.
- **Coverage on the shelf** is the value at save time and is labelled as such; the desk shows the current record.
- The mock search does not index the slug, so "wiki" does not find `wiki-qa-multilingual` (its name is "Encyclopedic QA"). That is adapter behaviour, not the desk's.

## Integration needs for Codex

1. **Header height**: the desk reads `var(--header-height, 64px)`. If the shell's height ever differs from 64 px, define `--header-height` on `:root` and the desk, tabs, and mobile bars follow.
2. **Old dossier route**: `/datasets/[slug]/` still exists. If it should fold into the desk, a redirect to `/workspace/?dataset=<slug>` is the equivalent (the `/explore/` redirect already maps `q, platform, domain, modality, license, commercial, min, sort, page, dataset, tab` — the desk reads exactly those names).
3. **Mock search** could index `slug` (and the live RPC should be checked for the same) so slug-shaped queries resolve.
4. **Footer on app routes**: the desk is viewport-sized on desktop and the footer sits under it. If app routes should hide the footer, that is a layout decision in the shell.
5. **Sitemap / robots**: `/workspace/`, `/compare/`, `/collections/` are not listed; `/compare/` and `/collections/` are probably better left unindexed.
6. **Live facets**: when `catalog_facets.payload` is empty the panel shows vocabulary chips without counts and no licence/domain chips; confirm the payload spells the "Not stated" licence facet the same way the records do.
7. **Delisted links**: the absent-record and absent-column states link to `/delisted/`; if the new Delisted composition supports a slug query, those links can pass `?q=<slug>`.
