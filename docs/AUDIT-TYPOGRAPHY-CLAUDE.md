# Archivum typography and hierarchy audit

Audit only — no code was changed. Date: 2026-09-15. Author: Claude Code (Opus 5), per `CLAUDE-AUDIT-TYPOGRAPHY-MISSION.md`.

Basis: the current working tree (uncommitted state of `redesign/product-workspace`, stylesheets last modified 2026-09-14 14:15–14:16) and the running preview at `http://localhost:3130/`, illustrative catalog. Rendered pages were measured at 1440×900 and 375×812 with a script that walks every visible text node and records its computed family, size, weight, tracking, and case ("runs" below). Routes covered: `/`, `/workspace/`, `/compare/`, `/collections/`, `/delisted/`.

## Measured baseline

| Route (1440×900) | Visible text runs | Distinct type styles | Runs under 11 px | Uppercase mono runs | Family split |
| --- | ---: | ---: | ---: | ---: | --- |
| `/` (home) | 165 | 30 | 56 (34 %) | 19 | sans 113 · mono 50 · serif 2 |
| `/workspace/?dataset=…` | 324 | 25 | 98 (30 %) | 26 | sans 103 · **mono 221 (68 %)** |
| `/compare/?datasets=a,b,c` | 188 | 17 | 13 (7 %) | 14 | sans 135 · mono 53 |
| `/collections/` (empty) | ~40 | 12 | 6 | 6 | sans-dominant |
| `/delisted/` (96 records) | 950 | 17 | 419 (44 %) | 30 | sans 530 · mono 419 · serif 1 |

Where the three faces are used today (source of truth: the stylesheets):

- **Geist Sans** — everything else, including all display headings after Codex's 14 Sep pass (`--wb-display` in the workbench, `.title`/`.copy h1`/`.ledgerHead h2` in Delisted, `.sceneCopy h2`/`.documentTitle`/`.candidateTitle` in the journey). Display weights in use: 400, 430, 440, 450, 500, 600. Display tracking in use: −0.065, −0.055, −0.05, −0.045, −0.04, −0.035, −0.02 em.
- **Geist Mono** — eyebrows, labels, captions, footers, counts, dates, publishers, coverage figures, table headers, badges' neighbours. Sizes: 8, 9, 10, 10.5, 11, 11.5, 12, 13, 14, 15, 22, 24, 44 px.
- **Instrument Serif** — only the italic second line of three headlines: home `.researchCopy em` ("Inspect the record."), home `.archiveCopy em` ("Context should remain."), Delisted `.copy h1 em` ("The record remains."). Everything else that was serif on 13 Sep is now sans.

The approved wordmark is an image (`BrandWordmark`) and is untouched everywhere; nothing in this audit concerns it.

---

## 1. Ranked problems

Ranked by how much they cost a researcher reading evidence, then by how visible they are.

### P1 — Mono is doing the sans's job on the desk (`/workspace/`)

- **Where:** `desk.module.css` `.eyebrow`, `.rowMeta`, `.pill`, `.chip small`, `.filtersDetails > summary > span`; `inspector.module.css` `.facts dt`, `.eyebrowRow`, `.sectionCounts`, `.drawerTitle small`, `.checkResult`, `.stageMeta`, `.versionNumbers`, `.table th`, `.legend`, `.licenceMeta`, `.kbd`; `tray.module.css` `.label span`, `.actions > span`.
- **Measured:** 221 of 324 visible runs on the record desk are monospace; 92 runs at 11 px and 52 at 10.5 px. Every label, every count, every date, every publisher line, every result word ("Documented") is mono.
- **Why it matters:** mono was meant to mark *machine-derived* values — identifiers, hashes, exact numbers. When labels, prose captions, publishers, and results are also mono, the mark stops meaning anything, and the desk reads as a terminal rather than a reading surface. It also costs legibility: Geist Mono at 10.5–11 px has wide, evenly spaced glyphs that fatigue faster than sans at the same size, and the list rows (`.rowMeta`) put four mono facts on two lines under every name.
- **Fix direction:** keep mono for slugs, hashes, SPDX identifiers, schema field names, sample-cell values, and the large coverage readout; move labels, captions, publisher lines, and result words to Geist Sans (see the policy in §2). Mono share should fall from ~68 % to ~20 % without removing a single fact.

