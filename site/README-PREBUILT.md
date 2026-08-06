# Archivum — pre-built files

Copy these into the repo root before the build run. They are finished and typechecked, and the spec instructs the builder not to regenerate them.

```
public/logo-arch.svg                   full ARCH wordmark, currentColor
public/logo-mark.svg                   compact mark (A + arc)
public/favicon.svg                     app icon, #56B1F6 on #0A0E14
src/app/globals.css                    complete token system, contrast-verified
src/lib/types.ts                       all domain types + TRUST_WEIGHTS
src/lib/mock-data.ts                   20 datasets, fully populated
src/lib/mock-dashboard.ts              10 activity events, 9 watched datasets
src/lib/api/client.ts                  the only data module components import
src/lib/api/adapters/mock.ts           filtering, sorting, faceting, latency
src/lib/api/adapters/huggingface.ts    stub for the real API later
```

## Staging steps

1. Copy the tree above into the repo, overwriting `src/app/globals.css`.
2. Delete `public/logo-arch.png` and `src/app/favicon.ico`.
3. Run `npx tsc --noEmit` — it should pass clean.
4. Commit and push, so the build run starts from this state.

## What is in the mock data

Twenty datasets with a real score spread (33 to 95), not twenty datasets in the nineties. Nine have deliberately incomplete lineage. Four carry `Unspecified` licenses. Publishers are fictional, so no real organization appears with a poor grade — that matters, because a live site showing a real named entity a low score is a defamation exposure.

`getFeatured()` returns five strong datasets plus the single worst one. That is intentional: the homepage preview has to show that the grading has teeth.

## The adapter boundary

Components import from `@/lib/api/client` and never from `mock-data.ts`. When a real API replaces the mock, only `src/lib/api/adapters/` changes and every component keeps working. Keep that boundary intact.

The mock adapter delays 220–480ms on purpose, so loading and skeleton states actually get built rather than discovered later.
