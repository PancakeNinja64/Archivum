# Delisted usability & spatial-design audit

Session: Opus 4.6, 2026-09-15.
Page inspected: `localhost:3130/delisted/?demo=1` at desktop (1024×768) and mobile (375×812).
Source files inspected: `ChronicleClient.tsx`, `ArchiveField.tsx`, `ArchiveField.module.css`, `Chronicle.module.css`, `helpers.ts`, `types.ts`, `page.tsx`.

---

## 1. Ranked usability critique

### 1 — Archive field cards are too small to read

**Severity: High** — first impression of the page's unique spatial concept fails.

The 3D field cards render at `clamp(82px, 8.2vw, 126px)` wide and `clamp(122px, 12vw, 182px)` tall (`ArchiveField.module.css → .plane`). At 1024 px viewport the cards are ~84 px wide. Record names truncate after one or two words. State labels (`.planeState`) render at ~8 px monospace and are unreadable without zoom. The spatial arrangement creates visual intrigue, but its content is illegible — the field communicates "archive" without communicating what is archived.

**Route:** `/delisted/?demo=1`
**Component:** `ArchiveField.tsx:86–104` (card render loop)
**Selector:** `.plane`, `.planeName`, `.planeState` in `ArchiveField.module.css`

### 2 — Focus panel overlays the card field

**Severity: High** — the overlay defeats the spatial browsing it enables.

The `.focus` article is positioned `absolute` at the horizontal centre of the field, `width: min(330px, 42%)`, `z-index: 10` (`ArchiveField.module.css → .focus`). At desktop this lands directly on top of the card arrangement, obscuring 4–6 cards. The user's scan of the spatial field is interrupted by the very element that should complement it.

**Component:** `ArchiveField.tsx:109–120` (focus panel render)
**Selector:** `.focus` in `ArchiveField.module.css`

### 3 — No spatial entry animation

**Severity: Medium** — the archive "opens" without ceremony.

All 14 cards appear at their final positions on first paint. There is no staggered entrance, no transition from collapsed to spread. The spatial concept only registers as spatial once the user moves their pointer and sees the tilt. Before that, it reads as an oddly layered grid.

**Component:** `ArchiveField.tsx` — no `@keyframes` or mount animation
**Selector:** `.planes`, `.plane` in `ArchiveField.module.css` — transitions exist only for tilt and selection, not for entry

### 4 — Dark-to-light transition between hero and register is abrupt

**Severity: Medium** — the page reads as two separate surfaces stitched together.

The hero section (`.hero`, background `#0c0d0f`) ends and the register section begins (`.page`, background inherited light) with no gradient, no mediating element. The bridge element exists in the DOM (`ref_88`, "From spatial overview to searchable register") but functions as a text waypoint, not a visual gradient bridge.

**Route:** `/delisted/?demo=1` — scroll from hero to `#delisted-ledger`
**Selector:** `.hero` in `ArchiveField.module.css`, `.page` in `Chronicle.module.css`

### 5 — Coverage checks section is dense for scanning

**Severity: Medium** — the dossier's most detailed section resists quick scanning.

The 28 documentation checks are split across 4 collapsible `<details>` sections (Origin & Sourcing, Licensing & Terms, Composition & Structure, Maintenance & Usage), each containing 7 checks. Every check is a row with a name, a status dot, and a status word (`documented`, `reported`, `not found`, `n/a`). At 7 items per section, the information is manageable when expanded one at a time — but the overall 23% score and "minimal" band label at the top do not give enough guidance about which section has gaps. A per-section subtotal would let users triage without expanding all four.

**Component:** `ChronicleClient.tsx:610–680` (coverage checks render)
**Selector:** `.covGroup`, `.covItem` in `Chronicle.module.css`

### 6 — List panel disappears completely on mobile when a record is selected

**Severity: Medium** — mobile users lose spatial context.

At `<960px`, selecting a record hides the entire list panel (`.listPanelHidden { display: none }`, `Chronicle.module.css`) and shows only the dossier with a "Back to list" button. This is correct for small screens but creates a jarring context switch — the user's position in the list is lost. After pressing "Back to list", scroll position is preserved (via `returnFocus` ref targeting the previously selected row), which partially mitigates this.

