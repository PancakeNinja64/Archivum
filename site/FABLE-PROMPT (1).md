# BUILD TASK — Archivum website

You are building a seven-page static website. The full specification follows.

**Before you start, read these three things in order:**
1. The specification below, in full.
2. The reference appendices at the end — `types.ts` (the data contract) and `globals.css` (the tokens).
3. The repository at `https://github.com/PancakeNinja64/Archivum_Test`, which already contains every file listed in §0.5.

**Three rules that override anything you might otherwise assume:**

- **Do not regenerate the files in §0.5.** The logos, tokens, types, mock data, and API layer are finished and typechecked. They are in the repo. Import them.
- **The output must be a static export** (§9.5). No API routes, no server actions, no middleware. `npm run build` must emit `./out`.
- **`src/lib/mock-data.ts` is 164KB — do not read it or print it.** You never need its contents. Import from `@/lib/api/client` and use the function signatures in §4. A representative record shape is in Appendix C so you know what comes back.

Build the site. Where the spec does not specify, decide like a designer who knows the subject: this is a ratings agency for a technical audience, so density, precision, and real data beat decoration every time.

---

# Archivum — Website Build Specification

**Read this whole document before writing code.** It is self-contained; you do not need any prior conversation context.

---

## 0. What you are building

A seven-page marketing and product-preview website for **Archivum**, a data provenance and discovery platform for AI datasets.

**One-line positioning:** Archivum is a search engine and a credit rating agency for AI data, combined.

**The analogy that anchors everything:** Buying data for AI today is like buying a used car with no history report. You can see it, but you don't know if it was in an accident, who owned it, or whether it's legal to resell. Archivum is the history report.

**What the product actually does:** It indexes datasets that already exist publicly across Hugging Face, Kaggle, GitHub, and academic sources, then grades each one. Every dataset gets a report card — origin, creator, last update, licensing, commercial-use status, and a trust score out of 100 — plus a lineage trail showing every transformation from original source to the version you're about to download.

**Who it is for:** The site speaks primarily to AI/ML engineers and data engineers at early-stage AI startups (10–50 people) building LLM, agent, and RAG applications. Secondary audience: enterprise AI governance and compliance teams. Write for the first group; make the second group feel accounted for.

**Legal entity:** Archivum LLC. Use this in the footer and metadata. (If you find the string "Aureliun" anywhere in the existing codebase, it is stale — replace it.)

**Stage:** Pre-launch. There is no live backend. Every data-bearing surface uses mock data structured to be swapped for real APIs later (see §4). The primary conversion action is joining a waitlist.

---

## 0.5 What is already built — do not rebuild these

Nine files ship with this spec and are already in the repo. They are finished, typechecked, and correct. **Read them, use them, do not regenerate them.** Time saved here is time you spend on design and interaction, which is the only thing you are uniquely needed for.

| File | What it is |
|---|---|
| `public/logo-arch.svg` | The full ARCH wordmark, vector-traced from the original art. Uses `currentColor`. |
| `public/logo-mark.svg` | Compact mark — the A and its arc, for tight spaces and mobile nav. |
| `public/favicon.svg` | Rounded-square app icon, `#56B1F6` on `#0A0E14`. |
| `src/app/globals.css` | The complete token system. Every value is contrast-verified. **This file is authoritative — §3.2 below describes it, but the file wins.** |
| `src/lib/types.ts` | All domain types, `TRUST_WEIGHTS`, and filter/pagination shapes. |
| `src/lib/mock-data.ts` | Twenty complete datasets — lineage, versions, schema, sample records. |
| `src/lib/mock-dashboard.ts` | Ten activity events and nine watched datasets. |
| `src/lib/api/client.ts` | The only data module components may import. |
| `src/lib/api/adapters/mock.ts` | Filtering, sorting, faceting, pagination, artificial latency. |
| `next.config.ts` | Static-export configuration. **Do not modify — see §11.** |

**Data access rule:** import from `@/lib/api/client` only. Never import `mock-data.ts` directly in a component. The adapter boundary is what makes real APIs a one-file swap later.

The mock adapter delays 220–480ms on purpose. Build real loading skeletons — you will see them.

---

## 1. Existing codebase

A partial single-page version exists at `https://github.com/PancakeNinja64/Archivum_Test`. You are substantially rebuilding it. Reuse the stack and the two strong interactive components; replace the content architecture and the color system.

### Stack (keep exactly)

- Next.js 16.3, App Router
- React 19.2, TypeScript
- Tailwind CSS v4 — CSS-first config via `@theme inline` in `globals.css`, no `tailwind.config.js`
- Framer Motion 12
- `next-themes` for light/dark

### What exists and what to do with it

| File | Action |
|---|---|
| `src/app/globals.css` | **Rewrite the token block** per §3. Keep the paper-grain utility, `link-underline`, `caret`, and all `prefers-reduced-motion` blocks. |
| `src/app/layout.tsx` | Keep structure. Update metadata, entity name, theme colors. |
| `src/app/page.tsx` | Rewrite — new section order. |
| `src/components/ui/Section.tsx` | Keep. Add a `SectionEyebrow` variant if useful. |
| `src/components/ui/Button.tsx` | Keep, extend with `size` prop and `Link` support for internal routes. |
| `src/components/Lineage.tsx` | **Keep the engine, replace the data.** The SVG graph + hover-to-inspect pattern is correct. Node labels must change (see §5.4). |
| `src/components/Workflow.tsx` | **Keep the typing-terminal engine**, demote to the Documentation page. It is no longer a homepage headline. |
| `src/components/Nav.tsx` | Rewrite — must handle seven routes, not anchors. Needs a mobile menu. |
| `src/components/Footer.tsx` | Rewrite — new link columns, correct entity. |
| `src/components/Problem.tsx`, `Versioning.tsx`, `Enterprise.tsx`, `Ecosystem.tsx`, `Vision.tsx` | Delete or absorb. Their content model is a devtool story; the new story is discovery + grading. |
| `src/components/Logo.tsx` | Keep the component API. Replace the PNG with SVG (see §3.5). |
| `public/logo-arch.png` | Replace with SVG. |

