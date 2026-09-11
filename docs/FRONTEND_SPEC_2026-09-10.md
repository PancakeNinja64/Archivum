> **Implemented with identity update:** Read `IDENTITY_2026-09-11.md` first. The supplied official wordmark and Graphite/Mineral/Silver/Signal Blue system override this document’s earlier branding and palette values.

# Archivum — Final Frontend Design Specification

Version 1.0 · September 10, 2026 · Ready for implementation

This document selects the design and defines its execution. It does not report a completed implementation. No frontend code was changed while preparing it.

## 1. The decision

Build Archivum as a **spatial archive of public AI data**: a slowly rotating network introduces the catalog, a selected dataset resolves into a layered evidence passport, and preserved records occupy a quieter architectural field in Delisted.

The composition combines three ideas within one design system:

| Source concept | Adopt | Application |
| --- | --- | --- |
| A — Dataset Passport | Sculptural depth, precise product lighting, evidence layers becoming a usable record | The homepage's central transformation and dataset detail hierarchy |
| B — Observatory | The current rotating network, selective relationship discovery, spatial continuity | Atlas in the homepage and the optional catalog map |
| C — Living Archive | Editorial pacing, mineral materials, chronological organization, permanence | Delisted, version history, documentation, and reading surfaces |

**Creative thesis:** the network gives context; the passport exposes evidence; the archive preserves what was observed. Motion should make those relationships understandable.

The tone is intelligent, elegant, quietly futuristic, and assured. Depth comes from perspective, occlusion, lighting, and material contrast. Restraint comes from limiting simultaneous motion, controls, and visual emphasis. The site must still feel composed when paused.

### Design authority

This specification supersedes the visual and interaction direction in `docs/REDESIGN_SPEC.md` dated August 30, 2026. The older document and existing implementation are historical references, not requirements to reproduce. Preserve useful working code and the user's uncommitted work.

The generated concept images below guide material, scale, and composition only. Their incidental copy, numbers, source names, invented licence changes, and hardware-like proportions are not product facts or requirements. The implementation must use actual data or clearly identified examples.

- [Dataset Passport visual reference](design-references-2026-09-10/dataset-passport.png)
- [Living Archive visual reference](design-references-2026-09-10/living-archive.png)

The final design keeps A's dark precision, B's network, and C's archival rhythm. It does not alternate unrelated website themes or turn every record into a phone-shaped slab.

## 2. Product purpose, audience, and success

Primary audience: AI engineers and researchers evaluating public datasets. Secondary audiences: data governance teams and dataset publishers. This is the selected design assumption, inferred from the product; it is not a claim about measured customer demographics.

Primary task: find a dataset, understand its source and documented terms, inspect evidence and gaps, then visit the original source or save the record.

Secondary task: understand what Archivum last observed when a source becomes unavailable, restricted, withdrawn, or superseded.

Success conditions:

1. A new visitor can identify what Archivum does and find the catalog without scrolling.
2. A returning visitor can search immediately and does not have to replay a presentation.
3. A dataset's source, declared licence, documentation coverage, and check date are visible near its title.
4. Coverage is consistently understood as documentation completeness, not quality or permission to use data.
5. Every visual encoding has a defined meaning or is explicitly decorative.
6. Mobile, keyboard, reduced-motion, loading, empty, and failure states receive complete designs.

Browsing stays public. Authentication is contextual to saving and account operations.

## 3. Baseline and implementation scope

Inspected public repository: `PancakeNinja64/Archivum`, commit `77a512c5134783325e36e3cd362b6c2f1364f14a`. Inspected live surfaces: homepage, Explore including a successful FineWeb search, FineWeb passport, and Delisted. Counts observed during reconnaissance are snapshots and must never become hardcoded claims.

Local project: `/Users/namkd/Documents/ChatGPT/random/Archivum`. It has the same base commit plus an existing uncommitted redesign. Before execution, inspect current changes and newer upstream work; preserve both intentionally. Do not reset, clean, or overwrite the working tree to obtain the old baseline.

Current stack: Next.js 16.3, React 19, Tailwind 4, Supabase, Framer Motion, and Vitest. The local draft also includes `motion`. Use the installed stack; this design does not require a framework upgrade.

### Included

- Shared visual tokens, typography, navigation, footer, and responsive shells.
- Homepage choreography, Atlas preview, passport demonstration, and Delisted introduction.
- Explore results and its optional Atlas view.
- Dataset passport, evidence disclosure, lineage, versions, schema, and available samples.
- Delisted spatial field, register, selection, and preserved-record inspector.
- Visual consistency for docs, pricing, publishing, authentication, saved datasets, admin, and legal pages.
- Narrow read-adapter and display-model fixes necessary to distinguish unavailable information from valid data.
- Removal or clear presentation of unimplemented product promises in the affected UI.

### Outside this implementation

- New ingestion pipelines, historical backfills, billing, invented SDKs, or new monitoring services.
- Changes to coverage arithmetic, authentication policy, database permissions, or legal terms.
- A custom 3D engine, a new design plugin installation, or a new mandatory service.
- Publishing or deploying the redesign. Deliver and verify the build before a separate deployment instruction.

## 4. Information architecture

Keep existing public paths and dataset slugs. Change labels and hierarchy where specified. Preserve existing inbound anchors and query links through compatibility handling.