**Component:** `ChronicleClient.tsx:436–460` (workspace render, conditional class)
**Selector:** `.listPanelHidden` in `Chronicle.module.css`

### 7 — Dossier empty state is hidden on mobile

**Severity: Low** — mobile users arrive at the register with no visual hint that a right panel exists.

The desktop empty state ("Every source has a history…") is hidden at `<960px` because the dossier panel is not rendered until a record is selected. On mobile the user sees only the list and must discover through interaction that selecting a row opens a detail panel. The "Choose a record to open its evidence dossier" subtitle above the filters serves as the only affordance.

**Component:** `ChronicleClient.tsx:463–470` (empty dossier state)
**Selector:** `.dossierPanel` in `Chronicle.module.css` (hidden by default, shown when `selectedSlug` is truthy)

### 8 — Dependent models and papers often show "Unknown"

**Severity: Low** — the fields appear structural but carry no information for many records.

The dossier shows "Dependent models" and "Dependent papers" as `<dt>/<dd>` pairs. For the demo dataset many records show "Unknown" for both. These fields occupy prime dossier real estate while adding no information. Either surface them only when data exists, or collapse them into a single summary line.

**Component:** `ChronicleClient.tsx:690–703` (dependent models/papers render)

---

## 2. First-time user path: arrival to opening a record

### Step 1 — Arrival at the hero

The user lands on a full-bleed dark section with the headline "The source disappears. *The record remains.*" The italic Instrument Serif second line communicates gravity. Stats below (96 records, 4 observed states, archive date) ground the message. The user understands this is a preservation archive. **No friction.**

### Step 2 — Encountering the 3D field

To the right of the copy, 9–14 translucent cards float in a 3D arrangement. The user sees rectangles with truncated text. Without hovering (touch device) or prior context, the cards' content is unreadable. The user grasps "archive" aesthetically but cannot determine what is archived.