---

## 2. Site architecture

Seven routes, in this order in the primary nav:

| Route | Page | Purpose |
|---|---|---|
| `/` | Home | Positioning and conversion |
| `/explore` | Explore Marketplace | Browse and filter the indexed dataset catalog |
| `/datasets/[slug]` | Dataset Page | The full credibility report for one dataset |
| `/docs` | Documentation | Integration guides, API, trust score methodology |
| `/pricing` | Pricing | Three tiers |
| `/publish` | Publish Dataset | Submission flow for dataset authors |
| `/dashboard` | Dashboard | Monitoring view — mocked UI shell, no auth |

**Nav treatment:** All seven surfaces are reachable from the primary navigation. Desktop nav: `Explore · Docs · Pricing · Publish · Dashboard`, then the theme toggle and a primary `Join the waitlist` button. Dataset pages are reached from Explore and from the homepage preview, not from the nav. Below `lg`, collapse to a full-height drawer with the same order. There is no login button; there is no auth.

**Every CTA resolves.** No dead `#` anchors anywhere. Primary CTA is "Join the waitlist," which opens a modal with an email field, validates format, and shows a success state. It writes nothing to a backend — stub the submit handler with a clear `TODO: connect to waitlist backend` comment.

---

## 3. Design system

### 3.1 Direction

The subject is a **ratings agency for a technical audience**. The vernacular to draw from: credit reports, certificates of authenticity, chain-of-custody forms, archival index cards, schema tables. The feeling should be *institutional confidence* — calm, precise, dense with real information, never hypey. Restraint everywhere except the signature element.

Explicitly avoid: cream-and-terracotta editorial palettes, near-black backgrounds with a single acid accent, glassmorphism, and floating gradient blobs. The brand color is already decided; spend the remaining freedom on structure and density, not on effects.

Design against dark first (§3.2) — that is the canonical presentation. Light mode must work, but do not build it first and retrofit dark.

### 3.2 Color

**The complete token system already ships in `src/app/globals.css`. That file is authoritative. Do not invent colors.** This section explains the reasoning so you apply it correctly.

Brand ink is `#56B1F6`, traced from the ARCH mark. Every blue on the site is a step on hue 206, so the identity reads as one color rather than a palette.

**Dark is the default theme.** Set `defaultTheme="dark"` in `next-themes` with `enableSystem` on; the toggle works and light mode is fully supported. The reason is contrast: `#56B1F6` measures 2.2:1 on a near-white ground and fails WCAG AA for text, which would lock the brand color out of every heading, link, and label. On the dark ground it reaches 8.3:1. Dark-first is what lets the exact logo color be the actual interface color at every size.

**Usage rules — enforce these:**

- `--accent` (`#56B1F6`) is the identity: the logo, display headings 32px and up, icon strokes, graph edges, borders, chart fills, progress arcs. In dark mode it is also safe for body text.
- **In light mode, never use `--accent` for text below 32px.** Use `--accent-strong` (5.2:1) for UI and 14px+ text, `--accent-deep` (6.7:1) for body text and inline links.
- Buttons: primary is `--accent-strong` filled with white. Never fill with `--accent` — white on it fails.
- The three trust tiers are **three distinct hues**, because they are the credibility mechanic of the product and must be separable at a glance:

| Tier | Dark | Light | Glyph |
|---|---|---|---|
| **Verified** | `#3DD68C` green | `#0C7A49` | filled dot |
| **Inferred** | `#56B1F6` blue | `#1A6FB2` | half-filled dot |
| **Asserted** | `#F0B03C` amber | `#8A5707` | hollow dot |

  Never encode a tier by color alone — the glyph and the text label always accompany it, so the distinction survives greyscale and color blindness.
- `--risk` is for license conflicts, staleness, and broken lineage. It is not a fourth tier.
- Paper grain stays; opacity is already themed via `--grain-opacity`.

### 3.3 Typography

Three roles, retained from the existing build because the pairing already works:

- **Display — Instrument Serif, 400, normal + italic.** Page and section headings only. Tight tracking (−0.03em), leading 1.05–1.12. Colored `--accent` at large sizes.
- **Body — Geist Sans.** All prose, UI labels, buttons, navigation.
- **Data — Geist Mono.** Every piece of machine-derived information: hashes, scores, licenses, timestamps, row counts, eyebrow labels, table cells, filter chips. This is a hard rule and it is what makes the site feel like a registry. If a number came from a system rather than a copywriter, it is mono.

Eyebrow labels: mono, 11px, uppercase, `0.2em` tracking, `--muted-foreground`.

### 3.4 Trust tier vocabulary

Every provenance claim on the site carries one of three tiers. Use these labels consistently — they are core product vocabulary, not decoration.

| Tier | Meaning | Visual |
|---|---|---|
| **Verified** | Archivum independently confirmed it against the original source | `--tier-verified`, filled dot |
| **Inferred** | Derived from metadata or automated analysis, not confirmed | `--tier-inferred`, half-filled dot |
| **Asserted** | Claimed by the publisher, unconfirmed | `--tier-asserted`, hollow dot |

Never show a bare claim without its tier. This is the credibility mechanic of the entire product.

### 3.5 Logo

