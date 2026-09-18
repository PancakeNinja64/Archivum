# Product redesign verification — September 15, 2026

## Scope

This report covers the full product redesign after the final design-audit revision (see `docs/DESIGN-AUDIT-FINAL.md`). Browser checks use the built-in illustrative catalog. No live deployment, production credential, customer data, or production database was changed. Runtime: Node.js 24.20.0, npm 11.19.0.

## Automated checks (working tree)

- TypeScript: `tsc --noEmit --incremental false` passed.
- ESLint (`eslint .`): 0 errors. The two remaining warnings document the intentional use of the supplied SVG wordmark through native image elements.
- Vitest: 12 files and 87 tests passed (the four explore-page tests left with the retired explore UI).
- Next.js production build (16.3.5): passed; 32 routes generated or registered, including `/`, `/workspace`, `/compare`, `/collections`, `/delisted`, `/docs`, the legacy redirects and the API routes.
- `npm audit`: 0 known vulnerabilities. `framer-motion` was removed as a direct dependency; `motion` is the only animation library (`framer-motion` remains only as motion's own transitive dependency).

## Production route matrix (`next start`)

| Request | Result |
| --- | --- |
| `/`, `/workspace/`, `/workspace/?dataset=…`, `/compare/?datasets=…`, `/collections/`, `/delisted/`, `/delisted/?demo=1`, `/docs/`, `/robots.txt`, `/sitemap.xml` | 200 |
| `/explore/?q=clinical&license=MIT` | 307 → `/workspace/?q=clinical&license=MIT` |
| `/datasets/biomed-abstracts-open/` | 307 → `/workspace/?dataset=biomed-abstracts-open` |
| `/datasets/nope-nope/` | 404 (genuine missing record) |
| `/no-such-page/` | 404 |

## Browser checks

- Home at 1440 × 900, 1280 × 620 and 390 × 844: Atlas with pause/resume, domain rail, record selection and the search dock; the three Evidence Journey chapters at their beginning, midpoint and end (source network + ledger; assembled record; three candidates + compare action) resolve correctly under natural scrolling and hold their final state past the end of the sequence; chapter dots jump to 12 / 50 / 87 %; the research specimen; the Archive Portal; the footer. No text under 10 px; the illustrative note is legible.
- Evidence Journey on phones and under reduced motion: ordinary document flow with each chapter's number, heading and body beside its own visual; connection lines drawn, candidate cards in place, compare action visible.
- Workspace: search, filters, record selection, four evidence tabs, shortlist tray, phone list ↔ record mode with focus management; dark theme.
- Compare: two- and three-record tables, differences-only, corner summary and legend, contained sideways scroll on phones (document width stays at the viewport width); dark theme.
- Collections: empty state and tray.
- Delisted (`?demo=1`): finite field entrance, nine cards on desktop / five on phones, legible state labels on the dark stage, focus panel beside the field, "Enter the ledger", bridge, illustrative banner, sticky filters, state summary in the dossier column before selection, selection by pointer and ↑/↓/Enter/Escape, URL state (`state=gated` → 19 records, `record=` selection), empty search result with "Clear filters", phone list → dossier → back with focus return; dark theme. Production load is free of console errors (the `<noscript>` register no longer streams segments).
- Docs: sans/graphite headings; no serif.
- Horizontal overflow: none at 1440, 1280, 1024 or 390 CSS px on any principal route.
- Target size: no interactive control under 24 × 24 CSS px except inline links inside sentences.

## Evidence semantics

- Documentation Coverage is consistently described as source-documentation completeness, never quality, trust, recommendation, or permission.
- Unknown and unavailable values remain distinct from zero (`0` rows renders as `0`; `null` renders as "Not stated").
- Published licence identifiers remain separate from static licence lookups and legal permission.
- Source links are shown only when a supplied valid HTTP(S) URL exists.
- Illustrative records are labelled in the interface, screen-reader summaries, and exports.

## Fresh-extraction check

The delivery archive `911frontend-design-audited.zip` was extracted into a new temporary directory, installed with `npm ci` from its lockfile, and re-verified there: Vitest 12 files / 87 tests, `next build` 32 routes, and `next start` route checks (`/`, `/workspace/`, `/compare/`, `/collections/`, `/delisted/?demo=1`, `/docs/`, the two redirects and a missing-record 404). The archive's integrity was tested with `unzip -t` and its SHA-256 recorded in the delivery report.

## Remaining staging work

- Verify catalog search, facet payloads, authentication, saved-account behavior, corrections, admin ingestion, and scheduled refresh against the production-shaped Supabase staging project.
- Connect and verify a production Delisted historical-record reader before presenting preserved records as real observations.
- Measure field Core Web Vitals on the deployed build. The package does not claim a Lighthouse score, physical-device battery profile, or assistive-technology certification.

The package is implementation-ready and production-build clean. Deployment remains a separate authorized step.