**Friction:** Cards too small to read (see critique #1). The field hint text "Move to shift perspective · Select a record" appears below the field in small muted text and is easy to miss.

### Step 3 — Interacting with the field

Desktop: moving the pointer tilts the field ~3°/5°, creating a parallax effect that confirms the cards are spatial. Clicking a card highlights it (Signal Blue border, lifted `translateZ(70px)`) and populates the focus panel with the record's name, publisher, last confirmed date, and licence.

Mobile: the field is flat (2-column grid, no tilt). Cards are `position: relative; width: 100%; height: 112px`. The focus panel appears below the cards rather than overlaying them — this is a better layout than desktop. Tapping a card selects it and updates the focus panel.

**Friction:** On desktop, the focus panel overlays the field (critique #2). On both: the focus panel's "Inspect preserved evidence ↓" link is the affordance to move to the register, but it competes with the "Enter the ledger ↓" link in the copy column.

### Step 4 — Reaching the register

The user either scrolls or clicks "Enter the ledger ↓" (which scrolls to `#delisted-ledger`, using `scroll-margin-top: 86px` on `.ledgerHead`). The dark hero field gives way to a light register with the heading "Inspect what remains." The transition is visually abrupt (critique #4).

**Friction:** The illustrative-mode status banner (`role="status"`) sits between the bridge and the register heading, but it is rendered as small muted text and could be confused with the disclaimer footer. Its content — "Illustrative records — these are fictional examples…" — is critical context but easily missed.

### Step 5 — Filtering and finding a record

The filter bar offers a search input ("Search by name, publisher, or licence"), an end-state dropdown (All/Superseded/Gated/Withdrawn/Unreachable), a platform dropdown (All/Hugging Face/Kaggle/GitHub/Academic/Direct), and a record count. The search is immediate (client-side filtering via `filterRecords()` in `helpers.ts`). Text search covers name, publisher, licence, and slug. **No friction** — this works well.

### Step 6 — Selecting a record

Clicking a record row highlights it with a 3px Signal Blue left border and opens the dossier panel. On desktop (≥960px) the dossier appears as a sticky right column (420px at ≥960px, 480px at ≥1200px). On mobile (<960px) the list hides and the dossier takes full width, with auto-scroll and focus moved to the dossier.

**Friction:** On mobile, the context switch is jarring (critique #6). On desktop, the dossier entry animation (`.dossierReveal`, slideIn 280ms from right) is smooth.

### Step 7 — Reading the dossier

The dossier presents: record name and publisher, state badge with explanatory note (e.g., "Endpoint returned an error on three consecutive checks."), first observed and last confirmed dates, observation window in days, a timeline minibar, licence, row count, version count, consecutive failures, documentation coverage (percentage, band, 28 checks in 4 sections), source/successor URLs (when available), dependent models/papers, and an export button.

**Friction:** The coverage checks section is the densest part (critique #5). The 28 checks require expanding 4 `<details>` elements to see fully. Dependent models/papers often show "Unknown" (critique #8).

### End-to-end assessment

The path from arrival to dossier takes 3–4 interactions (land → scroll/click → filter → select). This is a reasonable funnel. The primary friction points are in the hero (illegible cards, overlapping focus panel) and the hero-to-register transition. Once inside the register, the UI works well.

---

## 3. Verdict on the 3D field

### What works

**The concept is right.** A spatial archive field that lets users scan and select records in a dimensional space is the correct differentiator for Archivum. It signals that this is not a database table — it is a preserved collection with depth and history. The pointer-driven tilt (`ArchiveField.tsx:44–51`) is well-implemented: normalised cursor position maps to ±3° X and ±5° Y rotation, with a `prefers-reduced-motion` check. The `cubic-bezier(.22,1,.36,1)` easing on `.planes` transition creates a satisfying inertia. The selected card lifting (`translateZ(70px)`, Signal Blue border) provides clear feedback.

**The mobile fallback is correct.** At `<700px` the field drops perspective entirely and renders cards as a flat 2-column grid with `position: relative; width: 100%; height: 112px; transform: none; opacity: 1`. The focus panel becomes `position: relative; width: 100%` below the cards. This is the right call — forcing 3D on small screens would be unusable.

### What needs to change — Desktop

| Change | Rationale |
|---|---|
| Scale card base width to `clamp(130px, 11vw, 180px)` and height proportionally | Names and state labels must be legible without hover. At 130–180 px, two-word names fit on one line and state badges are readable at 10–11 px. |
| Move the focus panel to the right column of `.heroGrid` or anchor it to the selected card's edge | The centered overlay defeats spatial browsing. A right-aligned panel outside the card field preserves both the 3D arrangement and the detail view. |
| Add a staggered entry animation | All cards at `translate3d(0,0,0); opacity: 0` on mount, fanning to their positions over 700ms with `calc(var(--i) * 50ms)` stagger. Gate behind `prefers-reduced-motion: no-preference`. This transforms the page from "static dashboard" to "archive opens." |
| Reduce PLACEMENTS from 14 to 9–10 | Fewer, larger, more legible cards. The current 14 (`ArchiveField.tsx:17–23`) creates density but at illegible scale. Nine well-placed cards at 150 px width will communicate the spatial concept better. |
| Add hover detail on cards | Show the record name and state as a tooltip or expanded card face on `:hover`/`:focus`. Currently the only feedback is the focus panel, which is too far from the card to feel connected. |

### What needs to change — Mobile

| Change | Rationale |
|---|---|
| Show a maximum of 6 cards in the flat grid | The mobile grid can show up to 14 cards, which pushes the focus panel and "Enter the ledger" link below the fold. 6 cards fit in one viewport height. |
| Add a "See all in the register" affordance below the mobile card grid | Make it explicit that the field is a curated preview, not the full register. |

---

## 4. Verdict on the register, filters, list, and dossier

### Register heading and subtitle

The heading "Inspect what remains." is strong — imperative, thematic, and sets the user's task. The subtitle "Choose a record to open its evidence dossier." is clear functional guidance. **Keep both.**

### Filters

**Well-built.** Three filter inputs (search, end state, platform) cover the primary access patterns. The search is client-side and instantaneous, searching across `name`, `publisher`, `license`, and `slug` via `filterRecords()` (`helpers.ts:5–27`). The record count updates live ("96 records" → filtered count). The "Clear filters" button appears when any filter is active.

**Minor issue:** The search input placeholder says "Search records…" while the `aria-label` says "Search by name, publisher, or licence" — the placeholder could be more descriptive to match.

### Record list

**Solid implementation.** Each row is a `role="option"` inside a `role="listbox"`, with `aria-selected` tracking the current selection. Rows display name, state badge, publisher/platform, last confirmed date, and observation span. Keyboard navigation is thorough:

- **ArrowUp/Down:** Move selection through the list with wrap-around (`ChronicleClient.tsx:314–339`)
- **Enter/Space:** Select the focused record
- **Escape:** Clear selection and return focus to the previously focused row

The list scrolls via `overflow-y: auto` with `max-height: 760px` (or `calc(100vh - 280px)` at ≥960px). URL state is synchronised via `pushState`/`replaceState` with `popstate` listener, so the browser back button restores previous filter and selection state. **This is production-quality navigation.**

**One concern:** The list does not virtualise. All 96 records render as DOM nodes. For the demo dataset this is fine. For a production register with hundreds or thousands of records, the list will need virtualisation or pagination.

### Dossier

**Comprehensive and well-structured.** The dossier covers:

1. **Identity:** Name, publisher, platform
2. **State:** Badge with colour token + text label + explanatory note (e.g., "Publisher named a successor record")
3. **Temporal:** First observed, last confirmed, observation window (days + human-readable span), timeline minibar with SVG
4. **Technical:** Licence, row count, version count, consecutive failures
5. **Documentation:** Coverage percentage, band, 28 checks in 4 expandable sections
6. **Relationships:** Source URL, successor URL, superseded-by, dependent models/papers
7. **Export:** "Download preserved-record brief" button generating a JSON blob

**The state notes are excellent.** Each `EndState` maps to a human-readable observation note (`types.ts → END_STATE_NOTE`) that does not judge the publisher — it describes what the check found. This is the correct editorial posture for a preservation tool.

**The coverage system is the dossier's most distinctive feature.** The 28 checks encoded as a single-character string (`d`=documented, `r`=reported, `n`=not_found, `x`=n/a) and decoded via `decodeChecks()` (`types.ts`) provide a granular picture of what documentation existed at the source. The dot indicators are semantically clear:
- Filled accent: documented
- Muted: reported
- Hollow circle: not found
- Small muted: n/a

**However**, the section is dense (see critique #5). A per-section subtotal (e.g., "Origin & Sourcing: 3/7") would let users scan without expanding.

### Overall register verdict

The register is the strongest part of the Delisted page. It functions as a research tool: find, filter, select, inspect, export. The keyboard navigation, URL state sync, and `noscript` fallback (`page.tsx:62–88`) demonstrate product-grade engineering. The main investment needed is in density management (coverage subtotals, collapsing empty fields) and in scaling preparation (virtualised list).

---

## 5. Missing information and density

### Missing or empty

| Area | Issue |
|---|---|
| Source URL / Successor URL | Many records in the demo dataset have no `sourceUrl` or `successorUrl`. When absent, the fields are simply not rendered. This is correct — but a user inspecting a record with no source URL receives no indication that this field exists. Consider a "Source URL: Not available" line so users understand the schema. |
| Dependent models/papers | Frequently "Unknown" (`dependentModels: null`, `dependentPapers: null`). These fields take up space while communicating absence. Show them only when data exists, or collapse into a single "Dependencies: Unknown" line. |
| Platform-specific context | The platform badge (Hugging Face, Kaggle, GitHub, Academic, Direct) appears in the list and dossier but carries no additional information. A one-line description of what the platform is (for users unfamiliar with data repositories) would help. |
| Overview/fingerprint SVG | The dark `.overview` section (`Chronicle.module.css → .overview`, background `#101519`) contains an SVG timeline but it is not visible in the dossier tree — it may be part of a planned but unrendered feature, or it exists only in CSS with no corresponding JSX. |
| Observation evidence | `observationEvidence` exists in the type (`types.ts`) but is not rendered in the dossier. If populated, it would explain how the end state was determined. |

### Too dense

| Area | Issue |
|---|---|
| Coverage checks (28 items) | Four expandable sections of 7 items each. The checks are individually clear, but collectively overwhelming. Add per-section subtotals to the collapsed state. |
| Dossier metadata block | The block from "First observed" through "Consecutive failures" has 7 `<dt>/<dd>` pairs with no visual grouping. Consider grouping into "Temporal" (dates, window) and "Technical" (licence, rows, versions, failures) with subtle separators. |
| Record list rows on narrow viewports | Each row shows name, state badge, publisher/platform, last confirmed, and observation span. At 960–1024 px (two-column layout with dossier), the list column is only ~540 px. The row grid compresses and date text wraps. |

---

## 6. Accessibility and reduced-motion requirements

### What is already correct

| Feature | Implementation |
|---|---|
| Listbox semantics | `role="listbox"` on the record list, `role="option"` on each row, `aria-selected` tracking selection (`ChronicleClient.tsx:440`) |
| Live region | `aria-live="polite"` on the archive field focus panel (`ArchiveField.tsx:110`) announces the selected record to screen readers |
| Keyboard navigation | ArrowUp/Down with wrap, Enter/Space to select, Escape to clear (`ChronicleClient.tsx:314–339`) |
| Focus management | On mobile, focus moves to dossier on selection and returns to the row on deselection via `returnFocus` ref (`ChronicleClient.tsx:261–280`) |
| Reduced motion | `@media(prefers-reduced-motion: reduce)` flattens transforms and disables transitions in `ArchiveField.module.css` and `Chronicle.module.css` |
| Pointer tilt gate | `moveField()` checks `window.matchMedia('(prefers-reduced-motion: reduce)')` before applying tilt (`ArchiveField.tsx:45`) |
| `noscript` fallback | Server-rendered `<details>` elements for all records when JS is disabled (`page.tsx:62–88`) |
| Card aria-labels | Each field card button has `aria-label` with name, state, and last confirmed date (`ArchiveField.tsx:99`) |
| Focus-visible outlines | CSS focus styles use `:focus-visible` for keyboard-only indication |

### What needs attention

| Issue | Requirement |
|---|---|
| **Archive field has no arrow-key navigation** | The 14 card buttons in the 3D field are navigated by Tab only. A keyboard user must press Tab up to 14 times to reach a desired card. Add `role="grid"` or `role="listbox"` with `aria-activedescendant` and ArrowLeft/Right/Up/Down key handling within the field. |
| **Backdrop-filter contrast risk** | The focus panel (`backdrop-filter: blur(24px)`) and field cards (`backdrop-filter: blur(9px)`) overlay varying backgrounds. When bright decorative elements (`.atmosphere` radial gradient, `.ringA`/`.ringB`) sit behind the blur, text contrast may dip below WCAG 4.5:1. Test with a contrast analyser at multiple card positions. |
| **Small text in field cards** | `.planeCode` and `.planeState` render at ~8 px. At 200% browser zoom, the card `overflow: hidden` clips content. Either increase text size or set `overflow: visible` on cards. |
| **State badge colour alone** | State badges use colour tokens (`--tier-verified`, `--tier-inferred`, `--tier-asserted`, `--risk`) which produce different colours per state. The text label (Superseded, Gated, Withdrawn, Unreachable) is always present, so colour is not the sole differentiator. However, in the record list the colour is visually prominent and the text is secondary — ensure sufficient contrast between badge background and badge text for all four states. |
| **Coverage dot indicators** | The four check statuses (documented, reported, not found, n/a) use different dot styles. "Documented" is a filled accent dot, "reported" is a muted dot, "not found" is a hollow circle, and "n/a" is a small muted dot. These differences may be hard to distinguish for users with low vision. Add a text-only mode or ensure dots are supplemented by text labels (currently the text labels are present alongside dots — verify they remain visible, not hidden via CSS). |
| **Reduced motion: field still uses 3D positions** | Under `prefers-reduced-motion: reduce`, the field disables transitions but cards still render at their hardcoded `translate3d` positions via inline `--x`/`--y`/`--z` custom properties. The cards are scattered across the field without motion context. Consider flattening to a grid layout (similar to mobile) under reduced motion. |
| **Dossier scroll trap on mobile** | When the dossier opens on mobile and the dossier content is longer than the viewport, the user is focused inside the dossier with the list hidden. The "Back to list" button is at the top of the dossier. If the user scrolls down through coverage checks, they must scroll back up to find the exit. Consider a sticky "Back to list" bar at the top of the mobile dossier. |

---

## 7. Keep / change / remove

| Element | Verdict | Note |
|---|---|---|
| Hero headline + italic Instrument Serif | **Keep** | The strongest copy on the page. Sets the preservation tone immediately. |
| Stats row (records, states, archive date) | **Keep** | Grounds the poetic headline in verifiable fact. |
| 3D spatial concept for the archive field | **Keep** | Differentiating and conceptually correct for a preservation archive. |
| Pointer-driven perspective tilt | **Keep** | Well-implemented, motion-gated, adds life to the field. |
| Field card size | **Change** | Scale from `clamp(82px,8.2vw,126px)` to `clamp(130px,11vw,180px)` wide. Names and states must be legible. |
| Focus panel position (centred overlay) | **Change** | Move to right column of `.heroGrid` or anchor to selected card. Must not overlay the field. |
| Field entry animation | **Change** | Add staggered entrance from collapsed state. Currently static on mount. |
| Dark-to-light hero/register transition | **Change** | Add a gradient bridge band (120–180 px, `#0c0d0f` → light). |
| Mobile flat card grid | **Keep** | Correct responsive fallback. No 3D on small screens. |
| PLACEMENTS count (14 cards) | **Change** | Reduce to 9–10. Fewer, larger, more legible cards. |
| "Enter the ledger ↓" link | **Keep** | Clear navigation affordance from hero to register. |
| Illustrative mode banner | **Change** | Make more prominent. Currently small muted text easily missed. |
| Register heading "Inspect what remains." | **Keep** | Strong, imperative, thematic. |
| Search input | **Keep** | Fast client-side search across name/publisher/licence/slug. |
| State and platform filter dropdowns | **Keep** | Cover the primary access patterns. |
| Record count display | **Keep** | Live-updated feedback during filtering. |
| Record list (`role="listbox"`) | **Keep** | Correct semantics, good keyboard navigation, URL sync. |
| Record row layout (name, badge, meta, dates) | **Keep** | Dense but legible. All critical fields visible at a glance. |
| Arrow key + Escape keyboard navigation | **Keep** | Production-quality. Wrap-around, focus management, return-focus. |
| URL state synchronisation | **Keep** | `pushState`/`replaceState` + `popstate` listener. Back button works. |
| Dossier panel (sticky on desktop) | **Keep** | Correct layout. Sticky at `top: 80px` with scroll. |
| State badge with explanatory note | **Keep** | Non-judgemental observation language is exactly right. |
| Timeline minibar SVG | **Keep** | Visual anchor for temporal data. |
| Documentation coverage system (28 checks) | **Keep** | Unique, granular, and editorially sound. |
| Coverage section density | **Change** | Add per-section subtotals (e.g., "3/7") to collapsed `<details>` summary. |
| Dependent models/papers when "Unknown" | **Change** | Show only when data exists, or collapse into a single summary line. |
| `observationEvidence` field | **Change** | Render in dossier when populated. Currently in the type but not displayed. |
| Export button (JSON brief) | **Keep** | Useful for researchers. Includes disclaimer and mode flag. |
| `noscript` fallback | **Keep** | Renders all records as `<details>` elements. Correct progressive enhancement. |
| Mobile list-hide on selection | **Keep** | Correct for small screens, but add a sticky "Back to list" bar. |
| Mobile auto-scroll to dossier | **Keep** | Good UX. Focus management via `returnFocus` ref works. |
| Reduced-motion field handling | **Change** | Flatten to grid layout under `prefers-reduced-motion` (match mobile behaviour). Currently disables transitions but leaves cards scattered in 3D positions. |
| Field hint text ("Move to shift perspective…") | **Change** | Too small and too low. Move above or beside the field, increase prominence. |
| `.overview` dark section in CSS | **Remove** | Defined in `Chronicle.module.css` but not rendered in the current dossier JSX. Dead CSS or a planned feature — either render it or remove the styles. |

---

*End of audit. No application code was edited.*
