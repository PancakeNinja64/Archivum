# Archivum motion and scroll audit

Audited 2026-09-15 against current source in `/src/`.
Based on source code inspection of every animation-bearing component and CSS module.

---

## 1. Inventory of current motion by route/component

### Product homepage (`/` — ProductHome.tsx)

| Component | Technique | Driver | Duration / rate | What moves |
|---|---|---|---|---|
| **AtlasConstellation** | Canvas 2D `requestAnimationFrame` | Ambient rotation + scroll listener on `window` | 0.000033 rad/frame (~1.9°/s at 60 fps) | Globe of up to 80 nodes rotates continuously; camera tilt shifts with scroll `progress`; shared-publisher edges highlight on selection; radial glow on selected node; 12 precision rings drawn each frame |
| **EvidenceJourney** | `useScroll` → ~30 `useTransform` calls | Scroll position within 260svh pinned section | Continuous (scroll-locked) | Ch 1: SVG source network fades/scales/rotateX, `pathLength` line-draw on 7 connection curves. Ch 2: Document card fades in with rotateX tilt; two parallax back/mid evidence layers shift x, y, scale, rotateZ independently. Ch 3: Three candidate cards spread from centre with per-card x, y, scale, rotateY |
| **ArchivePortal** | `useScroll` → 6 `useTransform` calls | Scroll position `["start end", "end start"]` | Continuous (scroll-locked) | 9 `<i>` mineral plates shift x, y, z, rotateY, opacity driven by scroll; text block has parallax y |

### Original homepage (`ArchiveHome.tsx` — still in tree)

| Component | Technique | Driver | Duration / rate |
|---|---|---|---|
| **ArchiveHome** | `useScroll` → ~8 `useTransform` calls | 300svh pinned section | Scroll-locked opacity, scale, rotateX, rotateZ, spread across 4 chapters |
| **NetworkField** | Canvas 2D rAF | Ambient rotation 0.000014 rad/frame (~0.8°/s) | Continuous; pauses on IntersectionObserver, visibilitychange, `prefers-reduced-motion` |
| **HeroPassport** | `AnimatePresence`, `motion.div`, rAF counter | 5 s auto-advance interval + stagger delays | Initial scale/opacity 0.6 s; row stagger 0.08 s each; cross-fade 0.3 s; counter rAF ~700 ms |
| **Problem** | `motion.p/h2/li` `whileInView` | Viewport intersection (once) | Rise: 0.5 s stagger at 0.06 s intervals; ease `[0.22, 1, 0.36, 1]` |
| **SpecimenLattice** | Canvas 2D rAF, `useScroll` | Scroll drives theta/tilt; ring isolation eased at 0.14/frame | Scroll-locked rotation; ~180 ms reticle reveal; ring recession spring-like ease |
| **SpecimenReport** | `motion.section` animate opacity, `motion.span` sequential reveal | `useInView` (once) | 45 ms per check stagger; 0.22 s per item fade; rAF counter ~1.56 s total |
| **HowItWorks** | `useScroll` → `useMotionValueEvent`, `AnimatePresence` | 260vh pinned section | Visual swap: 0.35 s fade with y shift; arc SVG `strokeDashoffset` transition 0.5 s |
| **CoverageMethod** | `motion.div` `whileInView`, rAF counter | Viewport intersection (once) | Bars: 0.7 s + 0.1 s stagger; counter rAF ~1.1 s; gauge segment opacity transition 0.2 s |
| **HolographicArchive** | Canvas 2D rAF, scroll-driven progress | `MotionValue` from parent or fallback | Continuous rAF; atlas network + decay field + handoff veil; pointer parallax at 0.05 lerp; particle fragments animate continuously |
| **MarketplacePreview** | `motion.div` layout + initial fade | Data refetch trigger | Layout animation; 0.3 s fade per card |

### Explore page (`/explore/`)

| Source | Technique | Details |
|---|---|---|
| **AtlasField** | Canvas 2D rAF | Ambient rotation 0.00008 rad/frame (~4.6°/s); drag orbit; 2.5 s idle timeout before auto-spin resumes; 220 ms reticle; 3 ground rings; labels at depth |
| **explore.module.css** | `@keyframes breathe` | Skeleton loading pulse: 1.8 s ease-in-out infinite; opacity 0.45 ↔ 1 |

### Delisted / Graveyard (`/delisted/`)