### P2 — The home page is set in a specimen-sheet scale: a third of its text is under 11 px

- **Where:** `ProductHome.module.css` `.topline`/`.sectionLine` (10 px, 8 px at ≤ 800), `.domainRail>span` (9), `.focusTop` (9), `.focusFacts>span` (9 px sans labels "Documented context", "Declared licence"), `.publisher` (10 mono, 8 at ≤ 800), `.description` (11), `.sceneControls` (9/8), `.dockLabel small` (9/8), `.stageFoot` (9/8), `.steps` (9), `.workflow>a>span` (9), `.eyebrow` (9), `.sheetHeader`/`.sheetColumns`/`.sheetFoot`/`.sceneCaption` (8), `.archiveArt>span` (9/8); `EvidenceJourney.module.css` `.sceneCopy > span` (9), `.documentTag` (9), `.fieldLabel` (10 uppercase sans ×21), `.illustrativeNote` (10 px at 45–55 % opacity), `.sceneCopy p` (11 px body on a 900 px stage).
- **Measured:** 56 of 165 runs below 11 px; 21 runs of 10 px uppercase sans; 18 of 10 px uppercase mono. The smallest text on every page is the header's own "Public data intelligence" edition line (`Shell.module.css` `.edition`, 9 px mono, wrapped to two lines).
- **Why it matters:** the home is where the product argues it is serious about evidence, and its own factual copy — "Demonstration metadata · Not verified source records", "Illustrative evidence composition…", the coverage labels on the specimen — is the smallest, faintest text on the page. The cinematic scale of the headline (72 px) against 8–9 px footnotes is a fashion-editorial ratio (≈ 8:1), not a scientific one. The illustrative disclaimer being 10 px at 45 % opacity is the one place the product must not whisper.
- **Fix direction:** floor at 11 px for anything a person is expected to read, 12 px for disclaimers and captions, and drop the 8 px tier entirely. The stage keeps its drama through size *contrast in the headline*, not through shrinking everything else.

### P3 — Seven display trackings and six display weights: headings do not belong to one voice

- **Where:** `.title h1` 450 / −0.065 em (home); `.copy h1` 440 / −0.065 em (Delisted); `.sceneCopy h2` 430 / −0.055 em (journey); `.researchCopy h2`, `.ledgerHead h2`, `.dossierEmpty h2` 450 / −0.055…−0.04 em; workbench `.name` 450 / −0.05 em (record name), `.state h2` 500 / −0.04 em, `.blockHead h3` 450 / −0.035 em, `shelf .head h1` 500 / −0.045 em, `compare .head h1` **400** / −0.02 em, `desk .resultsTitle h1` 400 / −0.01 em, Delisted `.dossierName` **600**.
- **Measured:** the compare title ("3 records, side by side.") renders at 42 px weight 400 while the shelf title next to it in the nav renders at 42 px weight 500 with more than double the tracking; the Delisted dossier name is the only 600 on the product.
- **Why it matters:** these are the same kind of element (page or record title) on sibling routes. A researcher moving Workspace → Compare → Saved sees the product's voice change weight and tightness each time, which reads as three products. At 72–78 px, −0.065 em (−4.7 to −5.1 px) is also tight enough that "rr", "ea", and "ct" pairs begin to touch (visible in "perspective." and "remains.").
- **Fix direction:** two display steps only — see §2 ranges.

### P4 — Delisted's hero collides on phones: "disappears.*The*"

- **Where:** `ArchiveField.tsx` line 63 `h1` = `The source disappears.<br/><em>The record remains.</em>`; `ArchiveField.module.css` hides `br` under the phone breakpoint (computed `display: none` at 375 px), so the roman sentence and the italic serif sentence run together with no space.
- **Measured at 375 px:** h1 45 px / 440 / −2.9 px; the line reads "The source disappears.The" with the serif "The" fused to the full stop.
- **Why it matters:** it is the first headline on the archive's front door and the one place the serif is meant to be a considered accent. On desktop it is the strongest single typographic moment on the site; on a phone it looks like a bug.
- **Fix direction:** keep the `<br>` (or wrap the em in a block) at every width, or insert a real space before the `em`.

