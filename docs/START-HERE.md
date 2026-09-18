# Start here — Archivum redesign handoff

This is the complete source package for the new Archivum product. It is more than a visual theme: the navigation, homepage, research workflow, comparison, saved records, preserved archive, motion system, URL behavior, and exports have been rebuilt.

## What your developer should do

1. Extract the ZIP into a new folder. Keep the old deployed project available for rollback.
2. Run `npm ci`, then `npm run dev`.
3. Review `/`, `/workspace/`, `/compare/`, `/collections/`, and `/delisted/?demo=1` locally.
4. Copy the real environment variables into `.env.local`. Never commit that file.
5. Test against a staging Supabase project before changing production.
6. Connect the live Delisted historical adapter. Until then, do not remove the illustrative label or present the demo records as real.
7. Run `npm run lint`, `npm test`, and `npm run build` before deployment. Use Node.js 20 or newer (verified with 24.20).

## Decisions that should remain intact

- Keep the supplied Archivum wordmark and A-mark geometry unchanged.
- Preserve direct access to search and evidence. Cinematic motion belongs to the homepage and Delisted entrance; research actions stay quick.
- Preserve native scrolling, keyboard access, phone layouts, and reduced-motion fallbacks.
- Keep Documentation Coverage framed as documentation completeness.
- Preserve nulls, evidence labels, caveats, and source-link validation in every view and export.
- Saved records are intentionally device-local in this version.

## Backend notes

The redesign reuses the repository's existing catalog client and backend routes. The developer may adjust the data adapter to match production, but should not reintroduce the retired marketing-page layout or duplicate the new workspace with a second catalog UI. Existing `/explore/` and `/datasets/[slug]/` links already redirect into the new product.

See [README-BACKEND.md](./README-BACKEND.md) for environment variables, Supabase, ingestion, cron, and deployment details. See [docs/VERIFICATION.md](./docs/VERIFICATION.md) for completed checks and the remaining staging boundary, and [docs/DESIGN-AUDIT-FINAL.md](./docs/DESIGN-AUDIT-FINAL.md) for the typography and motion policies, the problems the final audit found, and the decisions behind the revision.

## Design policies to keep

- Typography: Geist Sans for everything a person reads or operates; Geist Mono only for identifiers, dates, licences, counts, evidence states and compact metadata; Instrument Serif only for “The record remains.” on Delisted (the homepage no longer uses it). No visible text below 10 px; explanatory text 12–15 px.
- Motion: the Atlas rotation (plus its edge pulses and halo breath) is the only ambient motion and pauses off screen, in hidden tabs, under reduced motion, while dragging, and on Pause. The homepage's Resolve and Evidence chapters are scroll-controlled on purpose; the Delisted introduction and the Delisted field entrance each play once. Working UI never animates with scroll. Reduced motion, phones and viewports under 1180×600 show everything in ordinary document flow (see `docs/ASTRA-RETURN-HANDOFF.md`).