| Component | Technique | Details |
|---|---|---|
| **DecayBoard** | Canvas 2D rAF | Column grow 240 ms, sweep 180 ms, stagger 600 ms total; focus in 620 ms / out 480 ms; ghost 200 ms; leader line to panel; `easeArchivum` easing |
| **AfterimageIndex** | `motion.div/button`, `AnimatePresence` | Uses `motionTokens.springs.snappy` (stiffness 520, damping 34) for panel transitions; `scrollIntoView` on mobile selection |
| **PreservedArchive.module.css** | `@keyframes sheetIn` | Dialog open: 240 ms `cubic-bezier(.16, 1, .3, 1)`, translateY(30px) → 0 + opacity |
| **HolographicArchive** (reused) | Canvas 2D rAF | In `afterimage` mode: decay field dominant, atlas faded to 0.045 alpha |

### Chronicle (`/chronicle/`)

| Source | Details |
|---|---|
| **Chronicle.module.css** | `loadSlide` 1.4 s skeleton; `fadeUp` 350 ms; `slideIn` 280 ms; reduced-motion: `animation: none` |

### Workbench (`/workspace/`)

| Component | Details |
|---|---|
| **Inspector.tsx** | `motion.article` — likely enter/exit transition for record inspector panel |
| **ShortlistTray.tsx** | `motion.div` — layout animation for shortlist items |
| **desk.module.css** | `@keyframes wbShimmer` 1.4 s infinite translateX shimmer on skeleton loaders |

### Global (`globals.css`)

| Pattern | Details |
|---|---|
| **Reduced-motion blanket** | `@media (prefers-reduced-motion: reduce)` sets `animation-duration: 0.01ms !important`, `transition-duration: 0.01ms !important`, `scroll-behavior: auto` on all elements |
| **Caret blink** | `@keyframes caret-blink` 1.1 s steps(1) infinite; disabled under reduced-motion |
| **Arc-draw utility** | `.arc-draw` uses `stroke-dashoffset` bound to `--draw-progress`; forced to 0 under reduced-motion |
| **Link underline** | `background-size` transition 200 ms on hover |

### Shared motion tokens (`motion-tokens.ts`)

| Token | Value |
|---|---|
| `duration.instant` | 0.12 s |
| `duration.fast` | 0.2 s |
| `duration.normal` | 0.42 s |
| `duration.slow` | 0.68 s |
| `easing.quick` | `[0.16, 1, 0.3, 1]` |
| `easing.smooth` | `[0.22, 1, 0.36, 1]` |
| `springs.snappy` | stiffness 520, damping 34, mass 0.8 |
| `springs.gentle` | stiffness 220, damping 28, mass 0.9 |

---

## 2. Ranked critique of weak, confusing, information-poor, or excessive sequences

### Critical

**C1. AtlasConstellation continuous scroll listener.**
The canvas binds `window.addEventListener("scroll", redraw, { passive: true })` to update camera tilt on every scroll event. This fires on every pixel of every scroll anywhere on the page — including inside the EvidenceJourney section that the atlas is not even visible in. Combined with the rAF ambient rotation, the atlas is effectively always rendering. On mobile or low-end hardware this is a measurable battery and performance cost for a section that occupies the top ~600 px of a long page. The scroll-driven tilt is subtle enough that most users will not perceive it.

**C2. HolographicArchive never stops its rAF loop (non-reduced-motion).**
Line 594: `if (!reducedMotion) start();` at the end of every `render()` call means the canvas runs a perpetual animation loop even when nothing is changing and the pointer is static. The `IntersectionObserver` and `visibilitychange` guards are present but the continuous restart overrides them within the same render pass. The drift sine wave (`time * 0.0001`) changes imperceptibly. The particle fragments (`time * 0.009`) run indefinitely for 2–3 columns.

**C3. EvidenceJourney uses ~30 useTransform calls without memoization guards.**
Each `useTransform` creates a new `MotionValue` subscription. With 30 of them all wired to the same `scrollYProgress`, every scroll event triggers 30 subscription callbacks in the same microtask. The transforms are pure interpolations so Framer Motion's internal batching mitigates this, but the sheer count is above the threshold where browsers may drop frames on mid-range Android devices during fast scrolling.

### High