| Surface | Route | Responsibility |
| --- | --- | --- |
| Home | `/` | Explain the product through the spatial story; provide immediate search |
| Catalog | `/explore/` | Search and filter; default readable results |
| Atlas | `/explore/?view=atlas` | Optional spatial view of the same result set |
| Dataset passport | `/datasets/[slug]/` | Inspect one dataset and its evidence |
| Delisted | `/delisted/` | Find and inspect preserved records |
| Methodology | `/docs/#methodology` | Coverage definition, arithmetic, limits |
| Docs | `/docs/` | Read supported capabilities and technical documentation |
| Saved datasets | `/dashboard/` | Existing signed-in saves and available activity |
| Supporting routes | Existing pricing, publish, auth, admin, legal routes | Remain functional; share the design system |

### Navigation

Desktop header: Archivum wordmark, **Explore**, **Delisted**, **Methodology**, **Docs**, and contextual **Sign in** or account control. Atlas lives inside Explore and is named in the homepage scene; it does not need a duplicate top-level destination.

The header is 64 px high. It has a solid or near-solid backing after content scrolls beneath it. Body content begins below it; sticky controls never overlap it. The wordmark returns home. Use a simple typeset Archivum wordmark in Geist for the primary header and retain the existing recognizable mark for the favicon and compact use. Do not invent a new emblem.

The footer has compact Product, Resources, and Company groups. Include publishing and pricing there. Remove repeated copies of the same destination within a footer. Keep required notices readable and retain legal links.

On mobile, use a 56 px header and an explicit Menu button. The menu is an accessible dialog with focus containment, Escape dismissal, background scroll locking, and focus restoration. Browsing must not be hidden behind sign-in.

## 5. Visual system

### Palette and surfaces

The default launch presentation is dark. Delisted introduces pale mineral objects inside that same dark environment. C's lightness comes from the objects, generous composition, and editorial spacing rather than a sudden white page midway through scrolling.

Reading and working routes support a light appearance through the existing theme infrastructure. Use a compact Appearance control with System, Dark, and Light in the account/footer area. Default to Dark when no explicit preference exists. Honor an explicit selection across navigation. Home and Delisted retain a dark cinematic stage inside either shell, with readable transitions into the surrounding page. Do not make theme changes part of scroll choreography.

| Token | Dark | Light | Purpose |
| --- | --- | --- | --- |
| Page | `#080B10` | `#F4F6F8` | Main background |
| Surface | `#111720` | `#FFFFFF` | Reading panels and controls |
| Elevated | `#19222D` | `#E9EEF3` | Selected or layered surfaces |
| Primary text | `#F2F5F8` | `#121922` | Main content |
| Secondary text | `#AAB6C4` | `#4D5D70` | Supporting content |
| Structural line | `#2B3746` | `#CBD4DE` | Dividers, nonessential geometry |
| Interactive blue | `#8CB9FF` | `#1C52CC` | Links, focus, selected state |
| Primary action fill | `#B2CFFF` | `#163FA8` | Primary button |
| Primary action text | `#0A1424` | `#FFFFFF` | Button label |
| Mineral object | `#D9E2EC` | `#D9E2EC` | Archival plate material |

These are implementation starting tokens, not a claim that every composited combination passes contrast. Measure actual backgrounds, opacity, hover, focus, and disabled states. Strengthen control boundaries independently of decorative dividers.

Blue identifies selection and interaction. Evidence state must remain understandable without color: filled marker for Documented, half-filled marker for Reported, open marker for Not found, and dash for Not applicable. Operational failures may use a restrained red plus icon and text. Do not use a red-to-green scale to imply that a dataset or publisher is good or bad.

### Typography

- Geist Sans: navigation, display headlines, product UI, and body copy.
- Geist Mono: dates, identifiers, evidence counts, small technical labels. Never set whole explanatory paragraphs in mono.
- Instrument Serif, already installed: reserve for the single Delisted headline and major editorial headings on methodology. No mixed-family emphasis inside a sentence.
- Desktop homepage headline: fluid 64–88 px, line-height 1.02–1.08, maximum approximately 12–16 characters per designed line.
- Mobile homepage headline: 40–48 px; never force a line break that overflows.
- Product page title: 32–44 px desktop, 28–34 px mobile.
- Body: 16–18 px, line-height 1.5–1.65. Dense table content may use 14 px. Essential metadata is at least 12 px.
- Tabular numerals for dates and measurements. Keep reading paragraphs around 55–70 characters wide.
- Avoid tiny all-caps slogans, excessive tracking, and ornamental fragments added by the concept generator.

### Layout, shape, and material

Use a 12-column desktop grid with a 1440 px content maximum. Horizontal gutters: 48–64 px desktop, 24–32 px tablet, 20 px mobile. Reading columns have their own narrower maximum.

Spacing scale: 4, 8, 12, 16, 24, 32, 48, 64, 96, 128 px. Marketing sections use 96–128 px desktop spacing; working pages use 24–48 px groups. Mobile marketing spacing is 56–72 px.

Radii: 8 px controls, 12 px panels, 16 px outer inspectors. Pills are reserved for short state tags. Spatial record plates have subtle 4–8 px corners and thin edges, closer to a document than a consumer device.

Most information is grouped through alignment, whitespace, and rules. Cards are used for selection, containment, or a true object boundary. Solid reading surfaces take precedence over translucency. Limit material texture and light to the cinematic scene; never put a full-page animated grain layer over the application.

## 6. Homepage: one continuous reveal