### P5 — Four different "label : value" idioms for the same kind of fact

- **Where:** workspace `.facts` (mono uppercase 10.5 px label above, sans 14 px value); Delisted `.fieldRow` (sans 13 px label left, value right, hairline between); home `.recordFocus .focusFacts` (9 px sans label above, 28 px sans figure / 12 px mono licence); journey `.documentFields` (10 px uppercase *sans* label above, 14 px *mono* value); home research specimen card (mono uppercase label above, mono value).
- **Why it matters:** the fact list is the product's atomic unit — publisher, licence, rows, dates, coverage. When the same fact is set four ways across routes, users re-learn the grammar on every page, and the eye cannot scan horizontally across surfaces. It also makes the journey's mono values ("academic", "medicalnlp") look like code when they are ordinary words.
- **Fix direction:** one idiom everywhere (proposed in §2): 11 px sans 500 uppercase label above, 14 px sans 400 value, mono only when the value is an identifier or number in a table.

### P6 — Register rows on Delisted speak in four voices per row, 96 times

- **Where:** `Chronicle.module.css` `.recordName` 14 px/500, `.recordMeta` 12 px, `.recordBadge` 11 px/500, `.recordDates` 9→10 px mono ("Last confirmed Jun 25, 2026 · Observed 3y 1m").
- **Measured:** 385 runs of 10 px mono on the page, 96 badge runs at 11 px 500; the register is 44 % text under 11 px.
- **Why it matters:** the register is the workhorse view; each row carries a name, a coloured state badge, a publisher/platform line, and a dates line in a fourth size and face. Scanning 96 rows for "which ones went unreachable last quarter" means reading the smallest, greyest line. The state badge — the most important fact — is the third-smallest element in the row.
- **Fix direction:** two voices per row (name 14/500; one 12 px meta line that includes the confirmed date), with the state as a coloured 11–12 px sans badge aligned right. Dates lose the mono.

### P7 — Truly empty: the Delisted dossier column before a selection

- **Where:** `ChronicleClient.tsx` `.dossierPanel` — measured **0 × 0 px** until a record is chosen; the `dossierEmpty` copy ("Every source has a history.") is in the DOM but not displayed at 1440 px.
- **Measured:** the list is 696 px wide inside a ~1300 px container; the right ~600 × 760 px is blank mineral.
- **Why it matters:** this is not calm space; it is a hole beside a dense list, and it holds the only explanation of what the dossier will show. (§3 lists what should occupy it.)

### P8 — Mono uppercase eyebrows are the product's most repeated device (89 runs across four routes)

- **Where:** every route: `.topline`, `.sectionLine`, `.eyebrow`, `.focusTop`, `.dockLabel small`, `.chapterTitle`, `.documentTag` (0.2 em tracking), `.ledgerHead > p`, `.overviewCaption`, workbench `.eyebrow`/`.pill`/`.facts dt`/`.table th`/`.groupRow th`, tray labels; header `.edition`.
- **Why it matters:** an eyebrow is a wayfinding device; it works when there are two or three per screen. With 19–30 per screen at 9–10.5 px and tracking from 0.04 to 0.2 em, they become texture, and the *real* wayfinding labels (section numbers, "In focus", "Field") no longer stand out. Uppercase mono at 9 px on a dark stage (`#a8adb4` on `#0c0d0f`) passes contrast but not comfort.
- **Fix direction:** one eyebrow style (11 px sans 500, 0.06 em, muted), and use it for section numbering only; table headers and fact labels get the label style, not the eyebrow.

### P9 — The serif is an editorial flourish used three times for two different reasons

- **Where:** home `.researchCopy em` "Inspect the record." (product section), home `.archiveCopy em` "Context should remain." (Delisted portal), Delisted `.copy h1 em` "The record remains." (archive front door). Italic Instrument Serif at 55–78 px.
- **Why it matters:** the italic turn-line is the single most recognisable fashion-magazine device. Used once, on the archive, it says "this is where the record is kept" — a real idea. Used again for "See the field. / *Inspect the record.*" it is decoration, and the mismatch (sans imperative, serif imperative) has no meaning a reader can recover. The home hero already has a better device for the second line: the silver colour shift on "A clearer perspective." — same face, different tone, still cinematic.
- **Fix direction:** keep the serif for the Delisted idea only (hero + the home portal that points to it, both saying "the record remains"), or drop it entirely; set every other second line in the same sans with the silver/graphite tone shift.

