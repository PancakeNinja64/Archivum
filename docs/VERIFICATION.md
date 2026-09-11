# Delivery verification — September 11, 2026

## Scope

This report describes the implemented September frontend with the supplied identity. It replaces the August prototype audit. Tests use the built-in illustrative catalog; no production credentials or live-site changes are involved.

## Completed checks

- ESLint: no errors or warnings.
- Vitest: 30 tests in 8 files passed. Coverage arithmetic, source parsing/cache behavior, catalog query state, preserved-register state, and unknown-versus-zero/date/history boundaries are covered.
- Production build: passed with Next.js 16.3.0 and TypeScript; 49 static pages generated alongside the dynamic server routes. Final source was built in a clean extracted workspace with dependencies installed from the included lockfile.
- Browser: desktop cinematic progression and reversible native scrolling; complete readable passport at the end of the transition; no pinned sequence on compact layouts. List/Atlas search and filter state, record selection, and passport navigation checked.
- Browser: Delisted retains the selected record when switching Field/Register. Its inspector becomes a focused dialog at tablet width; state filtering and the register fit a 390-pixel viewport.
- Browser: new vector wordmark switches with theme; supplied compact A/favicon assets present. Home and passport checked at 320 and 390 CSS pixels without horizontal page overflow. Mobile menu opens, focuses its close control, and closes correctly.
- Browser: illustrative Save reports unavailability without a false success. Correction dialog focuses its first input, fits a 320-pixel viewport, and disables demo submission. Fictional passport source links are suppressed.

## Core palette contrast

Calculated WCAG relative luminance ratios for these exact opaque pairs:

| Foreground / background | Ratio |
| --- | ---: |
| Mineral / Graphite | 17.49:1 |
| Silver / Graphite | 8.61:1 |
| Graphite / Signal Blue | 7.41:1 |
| Light secondary text / Mineral | 6.17:1 |
| Light link / Mineral | 6.34:1 |
| White / light primary action | 8.93:1 |

These checks cover the core text/action tokens, not an independent certification of every composited pixel.

## Distribution check

- Extracted the source ZIP into a separate temporary folder with no dependency symlink or environment files.
- `npm ci` installed 420 packages from `package-lock.json`; lint, 30 tests, and production build passed there.
- Corrected the inherited standalone-only output setting so the documented `npm run start` uses the normal Next.js server entry. Rebuilt that configuration successfully in the extracted folder.
- Core public routes and identity assets returned HTTP 200; an absent dataset returned HTTP 404. Mock robots/sitemap behavior remains non-indexable.
- Final archive integrity and source-file hashes are checked against the built extraction. Only reference images and delivery notes are added after that build.
- The ZIP excludes dependencies, build caches, Git history, symlinks, local environment files, and logs. `.env.example` contains placeholders only.
- npm 11.19.1 emitted install-script policy notices for two dependencies; the install, lint, tests, and build still passed. Vitest emits an advisory about a possible future Vite configuration default; it does not fail the current test run.

## Practical limits

- Live Supabase authentication, saving, corrections, ingestion, and account history require staging verification with the existing backend.
- Delisted historical data is illustrative until a production historical reader is connected. Dates, states, and publishers in that demo are fictional.
- Submission exports a local JSON draft; billing, SDK, and CLI are not enabled.
- Performance budgets in the spec are targets. No field Core Web Vitals, Lighthouse score, assistive-technology certification, or physical-device battery measurement is claimed.
- Original research references and concept images document design direction; the September 11 identity supplement takes precedence for the delivered visual identity.