### Opening content

Eyebrow: **THE RECORD OF PUBLIC AI DATA**

Headline: **Know your data. Trace its story.**

Supporting copy: **Explore public AI datasets through their origin, licensing, lineage, and documentation. One consistent record, with the evidence and the gaps in view.**

Primary control: a real search form, labelled Search datasets, placeholder **Search datasets or publishers**, with a submit action labelled **Explore datasets**. Empty submission opens the catalog; text submission opens `/explore/?q=...`. Enter works. Add one quiet link, **Open an example**, resolving to an actual available record or an explicitly identified example in demo mode.

A restrained count line uses current catalog and platform totals. If counts are unavailable, omit the line or say the catalog could not be loaded; never replace it with fixture counts.

### Desktop storyboard

The first three beats share a single stage. Target total section height: **300 svh**, containing a sticky stage of `calc(100svh - header-height)` and approximately two viewport lengths of scroll travel. Start implementation with this budget; shorten it if reading and interaction testing shows unnecessary travel. There is no additional long pin on the homepage.

| Progress | Composition | Meaning and behavior |
| --- | --- | --- |
| 0–20% — Atlas | Headline and search left; broad rotating network right, with depth extending behind the composition but not through the text | The catalog is immediately understandable and usable. Network rotation is slow and pausable. |
| 20–48% — Focus | One selected real record becomes prominent; unrelated edges recede; a small flat summary appears | One object retains its identity. The camera moves a short distance toward it, with no tunnel flight. |
| 48–80% — Unfold | The selected record becomes a horizontal document-like plate with four separated evidence layers | Origin, Licensing, Composition, Maintenance. Show evidence states from that record. Layers reveal structure; labels remain in readable DOM text. |
| 80–100% — Read | Perspective decreases and the layers settle into a flat passport preview | The cinematic object becomes the interface. Provide a direct Open record action. Release the sticky stage naturally. |

At every point, scrolling backward reverses the composition from the current state. Flinging past the section reaches the correct final state immediately. Do not queue animations or lock scroll. Scene geometry follows scroll progress; text crossfades may use brief bounded transitions.

Keep a small static chapter label: **Atlas / Record / Evidence**. It is orientation, not a second navigation bar. The header and hero search provide the primary navigation.

### Selection during the story

Choose the initial featured record deterministically from available records with sufficient metadata for a demonstration. It need not have high coverage. Selection must not claim it is the best or safest dataset.

Clicking a node changes the selected record and opens its compact preview without automatically scrolling the page. Freeze ambient rotation while the preview is active. Fetching details must show a reserved loading surface; never borrow the previous record's facts. A later scroll unfolds the selected record. If selection becomes invalid, clear it and explain the state.

Atlas-only summaries cannot supply all evidence detail. Request the selected passport through the shared data boundary; render absent detail honestly.

### Following sections

1. **Explore the index:** four to six actual records as concise rows, with source, licence, and coverage. One link opens all results. No second full set of homepage filters.
2. **The record remains:** a compact Delisted introduction, one field of pale archival plates and a short explanation. No second pinned film. Link: **Explore Delisted**. Clearly mark illustration when historical data is unavailable.
3. **A method you can inspect:** one concise explanation of Documented, Reported, Not found, and Not applicable, linking to methodology. Do not repeat the full 28-check report.
4. **Closing action:** a short invitation to explore and a contextual publishing link. Remove the existing fake-success waitlist form until a functioning endpoint is available.

Do not retain separate Problem, How it works, Coverage, Integrations, and Marketplace marketing blocks merely because components already exist. Their useful content is absorbed into the sequence above. Claims about supported sources or integrations must match working capabilities.

## 7. Atlas: rotating context with deliberate focus

### Visual composition

Retain the spinning network as a recognizable signature. Improve its composition rather than increasing its complexity:

- An asymmetric, slightly flattened ellipsoidal field with two or three perceptual depth planes.
- Small silver nodes, fine blue-grey connections, one unmistakable blue selection ring.
- Stable node positions derived deterministically from identity and grouping. Filtering does not randomly shuffle the whole map.
- Mild perspective and restrained depth fading. Low-coverage records are never hidden or pushed into illegibility.
- A clean text safety area on the left of the homepage. Keep visible contrast regardless of camera angle.
- The selected neighborhood gains contrast while unrelated geometry recedes. Labels appear on selection and in a limited set of useful anchor positions.
- No perpetual pulses, moving data packets, scan beams, or fabricated real-time activity. Rotation expresses space, not ingestion activity.

Ambient rotation target: 0.6–1 degree per second about the vertical axis, with a fixed small tilt. No oscillating camera bob. Pause immediately on interaction, focus within the scene controls, document hiding, or offscreen state. Once the user selects or manipulates the field, restart only through an explicit Resume rotation control. Reduced motion disables ambient rotation by default.

### Meaning of geometry

Default node size is consistent. Position conveys grouping, not coverage or quality. The old coverage-to-depth mapping is retired. Coverage is read in the inspector and optional labeled encodings, not inferred from apparent importance.

Edges require known endpoints and a supported relationship:

| Relationship | Display | Rule |
| --- | --- | --- |
| Same publisher | Fine solid line | Exact publisher identity match; display as Shared publisher |
| Shared domain | Fine dashed line | Exact available domain overlap; hidden by default until requested |
| Declared relationship | Stronger solid line when selected | Only when the source contract supplies the relationship and its evidence |
| Dataset derivation | Not inferred | Never fabricate from proximity, topic similarity, or a shared publisher |

