# Homepage motion implementation

The homepage uses motion to explain the product, then hands the visitor to a conventional research workspace.

## Sequence

1. **Atlas** is an interactive canvas constellation. Records occupy a projected sphere, shared publishers form the only connection lines, pointer drag changes the view, and a native record selector provides the keyboard path. Rotation can be paused and stops when the scene is hidden or off screen.
2. **Source** draws the first evidence connections through a shallow 3D field with two reference rings.
3. **Evidence** brings an archival document forward while its supporting surfaces separate behind it.
4. **Perspective** flies three real candidates in from different axes, resolves them into readable columns, and links directly to comparison.
5. **Delisted portal** separates and reassembles archival planes as the next product chapter enters.

The `EvidenceJourney` occupies 260 small-viewport-height units on desktop (capped at 3,200 px on very tall displays). Its stage is sticky below the 64-pixel navigation. Every transform and opacity derives from one JS-observed scroll progress value: `useScroll` is passed through an identity `useTransform` so that Motion does not promote the opacity ranges to native `ViewTimeline` animations, whose range disagreed with the observer on this tall pinned section (wrong blend mid-sequence and start values reappearing past the end). The Archive Portal uses the same arrangement. Chapter controls land on the completed compositions at 12%, 50%, and 87% of the sequence; a vertical progress rail tracks the position, and a skip link bypasses the sequence. Natural scrolling reveals the transitions between them.

Chapter 1 carries a source ledger (record, publisher, platform, checked date). Chapter 3 brings the three candidates in sequentially and reveals the compare action once the sequence resolves. The Atlas canvas redraws on scroll only while it is on screen and the tab is visible.

There is no wheel interception, scroll lock, spring chase, artificial loading sequence, or infinite decorative animation. Motion does not run in the workspace, comparison table, or saved-record shelf beyond short state transitions.

## Mobile and reduced motion

Below 800 pixels and with `prefers-reduced-motion: reduce`, the sticky stage becomes normal document flow. Each chapter's number, heading and body render beside its own layer; the network, document, and candidate layers stack vertically with their scroll-linked values resolved to the finished state (lines drawn, cards in place, compare action visible). Perspective and smooth chapter jumps are removed; nothing depends on scroll position.

## Performance and evidence

The Atlas animation draws on one canvas and does not update React each frame. The evidence chapters use compositor transforms and threshold-only React state updates. Content uses actual record summaries passed from the page. Illustrative mode labels the scene in both visible copy and the screen-reader summary.

Integrated desktop, phone, and reduced-motion checks are recorded in `docs/VERIFICATION.md`.
