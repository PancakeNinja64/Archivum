# Visual critique — Archivum product redesign

Session: Opus 4.6, 2026-09-14.
Pages inspected: `localhost:3130/` and `localhost:3130/delisted/` at desktop (1024×768) and mobile (375×812).

---

## 1. Strongest visual composition for a new Delisted hero and interactive archive field

### What works now

The headline **"The source disappears. *The record remains.*"** is the strongest copy on the site. The italic Instrument Serif on the second line lands the gravity immediately. The stats row (96 records / 4 observed states / archive date) grounds the poetic headline in verifiable fact, which is exactly the product's promise. The pointer-driven perspective tilt on the archive field is a good instinct — it makes the archive feel inhabited rather than displayed.

### Where the composition falls short

**The field cards are too small to read.** At desktop the cards are 82–126 px wide. Record names truncate after two words; state badges are 8 px mono text. A first-time visitor cannot tell what they are looking at until they hover, and hover reveals nothing on touch devices. The spatial drama of the 3D field is undermined by the fact that its content is illegible.

**The focus overlay competes with the field behind it.** The 330 px `.focus` panel lands at dead centre of the card arrangement, covering the very thing the user was scanning. It should pull to one side or expand outward from the selected card's position.

**No spatial entry.** The cards are already in position when the page paints. The "archive opens" moment — the event that makes the visitor feel they have stepped into a vault — is missing. A staggered appearance from a collapsed stack (all cards at z = 0, opacity = 0) fanning to their positions over 700–900 ms with the Archivum ease would establish the spatial identity the page needs.

**The dark-to-light cut is unmediated.** The dark hero field ends and the light register begins with no transitional zone. A full-width gradient band — dark-to-light over ~120 px — where the timeline overview (the SVG fingerprint) sits at slight `rotateX(3deg)` before settling flat into the register would make the page feel continuous.

### Recommended composition

```
[Full-bleed dark hero: headline centred, stats below]
        ↓
[Spatial field with larger cards (140–180 px wide)]
[Focus panel pulled to the right column, not overlaying the field]
        ↓
[Gradient bridge: dark → light, tilted SVG overview]
        ↓
[Light register: search, filters, record list, dossier]
```

---

## 2. What should move in 3D on the homepage, with spatial transitions and pacing

### Observatory → EvidenceJourney departure (scrollY 0–800)

The Atlas constellation stays pointer-driven (drag to orbit). Do not convert it to scroll-driven. Add a subtle Z-departure as the observatory scrolls out of view:

| Property | Start (scrollY = 0) | End (scrollY ≈ 700) | Easing |
|---|---|---|---|
| Constellation `scale` | 1 | 0.92 | ease-out |
| Constellation `translateZ` | 0 | −60 px | ease-out |
| Headline `translateY` | 0 | −1.15× scroll | linear (faster than scroll) |

This primes the visitor for the dimensional narrative ahead. The search dock and domain rail stay entirely static — they are functional controls, not scenery.

### EvidenceJourney (260 svh scroll, sticky stage at top: 64 px)

**Chapter 1 — Source (0–0.33 progress):**
Connection paths draw in via `pathLength 0 → 1` over 0–0.18. Nodes are static positionally but gain opacity 0 → 1 over 0.04–0.12. The BrandMark at centre needs a single radial pulse — a 4 px box-shadow in Signal Blue — timed to pathLength reaching 1, then dissipating over 300 ms. The network scales from 1 → 0.82 and tilts `rotateX(0 → 18°)` as it exits. This is already implemented and correctly paced.

**Chapter 2 — Evidence (0.33–0.66):**
The archival document surface lifts forward from `rotateX(−14°)` to `rotateX(0°)` over 0.28–0.46, arriving square-on at the user. Two depth planes behind the document separate in Y (0 → −12 px) and scale (1 → 0.96) over 0.42–0.62, creating a layered parchment effect. This is already implemented. The timing feels right — the document should feel monumental and slow, like pulling a folio from a drawer.

**Chapter 3 — Perspective (0.66–1):**
Candidate cards fan in from slight `rotateX(−10°)` to `rotateX(0°)`. Each card should have a 0.03 progress stagger so they arrive sequentially left-to-right rather than simultaneously. The Compare CTA fades opacity 0 → 1 at progress 0.85–0.95.

**Chapter navigation dots:** Add a vertical progress bar alongside the dots — a 2 px line with Signal Blue fill tracking `scrollYProgress`. This gives the user a spatial progress cue during 2000 px of scroll.

### EvidenceJourney → Research (hard cut)

No transition. The dark sticky stage releases; the light research section appears. This is correct — the abrupt shift from darkness to light reinforces the copy: **"The spectacle ends. The evidence stays."** A smooth crossfade here would dilute the message.

### Research section (no 3D scroll motion)