Always show a concise legend: **Connections show shared metadata; they do not establish derivation.** Avoid a fully connected graph for every publisher cluster. Use a deterministic limited set of representative edges; state that displayed connections are a subset. A node with no relationship remains visible as an isolated record.

### Explore Atlas behavior

Atlas is a view within Explore, with the same search, filters, pagination, and current result set as the list. For this release, show the current result page and explicitly label it, for example **24 of 218 results shown · Page 2**. Pagination changes the scene. Do not imply an entire catalog is visible when only a page is loaded.

Controls: **List / Atlas**, **Pause or Resume rotation**, **Reset view**, and accessible **Zoom in / Zoom out** buttons. Desktop pointer drag rotates the field. Wheel scrolling remains page scrolling; do not intercept it for zoom. On touch, normal vertical gestures scroll the page; the first release uses tap selection and explicit controls rather than gesture rotation.

Click/tap selects, then **Open record** navigates. Hover may preview the record name, but clicking must not immediately eject the visitor from the map. Selection and the readable result list stay synchronized by slug. Keyboard users select through the equivalent DOM list and receive the same inspector. Do not require tabbing through dozens of invisible canvas targets.

The selection panel is approximately 360–400 px wide on large screens. It contains name, publisher, declared licence, coverage with check date, and Open record. On small screens it becomes an accessible bottom sheet or inline expansion without hiding the navigation unexpectedly.

## 8. Dataset passport: the main working surface

The passport is primarily a flat reading interface. It inherits the hero's four-layer organization without placing paragraphs on tilted 3D planes.

### First viewport

At a representative 1440×900 viewport, the visitor should see the title, concise summary, source/publisher, declared licence, last check, coverage, and primary action without needing to scroll past source prose. Long names may increase the height; they must remain readable without overlap.

Layout: approximately 8 columns for identity and summary, 4 columns for a compact facts/action panel. **View at source** is primary; **Save** is secondary. Suggest a correction is a quiet contextual action. The record remains usable before auth status is resolved.

The summary is at most three visible lines with **Read source description** expansion. Preserve original text and source attribution; no invented AI summary is required. Collapse long hashes into a clearly labelled copyable value with the full value available on expansion. Display source update and Archivum check dates as separate facts.

### Sections and anchors

Use one sticky in-page navigation: **Overview · Evidence · History · Structure**. They are anchors into the same document, not separate pages. Preserve old incoming anchors such as `#coverage`, `#lineage`, `#license`, `#versions`, `#schema`, `#samples`, and `#integrate` at the corresponding content or explanation.

- **Overview:** key facts, source, declared terms, and concise observations requiring attention. Do not call missing documentation a dataset defect.
- **Evidence:** four coverage sections, expandable individual checks, licensing evidence, and the actual lineage graph.
- **History:** available version observations and documentation changes. A single observation renders as a single item, not an invented trend.
- **Structure:** schema and available preview rows. Display sample limitations and source context. Wide data tables scroll within their own labelled region.

At a coverage check, show its label, evidence state, what was checked, observation time when available, and a source artifact link only when supplied. A missing artifact URL must not become a fabricated deep link. A general source link is labelled as such.

### Lineage and versions

Draw only lineage nodes/edges supplied by the record. Missing stages are explicitly labelled. Avoid filling empty graphs with a universal six-stage workflow that implies all datasets underwent those processes. A empty lineage section explains that no lineage record is available.

C's version-comparison idea is limited by current data. `DatasetVersion` provides notes, dates, row deltas, and coverage; it does not provide complete historical licence/schema snapshots. Show the available chronology and evidence-backed differences only. Rich field-by-field comparison stays unavailable until actual snapshots exist. A zero inserted by an adapter is not evidence of zero change.

Save actions use the existing persistence path. Show pending and success/error states; roll back failed optimistic changes. Signed-out saving offers sign-in with a safe return to the same record. Public inspection is never gated.

Remove unverified SDK/CLI examples from the active integration UI. If retained as a product preview, isolate them under an explicit forthcoming-capability label and disable copy-as-working-code affordances.

## 9. Delisted: the preserved record field

### Design selection

Replace the default decay-column board with a field of **thin mineral archival plates**. Each plate represents one preserved record. They stand along quiet chronological rails inside a graphite environment, lit by a cool lateral light. Their silhouettes create depth and architectural rhythm.

Headline: **The record outlives the source.**

Supporting copy: **Inspect the last recorded state of datasets whose sources were superseded, gated, withdrawn, or could no longer be reached.**

There is no constant rotation here. Atlas feels open and exploratory; Delisted feels still and preserved. A selected plate moves slightly forward and turns toward the reader; the panel beside it exposes the record. No disintegration, tombstones, ominous red landscapes, particles escaping, or implied accusation against publishers.

### Geometry and encoding

- Group plates into labelled lanes by observed state: Superseded, Gated, Withdrawn, Unreachable. Grouping is categorical, not a severity ranking.
- Within a lane, order by last confirmed date, newest first. Use visible year/cohort markers.
- Plate size is uniform. Height, opacity, and physical damage do not encode an invented risk or loss score.
- Different states use label/icon plus a restrained edge treatment; all remain legible in monochrome.
- Selected plate advances approximately one plate spacing, with a slight turn toward the camera. Neighboring plates remain stable.
- The display is an ordered archival arrangement, not a quantitative chart with unexplained spatial axes.