**Already built.** `public/logo-arch.svg` (full wordmark), `public/logo-mark.svg` (the A and its arc), `public/favicon.svg`. All traced from the original art; the wordmark and mark use `currentColor` and inherit theme color. Update `Logo.tsx` to render the SVG inline or via `next/image`, keeping its existing `size` prop API. Delete `public/logo-arch.png` and `src/app/favicon.ico`.

**The arc is the brand motif.** Reuse it structurally, not decoratively — as the spine of the lineage graph, the shape of the trust-score gauge, and the thread that draws down the homepage. Do not scatter it as ornament.

### 3.6 Motion

The reference is Apple's product pages: motion bound to scroll position rather than fired once and forgotten. Restraint still applies — but restraint means *few, well-executed* moments, not *shallow* ones.

**Use scroll-linked motion, not scroll-triggered.** Prefer `useScroll` + `useTransform` over `whileInView` for the four orchestrated moments below. Progress through the section *is* the animation, so scrubbing backward works correctly.

**The four orchestrated moments — build these properly:**

1. **Hero passport assembly.** On load the passport outline draws, its rows fade in at 80ms intervals, the trust score counts up, and the lineage strip draws left to right. About 1.6s total, once.
2. **How Archivum Works (§5.3) — sticky pinned scene.** Section is tall; the left column of three steps scrolls while a `sticky` visual panel on the right transforms at each step. This is the single most important interaction on the site.
3. **Trust Scoring (§5.4) — the gauge sweeps** as the section enters, driven by scroll progress, with the four factor bars filling in sequence.
4. **The arc.** The brand arc draws itself down the page as a continuous thread, connecting the How-It-Works steps and the lineage graph. Use `pathLength="1"` with `strokeDashoffset` bound to scroll (the `.arc-draw` utility in `globals.css` is set up for this).

**Continuity:** give the trust gauge in §5.4 and the score badge on the §5.5 cards a shared Framer Motion `layoutId` so one becomes the other. This is what makes the page feel authored rather than assembled.

**Everything else stays quiet.** Section entrances: 12–16px rise, 0.5s, `--ease-archivum`, `viewport={{ once: true }}`. Hovers: 200ms, translate no more than 2px. No spring physics on anything a professional uses daily. No scroll-hijacking — the page must always scroll at the speed the user expects.

**Performance:** animate only `transform` and `opacity`. Target 60fps on a 2019 laptop.

**Reduced motion:** every animation guarded by `useReducedMotion()`. Under reduced motion all content renders in its final state — nothing hidden, nothing dependent on animation to appear. Sticky scenes degrade to stacked sections.

### 3.7 Signature element

**The Dataset Passport.** A report-card artifact that appears at three scales and is the thing people remember:

1. **Compact** — inside marketplace cards: trust score, license, last updated, tier dot
2. **Panel** — beside the lineage graph on the homepage: dataset, license, hash, source, contributor, tier
3. **Full** — the entire `/datasets/[slug]` page

Design it once as a component family with shared visual DNA: hairline borders, mono data, a trust score in the top-right set in an arc gauge, tier dots against every claim. It should look like a document, not a card.

---

## 4. Data layer — already built

`src/lib/types.ts`, `src/lib/mock-data.ts`, `src/lib/mock-dashboard.ts`, `src/lib/api/client.ts`, and `src/lib/api/adapters/mock.ts` are complete. Read them before building any page that shows data.

**What is in there:** twenty datasets with realistic score spread (33 to 95), complete four-factor trust breakdowns, lineage graphs, version histories with per-version scores, schemas, and five sample records each. Nine datasets have deliberately incomplete lineage. Four carry `Unspecified` licenses. Publishers are fictional, so no real organization is shown being graded poorly.

**Available functions** (all async, all from `@/lib/api/client`):

```
getDatasets(filters) -> Paginated<DatasetSummary>   // filter, sort, paginate
getDataset(slug)     -> Dataset | null
getLineage(slug)     -> LineageGraph | null
getFacets()          -> Facets                       // counts for filter sidebar
getAllSlugs()        -> string[]                     // for generateStaticParams
getFeatured(n)       -> DatasetSummary[]             // homepage preview
getRelated(slug)     -> DatasetSummary[]
getActivity()        -> ActivityEvent[]              // dashboard
getWatchlist()       -> WatchedDataset[]             // dashboard
```

`getFeatured()` deliberately returns five strong datasets plus the worst one, so the homepage preview shows that the grading has teeth. Do not filter that one out.

**Trust weights** are exported as `TRUST_WEIGHTS` from `types.ts` — source transparency 35, community verification 25, update frequency 20, documentation quality 20. Use the constant; never hardcode the numbers.

**What you still need to write:** nothing in the data layer. Everything else in this spec.

---

## 5. Homepage — section by section

Order is fixed: Hero → Problem → How Archivum Works → Trust Scoring → Marketplace Preview → Integrations → CTA.

### 5.1 Hero

Full viewport height. Left column takes about 55%.

- Logo mark at 56px
- H1, Instrument Serif, up to 5rem: **"The trust layer for AI data."**
- Subhead: "Every dataset your model learns from has a history. Archivum indexes what's already public, then grades it — origin, licensing, and a trust score you can defend to an auditor."
- Primary button "Explore datasets" → `/explore`. Secondary "Read the methodology" → `/docs#methodology`.
- Below the buttons, one mono line: `12,400 datasets indexed · 4 platforms · updated hourly` — and mark it clearly in code as placeholder metrics to replace before launch.