The paper stack with `rotateX` and `rotateZ` transforms driven by scroll is decorative and not part of the user's reading flow. **Remove the scroll-driven transforms on the paper stack.** The three numbered workflow cards (Follow the evidence / Keep your perspective / Make the differences clear) are functional navigation — they should not participate in motion. A subtle `fadeUp` on intersection is sufficient.

### ArchivePortal (below research)

The 9-layer fan is the right concept but under-expressed. Current Z spread goes from `−index*10` at progress 0 to `−index*35` at progress 1. Triple the final spread to `−index*90` for a more dramatic tunnel opening. The "THE RECORD REMAINS" text should emerge from `translateZ(−200px), opacity(0)` to `translateZ(0), opacity(1)` as the layers spread, creating the sense that the text was always there, behind the records, waiting.

---

## 3. What should stay static for usability

| Element | Reason |
|---|---|
| Navigation bar | Fixed anchor for site-wide wayfinding. Never transforms. |
| Search dock (homepage) | Primary research entry point. Must stay accessible during any scroll position. |
| Domain filter rail | Clickable filter controls. No animation beyond `color` transitions. |
| Record focus panel (homepage + Delisted) | Selected record details must be readable at all times. |
| EvidenceJourney skip link | "Skip to workspace →" must remain operable for keyboard navigation. |
| Chapter navigation dots | Clickable scroll-jump targets within EvidenceJourney. Fixed in the sticky stage. |
| Delisted register: search, filters, record list, dossier | Research tools. Zero scroll-driven motion. Subtle `fadeUp` on initial intersection only. |
| All form controls site-wide | Inputs, dropdowns, buttons, select elements. |
| Footer | Static. |
| Illustrative-mode disclaimers | Must remain readable and never animated away. |

---

## 4. Five highest-value changes, ranked

### 1. Verify and fix EvidenceJourney rendering at desktop

**Problem:** The EvidenceJourney section occupies 1997 px of vertical space (260 svh). The sticky stage has correct computed styles (`position: sticky; top: 64px; width: 1024px; height: 704px; background: rgb(12, 13, 15)`), and DOM inspection confirms all three chapter layers exist with correct opacity and transform values. However, screenshots from the preview browser show a blank mineral-coloured void for the entire section. The stage does render briefly when scrolled to via native scroll events, but the content appears at a fraction of the expected viewport size.

**Why this is #1:** This section is the centrepiece of the homepage narrative. If it renders as ~2000 px of blank space in any real browser, the entire product introduction collapses. There may be a compositing bug (z-index, stacking context from `overflow: clip` on `.visual`, or a parent creating an unexpected containing block for sticky), or this may be purely a preview-browser limitation. Either way, it must be verified in Chrome, Safari, and Firefox before shipping.

**Action:** Open the site in a real browser. If the blank void reproduces, investigate: (a) whether `overflow: hidden` on `.observatory` creates a scroll container that traps the sticky child, (b) whether the wrapper `<div id="evidence-journey">` without explicit `height`/`position` properties collapses, or (c) whether `overflow: clip` on `.visual` interacts badly with `position: sticky` on `.stage`.

### 2. Enlarge Delisted archive field cards with an entry animation

**Problem:** Cards at 82–126 px are too small for content. Names truncate; state labels are 8 px mono. The field arrives fully spread on page load — no spatial event.

**Action:** Scale card base width to `clamp(130px, 11vw, 180px)` and height proportionally. Add a CSS `@keyframes` entrance: all cards start at `translate3d(0, 0, 0); opacity: 0`, then fan to their positions over 700 ms with a `calc(var(--i) * 50ms)` stagger, using the Archivum ease. Gate behind `prefers-reduced-motion: no-preference`. This single change transforms the page from "archive dashboard" to "spatial archival experience."

### 3. Add a spatial bridge between the Delisted hero and register

**Problem:** The dark 3D spatial field cuts to a flat light register with no mediation. The two halves feel like separate pages.

**Action:** Insert a 120–180 px gradient band (`background: linear-gradient(to bottom, #0c0d0f, var(--background))`) between the hero section and the register. Place the SVG timeline overview within this band at `rotateX(3deg)` with a subtle scroll-driven flattening to `rotateX(0deg)`. This physically bridges the dark spatial world and the light reading world.

### 4. Add scroll-driven Z-departure to the observatory

**Problem:** The observatory, the site's first impression, scrolls away with no depth. The constellation and headline just translate up at scroll speed, same as any flat page.

**Action:** On the observatory section's exit (scrollY 0–700), apply `scale(0.92)` and `translateZ(−60px)` to the constellation, and move the headline at 1.15× scroll speed. Use `useScroll` + `useTransform` in ProductHome. Ensure the search dock and domain rail are excluded from these transforms (they are positioned absolutely and need not be children of the animated container). Gate behind reduced-motion check.

### 5. Increase ArchivePortal layer depth and add text emergence