**H1. AtlasField ambient rotation is too fast.**
At `ROTATION_PER_MS = 0.00008` (4.6°/s), the atlas on `/explore/` spins visibly faster than the homepage version (1.9°/s). This creates brand inconsistency — the same conceptual object moves at different speeds on different pages. The faster rate also makes it harder to read node labels before they rotate away.

**H2. HeroPassport auto-advance carousel.**
The 5-second auto-advance interval with no visible progress indicator violates the "scroll should control narrative transformations" constraint. The carousel cycles through datasets automatically even when the user is reading the current card. There is a pause-on-hover/focus mechanism, but no timer bar or countdown, so the switch feels arbitrary. Touch users cannot pause.

**H3. ArchivePortal 9-plate parallax is ornamental.**
The 9 `<i>` elements each compute 5 motion values (x, y, z, rotateY, opacity) — 45 motion value subscriptions for an arrangement of translucent rectangles that conveys no data. The plates represent "stacked records" metaphorically, but with no labels, no interaction, and no connection to actual delisted records, they are purely decorative parallax.

### Medium

**M1. Two homepage implementations coexist.**
`ArchiveHome.tsx` and `ProductHome.tsx` both render scroll-driven cinematic stages at `/`. Whichever is not active still ships in the bundle. The two use different scroll offsets, different canvas implementations (NetworkField vs AtlasConstellation), and different motion patterns, creating maintenance divergence.

**M2. SpecimenLattice canvas is aria-hidden with no visible fallback above lg.**
The SpecimenReport with `visual="sr"` is correctly placed as the screen-reader surface, but between 800 px and 1024 px (lg breakpoint), the lattice canvas renders as the visible element while the sr-only list is hidden. If the canvas fails to render (WebGL context loss, etc.), this viewport range shows nothing.

**M3. DecayBoard intro sequence is front-loaded.**
The sweep (180 ms) + grow (240 ms) + stagger (600 ms) + detail (220 ms) totals ~1.24 s before the board is fully visible. For a returning user who has seen the animation before, this is a noticeable delay before the content is usable.

**M4. Coverage gauge and bar animations fire on every visit.**
CoverageMethod and SpecimenReport both use `useInView({ once: true })` counters, but the animations still run every time the page loads. For a research tool where users may visit the homepage multiple times per session, the novelty value diminishes quickly.

### Low

**L1. `caret-blink` is infinite with no purpose gate.**
The terminal caret animation in the search bar blinks continuously even when no terminal UI is active. It is small and CSS-only, so the cost is negligible, but it adds visual noise.

**L2. Skeleton shimmer animations have no maximum duration.**
`wbShimmer` (1.4 s), `breathe` (1.8 s), and `loadSlide` (1.4 s) all loop infinitely. If a data fetch stalls, the skeleton shimmers indefinitely. A timeout fallback to static state would be more respectful.

**L3. `explore.module.css` reduced-motion override is local.**
The explore page adds its own `animation: none !important; transition: none !important` blanket that duplicates the global one in `globals.css`. This is harmless but redundant.

---

## 3. Decision for each major sequence