Right column: **a live Dataset Passport**, rendered at full fidelity, showing a real-looking dataset at 96/100 with tier dots against each claim. This is the thesis of the page — it shows the product instead of describing it. Give it the assembly animation described in §3.6: outline draws, rows fade in at 80ms intervals, score counts up, lineage strip draws. About 1.6s, once, then still.

**Do not** use a fake search bar in the hero. It implies a working index and creates an immediate dead end.

### 5.2 Problem

Two columns. Left holds the heading and the used-car analogy in full — it is the clearest thing in the whole narrative and deserves real estate:

> **"You wouldn't buy a used car without the history report."**
>
> "You can see the dataset. You can't see whether it was scraped legally, who touched it, when it was last real, or whether using it commercially will get you sued. Teams spend weeks hunting for data, then still can't answer those questions."

Right column: three consequences, hairline-separated. **No 01/02/03 numbering** — these are parallel risks, not a sequence, and numbering them would be decoration pretending to be structure.

- **Wrong answers ship** — outdated or dirty data reaches production, and the model hallucinates with confidence.
- **Licenses surface too late** — commercial restrictions get discovered after training, not before.
- **Weeks disappear** — searching, validating, and cleaning eats the time you meant to spend building.

### 5.3 How Archivum Works

A three-step horizontal flow. **This is a real sequence, so numbering is earned here.**

1. **Search** — One index across Hugging Face, Kaggle, GitHub, and academic sources. Filter by domain, language, modality, license, and trust score.
2. **Verify** — Open the passport. See origin, contributors, update history, licensing, and the full lineage trail behind every transformation.
3. **Integrate** — Download directly or export to LlamaIndex, LangChain, or your vector store. Provenance metadata travels with the data.

Each step gets a small, specific visual — a filter panel fragment, a passport fragment, a code snippet — not an icon. Connect the three with the brand arc.

### 5.4 Trust Scoring

The most important section on the page, and the one that makes the business defensible. Two parts.

**Part A — the breakdown.** An arc gauge showing a composite score, with the four contributing factors and their weights beside it:

| Factor | Weight | What it measures |
|---|---|---|
| Source transparency | 35% | Can every record be traced to a named origin? |
| Community verification | 25% | Independent confirmation, citations, downstream use |
| Update frequency | 20% | Is it maintained, or abandoned? |
| Documentation quality | 20% | Schema, collection method, and known limitations documented |

Make the gauge interactive: hovering a factor highlights its contribution to the arc.

**Part B — the tiers.** Explain Verified / Inferred / Asserted using §3.4, with the visual dot treatment shown inline. Close with a line that states the position plainly: *"Every score shows its work. The full methodology is public."* Link to `/docs#methodology`.

Include, in smaller type, an honest note: scores reflect available evidence at a point in time and are not legal advice. This protects you and it also reads as more credible, not less.

### 5.5 Marketplace Preview

Six dataset cards in a responsive grid, pulled from the same mock data as `/explore` — never a separate hardcoded list.

Each card: name, publisher, platform badge, one-line description, trust score with its tier dot, license chip with a commercial-use indicator, last-updated in relative time. Hover lifts 2px and tints the border toward `--accent`.

**Include one low-scoring dataset in the six.** It signals the ratings are real.

Section closes with a link to `/explore`.

### 5.6 Integrations

Restraint required here. The narrative names ecosystem players, but a marketing page that displays company names in a grid reads as an endorsement claim you cannot support.

Show integration *targets* as plain mono text in a bordered grid — LlamaIndex, LangChain, Hugging Face Datasets, Pinecone, Weaviate, Qdrant, Chroma, S3, Snowflake — with **no logos**, and a caption directly beneath: *"Archivum exports to these tools. Names shown are third-party trademarks; listing does not imply partnership or endorsement."*

Add a short code sample showing a passport-aware export in Python. Reuse the terminal component here if it fits, or keep it simple.

### 5.7 CTA

Centered, quiet, aimed squarely at developers.

- Serif heading: **"Know what your model learned from."**
- One line: "Archivum is in early access. Join the waitlist and help shape what gets indexed first."
- Email field with inline validation, button "Join the waitlist"
- Secondary text link: "Publishing a dataset? Submit it →" → `/publish`

---

## 6. Remaining pages

### 6.1 `/explore` — Explore Marketplace

Sidebar filters on desktop, collapsible drawer on mobile: search input, platform, domain, modality, language, license type, commercial-use toggle, minimum trust score slider, last-updated range. Sort by trust score, recency, or size.

Results as a responsive card grid with a table-view toggle. Filters must update the URL query string so a filtered view is shareable. Build a real empty state — an invitation to broaden filters or submit a dataset, not a shrug. Build real loading skeletons; the artificial delay in §4 exists to make you build them.

### 6.2 `/datasets/[slug]` — Dataset Page

The flagship page. Static params generated from the mock set.

- **Header:** name, publisher, platform link out, trust score in the arc gauge, license chip, primary action "Download" plus "Export to…" dropdown
- **Trust breakdown:** four factors with scores, each claim carrying its tier dot
- **Lineage:** the full interactive graph. Node sequence is now the dataset-provenance story, not a training pipeline: `Original source → Raw scrape → Cleaning → Annotation → Embedding → Current version`. Hovering a node opens its passport. Lay the graph along the brand arc.
- **Version history:** commit-style list — version, date, rows added/removed, note, author. Reuse the existing versioning component's visual pattern.
- **Schema:** field table — name, type, nullable, description
- **Sample records:** five rows, horizontally scrollable
- **Similar datasets:** three cards
- Tab or anchor navigation between these on mobile.

### 6.3 `/docs` — Documentation

Three-column layout: nav sidebar, content, on-page table of contents.