### P10 — Body copy on the dark stage is too small for its stage

- **Where:** `EvidenceJourney.module.css` `.sceneCopy p` 11 px / 1.7 on a 900 px sticky stage; `ProductHome.module.css` `.title p` 13 px right-aligned tagline ("Discover the source. / Understand the evidence. / Make your next move."), `.description` 11 px in the focus card, `.archiveCopy p` 13 px, `.workflow p` 12 px.
- **Why it matters:** the stage earns its height with one 45 px line and one 11 px paragraph — the eye has nowhere to rest between them; the paragraph is the part that explains the chapter. The journey chapters are the product's explanation of *how* evidence is assembled; they should be readable at arm's length.
- **Fix direction:** 15–16 px / 1.55 on the stage, max 44ch.

### P11 — Compare's sticky corner and "Field" column are the largest empty block on the desk

- **Where:** `compare.module.css` `.table thead th:first-child` — a ~250 × 160 px cell holding only "FIELD" (10.5 px mono uppercase) opposite three record headers.
- **Why it matters:** it is the anchor of the table and the first thing the eye lands on; the differences count and the legend for the evidence marks currently live in the toolbar and footer instead. (See §3.)

### P12 — Smaller consistency faults

- `Shell.module.css` `.edition` (9 px mono, two-line wrap "PUBLIC DATA / INTELLIGENCE") is the smallest text on every page and sits next to the wordmark; either 10.5 px on one line or removed.
- `EvidenceJourney.module.css` `.fieldValue` sets ordinary words ("academic", "medicalnlp" — also missing its separator) in 14 px mono; `.documentPublisher` is 13 px uppercase sans with 0.05 em tracking, a fifth label style.
- `ProductHome.module.css` `.focusFacts strong` is a 28 px sans figure while the same figure on the desk is a 44 px mono readout and on the journey a 10 px uppercase sans label ("extensive 95 %"): three treatments of the coverage number.
- `compare.module.css`: the mono meta line under each column title ("Meridian Health Data Collective · Academic · v5.0", `.column .meta`) and the corner "Field" eyebrow render **bold** (13 runs at weight 700) because they sit inside `<th>` elements and inherit the browser's default `th` bold — the only bold mono on the product, and unintended; the label/meta styles should set `font-weight: 400` explicitly.
- `desk.module.css` `.resultsTitle h1` "Research desk" is 22 px / 400 — the lightest heading on the site — beside a 10.5 px mono pill; the panel's title reads weaker than the filter labels beneath it.
- Home `.orbitLabel` "ATLAS" watermark at 142 px / 250 weight / 5 % opacity plus "EXPLORE THE CONNECTIONS" at 9 px — decorative; harmless, but it is another 9 px line.
- Mobile: `.topline > span:last-child { font-size: 0 }` hides the catalog mode label ("Illustrative catalog") on phones, leaving only "01"; the illustrative status should not disappear at any width.

---

## 2. Font-role policy (simplified) and ranges

Three faces, three jobs, no overlap.

| Face | Job | Never for |
| --- | --- | --- |
| **Geist Sans** | All reading and UI text: headings at every level, record names, body, labels, eyebrows, captions, buttons, badges, table text. | — |
| **Geist Mono** | Machine strings only: slugs, hashes, SPDX identifiers, schema field names and types, sample-cell values, code, and *tabular numbers in tables* (rows, bytes, dates in a column). The one display use: the large coverage readout. | Labels, eyebrows, captions, prose, publishers, result words, footers, counts inside chips. |
| **Instrument Serif** | One signature idea: "the record remains" (Delisted hero, and the home portal to it). Roman or italic, but the same choice in both places. | Any other heading; any UI text; anything under 40 px. |

Scale (desktop; phone in brackets). Six steps, not sixteen.