The legacy decay calculation may remain accessible as an optional methodological detail if its input data and limitations are available. It is removed from the headline, default sort, and primary spatial encoding. Do not redesign the formula or treat its ranking as authoritative.

### Working layout and interaction

On desktop, the title and compact controls appear first, followed by **Field / Register** views. Field is the default for an initial visit with data; respect an explicitly chosen view in the URL. The Field occupies roughly 55–65 vh, with a maximum around 680 px. It does not create a long scroll trap.

Search label: **Find a preserved record**. Filters: observed state and platform. Default order: most recent last-confirmed date. Both views share query, selection, total count, pagination, and data mode. Show a finite page of 24 records in either view with an explicit displayed/total count.

Register columns: dataset/publisher, observed state, last confirmed, declared licence at last check, and documentation coverage at last check. Click a record to open the inspector. On mobile, Register is the default; the Field remains optional and uses tap selection, not precise dragging.

Inspector contents:

1. Record name, publisher, platform, and observed state.
2. Last confirmed date and current age of that observation, using precise wording.
3. Last recorded declared licence and documentation coverage.
4. Frozen coverage checks, clearly distinguished from current verification.
5. First observation and final confirmation when present.
6. Known successor link only if supplied and valid; original source link labelled as possibly unavailable.
7. Why this state was recorded, only to the extent supported by supplied evidence.

Do not equate a failed fetch with publisher withdrawal. Do not display dependent model/paper counts when null. Do not fabricate a sequence of probe events from an aggregate failure count.

On the homepage, Atlas and Delisted are separate compositions joined by a restrained crossfade. A dataset may move between them only when a verified shared identifier establishes that it is the same record. Array positions or similar names are never an identity match.

### Data availability is part of the design

The inspected public Delisted route uses `DELISTED_FIXTURE`. Until real records are supplied, production displays a compact labelled illustrative plate composition and the message **Preserved records are not available in this catalog yet.** It may offer **View an example** into an explicitly marked demo, but it must not present the fixture's 96 records as observed history.

In local demo mode, the full field and register work with synthetic data under a persistent **Illustrative records** notice. Prefer neutral example publishers; do not attribute fictional withdrawals or licence changes to real organizations. Demo status remains visible inside the inspector and in any shared demo link.

An empty real dataset and unavailable historical integration are distinct states. An error must not fall back silently to examples.

## 10. Explore: convenience and precision

Default view: List. Retain table semantics on desktop; use readable stacked records on mobile. Eliminate the separate decorative card-grid mode. Accept old `view=grid` links and interpret them as List; preserve `view=table` as List and add `view=atlas`.

Desktop: 240 px filter column and flexible result region. Search, active filters, result count, sort, and view switch form one compact toolbar. Primary columns: name/publisher, platform, declared licence, documentation coverage with check context, source update. Expand secondary metadata within a row instead of adding eight permanent columns.

Default sort remains Documentation coverage descending for compatibility; label it explicitly and do not call it Recommended or Best. For a text query, use actual relevance only if supported by the backend; otherwise retain the explicitly selected supported sort. Do not imply semantic or AI search.

Preserve existing supported query keys: `q`, `platform`, `modality`, `domain`, `license`, `commercial`, `min`, `sort`, `page`, `view`. Validate all values; unsupported values fall back predictably. Filters and sort reset pagination; switching List/Atlas preserves it. Selection may use a namespaced slug query parameter, validated against the loaded data.

Search input updates immediately. Keep the existing approximate 250 ms request debounce, but Enter submits immediately. Cancel or ignore stale responses. Preserve the prior result region while a subsequent request is pending, with a small Updating indicator and `aria-busy`; never let old results masquerade as the completed response to a new query.

Keep search/filter state on Back navigation. When filtering removes a selected record, clear selection explicitly. Requests that fail show Retry while preserving query and filters.

Normalize visually equivalent licence labels for browsing only when a recognized identifier maps them safely. A grouped MIT filter must send all corresponding raw variants to the existing filter API so counts and results agree. Retain the exact original licence spelling in the record. Keep Unknown, Other, and Not stated distinct unless the source semantics establish equivalence.

Hide empty filter groups; make long groups searchable or expandable. Active filters remain visible as removable chips. On mobile, a Filter button shows the active count, and the sheet has Apply and Clear actions; opening it must not move results unexpectedly.

## 11. Shared data and truth requirements

Reuse `src/lib/api/client.ts` as the page/component data boundary. Do not import Supabase adapters directly into new visual components. Derived Atlas view models may use current catalog summaries. A Delisted data provider must return an explicit unavailable state until a real read implementation exists; this spec does not authorize manufacturing historical data.

Every data-backed surface distinguishes **catalog data**, **illustrative data**, **unavailable**, and **error**. The mock environment and fixture scene state are explicit inputs, not guesses based on whether an array is empty.

Required corrections at the presentation/read boundary:

- Missing counts, sizes, and dates must remain unknown. The inspected adapter substitutes zero counts and current timestamps; correct that handling rather than presenting those defaults as observations.
- Use nullable values or an equally explicit availability field consistently through both adapters and formatting helpers. Choose one representation and cover it with focused tests. Never decide that all numeric zeroes are missing; a verified zero is valid.
- History deltas not measured by ingestion are unavailable, not `+0 / -0` facts.
- Coverage uses the existing `computeCoverage` output and source check detail. Preserve Documented = 1, Reported = 0.5, Not found = 0, and Not applicable excluded, with the existing section weighting and rounding. Do not replace this with `documented checks / 28`.
- Coverage always has its meaning and available observation date nearby. A figure cannot become a badge labelled trusted, verified safe, graded, or legally cleared.
- A claim derived from a licence lookup must be distinguished from verbatim source terms. Do not interpret unsupported prose or a false Boolean as proof that no obligation exists.
- Current dataset lineage does not imply dataset-to-dataset graph edges. Cross-record relationships need separate supplied evidence.
- Loading and transport errors do not become 404 dataset-not-found states. A missing record and a failed request receive different UI and HTTP handling where appropriate.

These are narrow correctness requirements for the redesigned interface. They do not require a new database, new crawler, or coverage model.

## 12. Motion specification

| Motion class | Starting values | Rules |
| --- | --- | --- |
| Press feedback | 80–120 ms; scale 0.98 | Immediate acknowledgement; focus is always visible |
| Hover/focus decoration | 120–160 ms | Color/border emphasis; no repeated row lifting |
| Menu/popover | 160–220 ms | Decelerating arrival from its trigger; interruptible |
| Inspector/sheet | 220–300 ms | Symmetric entrance/exit; never block input until settled |
| Spatial selection | 300–420 ms | Short travel from current position; zero bounce by default |
| Authored entrance | 500–700 ms maximum | Only the focal object; text and controls are present immediately |
| Scroll composition | Position-driven | No fixed duration, no delayed catching-up after scroll stops |
| Atlas ambient rotation | 0.6–1 degree/second | Pausable, stops offscreen/hidden and during interaction |

Primary arrival curve: `cubic-bezier(0.16, 1, 0.3, 1)`. On-screen composition curve: `cubic-bezier(0.65, 0, 0.35, 1)`. These are defaults; test their perceived speed at actual travel distances. Use a critically damped or near-critically damped spring for retargetable object selection. Avoid spring overshoot on text, filters, and tables.

State changes triggered repeatedly by keyboard, search, filtering, or paging are immediate except for necessary loading feedback. Do not stagger every result, animate coverage numbers from zero, or replay page intros on Back.

During pinned scroll, scroll progress takes priority over ambient rotation and any unfinished decorative entrance. Maintain one transformation owner per scene object. User input cancels conflicting choreography. This prevents camera and scroll controllers from fighting each other.

Meaningful UI is HTML. Animate its wrappers without rasterizing text. Masks and bounded lighting effects are allowed where measured. Expensive blur, refraction, and shadows remain isolated to the focal scene. No background audio or autoplay cinematic video.

## 13. Responsive and accessible behavior

| Width / preference | Required composition |
| --- | --- |
| 1280 px and above | Full homepage spatial sequence; side inspector; desktop results |
| 1024–1279 px | Reduced field density and travel; compact side inspector where it fits |
| 768–1023 px | Unpinned stacked story; inline/sheet inspectors; visible search before the scene |
| Below 768 px | Headline, search, then compact network; flat evidence layers; Delisted Register default |
| Reduced motion, any width | Unpinned semantic sections; static network and plates; instant selection or brief nonspatial crossfade |

Mobile receives authored compositions, not cropped desktop canvases. Use a 4-column grid. Do not require hover, horizontal page scrolling, or precise taps on tiny moving objects. Touch targets are at least 44×44 CSS px even if the visible icon is smaller. Long dataset names and metadata wrap without covering controls.

For reduced motion, show the same record, evidence, and route actions in normal document order. Remove rotation, camera moves, plate travel, and parallax. Keep feedback and visible state changes. A Pause motion control is available alongside any nonessential continuous animation.

Provide skip-to-content, clear focus, correct landmarks/headings, labelled forms, focus restoration, and keyboard equivalents for every scene action. Announce result changes politely, not every frame or keystroke. A visual canvas may be hidden from assistive technology only when equivalent useful content and controls exist in the DOM.

The no-JavaScript homepage contains positioning, links, and an attractive static composition. The catalog should server-render its initial results where supported; any enhanced filtering failure leaves useful navigation. No page may stay invisible because a reveal script did not run.

Target WCAG 2.2 AA. Validate contrast, zoom to 200%, reduced motion, focus order, and screen-reader names. Contrast is evaluated on the actual composite, including text over scenes. Fixed/sticky UI must not obscure focused controls.

## 14. Rendering architecture and performance

### Selected approach

Reuse the existing projected Canvas 2D Atlas for the first implementation; its 3D geometry/projection already supports the network. Recompose and correct its encodings. Use CSS perspective plus Motion for the small number of passport layers. Use a shared projected-field approach for Delisted plates where practical, with readable HTML inspectors.

This combination delivers spatial continuity without loading a new 3D framework across the application. If a bounded scene prototype proves that the specified material quality cannot be achieved, a lazily loaded Three.js scene is an allowed implementation substitution for that scene alone. Document the visual gain and measured bundle/frame cost before retaining it. Do not add multiple animation controllers or WebGPU as a requirement.

Server components deliver content and metadata. Isolate motion in client leaves. Consolidate the local `motion`/`framer-motion` usage to one consistent package/import convention when touched; do not load two copies. Verify Next.js APIs against the installed documentation before code changes, as required by the repository's AGENTS.md.

