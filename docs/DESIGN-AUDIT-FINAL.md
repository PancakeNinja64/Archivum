# Archivum — final design audit and revision

Date: 2026-09-15. Branch `redesign/product-workspace`, working tree (uncommitted). This document consolidates the three parallel audits (`docs/AUDIT-TYPOGRAPHY-CLAUDE.md`, `docs/AUDIT-MOTION-CLAUDE.md`, `docs/AUDIT-DELISTED-CLAUDE.md`), the earlier `docs/VISUAL-CRITIQUE.md`, the partial revision Codex had begun, and the completed revision that was then verified in the browser and from a fresh extraction of the delivery archive.

The audits were treated as evidence, not instructions. Where they disagreed with each other or with the rendered product, the product objective decided: a practical evidence-research tool with cinematic depth, whose working surfaces stay fast and legible.

## 1. Problems found

Ordered by cost to a researcher reading evidence.

1. **Scroll-linked opacity in the Evidence Journey was running on native `ViewTimeline` animations that disagreed with the JS scroll observer.** `useScroll` with `offset: ['start start','end end']` matches Motion's `ScrollOffset.All` preset, so every `useTransform` opacity range was promoted to a hardware timeline. On the 2,340 px pinned section those timelines blended chapters at the wrong progress and, once "finished", released to their *start* values — the network reappeared over chapter 3 and past the end of the sequence (measured: layer opacities `1, 0, 0` at progress 1.03 while the copy and transforms said chapter 3). This is the "blank / fraction of the viewport" symptom the visual critique had reported without a cause.
2. **The `<noscript>` register on Delisted threw 15 uncaught errors on every load.** A page of 48 `<details>` entries exceeded React's progressive chunk size, so the server streamed it as segments whose completion scripts (`$RS`) look up ids inside `<noscript>` — inert in a JS-enabled browser — and hit `null.parentNode`.
3. **A third of the home page's text was below 11 px** (56 of 165 visible runs at 1440 px; an 8 px tier existed), and the illustrative disclaimers were the smallest, faintest copy on the page (10 px at 45 % opacity). The header's own "Public data intelligence" line was 9 px on every route.
4. **Headings did not share one voice**: six display weights (400–600) and seven trackings (−0.02 … −0.065 em) across sibling routes; the compare title was the light one, the Delisted dossier name the only bold. At −0.065 em the 78–86 px headlines had letterpairs touching.
5. **Instrument Serif was used for three headline turn-lines and for routine documentation** (docs, legal, pricing, auth, dashboard, admin used blue serif headings), and until 14 Sep for dataset names, column titles, saved-record titles, workspace states and the Delisted loading heading.
6. **Delisted on phones fused the two headline sentences** ("disappears.*The*") because the `<br>` was hidden below 700 px; state labels on the always-dark field used light-theme evidence tokens (`#334a62` on `#1b2329`) and nearly vanished; the desktop field hint bled through under the phone hint.
7. **The Delisted dossier column was a 0 × 0 element until a record was chosen** — roughly 600 × 760 px of blank page beside the list on desktop, and the only explanation of the dossier was hidden with it.
8. **Reduced motion and phones did not show every chapter's copy.** The pinned stage kept only the current chapter's heading; in document flow the three visuals stacked under a single heading, and the inner scroll-linked values (line draw, candidate fly-in, delayed compare action) kept their scroll-dependent state.
9. **Journey layout overlapped at laptop and short-height sizes**: the 540 px document and the three-card grid were centred on the full stage and ran under the chapter copy at 1280 px and 1024 px.
10. **Evidence Journey cell values misrepresented data**: `0` rows or bytes rendered as unknown (`—`), the domain array printed without separators ("medicalnlp"), an absent licence fell back to the *evidence label* or "No license", and platform/domain words were set in monospace.
11. **Compare's sticky corner was empty** while the row summary and the evidence legend lived in the toolbar and a footer 1,900 px away; on phones the corner needed to collapse.
12. **The Atlas canvas redrew on every window scroll event while off screen.**
13. **Dead code**: a second homepage (`ArchiveHome`), the old graveyard/explore/atlas/dataset trees, and the last `framer-motion` import lived in the repository unreachable from any route.
14. **Interactive targets under 24 × 24 CSS px**: footer legal links, "Continue ↓", "Skip to workspace →", "Open full evidence ↗", "Understand the methodology ↗", and one inline desk button.

## 2. Decisions made