| Sequence | Decision | Rationale |
|---|---|---|
| **AtlasConstellation (homepage)** | **Retain scroll control** for camera tilt; **simplify** the scroll listener to only fire when the section is in the viewport (IntersectionObserver gate). Remove the continuous ambient rotation or reduce it to the NetworkField rate (0.000014 rad/frame). Add pause on tab hidden. | The globe is the hero identity element. Scroll-driven camera tilt is the right mechanic. But the continuous global scroll listener and the faster-than-necessary rotation waste resources. |
| **EvidenceJourney scroll composition** | **Retain scroll control.** Reduce the useTransform count by collapsing the two evidence back/mid layers into a single CSS `transform` driven by one progress value instead of 8 separate motion values. | The three-chapter scroll narrative is the conceptual centrepiece. The transforms are well-scoped and scroll-locked. The only issue is density of subscriptions. |
| **ArchivePortal parallax plates** | **Simplify.** Reduce from 9 plates to 3–5. Replace per-plate JS transforms with a single CSS `transform` on the group driven by one `useTransform` progress value. The text parallax is good — retain it. | The metaphor of stacked plates is sound but 9 plates × 5 motion values = 45 subscriptions for pure decoration. Fewer plates sell the same metaphor. |
| **AtlasField (explore page)** | **Retain** drag interaction and auto-spin. **Simplify** by reducing `ROTATION_PER_MS` to match the homepage rate (0.000033 or lower). Add IntersectionObserver pause (already present) and confirm the idle timeout properly stops rAF. | The explore atlas is a functional research instrument. Drag orbit is core. Auto-spin is acceptable ambient life but should be slower and should fully stop its rAF loop when idle rather than continuing to render identical frames. |
| **HolographicArchive** | **Simplify.** Gate the rAF loop to stop when pointer is static and progress has not changed for >500 ms. In `afterimage` mode where atlas alpha is 0.045, skip the atlas draw entirely. | The dual-field transition effect is ambitious but the always-running rAF loop is the most expensive animation in the codebase. The visual effect is good enough to retain, but the render loop must be gated. |
| **HeroPassport auto-advance** | **Replace with finite automatic motion.** Remove the 5 s auto-advance interval. If rotation is desired, add a visible progress bar and pause/play button accessible to keyboard/touch. Or: make it scroll-driven instead. | Auto-advance carousels violate the stated constraint that "scroll should control narrative transformations; automatic animation is acceptable only for low-amplitude ambient life." A dataset carousel is not ambient life. |
| **Problem rise stagger** | **Retain.** | Clean viewport-triggered entrance with `once: true`. Well-paced. Respects reduced-motion. |
| **SpecimenLattice scroll-driven canvas** | **Retain scroll control.** | Explicitly designed as "a mechanism the reader is turning rather than an animation playing at them." The docstring says this directly. This is the right approach. |
| **SpecimenReport sequential reveal** | **Retain.** Consider adding a `sessionStorage` flag to skip the animation on repeat visits within the same session. | The staggered reveal makes the struck-through checks legible one at a time. On repeat visits the novelty fades. |
| **HowItWorks scroll-pinned scene** | **Retain scroll control.** | Three-step sticky scene with AnimatePresence swap. Clean, well-scoped, respects reduced-motion. |
| **CoverageMethod gauge + bars** | **Add a small idle loop** for the gauge to pulse subtly after the initial count-up completes, or make the gauge static after the animation. Currently it is static after animation, which is fine. **Retain.** | The count-up is a legitimate information-reveal (showing how the score is composed). The `whileInView` bars are clean. |
| **DecayBoard intro** | **Simplify.** Provide a `skip` option or reduce the stagger duration to 400 ms total. If the user has visited `/delisted/` in this session, skip directly to the assembled state. | 1.24 s of mandatory intro animation on a functional page delays task completion. |
| **MarketplacePreview layout animation** | **Retain.** | Layout animations on filter change are appropriate state communication. |
| **NetworkField (old ArchiveHome)** | **Remove** the component or gate it behind the route that uses it. If ArchiveHome is dead code, remove both. | Two atlas canvases in the bundle is waste. |
| **Skeleton shimmers** | **Retain** but add a 10 s maximum before transitioning to a static skeleton. | Infinite shimmer with no timeout is a minor accessibility concern under sustained network failure. |
| **CSS dialog/sheet animations** | **Retain.** | 240 ms sheet-in and 280–350 ms fade/slide in Chronicle are brief, purposeful state transitions. |

---

## 4. Information each sequence should reveal at beginning, midpoint, and end

### AtlasConstellation

| Point | Information revealed |
|---|---|
| **Beginning (0%)** | A spatial field of named data points exists. Points are connected by shared publishers. One point is selected (glow + label). The domain rail shows available filters. |
| **Midpoint (scrolled ~50% through observatory)** | Camera has tilted to show depth. The user can see which clusters share a publisher. The selected record's metadata is visible in the focus panel. |
| **End (scrolled past)** | The atlas is above the fold and static. The user's selection persists in the focus panel. The search dock is visible. |

### EvidenceJourney

| Point | Information revealed |
|---|---|
| **Beginning (Ch 1 — Source, 0–33%)** | A network of sources exists. Seven nodes connect to a centre. Line-draw animation reveals the connections progressively. The chapter label reads "01 / Source." The heading says "Follow the signal." |
| **Midpoint (Ch 2 — Evidence, 33–66%)** | A single evidence document card is centred. It shows: name, publisher, platform, domain, licence, coverage band + percentage, rows, size. Two parallax layers behind it suggest depth/layers of provenance. Chapter label reads "02 / Evidence." |
| **End (Ch 3 — Perspective, 66–100%)** | Three candidate cards spread from centre. Each shows: name, publisher, platform, coverage band + bar, licence. A "Compare N records" link is visible. Chapter label reads "03 / Perspective." The user understands: source → evidence → comparison. |