Sections: Quickstart, Search API, Dataset API, Lineage API, Exports (LlamaIndex / LangChain / vector stores), SDKs (Python, TypeScript, REST), and **Trust Score Methodology at `#methodology`** — the anchor the homepage links to. Write the methodology section properly: the four factors, their weights, how each is computed, what the tiers mean, how to dispute a score. This is the page that has to hold up when someone challenges a rating.

Code blocks need syntax highlighting and copy buttons. The typing-terminal component from the existing build belongs on Quickstart.

### 6.4 `/pricing` — Pricing

Three tiers, matching the revenue model:

| Tier | Price | For | Includes |
|---|---|---|---|
| **Free** | $0 | Individual developers | Full search, trust scores, lineage viewing, 100 API calls/month |
| **Team** | $49/user/month | AI startups | Change monitoring and alerts, license-change notifications, exportable audit reports, 10k API calls/month, private collections |
| **Enterprise** | Contact sales | Regulated industries | Org-wide dataset inventory, SSO, custom policy rules, dedicated support, SLA, on-prem option |

Mark the price points clearly in code as provisional. Add a feature comparison table and four or five FAQs (billing, limits, self-hosting, what happens at the free tier ceiling). Enterprise CTA opens a contact modal, not a dead link.

### 6.5 `/publish` — Publish Dataset

Two parts. First, a short pitch to dataset authors: submitting gets your dataset indexed, scored, and discoverable, and you control the provenance claims.

Then a multi-step form with real client-side validation and a step indicator:

1. **Source** — platform, URL, or direct upload
2. **Metadata** — name, description, domain, language, modality, size
3. **Provenance** — collection method, primary sources, collection dates, human review process
4. **Licensing** — SPDX selector, commercial-use declaration, consent artifacts
5. **Review** — a live preview of the passport the dataset would get, with a provisional trust score

Step 5 is the payoff — showing authors their own passport before they submit is what makes this page worth building. Submit shows a success state with a `TODO` comment; nothing persists.

### 6.6 `/dashboard` — Dashboard

Mocked shell, no auth. Add a small dismissible banner: "Demo view with sample data."

- **Monitored datasets** table — name, current trust score, score delta since last check, license status, last verified
- **Alerts feed** — license changed, trust score dropped, dataset deprecated, new version published. Give each alert a severity and a timestamp.
- **Compliance summary** — count of monitored datasets by license type and commercial-use status, with an "Export audit report" button that triggers a mocked download
- **Score trend** — one simple line chart over 90 days for a selected dataset

Keep it dense and functional. This page should look like a tool, not a marketing mockup.

---

## 7. Shared components to build

`Logo` · `Nav` (7 routes, mobile drawer, scroll-aware) · `Footer` · `Button` · `Section` primitives · `TrustScore` (arc gauge, three sizes) · `TierDot` · `LicenseChip` · `PlatformBadge` · `DatasetCard` · `DatasetPassport` (compact / panel / full) · `LineageGraph` · `VersionHistory` · `SchemaTable` · `FilterSidebar` · `WaitlistModal` · `CodeBlock` · `EmptyState` · `LoadingSkeleton` · `ThemeToggle`

---

## 8. Quality bar

Non-negotiable:

- Responsive from 320px up. Test the lineage graph and the dataset page at mobile width specifically — they are the two that will break.
- Visible keyboard focus on every interactive element, using `--accent-strong`.
- The lineage graph must be keyboard-navigable, not hover-only.
- All motion respects `prefers-reduced-motion`.
- Semantic headings, one `h1` per page, real landmarks.
- Per-page metadata and Open Graph tags.
- No layout shift on theme toggle.
- `npm run build` passes clean. No TypeScript `any`. No console errors.
- Real loading and empty states everywhere data is fetched.

Copy rules: sentence case, active voice, plain verbs. A button says what happens when you press it. Actions keep the same name through the whole flow — "Join the waitlist" produces "You're on the list." Never describe the system's internals; describe what the person gets.

---

## 9. Out of scope

Authentication · payment processing · real API integrations · a CMS · blog · search backend · user accounts · anything that persists data.

---

## 9.5 Static export — a hard constraint

**The output must be a fully static site.** `npm run build` produces `./out`, which is deployed to a static host with no Node server. `next.config.ts` ships pre-configured with `output: "export"`, `images.unoptimized: true`, and `trailingSlash: true`. Do not change it.

**What this forbids — none of these may appear anywhere in the build:**

- No `app/api/` route handlers
- No server actions or `"use server"`
- No `middleware.ts`
- No `revalidate`, no ISR, no `dynamic = "force-dynamic"`
- No `cookies()`, `headers()`, or `draftMode()`
- No dynamic route without `generateStaticParams`
- No `next/image` loader config or remote patterns; images are unoptimized by design

**What this requires:**

- `/datasets/[slug]` must call `generateStaticParams()` backed by `getAllSlugs()`, or the build fails.
- All data fetching that reacts to user input runs **client-side**. The mock adapter is plain in-memory TypeScript, so `/explore` filtering, sorting, and pagination all work in the browser with no server. Keep it that way.
- URL filter state uses `useSearchParams` inside a `<Suspense>` boundary — App Router requires this and it will fail the build otherwise.
- Any component calling `getDatasets()` in response to interaction is a client component. Static shells with client islands, not server rendering.

**The waitlist and contact forms** must post to a third-party endpoint (a form service or a hosted function), never to a Next route handler. Build them with the submit handler stubbed and a clear `TODO: point at form endpoint` comment, plus a working optimistic success state. The endpoint gets wired at deploy time.

**Verify before finishing:** `npm run build` must complete and emit `./out` containing an `index.html` plus a directory for every route, including all twenty dataset pages. If `./out` is missing or a route is absent, the build is not done.