- Route every scroll-linked value through the JS observer by passing `scrollYProgress` through an identity `useTransform` (Evidence Journey and Archive Portal). Chapter state, transforms and opacity now derive from one value; there are no native scroll animations on the page (`getAnimations()` returns none). Verified at seven scroll positions including past the end: `0,0,1` holds.
- Render the no-JavaScript register as one pre-built, escaped HTML string inside `<noscript>`, which cannot be segmented. Production load of `/delisted/?demo=1&record=…` is error-free.
- Enforce a type floor (see §3), remove the 8–9 px tiers, set disclaimers at 12 px and full opacity, and put the header edition line on one 10 px line.
- Unify headings: 450 for stage headlines, 500 for page/record titles and section headings; tracking −0.045 em on headlines, −0.035 em on titles.
- Reserve Instrument Serif for exactly two phrases (§3). The portal's "Context should remain." uses the silver second-line device instead; routine documentation and account pages use sans/graphite headings.
- Delisted: keep the line break at every width; give the dark hero its own token values for state colours; hide the desktop hint on phones; flatten the field to an ordinary grid under reduced motion; fill the desktop dossier column with the observed-state summary (counts that follow the filters, one-line meaning per state, archive date).
- Stacked layouts (phones, reduced motion) render each chapter's number, heading and body with its own layer, and resolve the inner scroll-linked values to their finished state.
- Shift the journey's visual stage right of the copy column (`left: min(22vw, 320px)`), cap the document at `min(540px, 56vw)` and the candidate cards at `min(250px, 17vw)`; verified clear of the copy at 1024, 1280 and 1440.
- Zero is a value: `0` renders as `0` / `0 B`; only `null` is "Not stated". Domains join with commas. Licence falls back to "Not stated" / "Licence not stated". Words stay sans; identifiers, counts and licences stay mono.
- Compare's corner carries "25 facts, one per row · N rows differ", the evidence-mark legend and the "Not stated ≠ zero" rule; on phones the legend collapses in the corner and repeats beneath the table.
- Gate the Atlas scroll redraw on visibility and tab state.
- Remove the unreachable legacy trees (68 files) and the direct `framer-motion` dependency; `motion` remains the only animation library (`framer-motion` stays only as motion's own transitive dependency).
- Give every small link a 24 px hit area; inline links inside sentences keep their inline flow (WCAG 2.2 inline exception).

## 3. Typography policy

| Face | Used for | Not used for |
| --- | --- | --- |
| **Geist Sans** | Navigation, headlines, product headings, dataset names, explanations, buttons, filters, record titles, workspace UI, comparison UI, documentation, account pages, every practical value that is a word (platform, domain, publisher). | — |
| **Geist Mono** | IDs and slugs, hashes, dates, licence identifiers, counts, evidence states, keyboard hints, small technical labels and compact metadata lines, the large coverage readout. | Prose, explanations, headings, button labels. |
| **Instrument Serif** | Two editorial phrases: the homepage "*Inspect the record.*" and Delisted's "*The record remains.*" | Dataset names, page titles, workspace states, loading states, cards, comparison columns, saved collections, routine documentation. |

Sizes and weights in force:

- Stage headlines 44–86 px, weight 450, tracking −0.045 em, line-height 1.0–1.05. Page and record titles 30–52 px, weight 500, tracking −0.035 to −0.05 em. Section headings 20–28 px, weight 500.
- Explanatory text 13–15 px (15 px on the dark stage). Captions and disclaimers 12–12.5 px at full opacity.
- Labels and eyebrows 10.5–11 px; nothing rendered for a person to read is below 10 px. No negative tracking on text under 16 px.
- Illustrative labels are set at label size or larger and never faded.

Measured after the revision at 1440 × 900: home 157 visible runs, **0 under 10 px**, 37 under 11 px (all label-class mono), serif ×1; Delisted and the workbench have no text under 10 px.

## 4. Motion policy

Every animation must guide attention, communicate state, or preserve spatial continuity. Working UI (search, filters, record lists, dossiers, comparison tables, the shelf) never moves with scroll. Transforms and opacity are the only animated properties; no layout dimensions animate. Infinite motion pauses while the page is hidden.

## 5. Automatic motion (and why)

| Sequence | Kind | Why |
| --- | --- | --- |
| Atlas constellation | Infinite, extremely slow rotation (canvas) | Ambient life for the identity object. Pauses when off screen (IntersectionObserver), when the tab is hidden, under reduced motion, while dragging, and on Pause. The scroll-driven camera tilt now redraws only while the canvas is visible. |
| Delisted field entrance | Finite, plays once (CSS `planeEnter`, 760 ms, 45 ms stagger) | A page-arrival event: the archive opens. Disabled under reduced motion, where the field is an ordinary grid. |
| Delisted pointer tilt | Pointer-driven, ±3°/±5° | Subtle depth feedback; gated by `prefers-reduced-motion`. |
| Workspace / tray / dossier state transitions | Finite, 150–300 ms | Communicate selection and state changes; collapse under reduced motion. |

## 6. Scroll-driven motion (and why)

| Sequence | Why it stays scroll-controlled |
| --- | --- |
| Evidence Journey (Source → Evidence → Perspective) | The user controls the explanation. Chapter 1 reveals connections with a source ledger (record, publisher, platform, checked date); chapter 2 assembles an inspectable record; chapter 3 brings three candidates in sequentially and ends with the compare action. Chapter dots and a progress rail are the wayfinding; a skip link bypasses it. It is never an automatic slideshow. |
| Archive Portal | Its depth change — plates fanning apart while "THE RECORD REMAINS" emerges from behind them — communicates records moving into preservation. |

Both use one JS-observed progress value (see §2). Under reduced motion and on phones both fall back to ordinary document flow with all information visible.

## 7. Empty-space revisions

- **Homepage research section**: the previously empty second column holds the record specimen (identity, coverage readout and meter, publisher/platform, licence, rows, last update, "coverage describes metadata presence, not quality", link to the full evidence). Kept and refined (label and value sizes raised).
- **Evidence Journey**: chapter 1 gained the source ledger; the illustrative note moved to the free bottom-left corner so it no longer crowds the ledger; the stage sits right of the copy so nothing overlaps.
- **Delisted dossier column**: now visible before selection with the state summary; the bridge band carries the two waypoints at 10.5 px.
- **Compare**: the sticky corner holds the summary and legend.
- **Calm space kept deliberately**: the Atlas stage, the beats between journey chapters, the workspace idle state, the compare picker, the collections empty state.

## 8. Delisted usability verdict

Usable as a research tool. The spatial field is an orientation device — nine legible cards on desktop (138 × 184 px at 1440), five on phones, state in text and colour, focus panel beside the field rather than over it, and a clear "Enter the ledger" path. The register is the working tool: search covers name, publisher and licence; state and platform filters work and are reflected in the URL (`q`, `state`, `platform`, `record`, `demo`); selection works by pointer and keyboard (↑/↓ wrap, Enter/Space, Escape clears and returns focus); back/forward restore state; the empty result offers "Clear filters". The dossier carries dates, observed state with its explanation, publisher, platform, licence, observation window with one compact labelled span, all 28 documentation checks with methods, source/successor links when supplied, dependency unknowns as unknown, and export. Illustrative records are labelled in the hero, the banner, the screen-reader path and the export. Documentation Coverage is described as metadata presence, never quality, permission or trust. Nothing in the field delays reaching the register.

## 9. Accessibility and responsive findings

- Viewports verified: 1440 × 900, 1024 × 768, 1280 × 620 (short height), 390 × 844. No horizontal document overflow at any of them (`scrollWidth === innerWidth` on every route).
- Keyboard: Atlas pause/resume, chapter dots (scroll to 12 / 50 / 87 %), record rows, tabs, search, filters, Escape/close, back-to-list focus return — all exercised.
- Reduced motion: the global blanket in `globals.css`; the journey's stacked block (shared with the phone layout, exercised at 390 px); the Delisted grid fallback; register transitions disabled — all confirmed present in the CSSOM. The pane cannot emulate the media feature, so the reduced-motion state was verified through the identical phone rules plus rule inspection.
- Target size: every control ≥ 24 × 24 CSS px after the revision except inline links inside sentences (WCAG 2.2 exception); primary desk actions are 44 px.
- Themes: light default and dark verified on the workspace, compare and Delisted.
- Console: production loads of `/` and `/delisted/?demo=1&record=…` produce no application errors; the only failed request is Vercel Analytics' script, which exists only on Vercel.

## 10. Verification evidence

See `docs/VERIFICATION.md` for the full list. Summary: TypeScript clean; ESLint 0 errors (2 intentional `<img>` warnings for the exact wordmark SVGs); Vitest 12 files / 87 tests; `next build` 32 routes; `npm audit` 0 vulnerabilities; production route matrix (200s, 307 redirects for `/explore/` and `/datasets/[slug]/`, 404 for a missing page and a missing record); fresh extraction of the delivery ZIP installed from its lockfile, tested, built and served.

## 11. Remaining integration boundaries

- **Supabase / live catalog**: unverified without staging credentials. Search, facets, saved-account behaviour, corrections, admin ingestion and scheduled refresh need a production-shaped staging project.
- **Delisted historical records**: there is no production adapter; `?demo=1` serves 96 fictional records and every surface labels them illustrative. They are not real observations and must not be presented as such.
- Field Core Web Vitals, physical-device profiling and assistive-technology certification are not claimed.