| Role | Size | Weight | Tracking | Line height |
| --- | --- | --- | --- | --- |
| Display (stage headlines) | 64–80 px [40–48] | 450 | −0.035 … −0.045 em | 1.0–1.05 |
| Page title / record name | 36–48 px [28–32] | 500 | −0.03 em | 1.05–1.1 |
| Section heading (h2/h3 inside a desk) | 20–24 px | 500 | −0.02 em | 1.15 |
| Row title / column title | 14–16 px | 500 | −0.005 em | 1.3 |
| Body | 14–15 px (stage: 15–16) | 400 | 0 | 1.55–1.65 |
| Label / eyebrow (uppercase) | 11 px (never below) | 500 | 0.06–0.08 em | 1.3 |
| Meta / caption / disclaimer | 12–12.5 px | 400 | 0 | 1.5 |
| Mono values (inline) | 12–13 px | 400 | 0 | inherit |
| Mono readout (coverage figure) | 36–44 px | 400 | −0.04 em | 1 |

Rules that follow from the table:

- Nothing rendered for a person to read is below 11 px; disclaimers and illustrative notices are 12 px at full opacity, never faded.
- Display tracking never tighter than −0.045 em; at 72–80 px that is about −3.5 px, enough for the cinematic set without letterpairs touching.
- One eyebrow style per product. Section numbers ("01 / Source") use it; fact labels use the label style; table headers use the label style without tracking games.
- Uppercase is a label signal, not a texture: at most one uppercase style visible in any 300 px of scroll besides table headers.
- Colour does hierarchy where size cannot: `--muted-foreground` for meta, `--foreground` for values, the accent for one interactive emphasis per block. The home hero already does this ("A clearer perspective." in silver) and should be the model for every two-line headline.

---

## 3. Empty versus calm

**Intentionally calm (keep):**

- The Atlas stage on the home page (`.spatial`, ~540 px tall): the orbit, the rail, and the focus card frame a real navigation object; the darkness around it is the product's depth.
- The evidence journey's sticky stage: the emptiness is the cinematic beat between chapters; the fix is the copy size (P10), not more objects.
- The workspace idle state ("Choose a record to read its evidence."): it explains the four tabs and the shortcuts; it is quiet on purpose and earns its 60 vh.
- The compare picker with fewer than two slugs, and the collections empty state's first screen: honest, short, actionable.
- The `<hr>`-and-rule rhythm inside the Delisted dossier and the workspace inspector: hairlines with 20–24 px air are the reading rhythm, not waste.

**Truly empty (fill with information, not ornament):**

1. **Delisted register, right column before selection** (P7; ~600 × 760 px at 1440). Occupy it with the state summary that the hero already computes — counts per observed state (unreachable / superseded / withdrawn / gated) as a small table, the archive date and observation window, a one-line legend for the badges, and the "Every source has a history" instruction currently hidden. When a search is active, show the count of matches per state instead.
2. **Compare's sticky corner** (P11). Put the comparison summary there: "25 rows · 18 differ", the evidence-mark legend (● documented · ◐ reported · ○ not found), and the "unknown ≠ zero" sentence that now sits in a 12.5 px footer 1,900 px below.
3. **Collections below the fold when empty.** After the two buttons there is nothing for the remaining ~500 px. Show *what a saved record will carry* (the four stored facts and the "coverage when saved" caveat) as a single ghosted row, and the three or four most-recently opened records from the workspace cache as "Recently inspected" — real, local, not invented.
4. **The dark bridge band between the Delisted field and the register** ("SPATIAL OVERVIEW ——— SEARCHABLE REGISTER", 9 px mono on a 60 px band). Either carry the state counts and archive date here at 12 px sans, or remove the band; a progress line with two 9 px labels is texture.
5. **Home research section right column at ≤ 1100 px** where the specimen card stacks and leaves the "Discover → Inspect → Compare" steps orphaned; the three workflow links below already carry the same content — one of the two should go.
6. **Workspace results column at ≥ 1440 px** when filters are folded: the column is 408 px and the rows use ~300 px; the coverage column could show the checked date (already in the row) aligned as a true column rather than folded into the mono line, which would fill the width with information a researcher scans for.

---