### ArchivePortal (Delisted section)

| Point | Information revealed |
|---|---|
| **Beginning (entering viewport)** | Stacked translucent plates appear, tightly grouped. Text is off-screen or faded. |
| **Midpoint (plates spreading)** | Plates have separated to suggest a physical archive. The heading "Sources change. Context should remain." is legible. The eyebrow reads "02 / Delisted." |
| **End (past section)** | "Enter the archive" link is visible. The user understands: some sources are no longer available, and Archivum preserves their last observed state. |

### HolographicArchive

| Point | Information revealed |
|---|---|
| **Beginning (progress ~0)** | Atlas network visible: nodes, edges, selected node with label showing name + coverage + platform. Reference grid visible. |
| **Midpoint (progress ~0.5)** | Handoff veil sweeps across. Atlas fades. Decay towers begin rising with staggered reveals. The dual-space (live atlas → delisted archive) transition is legible. |
| **End (progress ~1)** | Decay field dominant. Towers show: end-state dash patterns (gated/withdrawn/unreachable/superseded), relative height (coverage), echo rings (decay severity), trail lines (high-decay or selected). Selected tower shows name + state + last-confirmed date. |

### SpecimenLattice + SpecimenReport

| Point | Information revealed |
|---|---|
| **Beginning (entering viewport)** | The 3D lattice cage begins to assemble. Ring labels appear. Ghost rings show the full circle so missing arcs read as voids. |
| **Midpoint (scrolled to centre)** | Cage is fully assembled. Hovering a node shows: label, outcome (documented/reported/not_found), and the method sentence. The report card counter ticks up. |
| **End (past section)** | All 28 checks are visible. The total "X of 28 documented, Y%" is stable. The specimen record is complete. The user understands: this is what a coverage audit looks like. |

### HeroPassport

| Point | Information revealed |
|---|---|
| **Beginning (enters view)** | Card scales in. First dataset: name, publisher, platform, coverage score (counter animates up), licence, commercial terms, last updated, row count, lineage strip. |
| **Midpoint (auto-advance or dot click)** | Second dataset cross-fades in. The user sees: different datasets have different scores and licence terms. Indicator dots show position. |
| **End (hover/focus pauses)** | The user has seen 2–3 representative datasets. The passport format is established as a pattern they will encounter in the workspace. |

### DecayBoard

| Point | Information revealed |
|---|---|
| **Beginning (board intro)** | Columns sweep in from left. Each column grows upward. The board layout (cohort grouping, axes) becomes legible. |
| **Midpoint (stagger complete)** | All columns visible. Hovered column shows: name, end-state, last-confirmed date, decay index. Leader line connects to detail panel. |
| **End (interaction)** | Focused column is highlighted. Panel shows full record metadata. The user can compare relative decay severity across the cohort. |

---

## 5. Platform and accessibility requirements

### Desktop (>= 1024 px)

- All scroll-driven sequences use `position: sticky` pinned stages. Ensure `scroll-padding-top` (currently 88 px in `globals.css`) accounts for the fixed nav.
- Canvas elements (AtlasConstellation, AtlasField, SpecimenLattice, HolographicArchive, DecayBoard) must cap DPR at 1.5–2.0 (all currently do).
- Pointer-driven interactions (drag orbit, hover reticle, column hover) require cursor feedback (`cursor: grab/grabbing` — present).
- rAF loops must pause via `IntersectionObserver` + `document.visibilitychange`. **Current gaps**: AtlasConstellation does not gate its scroll listener; HolographicArchive restarts its loop unconditionally.

### Mobile (< 800 px)

