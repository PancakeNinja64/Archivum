# Delisted usability revision — handoff

Date: September 16, 2026. Scope: `src/components/chronicle/` and its tests only.
No other files were edited; no dependency manifests, shared styles, homepage, workbench or
route files were touched. Nothing was committed, pushed, deployed or zipped.

## Issues reproduced before repair

Reproduced against this repo's dev server (`next dev -p 3130`) with the illustrative catalog.

1. **Phone register rendered all 96 records in page flow.** At 375×812 the page was
   11,450 px tall; the `[role=listbox]` alone was 8,736 px with 96 `[role=option]` rows in
   flow (the phone rule `.recordList{max-height:none}` removed the desktop scroll region).
2. **Selection continuity between the spatial field and the register was inconsistent.**
   - On load, plane 01 rendered `aria-pressed="true"` with the "In focus" panel while the
     register had no selected row and the URL carried no `record`. The field implied a
     selection that did not exist.
   - Hover and selection were visually near-identical on planes (both a blue border and a
     forward lift; hover `#4da3ff8c`, selected `#4da3ff`).
   - "Inspect preserved evidence" was a bare `href="#delisted-ledger"` anchor: it did not
     select anything, so it opened the register with no dossier unless a plane had already
     been clicked.
   - `?state=gated&record=quarry-wiki-tagged` (a superseded record) silently dropped the
     dossier because selection resolved only against the filtered slice, and the field
     panel showed a different record ("Prism Speech Aligned").
   - Choosing a plane always wiped the active filters.
   - Register hover (`--accent-wash`) and selected-row background were the same colour;
     only a 3 px left rule distinguished them.

## Changes

### `helpers.ts` (new pure logic, all unit-tested)
- `LEDGER_BATCH = 24`, `requiredVisibleCount(index)` — batch size and the count needed to
  reveal a selected record that sits beyond the rendered batch.
- `rangeLabel(shown, total)` — "Showing 1–24 of 96 records" / "Showing all N" / empty.
- `stepIndex(current, length, key)` — ArrowDown/ArrowUp/Home/End with wrap-around.
- `readLedgerUrl(search)` / `buildLedgerUrl(pathname, state, isDemo, hash)` — one parser
  and one serialiser for `q`, `state`, `platform`, `record` (+ `demo=1`), used by the
  popstate handler, every history write and the field's plain `href`s.
- `resolveSelection(all, filtered, slug)` — resolves the chosen record against the whole
  archive and reports its index in the filtered view (-1 = outside the filters).

### `ChronicleClient.tsx`
- **Batched register with "Show more".** 24 rows rendered at a time on every viewport; a
  foot outside the scroll region shows `Showing 1–24 of 96 records` (`role="status"`,
  `aria-live="polite"`) and a `Show 24 more · 72 remaining` button. Activating it moves
  focus to the first newly revealed row. The batch resets whenever filters change.
- **Selection resolves against the whole archive.** A `record=` outside the filters (direct
  URL, back/forward, field choice) still opens its dossier; the dossier shows a
  `role="status"` notice — "This record is outside the current filters…" — with a
  "Show it in the register" button that clears filters and keeps the selection.
- **Selection beyond the batch is always reachable.** `shownCount` extends to include the
  selected record; closing the dossier persists that extension so focus can return to the
  row.
- **Record-specific "Inspect preserved evidence".** The field link is
  `/delisted/?…&record=<slug>#delisted-dossier` (works before hydration); on click it
  selects the record if needed, scrolls the dossier (`id="delisted-dossier"`) into view and
  moves focus to it on every viewport.
- **Intentional "Enter the ledger".** Keeps `href="#delisted-ledger"` as the no-JS path; with
  JS it scrolls to the register and moves focus to the register heading (now
  `tabIndex={-1}`) without changing the selection.
- **Field selection keeps filters** when the record is in the filtered view; filters are
  cleared only when the field is showing the whole-archive fallback (no matches).
- **URL state and history.** Filters use `replaceState` (no history spam per keystroke);
  selection uses `pushState`; popstate restores query, state, platform, record and resets
  the batch. Direct record URLs land on the dossier with focus on all viewports.
- **Keyboard.** ArrowDown/ArrowUp/Home/End step through the whole filtered list; stepping
  past the batch reveals and keeps the rows; Escape clears the selection and returns focus
  to the row. The dossier's global Escape listener now ignores keypresses inside form
  controls (Escape in the search box no longer also closes the dossier).
- **Counts.** Top count reads `N of 96 records match` while filters are active, `96 records`
  otherwise. The empty state stays inside the workspace so a selected dossier can still
  render alongside "No records match the current filters".
- **Legible selected row.** `Open in dossier` mono tag, tinted ground
  (`color-mix(accent 11%)`), accent-coloured name, 3 px left rule; hover stays a wash.

### `ArchiveField.tsx` / `ArchiveField.module.css`
- No implicit selection: `aria-pressed` and the `planeSelected` ring are only set for the
  actually selected record. Nothing is selected on load.