## 4. Recommendations that keep the sophistication

The direction — cold, precise, cinematic, restrained — is right, and most of it is already on the page. What makes it feel like an editorial rather than an instrument is not the scale of the headlines; it is the number of *small* voices around them. The recommendations below reduce voices without reducing drama.

1. **Let one headline carry the cinema per screen.** Keep the 72–78 px stage headline and the silver second-line device from the home hero; retire the italic serif turn-line except on the archive, where it names the product's idea. Everything else on the same screen sits in two steps: 15 px body and 11–12 px labels.
2. **Cut the eight-and-nine-pixel tier.** Move every 8–10 px run to 11 px (labels) or 12 px (captions). This is the single change with the largest effect on "serious research product": the footers, disclaimers, and specimen labels stop looking like colophon fine print. The stage keeps its proportions because the headline stays where it is.
3. **Give mono back its meaning.** Restrict it to identifiers, hashes, schema, samples, and tabular numbers. On the desk this turns the row metadata, fact labels, and result words back into sans; the coverage readout, content hash, and licence identifier remain mono and therefore *read* as evidence.
4. **One fact idiom, product-wide** (label above value, 11/500 uppercase sans over 14/400 sans). Apply it to the home focus card, the journey document, the workspace facts, the Delisted dossier, and the compare cells' detail lines. The compare table then needs no separate `groupRow` typography — the group header becomes the same label with a top rule.
5. **Unify display weight and tracking** to the two steps in §2. Pick 450 for the stage headlines, 500 for page/record titles and section headings; −0.04 em and −0.03 em respectively. The compare title stops being the light one; the dossier name stops being the bold one.
6. **Badges and states get one style.** Delisted's coloured state badge (11 px 500 sans) is good; use the same construction for "Illustrative catalog / Illustrative record" pills on every route (currently 10.5 px mono uppercase pills) so the illustrative status is read at the same weight as an observed state — it is one.
7. **Use colour for depth instead of opacity for de-emphasis.** Several disclaimers are 45–55 % opacity 10 px text (`.illustrativeNote`, `.orbitLabel`). Set them at 12 px in `--muted-foreground` at full opacity; restraint should come from tone, not from fading facts.
8. **Right-size the header edition line** to a single 10.5–11 px line or fold it into the wordmark's alt text; it is currently the smallest text in the product and sits next to the logo on every page.
9. **Fix the phone headline seam** (P4) before any other Delisted change; it is the one defect a visitor will notice in the first second.

None of this needs a new face, a new token, or a new component; it is a reduction in the number of type decisions from roughly sixty to about twelve.

---

## 5. Keep

- The wordmark as an untouched image, switching light/dark assets — correct, and immune to font fallbacks.
- The home hero: 72 px Geist at 450 with the silver second line, over the Atlas orbit. This is the product's best typographic moment and the model for second lines everywhere.
- The Atlas stage itself: rail on the left, focus card on the right, search dock below — hierarchy by position, not by more type.
- The three-chapter evidence journey headings ("Follow the signal / Bring the layers forward / See the choice in depth") at 45 px — the copy is good; only its body size needs to grow.
- The big mono coverage readout (44 px, `−0.06 em`) with "Documentation · extensive" beneath it: the one place mono at display size says "measured".
- The workspace record header: platform · publisher · version line, then the 46–52 px record name, then the clamped description, then a hairline fact grid — the order is right and matches how a researcher reads a record.
- Evidence drawers with numbered sections, per-check method text, and the shape-coded evidence marks (●/◐/○/–) with text labels — legible without colour.
- The comparison table's group rows, sticky field column, blue "differs" rail, italic "Not stated" for unknowns, and the explicit "no column is ranked" sentence.
- Delisted's coloured state badges and the dossier's label-left/value-right rhythm with hairlines (good rhythm; only the label style should change to the shared idiom).
- Hairlines (`--border`) as the primary structural device across every route; the product never needed boxes or shadows to organise itself.
- Every illustrative label that currently exists — the pills, the banner, the stage footer, the journey note — must survive any cleanup; the only change they need is size and opacity.
- The 44 px touch and keyboard affordances on the desk, and the honest empty states on Collections and Compare.
