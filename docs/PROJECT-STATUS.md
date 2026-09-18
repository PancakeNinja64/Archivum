# Archivum product redesign — current status

Updated September 16, 2026. Canonical source: this repository on `redesign/product-workspace`, based on upstream `d083ed9`. Working tree only; nothing committed or deployed. Pre-rebuild checkpoint: `refs/checkpoints/pre-homepage-2026-09-16`.

## Current decision

This is a complete product redesign. The accepted direction replaces the old marketing-page structure with a connected dataset-research product: Atlas → discover → inspect evidence → save → compare → export, plus a distinct preserved-record archive. The approved logo geometry remains unchanged.

The introduction is cinematic and spatial. The working surfaces are restrained and fast. Motion explains source, evidence, and comparison; it never blocks access to search or record detail. Documentation Coverage remains a measure of source-documentation completeness, never a quality score, trust score, recommendation, or permission grant.

## Homepage candidate — a living atlas of evidence (September 16)

The homepage was rebuilt as one continuous scene around a single selected record (`src/components/product/`, details and evidence in `docs/ASTRA-RETURN-HANDOFF.md`): a lit, fogged wire-globe Atlas with real shared-publisher connections and a docked mineral record plate; a scroll-driven resolve that brings the selected point forward and lands the plate on it; four evidence layers (source, licence, structure, history) that fan out with facts read from the record and gaps left visibly open; a readable record surface with the workspace action; a once-playing Delisted introduction on an illustrative preserved record; concise search with example queries. Search sits in the first viewport on desktop and phones. Viewports under 1180×600 and reduced motion get a flow composition. The old Evidence Journey, Archive Portal, research specimen, workflow trio and method line were removed, along with the homepage's serif phrase. Shared tokens, navigation, footer, dependencies and backend contracts are unchanged. A Codex/Astra creative assessment is the next step; the candidate is not declared final.

In the same pass the Delisted (`src/components/chronicle/`) and workspace (`src/components/workbench/`) usability revisions from the two parallel sessions were integrated as found; see `docs/DELISTED-REVISION-HANDOFF.md` and `docs/WORKBENCH-REVISION-HANDOFF.md`.

## Final design-audit revision (September 15)

Three report-only audits (typography, motion, Delisted) and the earlier visual critique were consolidated in `docs/DESIGN-AUDIT-FINAL.md` and applied. Highlights: one typography policy (Geist Sans for reading and UI, Geist Mono for identifiers/dates/licences/counts/states, Instrument Serif for exactly two editorial phrases); a 10 px type floor with 12–15 px explanatory text; the Evidence Journey and Archive Portal driven by a single JS scroll observer (the native scroll-timeline mismatch that blanked chapters is fixed); every chapter's copy present in phone and reduced-motion flow; the Delisted field with nine legible cards (five on phones), a focus panel beside the field, dark-stage state colours, a reduced-motion grid, and a dossier column that carries the observed-state summary before a record is chosen; Compare's corner summary and legend; the no-JavaScript register rendered without streaming errors; dead legacy UI removed and `framer-motion` dropped in favour of `motion` alone.

## Implemented

- Homepage: Atlas entrance with immediate search, scroll-resolved record plate, four evidence layers, record surface, Delisted introduction, search resolution (September 16).
- New two-pane research workspace with URL search/filter state and four evidence tabs.
- Validated four-record local shortlist and Saved shelf.
- Two-to-four-record comparison with differences-only mode and shareable URLs.
- JSON and Markdown research-brief exports with evidence checks and caveats.
- New Delisted spatial archive field, practical preserved register, full dossier, and selected-record export.
- New global navigation and legacy URL redirects into the workspace.
- Desktop, phone, keyboard, dark-theme, and reduced-motion behavior.

## Verified (integrated tree, September 16)

- 15 test files, 128 tests passed.
- TypeScript passed.
- ESLint has no errors; two intentional native-image warnings remain for the supplied SVG wordmark.
- Next.js 16.3.5 production build passed and registered 32 routes.
- Production routes returned HTTP 200; legacy routes returned the expected 307 redirects; a missing page returned HTTP 404.
- Homepage rendered checks at 1440×900, 1280×720, 1024×768 and 390×844 including transition states, reverse and fast scrolling, direct navigation, reduced motion and dark theme, plus keyboard and pointer interaction — recorded with captures in `docs/evidence/homepage-2026-09-16/` and described in `docs/ASTRA-RETURN-HANDOFF.md`. Earlier package-wide checks remain in `docs/VERIFICATION.md` (September 15).

## Honest boundary

The package was verified with the illustrative catalog. Production Supabase behavior requires staging credentials and staging verification. Delisted has no production historical-record adapter yet, so its packaged examples remain visibly fictional. The earlier deployed catalog outage later recovered without a code change; its cause was not established and no speculative backend fix is included.

The empty/unavailable-catalog branch of the new homepage was not rendered in this pass; the in-app browser pane could not drive scroll-linked motion reliably (hidden tab throttling), so scroll states were verified with headless Chrome captures instead.

No deployment was performed in this work. The next triggers are the Codex/Astra assessment of the homepage candidate, then staging integration and a separately authorized production deployment.