**Problem:** The 9-layer fan spreads only `−index*35` in Z at full scroll. At this range the layers overlap so much they read as a single smeared rectangle. "THE RECORD REMAINS" sits below the layers as a flat label.

**Action:** Increase final Z spread to `−index*90`. Move "THE RECORD REMAINS" into the 3D scene with `translateZ(−200px); opacity: 0` at scroll start, transitioning to `translateZ(0); opacity: 1` as the layers spread. The text emerges from behind the archival stack. This costs one additional `useTransform` hook and no new DOM.

---

## 5. Accessibility and performance risks

### Accessibility

**Good:**
- `prefers-reduced-motion` is honoured in all three motion zones (EvidenceJourney falls back to flat vertical layout; ArchiveField flattens transforms and disables transitions; ArchivePortal uses static positions).
- Skip links are present ("Skip to content", "Skip to workspace →").
- `aria-live="polite"` announces chapter transitions in EvidenceJourney.
- Screenreader summary (`srSummary`) provides full semantic content for the visual narrative.
- The atlas rotation pause button is correctly disabled when `useReducedMotion()` returns true.
- The archive field's pointer-driven tilt checks `prefers-reduced-motion` before applying.

**Risks:**
- **Long scroll distance with no progress indicator.** The EvidenceJourney's 260 svh creates ~2000 px of scroll where keyboard-only users see the same sticky stage. Three small dots are the only visual progress. Add a vertical progress bar (Signal Blue, 2 px) alongside the dots, or ensure each chapter region is reachable via Tab → Enter on the dot buttons (already implemented via `onClick` → `scrollTo`).
- **Small text in archive field cards.** `.planeCode` and `.planeState` are 8 px mono. At 200% browser zoom, the card `overflow: hidden` clips content. Add `overflow: visible` or increase text to 10 px.
- **Contrast under `backdrop-filter`.** The record focus panel (homepage) and archive field focus card both use `backdrop-filter: blur()` over varying background content. When a bright node or connection line sits behind the blur, text contrast may dip below 4.5:1. Test with a contrast analyser at multiple scroll positions.
- **Archive field has no `role="grid"` or equivalent.** The spatial card arrangement is navigated by pointer; keyboard users must Tab through up to 14 buttons sequentially. Consider adding arrow-key navigation within the field (`role="grid"` or `role="listbox"` with `aria-activedescendant`).

### Performance

**Good:**
- EvidenceJourney uses only `useTransform` (no `useSpring`), computing transforms directly from `scrollYProgress` without per-frame React state updates. Chapter state changes are gated to fire at most twice during the entire scroll.
- `will-change: transform, opacity` is applied to animated layers, correctly hinting the compositor.
- Mobile (<800 px) and reduced-motion modes eliminate all scroll-driven transforms, perspective, and sticky positioning.

**Risks:**
- **`backdrop-filter: blur()` on overlapping layers.** The EvidenceJourney document surface, archive field focus card, and homepage record focus panel all use `backdrop-filter: blur()` with values from 9 px to 24 px. Each creates a GPU-composited layer. On mid-range mobile (iPhone SE, Pixel 6a), multiple blurred layers during scroll can drop below 60 fps. Profile in Chrome DevTools Performance panel with CPU 4× throttling. If drops occur, replace blur with solid semi-transparent backgrounds (`background: #101519e8` is already mostly opaque).
- **SVG `pathLength` on 7 simultaneous paths.** The Source network animates 7 `motion.path` elements via `pathLength` during scroll. Each triggers a repaint of the path's stroke. Profile on mobile Safari, which handles SVG repaints differently from Chromium. If jank appears, consider pre-rendering the network as a single animated path or using `stroke-dasharray`/`stroke-dashoffset` with CSS transitions instead of Framer Motion.
- **ArchivePortal wide scroll trigger.** The `useScroll({ offset: ['start end', 'end start'] })` fires for every pixel from the moment the section's top enters the bottom of the viewport until its bottom exits the top — a very wide range. Framer Motion's internal batching handles this efficiently, but on mobile Safari with 120 Hz ProMotion, this means double the callback frequency. Profile and add a `requestAnimationFrame` guard if needed.
- **Bundle weight.** Framer Motion v12 tree-shakes well, but confirm that only `motion`, `useScroll`, `useTransform`, `useMotionValueEvent`, and `useReducedMotion` are bundled — not the full `AnimatePresence`, layout animation, or gesture suite. Run `npx next-bundle-analyzer` to verify.
- **EvidenceJourney 260 svh on very tall screens.** On a 4K display (2160 px viewport height), 260 svh = 5616 px of scroll for three chapters. The motion ranges were designed for ~1400 px viewports. On tall screens the chapter transitions will feel sluggish. Consider capping the journey height at `min(260svh, 3200px)`.

---

*End of critique. No application code was edited.*
