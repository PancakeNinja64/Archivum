# Running the Fable build — checklist

## Step 1 — Stage the repo (do this first, it is the whole point)

Copy the `archivum-prebuilt/` tree into your local clone of `Archivum_Test`:

```
public/logo-arch.svg
public/logo-mark.svg
public/favicon.svg
next.config.ts                          (overwrites the existing one)
src/app/globals.css                     (overwrites the existing one)
src/lib/types.ts
src/lib/mock-data.ts
src/lib/mock-dashboard.ts
src/lib/api/client.ts
src/lib/api/adapters/mock.ts
src/lib/api/adapters/huggingface.ts
```

Then:

```bash
rm public/logo-arch.png src/app/favicon.ico
npx tsc --noEmit          # must pass clean
git add -A && git commit -m "Add tokens, types, mock data, API layer, logos, static export config"
git push
```

**Do not skip the push.** The build run reads the repo. If these files aren't there, it will regenerate them and you'll spend your one run on work that's already done.

## Step 2 — Run the build

Attach or paste **`FABLE-PROMPT.md`** — that one file only. It contains the spec plus the two reference files inline.

**Do not attach `mock-data.ts`.** It's 164KB. Including it costs roughly 41,000 tokens of context for a file the builder never needs to open — it only imports from the API client. The prompt file already contains a representative record shape and an explicit instruction not to read it.

**Do not attach the prebuilt files individually either.** They're in the repo, and `types.ts` and `globals.css` are already inlined as appendices.

## Step 3 — Verify before you call it done

```bash
npm install
npm run build             # must complete and emit ./out
npx serve out             # sanity-check locally
```

Check:

- [ ] `./out` exists and contains `index.html`
- [ ] `./out/datasets/` has a directory for all 20 slugs
- [ ] All seven routes load: `/`, `/explore`, `/datasets/[slug]`, `/docs`, `/pricing`, `/publish`, `/dashboard`
- [ ] Dark mode is the default; the toggle works with no flash
- [ ] `/explore` filters work and the URL updates; the back button restores state
- [ ] The low-scoring dataset appears in the homepage marketplace preview
- [ ] No console errors, no "Aureliun" anywhere
- [ ] Keyboard-only navigation reaches everything with a visible focus ring

## Step 4 — Deploy

`./out` is a plain static directory. Drop it on Vercel, Netlify, Cloudflare Pages, S3 + CloudFront, or GitHub Pages. No Node server, no environment variables required.

## Step 5 — After deploy, what you wire up yourself

1. **Waitlist and contact forms.** Search for `TODO: point at form endpoint`. Point them at a form service or a hosted function. Static export cannot handle form posts itself.
2. **Real dataset APIs.** Implement `src/lib/api/adapters/huggingface.ts` against the real API, mapping into the types in `types.ts`, then change the one import line in `src/lib/api/client.ts`. No component changes.
3. **Analytics**, if you want it — a script tag in `layout.tsx`.
4. **Domain and metadata.** Update `metadataBase` in `layout.tsx` and the `sitemap.ts` base URL once you have the domain.

## If something comes out thin

Most likely candidate is `/docs`, which the spec deliberately marks as the page to render thinnest under time pressure. That's the right thing to sacrifice — it's the easiest to fill in afterward without Fable.