---

## 10. Build order

The data layer and tokens are done, so start at step 2.

1. ~~Tokens, logo, mock data~~ — **shipped, see §0.5**
2. Layout shell, `Nav` (seven routes, mobile drawer, scroll-aware), `Footer`, fonts wired in `layout.tsx`
3. Shared components, starting with `TrustScore`, `TierDot`, and `DatasetPassport` — these three appear on every page and everything else composes from them
4. Homepage, section by section, in the fixed order
5. `/explore`, then `/datasets/[slug]` with `generateStaticParams` from `getAllSlugs()`
6. `/pricing`, `/publish`, `/dashboard`
7. `/docs`, including the methodology section at `#methodology`
8. Responsive pass from 320px, accessibility pass, then `npm run build`

If time runs short, `/docs` is the page to render thinnest — but the methodology section must still be written properly, because it is what the homepage links to and what makes the ratings defensible.

**A closing note on judgment.** This spec is detailed about structure and deliberately quiet about visual execution. Where it does not specify, decide — and decide like a designer who has seen the subject: this is a ratings agency for a technical audience, so density, precision, and real data beat decoration every time.


---

# Appendix A — `src/lib/types.ts` (already in the repo, reference only)

```ts
/**
 * Archivum — core domain types.
 * These are the contract between the data layer and every component.
 * When a real API replaces the mock adapter, these shapes stay fixed.
 */

/** How a claim was established. The credibility mechanic of the whole product. */
export type TrustTier = 'verified' | 'inferred' | 'asserted';

export type Platform = 'huggingface' | 'kaggle' | 'github' | 'academic' | 'direct';

export type Modality = 'text' | 'image' | 'audio' | 'tabular' | 'multimodal';

export type LineageStage =
  | 'source'
  | 'scrape'
  | 'clean'
  | 'annotate'
  | 'embed'
  | 'current';

export type TrustFactorKey =
  | 'sourceTransparency'
  | 'communityVerification'
  | 'updateFrequency'
  | 'documentationQuality';

/** Weights sum to 100. Displayed on /docs#methodology and in the Trust Scoring section. */
export const TRUST_WEIGHTS: Record<TrustFactorKey, number> = {
  sourceTransparency: 35,
  communityVerification: 25,
  updateFrequency: 20,
  documentationQuality: 20,
};

export interface TrustFactor {
  key: TrustFactorKey;
  label: string;
  weight: number;
  score: number; // 0-100
  tier: TrustTier;
  summary: string;
}

export interface DatasetLicense {
  spdx: string; // 'MIT' | 'CC-BY-4.0' | 'Unspecified' | ...
  commercialUse: boolean;
  attribution: boolean;
  shareAlike: boolean;
  tier: TrustTier;
  /** Unresolved terms inherited from upstream sources. Empty when clean. */
  conflicts: string[];
}

export interface LineageNode {
  id: string;
  stage: LineageStage;
  label: string;
  description: string;
  actor: string;
  hash: string; // 'sha256:abcd…wxyz'
  timestamp: string; // ISO
  tier: TrustTier;
  url: string | null;
}

export interface LineageEdge {
  from: string;
  to: string;
  tier: TrustTier;
}

export interface LineageGraph {
  nodes: LineageNode[];
  edges: LineageEdge[];
  /** 0-100. Below 100 means stages are undocumented — render the gap, do not hide it. */
  completeness: number;
  undocumentedStages: LineageStage[];
}

export interface DatasetVersion {
  version: string;
  date: string; // ISO date
  rowsAdded: number;
  rowsRemoved: number;
  note: string;
  author: string;
  /** Score at the time of this version — lets the UI show trust drift. */
  trustScore: number;
}

export interface SchemaField {
  name: string;
  type: string;
  nullable: boolean;
  description: string;
}

export interface Dataset {
  slug: string;
  name: string;
  publisher: string;
  publisherSlug: string;
  description: string;

  platform: Platform;
  platformUrl: string;
  domain: string[];
  languages: string[];
  modality: Modality;

  sizeRows: number;
  sizeBytes: number;

  license: DatasetLicense;

  trustScore: number; // 0-100, weighted from trustBreakdown
  trustTier: TrustTier;
  trustBreakdown: Record<TrustFactorKey, number>;
  trustFactors: TrustFactor[];
  methodologyVersion: string;

  primarySourceCount: number;
  humanVerificationPct: number;
  duplicatesRemovedPct: number;

  firstPublished: string; // ISO
  lastUpdated: string; // ISO
  contentHash: string;
  version: string;

  lineage: LineageGraph;
  versions: DatasetVersion[];
  schema: SchemaField[];
  sampleRecords: Record<string, unknown>[];
  relatedSlugs: string[];
}

/** Summary shape used by cards and tables. A Dataset satisfies this structurally. */
export type DatasetSummary = Pick<
  Dataset,
  | 'slug' | 'name' | 'publisher' | 'description' | 'platform' | 'domain'
  | 'languages' | 'modality' | 'sizeRows' | 'sizeBytes' | 'license'
  | 'trustScore' | 'trustTier' | 'lastUpdated' | 'version'
>;

export interface DatasetFilters {
  query?: string;
  platform?: Platform[];
  domain?: string[];
  modality?: Modality[];
  languages?: string[];
  license?: string[];
  commercialOnly?: boolean;
  minTrustScore?: number;
  tier?: TrustTier[];
  updatedWithinDays?: number;
  sort?: 'trust' | 'recent' | 'size' | 'name';
  page?: number;
  pageSize?: number;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface Facets {
  platforms: { value: Platform; count: number }[];
  domains: { value: string; count: number }[];
  modalities: { value: Modality; count: number }[];
  languages: { value: string; count: number }[];
  licenses: { value: string; count: number }[];
}

/* ---------- Dashboard (mocked, no auth) ---------- */

export type AlertSeverity = 'info' | 'warning' | 'critical';

export interface ActivityEvent {
  id: string;
  type: 'license-change' | 'score-drop' | 'new-version' | 'deprecated' | 'lineage-updated';
  severity: AlertSeverity;
  datasetSlug: string;
  datasetName: string;
  message: string;
  timestamp: string;
}

export interface WatchedDataset {
  slug: string;
  name: string;
  publisher: string;
  trustScore: number;
  scoreDelta: number;
  licenseStatus: 'ok' | 'changed' | 'unresolved';
  lastVerified: string;
  /** 12 points, oldest first — for the sparkline. */
  scoreHistory: number[];
}

```

