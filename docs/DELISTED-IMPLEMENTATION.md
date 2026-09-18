# Delisted implementation

Delisted is a preserved-record experience with two layers: a memorable spatial entrance and a practical evidence register.

## Spatial archive field

`ArchiveField.tsx` renders the first nine filtered records as selectable document planes in a real CSS perspective scene (138 × 184 px at 1440 px, names and states readable without hovering, state colour set from dark-stage token values with the state name always in text). The field opens once on arrival with a finite, staggered entrance (760 ms, 45 ms per card) and then rests; pointer movement shifts it a few degrees; individual planes come forward on hover, focus, or selection. The selected record appears in a focus surface beside the field — not over it — with its observed state, last-confirmed date, declared licence, and an anchor into the evidence register.

The phone layout removes perspective and presents five records as a compact card grid with a note that the full register follows. Reduced-motion mode disables the entrance and pointer parallax and lays the field out as an ordinary grid so every card is readable at once. A dark-to-light bridge leads into the register; on desktop the filter bar is sticky.

## Preserved register

`ChronicleClient.tsx` provides URL-synced search, observed-state and platform filters, keyboard record selection, a desktop list-and-dossier layout, a focused phone dossier, and JSON export. The former chart-led overview and repeated horizontal timeline bars were removed. Observation dates now appear as readable text; one compact labelled span remains inside the selected dossier as secondary evidence.

The dossier preserves state context, dates, declared licence, rows, versions, failures, Documentation Coverage, all 28 expandable check methods, supplied source and successor links, downstream-reference unknowns, observation evidence, and selected-record export. Before a record is chosen, the desktop dossier column shows the observed-state summary for the current filters (count and one-line meaning per state, archive date) instead of standing empty.

The no-JavaScript register is emitted as a single pre-built, escaped HTML string inside `<noscript>`; rendered as elements it exceeded React's progressive chunk size and streamed as segments whose completion scripts failed in JavaScript-enabled browsers.

## Data boundary

The page uses `getPreservedRecords()` and respects its `catalog`, `illustrative`, `unavailable`, and `error` states. The package has no production historical adapter, so `?demo=1` uses 96 fictional examples with a visible illustrative label. Dependency values remain `Unknown` until ingestion exists; no figures are fabricated.

Filter and selection state remains shareable through `q`, `state`, `platform`, `record`, and `demo` query parameters. Browser back and forward restore the state.

## Verification

The helper suite contains 31 passing tests. Integrated type checking, linting, production build, desktop/laptop/phone rendering, spatial selection, URL updates, filters, keyboard paths, and dossier access were verified in the final design-audit revision. See `docs/VERIFICATION.md` for the complete release check.