- Hover/focus is a neutral light lift (`#c8d2db73` border); selection is the only blue ring
  (`0 0 0 2px #4da3ff`) and carries a "Selected" tag on the card.
- Panel states: `No record selected` (dashed, explains hover vs select, "Browse the full
  register") → `Selected` / `Selected · not surfaced` (record chosen from the register or a
  URL that is not one of the nine surfaced cards) with the record-specific inspect link.
  `aria-live` was removed from the panel; the plane `aria-pressed` change and the register
  status already announce selection.
- Summary reads `N of 96 records match the filters` while filters are active, and `0 of 96`
  when nothing matches (the field falls back to the whole archive but no longer claims
  "96 records in register" for an empty result).
- Hero copy, geometry, atmosphere, rings, floor, entrance animation and phone/reduced-motion
  grids are unchanged. No new decorative animation.

## Verification

Environment: Next 16.3.5 dev on port 3130, illustrative catalog, in-app browser.

- `npx vitest run`: 15 files, 128 tests passed (was 12 / 87; +41 targeted tests in
  `src/components/chronicle/helpers.test.ts`).
- `npx tsc --noEmit`: clean. `npx eslint src/components/chronicle`: clean.
- Server HTML for `/delisted/?platform=kaggle&record=quarry-wiki-tagged` contains the
  dossier, the out-of-filter notice, `Selected · not surfaced` and `9 of 96 records match`
  (SSR path exercised, no "switched to client rendering").
- Phone (375×812): page 11,450 → 4,985 px; list 8,736 → 2,184 px; 24 rows; 5 field cards;
  no horizontal scroll. Card 03 (not the default) selected → blue ring + "SELECTED" tag,
  panel "Selected", URL `?record=drift-court-curated`, dossier "Drift Court Curated" opened
  with focus; "Back to list" returned focus to that row; "Show 24 more" foot legible.
- Desktop (1440×900): plane 04 selected while hovering plane 02 — only 04 blue/tagged;
  register row 4 selected with "Open in dossier"; URL, panel and dossier agree. Inspect link
  `href="/delisted/?record=anchor-speech-dedup#delisted-dossier"` scrolled to and focused
  the dossier. Back → nothing selected anywhere, URL clean; Forward → restored everywhere.
- Keyboard: first row focus → ArrowDown×2 selects row 3 and pushes `?record=`; End reveals
  all 96 and selects the last; ArrowDown wraps to row 1; Escape clears and returns focus to
  the row. "Show more" moved focus to row 25 and updated the status to 1–48.
- Filters: `?state=gated&platform=kaggle` → `4 of 96 records match`, four cards, four rows,
  "Showing all 4 records", no Show-more. `?q=zzzz` → `0 of 96 records match`, explicit
  empty message with Clear filters, field summary `0 of 96`, page 3,210 px on phone.
- Direct out-of-filter URL `?state=gated&record=quarry-wiki-tagged` → dossier "Quarry Wiki
  Tagged" opened and focused with the notice; "Show it in the register" cleared filters,
  kept the selection, expanded the register to row 94 of 96. "Enter the ledger" focused
  the H2 without changing the selection.
- Dark theme (`.dark`): selected row, tag and notice legible. Reduced-motion rules for the
  new selection ring are present.
- Illustrative labelling (banner, field note, export suffix, disclaimer) and explicit
  `Unknown` dependency values are unchanged; no historical-data adapter was added.

## Unresolved / not done

- **No production build was run.** Two other sessions have dev servers writing to `.next`
  in this checkout; running `next build` concurrently risked their work. Please run
  `npm run build` after the sessions converge.
- Batch size is 24 on all viewports (matches `RECORDS_PER_PAGE` used by the no-JS
  register). A phone-specific smaller batch would need a hydration-safe media-query
  strategy; not attempted.
- On phones, selecting a card in the field still jumps straight to the dossier (pre-existing
  behaviour, because the register list is hidden while a dossier is open). The card's
  "Selected" state is visible when scrolling back up. If a select-then-inspect two-step is
  preferred on phones, that is a small follow-up in the phone-layout effect.
- The dev-server transcript shows `COVERAGE_FLOORS is not defined` from
  `src/components/workbench/ResultsPanel.tsx` — the workbench session's in-progress edit,
  not this scope.
- `next dev` on port 3130 started by this session is still running (other sessions'
  browsers were observed hitting it for `/workspace` and `/compare`); stop it when
  convenient.

## Coordinator requests

1. `npx eslint` reports one **error** outside my scope:
   `src/components/product/atlas/AtlasCanvas.tsx:76` — "Cannot access refs during render"
   (react-hooks). Homepage session's file; needs their fix before a clean lint gate.
2. `docs/VERIFICATION.md` is modified by another session; the verification notes above
   should be folded into it by whoever owns that file.
3. `.claude/launch.json` (`dev` on 3130) is shadowed by `~/.claude/launch.json`
   (`archivum-dev` → `/Users/namkd/Archivum`, port 3000) when a session's working
   directory starts at `~`; the browser preview tool launched the wrong checkout twice.
   Consider removing or renaming the home-level entry.
4. No shared-file changes were required for this scope.