---

# Appendix B — `src/app/globals.css` (already in the repo, authoritative)

```css
@import "tailwindcss";

@custom-variant dark (&:where(.dark, .dark *));

/* ==========================================================================
   Archivum design tokens
   Brand ink is #56B1F6, traced from the ARCH mark. Every blue on the site is a
   step on hue 206 so the identity reads as one color.
   Dark is the canonical theme; light is fully supported.
   All values below are contrast-verified against their own ground.
   ========================================================================== */

@theme inline {
  --color-background: var(--background);
  --color-surface: var(--surface);
  --color-surface-elevated: var(--surface-elevated);
  --color-foreground: var(--foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-border: var(--border);
  --color-border-strong: var(--border-strong);
  --color-accent: var(--accent);
  --color-accent-strong: var(--accent-strong);
  --color-accent-deep: var(--accent-deep);
  --color-accent-wash: var(--accent-wash);
  --color-accent-soft: var(--accent-soft);
  --color-verified: var(--tier-verified);
  --color-inferred: var(--tier-inferred);
  --color-asserted: var(--tier-asserted);
  --color-risk: var(--risk);

  --font-sans: var(--font-geist-sans);
  --font-serif: var(--font-instrument);
  --font-mono: var(--font-geist-mono);

  --ease-archivum: cubic-bezier(0.22, 1, 0.36, 1);
}

/* ---------- Light ---------- */
:root {
  --background: #fbfcfd;
  --surface: #ffffff;
  --surface-elevated: #ffffff;
  --foreground: #0d1117;        /* 18.4:1 */
  --muted: #f2f5f8;
  --muted-foreground: #55606d;  /*  6.2:1 */
  --border: #e3e9ef;
  --border-strong: #cfd8e2;

  /* #56B1F6 is only 2.2:1 on this ground, so it is reserved for the mark,
     display type at 32px and above, and non-text graphics. */
  --accent: #56b1f6;
  --accent-strong: #1a6fb2;     /*  5.2:1 — buttons, UI, 14px+ text */
  --accent-deep: #155e96;       /*  6.7:1 — body text, inline links */
  --accent-wash: #eef6fe;
  --accent-soft: #d3e9fc;

  /* Trust tiers — three distinct hues, never distinguished by color alone. */
  --tier-verified: #0c7a49;     /*  5.3:1 — green,  filled dot */
  --tier-inferred: #1a6fb2;     /*  5.2:1 — blue,   half dot   */
  --tier-asserted: #8a5707;     /*  5.9:1 — amber,  hollow dot */
  --risk: #c4302b;              /*  5.4:1 */

  --selection: #d3e9fc;
  --grain-opacity: 0.03;
}

/* ---------- Dark (canonical) ---------- */
.dark {
  --background: #0a0e14;
  --surface: #101720;
  --surface-elevated: #151d28;
  --foreground: #edf2f7;        /* 17.2:1 */
  --muted: #151d28;
  --muted-foreground: #93a1b1;  /*  7.3:1 */
  --border: #1e2833;
  --border-strong: #2b3846;

  /* The exact mark color, safe for text at every size on this ground. */
  --accent: #56b1f6;            /*  8.3:1 */
  --accent-strong: #7dc4f8;
  --accent-deep: #a5d6fa;
  --accent-wash: #0e1a28;
  --accent-soft: #17293d;

  --tier-verified: #3dd68c;     /* 10.3:1 */
  --tier-inferred: #56b1f6;     /*  8.3:1 */
  --tier-asserted: #f0b03c;     /* 10.1:1 */
  --risk: #f0575c;              /*  5.7:1 */

  --selection: #17293d;
  --grain-opacity: 0.045;
}

html {
  scroll-behavior: smooth;
}

body {
  background: var(--background);
  color: var(--foreground);
  font-family: var(--font-sans), ui-sans-serif, system-ui, sans-serif;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

::selection {
  background: var(--selection);
  color: var(--foreground);
}

:focus-visible {
  outline: 2px solid var(--accent-strong);
  outline-offset: 2px;
  border-radius: 3px;
}

.font-serif {
  font-family: var(--font-instrument), ui-serif, Georgia, serif;
}

.font-mono {
  font-family: var(--font-mono), ui-monospace, monospace;
}

/* Tabular figures for every machine-derived number. */
.tnum {
  font-variant-numeric: tabular-nums;
  font-feature-settings: "tnum" 1;
}

/* ---------- Paper grain: the one texture in the system ---------- */
.paper-grain {
  position: relative;
}

.paper-grain::before {
  content: "";
  pointer-events: none;
  position: absolute;
  inset: 0;
  z-index: 0;
  opacity: var(--grain-opacity);
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  background-repeat: repeat;
  background-size: 180px 180px;
}

/* ---------- Link underline that grows from the left ---------- */
.link-underline {
  background-image: linear-gradient(currentColor, currentColor);
  background-position: 0 100%;
  background-repeat: no-repeat;
  background-size: 0% 1px;
  transition: background-size 200ms ease;
}

.link-underline:hover {
  background-size: 100% 1px;
}

/* ---------- Terminal caret ---------- */
@keyframes caret-blink {
  0%, 45% { opacity: 1; }
  50%, 100% { opacity: 0; }
}

.caret {
  display: inline-block;
  width: 0.55ch;
  height: 1.05em;
  margin-left: 2px;
  vertical-align: -0.15em;
  background: currentColor;
  animation: caret-blink 1.1s steps(1) infinite;
}

/* ---------- Lineage / arc stroke drawing ----------
   Bind --draw-progress (0 to 1) to scroll via Framer Motion useTransform. */
.arc-draw {
  stroke-dasharray: 1;
  stroke-dashoffset: calc(1 - var(--draw-progress, 1));
  pathLength: 1;
}

/* ---------- Reduced motion: content always ends visible ---------- */
@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }

  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }

  .caret { animation: none; opacity: 1; }
  .arc-draw { stroke-dashoffset: 0; }
}

```