### Budgets and degradation

- Homepage network cap: 80 displayed nodes and approximately 120 representative edges. Show the displayed count separately from the catalog total. On small screens cap at 24 nodes.
- Explore Atlas and Delisted Field: 24 current-page records by default, matching the associated list/register pagination.
- Canvas DPR cap: 1.5 initially; raise only if device testing justifies it. Avoid rendering imperceptible subpixel detail.
- At most one expensive animated scene runs at a time. Pause offscreen and on document hiding; clean up observers and animation loops on unmount.
- Use motion values/ref-based transforms for continuous input; no React state updates per animation frame.
- Reserve scene, image, font, and inspector space before loading. Lazy-load nonessential scene code after critical content. The hero is complete before its enhancement loads.
- First meaningful content never waits for shader compilation, scene initialization, or all record details.
- Measure on a representative midrange phone and normal laptop. Target smooth 60 Hz motion; if sustained frame time exceeds roughly 25 ms during a short observation window, reduce edge density/DPR and then freeze decorative rotation rather than degrading input.
- Bound labels, geometry, and request sizes. Do not fetch the entire catalog simply to populate a decorative hero.

Release performance targets: LCP ≤2.5 seconds, INP ≤200 ms, and CLS ≤0.1 at the 75th percentile, segmented by mobile and desktop when field data becomes available. Before release, use lab loading/interaction checks and representative device testing; a Lighthouse score alone is not proof of field INP.

## 15. Supporting surfaces

**Docs/methodology:** readable article layout, restrained serif section headings, stable table of contents, copyable anchors, good code contrast. Explain the score once, including fractional Reported credit and Not applicable handling. No cinematic page entrances.

**Saved datasets:** prioritize actual saved records and supplied activity. Avoid synthetic KPIs, derived risk summaries, or trend lines with fewer than two actual observations. Distinguish a failed load from an empty list. Keep demo status persistent when activity is illustrative.

**Pricing:** preserve an honest free-catalog offering and clearly forthcoming paid capabilities. No checkout-like action until checkout exists. Reduce its navigation prominence rather than inventing commercial features.

**Publish:** preserve the route and useful guidance. A submission form must use a real supported endpoint and surface real status. If none exists, replace the fake success flow with an honest availability message and the existing contact route; do not silently send email.

**Auth/admin:** apply shared tokens, spacing, input, feedback, and accessible focus styles. Preserve their workflows and authorization checks. No spatial animation in forms or administrative tables.

**Legal:** preserve substance and links. Improve typography and reading layout only.

## 16. Component responsibilities and reuse

Names below describe responsibilities; reuse existing components where they fit instead of creating parallel versions of every file.

| Responsibility | Existing starting points | Required result |
| --- | --- | --- |
| Application shell | `layout.tsx`, `Nav`, `Footer`, `ThemeProvider`, `globals.css` | One coherent responsive and theme system |
| Homepage sequence | `ArchiveHome`, `HolographicArchive`, `AtlasHero`, older home components | One storyboard; remove duplicate explanatory blocks |
| Atlas renderer | `AtlasField`, geometry/projection/draw utilities | Stable, pausable, truth-preserving network |
| Atlas data mapping | `lib/api/client.ts`, atlas types/fixtures | Explicit catalog/example/unavailable models; derived valid edges |
| Passport visual | `HeroPassport`, coverage components, motion tokens | Shared visual vocabulary; real selected record |
| Catalog | `ExploreClient`, `DatasetCard` or replacement row | List/Atlas sharing one query/result state |
| Detail view | dataset page, `CoveragePanel`, `LineageGraph`, `VersionList`, `SchemaTable` | Reading hierarchy and complete states |
| Delisted | `AfterimageIndex`, `DelistedClient`, `DelistedRegister`, field utilities | Plate field/register with shared selection and explicit data mode |
| Inspectors | Existing record and decay panels | Consistent desktop/mobile behavior; typed, factual content |

Keep domain arithmetic and data retrieval out of canvas drawing. Scene geometry is a deterministic function of normalized display data; hit-testing and DOM selection share stable identifiers. Extract tokens and basic shared controls when they eliminate real duplication, without constructing a general-purpose design-system package.

## 17. Execution order and stopping gates

1. **Establish the baseline.** Inspect source, installed Next.js guidance, existing changes, scripts, and representative routes. Record existing failures separately. Preserve the local redesign and choose a safe isolated implementation approach. Do not reinstall the reference repositories.
2. **Implement the foundation and passport.** Tokens, typography, navigation, responsive controls, truthful display values, and a usable dataset record. This is the working interface the film must resolve into.
3. **Build one complete scene slice.** Connect a real catalog record to Atlas selection, its evidence layers, and the flat passport. Implement reduced motion and the mobile composition at the same time. Verify identity continuity, input priority, and frame cost before expanding polish.
4. **Complete the homepage.** Apply the storyboard, compact catalog preview, Delisted introduction, methodology summary, and closing action. Remove redundant old sections.
5. **Complete Explore and Delisted.** Shared query state, list/field views, inspectors, pagination, source/data-mode distinctions, and empty/error handling.
6. **Unify supporting routes.** Docs, account, auth, publish, pricing, admin, and legal presentation, preserving working behavior.
7. **Verify and correct.** Run focused tests for new behavioral risk, existing test suite, lint, production build, and diff checks. Batch visual inspection across target widths and states, correct concrete findings, then confirm those fixes. Do not enter open-ended cosmetic iteration.
8. **Deliver.** Provide changed-source summary, runnable instructions, verified preview/build, desktop and mobile captures, motion evidence, and remaining real integration limitations. Do not claim deployment or historical data integration that did not occur.

