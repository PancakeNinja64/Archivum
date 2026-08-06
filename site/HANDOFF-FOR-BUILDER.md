# Handoff — Archivum website build

You're running one build pass to produce a static Next.js site. Everything you need is prepared; this note tells you what's already done and what's expected back.

---

## What's already finished (do not redo any of it)

The repo at `https://github.com/PancakeNinja64/Archivum_Test` already contains:

- **Logos** — `public/logo-arch.svg`, `logo-mark.svg`, `favicon.svg`, vector-traced from the original art, using `currentColor`
- **Design tokens** — `src/app/globals.css`, complete and contrast-verified in both themes
- **Types** — `src/lib/types.ts`, the full data contract plus `TRUST_WEIGHTS`
- **Mock data** — `src/lib/mock-data.ts` (twenty datasets) and `src/lib/mock-dashboard.ts`
- **API layer** — `src/lib/api/client.ts` and `adapters/mock.ts`, with filtering, sorting, faceting, pagination, and artificial latency
- **Static export config** — `next.config.ts`, pre-set to `output: "export"`

All of it typechecks clean under `strict`. Regenerating any of it wastes the run.

---

## What to do

1. Clone the repo and run `npm install`.
2. Open a Fable session and attach **`FABLE-PROMPT.md`** — that one file, nothing else.
3. Send this as the message:

> Build the Archivum website per the attached specification.
>
> The repo is `https://github.com/PancakeNinja64/Archivum_Test`. Everything listed in §0.5 is already committed there — logos, design tokens, TypeScript types, twenty mock datasets, and the API layer. Do not regenerate any of it; import from `@/lib/api/client`.
>
> Do not read `src/lib/mock-data.ts` — it's 164KB and you don't need its contents. Appendix C has the record shape.
>
> Output must be a static export per §9.5. `npm run build` has to emit `./out`.
>
> Follow the build order in §10. Start with the layout shell and shared components, then the homepage.

4. Put the resulting files into the cloned repo, then verify (below).
5. Commit and push to a branch — `build/fable-pass-1` is fine — and open a pull request rather than pushing to `main`.

---

## Two things that will bite you if missed

**Do not attach `mock-data.ts` to the session.** It's 164KB, roughly 41,000 tokens. The builder imports from it but never needs to read it. `FABLE-PROMPT.md` already contains a representative record shape as Appendix C.

**The output has to be statically exportable.** No `app/api/` route handlers, no server actions, no middleware, no ISR. `/datasets/[slug]` must have `generateStaticParams()`. Anything using `useSearchParams` needs a `<Suspense>` boundary or the build fails. §9.5 of the spec has the full list.

---

## If the session can't reach GitHub

Don't re-attach everything. `types.ts` and `globals.css` are already inlined in the prompt as Appendices A and B — that's the only content it actually needs to read. Tell it to write components against those appendices and assume the other files exist at the paths in §0.5. The output will drop into the cloned repo and compile.

---

## Verify before handing back

```bash
npm run build     # must complete and emit ./out
npx serve out
```

- [ ] `./out` exists with an `index.html`
- [ ] `./out/datasets/` has a folder for all twenty dataset slugs
- [ ] Seven routes load: `/`, `/explore`, `/datasets/[slug]`, `/docs`, `/pricing`, `/publish`, `/dashboard`
- [ ] Dark mode is the default; the toggle works with no flash on load
- [ ] `/explore` filters work, the URL updates, and the back button restores state
- [ ] A low-scoring dataset appears in the homepage marketplace preview (intentional — it shows the grading is real)
- [ ] No console errors; the string "Aureliun" appears nowhere
- [ ] Keyboard-only navigation reaches everything with a visible focus ring

---

## Expected shortfall

Seven pages is a lot for one pass. The spec deliberately names `/docs` as the page to render thinnest under time pressure, so if something comes out shallow that's the intended one. Don't spend extra effort backfilling it — flag it and hand back.

Notes on anything you had to decide, work around, or leave incomplete are more useful than a polished summary.