---

# Appendix C — shape of one record from `getDataset()`

Twenty of these exist. Abbreviated here; the real file is complete. **Do not open `mock-data.ts`.**

```json
{
  "slug": "biomed-abstracts-open",
  "name": "Biomedical Abstracts (Open Access)",
  "publisher": "Meridian Health Data Collective",
  "publisherSlug": "meridian-health-data-collective",
  "description": "Peer-reviewed biomedical abstracts with structured metadata, deduplicated and normalized against source registries.",
  "platform": "academic",
  "platformUrl": "https://example.org/academic/biomed-abstracts-open",
  "domain": [
    "medical",
    "nlp"
  ],
  "languages": [
    "en"
  ],
  "modality": "text",
  "sizeRows": 4210883,
  "sizeBytes": 18400000000,
  "license": {
    "spdx": "CC-BY-4.0",
    "commercialUse": true,
    "tier": "verified",
    "attribution": true,
    "shareAlike": false,
    "conflicts": []
  },
  "trustScore": 95,
  "trustTier": "verified",
  "trustBreakdown": {
    "sourceTransparency": 98,
    "communityVerification": 92,
    "updateFrequency": 94,
    "documentationQuality": 95
  },
  "trustFactors": [
    {
      "key": "sourceTransparency",
      "label": "Source transparency",
      "weight": 35,
      "score": 98,
      "summary": "Can every record be traced to a named origin?",
      "tier": "verified"
    },
    {
      "key": "communityVerification",
      "label": "Community verification",
      "weight": 25,
      "score": 92,
      "summary": "Independent confirmation, citations, and downstream use.",
      "tier": "verified"
    },
    {
      "key": "updateFrequency",
      "label": "Update frequency",
      "weight": 20,
      "score": 94,
      "summary": "Is the dataset maintained, or effectively abandoned?",
      "tier": "verified"
    },
    {
      "key": "documentationQuality",
      "label": "Documentation quality",
      "weight": 20,
      "score": 95,
      "summary": "Schema, collection method, and known limitations documented.",
      "tier": "verified"
    }
  ],
  "primarySourceCount": 3,
  "humanVerificationPct": 99.1,
  "duplicatesRemovedPct": 99.4,
  "firstPublished": "2021-03-14T00:00:00Z",
  "lastUpdated": "2026-07-22T00:00:00Z",
  "contentHash": "sha256:c11d…683a",
  "version": "v5.0",
  "methodologyVersion": "1.0",
  "lineage": {
    "nodes": [
      {
        "id": "source",
        "stage": "source",
        "label": "Original source",
        "tier": "verified",
        "description": "Origin registry or repository the records were first published to.",
        "actor": "publisher",
        "hash": "sha256:a40e…2e44",
        "timestamp": "2021-03-14T00:00:00Z",
        "url": "https://example.org/biomed-abstracts-open"
      },
      {
        "id": "scrape",
        "stage": "scrape",
        "label": "Raw acquisition",
        "tier": "verified",
        "description": "Records retrieved and stored with request-time fingerprints.",
        "actor": "archivum-ingest",
        "hash": "sha256:a3b3…839c",
        "timestamp": "2026-07-22T00:00:00Z",
        "url": null
      },
      "…4 more"
    ],
    "edges": [
      {
        "from": "source",
        "to": "scrape",
        "tier": "verified"
      },
      "…4 more"
    ],
    "completeness": 100,
    "undocumentedStages": []
  },
  "versions": [
    {
      "version": "v5.0",
      "date": "2026-07-22",
      "rowsAdded": 168435,
      "rowsRemoved": 16843,
      "note": "Re-verified upstream licenses",
      "author": "data-ops",
      "trustScore": 95
    },
    "…4 more"
  ],
  "schema": [
    {
      "name": "id",
      "type": "string",
      "nullable": false,
      "description": "Stable record identifier"
    },
    {
      "name": "text",
      "type": "string",
      "nullable": false,
      "description": "Primary text content"
    },
    "…4 more"
  ],
  "sampleRecords": [
    {
      "id": "rec_000001",
      "text": "Randomized trials of the intervention reported a modest reduction in recurrence.",
      "source_url": "https://example.org/a/1",
      "language": "en",
      "collected_at": "2026-05-02T09:14:00Z",
      "license": null
    },
    "…4 more"
  ],
  "relatedSlugs": [
    "multilingual-instruct-2m",
    "us-contract-clauses",
    "wiki-qa-multilingual"
  ]
}
```