- **EvidenceJourney**: The CSS module correctly un-stickies the stage below 800 px and forces `.layer { opacity: 1 !important; transform: none !important; }`. All three chapters render as stacked static content. Scroll animation is fully disabled. This is correct.
- **ArchivePortal**: The plates are pure parallax with no mobile breakpoint override. On small viewports the 9 animated `<i>` elements still compute 45 motion values for an effect that is barely visible on a 375 px screen. **Recommendation**: Hide the plate art below 800 px or use a static arrangement.
- **AtlasConstellation**: Canvas renders at full size. Node labels are clipped below 700 px (`w > 700` guard in the draw loop). Drag orbit requires `pointerType === "mouse"` guard — touch users cannot orbit. **Recommendation**: Allow touch drag or add swipe hint.
- **HeroPassport**: Auto-advance cannot be paused by touch (only hover/focus). **Fix**: Add a pause button or make the carousel swipeable.
- **AtlasField**: Limits to 60 nodes on mobile (`MOBILE_NODES = 60`). Good.
- **SpecimenLattice**: Not mounted below `lg` (1024 px). SpecimenReport renders as a collapsible list instead. Correct.
- **HolographicArchive**: No mobile-specific DPR cap or node reduction. The full 3D field renders on mobile. **Recommendation**: Reduce to a static screenshot or limit to atlas-only mode below 800 px.

### Keyboard

- **EvidenceJourney chapter dots**: Focusable buttons with `aria-label` and `aria-current="step"`. Pressing activates `scrollTo`. Good.
- **AtlasConstellation**: Canvas is `role="img"` with a descriptive `aria-label`. "Use the adjacent record selector for keyboard navigation." The `<select>` in the focus panel is the keyboard path. Good.
- **SpecimenReport**: Each check row has `tabIndex={0}`. Hover tooltip appears on `focus-visible`. Good.
- **HowItWorks steps**: Each step is a `<button>` that scrolls to the relevant position. Good.
- **DecayBoard**: Canvas with pointer-only interaction. **Gap**: No keyboard alternative for column selection. The adjacent panel list should be the keyboard path, but confirm it is.
- **AtlasField**: Canvas with pointer-only drag. **Gap**: No keyboard orbit control.
- **Skip link**: EvidenceJourney has `<a href="#workspace" className={styles.skipLink}>Skip to workspace</a>`. Good. The global skip link in `globals.css` targets `main`. Confirm both are present.

### Reduced motion (`prefers-reduced-motion: reduce`)

**Global blanket** (`globals.css`):
```css
*, *::before, *::after {
  animation-duration: 0.01ms !important;
  animation-iteration-count: 1 !important;
  transition-duration: 0.01ms !important;
  scroll-behavior: auto !important;
}
```
This kills all CSS animations and transitions globally. Framer Motion components must also check `useReducedMotion()`.

**Component-level checks**:
| Component | Uses `useReducedMotion()` | Behaviour when reduced |
|---|---|---|
| AtlasConstellation | Yes (via `media.matches` in draw loop) | Rotation stops; frame not requested when `animate` is false; scroll tilt still computed but no rAF loop |
| EvidenceJourney | Yes (`reduceMotion`) | Chapter dot scrollTo uses `behavior: "auto"`; no other reduced-motion guard — **relies on CSS module override** |
| EvidenceJourney.module.css | Yes | `.layer { opacity: 1 !important; transform: none !important; }` under `@media (prefers-reduced-motion: reduce)` — all scroll transforms killed via CSS |
| ArchivePortal | Yes | Sets static inline styles instead of motion values when `reduced` is true |
| ProductHome | Yes | Disables Atlas pause/resume button; shows "Reduced motion" label |
| HeroPassport | Yes | Skips initial animation; disables auto-advance interval; skips counter animation |
| Problem | Yes | All `rise()` calls pass `initial: false` |
| SpecimenLattice | Yes | Progress fixed at 0.5; ring easing skipped (instant snap); scroll subscription not created |
| SpecimenReport | Yes | All delays set to 0; stagger disabled; counter shows final value immediately |
| HowItWorks | Yes | AnimatePresence `initial={false}`; arc SVG offset set to 0; scroll uses `behavior: "auto"` |
| CoverageMethod | Yes | Bars start at final width; counter shows final value |
| HolographicArchive | Yes | Pointer parallax snaps; drift zeroed; particle fragments skipped; mode "sequence" shows end state (progress 0.94) |
| MarketplacePreview | Yes | Layout animation disabled (`layout={false}`); initial animation disabled |
| DecayBoard | Yes | Present in hook |
| AfterimageIndex | Yes | Present; `scrollIntoView` uses `behavior: "auto"` |
| AtlasField | Yes | Present in hook |