The executor may refine exact camera coordinates, optical alignment, and easing within this specification. They should not substitute a generic static landing page, remove the rotating Atlas, invent capabilities, or expand scope into new backend systems to fill visual gaps.

## 18. Acceptance checklist

### Visual and motion

- [ ] The opening visibly retains a refined rotating network and provides immediate search.
- [ ] A selected dataset resolves into a four-layer passport and a readable flat record with the same identity.
- [ ] Delisted uses the mineral plate field with categorical state grouping and chronological order.
- [ ] All surfaces share typography, spacing, control shapes, and a coherent palette.
- [ ] At most one focal motion commands attention; repeated controls do not delay work.
- [ ] Fast forward/reverse scrolling, mid-animation selection, Pause/Resume, and Back navigation behave predictably.
- [ ] The design remains convincing with motion paused and in its reduced-motion composition.

### Functional and factual

- [ ] Search, supported filters, sorting, pagination, and old query links work in both mock and configured live mode.
- [ ] List/Atlas and Field/Register present the same current result page and selected identity.
- [ ] Authenticated saves persist; failed saves recover; signed-out browsing remains public.
- [ ] Invalid slug, unavailable provider, no results, one result, long metadata, and large result totals are distinct and usable.
- [ ] Unknown counts/dates/deltas are not shown as zero or now; verified zero remains valid.
- [ ] Coverage matches the existing rules including fractional outcomes and excluded checks.
- [ ] No fabricated derivation, historical snapshots, model counts, endorsements, SDKs, or successful form submissions.
- [ ] Synthetic fixtures remain visibly illustrative; production cannot silently substitute them for a failed or unavailable data source.
- [ ] Existing deep links, auth return paths, and supporting routes remain usable.

### Accessibility and performance

- [ ] Inspect at 390×844, 768×1024, 1024×768, and 1440×900; include a narrow 320 px stress check for basic reflow.
- [ ] Confirm actual viewport dimensions before claiming responsive verification.
- [ ] No horizontal page overflow; wide tables have labelled local scrolling regions.
- [ ] Keyboard can search, filter, select, inspect, close, save, and follow sources without using the canvas.
- [ ] Menu/inspector focus management and 200% zoom work; text/control contrast is measured.
- [ ] Reduced motion and JavaScript/scene failure retain content and useful navigation.
- [ ] Animations stop offscreen/hidden; no duplicate loops survive navigation.
- [ ] Production build passes; new console errors are absent; loading/interaction performance is measured with the limits of lab results stated.

Meaningful new tests should cover query compatibility, missing-value mapping, scene/list identity, coverage preservation, and relevant interaction failures. Do not write tests that merely reproduce CSS values or snapshot arbitrary animation coordinates.

## 19. Execution brief

Copy this into the implementation task with the repository available:

> Implement `docs/FRONTEND_SPEC_2026-09-10.md` in Archivum. Treat it as the final design direction. Preserve the existing uncommitted work and inspect the current repository before modifying it. Combine the refined rotating Atlas, the layered dataset passport, and the mineral Delisted archive as specified. Prioritize a complete working search-to-record flow, truthful data states, responsive composition, accessibility, and controlled cinematic motion. Reuse the current stack and shared data boundary. Build and verify the frontend through a production build and representative browser checks, correcting concrete failures. Deliver the implementation and verification evidence without deploying or inventing unavailable backend capabilities. Use the included concept images for material and composition only; the written spec overrides their incidental details.

## 20. Reference basis

Source snapshots were inspected during September 10 preparation. Upstream advice is reference material, not authorization to execute installers, alter workflows, or override this brief.

- [Archivum repository](https://github.com/PancakeNinja64/Archivum/tree/77a512c5134783325e36e3cd362b6c2f1364f14a): current route and data structure, fixture boundaries, shared adapters.
- [Emil Kowalski's skills](https://github.com/emilkowalski/skills/tree/d23d7f88a2e21c9e4b1418c7abe420f5c1052ba7): purposeful animation, timing, feedback, interruption, and physical continuity.
- [Impeccable](https://github.com/pbakaus/impeccable/tree/cb56ed6c19a07329a9fa0cd4e657bee040156593): distinct needs of persuasion, operation, and reading; one authored focal sequence; reducing redundant complexity.
- [Taste skill](https://github.com/leonxlnx/taste-skill/tree/ccbc15639c97057cbfcf32ecebc38ef716e4bb37): audience-led art direction, visual consistency, and deliberate avoidance of default layouts; applied selectively to working interfaces.
- [Apple: Designing Fluid Interfaces](https://developer.apple.com/videos/play/wwdc2018/803/): response, interruption, and spatial consistency.
- [Motion: scroll animations](https://motion.dev/docs/react-scroll-animations): scroll-linked values and progressive motion implementation.
- [Core Web Vitals](https://web.dev/articles/vitals): loading, responsiveness, stability, field thresholds, and limitations of lab-only evidence.

The synthesis, composition, proposed timings, budgets, and implementation decisions in this specification are design decisions for Archivum. They are not claims of an official 2026 aesthetic standard or a guarantee of a design award.