**Gaps**:
- EvidenceJourney's JS-side `reduceMotion` is only used for the chapter dot `scrollTo` behavior. All actual animation disabling comes from the CSS module. If a future refactor removes the CSS override but keeps the JS transforms, the reduced-motion path would break. **Recommendation**: Add `reduceMotion` guards to the `useTransform` outputs (return static values when reduced).
- No component verifies that the reduced-motion global CSS blanket is loaded. If `globals.css` is tree-shaken or loaded after component CSS, the blanket might not apply. **Recommendation**: Each scroll-driven component should independently respect `useReducedMotion()`.

### Tab visibility (`document.visibilityState`)

| Component | Pauses on hidden tab |
|---|---|
| AtlasConstellation | Yes — checks `document.hidden` in the animate guard |
| NetworkField | Yes — `document.addEventListener("visibilitychange", redraw)` |
| AtlasField | Yes — `runningRef` gated by `!document.hidden` |
| SpecimenLattice | Yes — IntersectionObserver + visibilitychange |
| HolographicArchive | Yes — `state.documentVisible` checked |
| DecayBoard | Likely yes (standard pattern in the codebase) |
| HeroPassport | **No** — the `setInterval` for auto-advance does not check `document.hidden`. The carousel advances in background tabs. |
| Skeleton shimmers (CSS) | Not applicable — CSS animations are paused by browsers when tab is hidden |

---

## 6. Recommended timing/easing hierarchy

### Easing

| Name | Value | Use for |
|---|---|---|
| **archivum** (primary) | `cubic-bezier(0.22, 1, 0.36, 1)` | All scroll-driven transforms, entrance animations, bar fills, fade-in/out. This is the brand easing already in `motion-tokens.ts` as `easing.smooth` and in `globals.css` as `--ease-archivum`. **Standardise on this single curve.** |
| **quick** | `cubic-bezier(0.16, 1, 0.3, 1)` | Button press feedback, tooltip show, small UI state changes. Already in `motion-tokens.ts` as `easing.quick`. |
| **linear** | `linear` | Only for: scroll-progress interpolation (useTransform does this by default), continuous canvas rotation (already linear). |

**Remove or consolidate**: The codebase uses `ease-in-out` for skeleton shimmers. Replace with `archivum` for consistency, or keep `ease-in-out` only for symmetric looping animations (shimmer, breathe).

### Duration

| Tier | Duration | Use for |
|---|---|---|
| **Instant** | 100–150 ms | Hover states, button press, focus ring, tooltip appear, checkbox toggle. Use `motionTokens.duration.instant` (120 ms). |
| **Fast** | 180–250 ms | Panel open/close, dropdown, tab switch, dialog sheet-in, reticle reveal. Use `motionTokens.duration.fast` (200 ms). |
| **Normal** | 350–450 ms | Entrance animations (`whileInView`), AnimatePresence swaps, bar fill, card fade. Use `motionTokens.duration.normal` (420 ms). |
| **Slow** | 600–700 ms | Counter count-up, complex layout transitions, stagger totals. Use `motionTokens.duration.slow` (680 ms). |
| **Scroll-driven** | N/A | No duration — driven by scroll position. The `useTransform` input ranges define the scroll-distance over which the animation plays. Keep input ranges between 10–25% of total scroll height for comfortable pacing. |

### Springs

| Name | Config | Use for |
|---|---|---|
| **snappy** | stiffness 520, damping 34, mass 0.8 | Panel transitions, tray open/close, layout shifts. |
| **gentle** | stiffness 220, damping 28, mass 0.9 | Larger element movements, page transitions. |

### Canvas ambient rotation

Standardise all atlas/network canvases to **0.000020 rad/frame** (~1.15°/s at 60 fps). This is slow enough to read labels, fast enough to signal life. The current spread (0.000014 → 0.000033 → 0.00008) is inconsistent.

### Stagger

- **List items**: 40–60 ms between items. Maximum total stagger: 500 ms (cap at ~8–10 items, then batch the rest).
- **Section reveals**: 60–80 ms between sections.
- **Sequential check reveal** (SpecimenReport): 45 ms is good. Do not exceed 50 ms per item for 28 items.

### Reduced-motion overrides

All of the above collapse to: **0 ms duration, no spring, no stagger, final state immediately visible.** Scroll-driven transforms return their end-of-range value. Canvas ambient rotation stops. Counters show final values. The global CSS blanket handles CSS animations; each component handles its own Framer Motion values via `useReducedMotion()`.
