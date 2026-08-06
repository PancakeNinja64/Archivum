# Archivum site — what you have and how to ship it

Two zips:

- **archivum-site-source.zip** — the complete Next.js project. This is what goes in your GitHub repo. It replaces everything currently in `Archivum_Test`.
- **archivum-site-static-out.zip** — the already-built static site (the `out/` folder). Any static host can serve this as-is; no build step needed.

## Fastest path to a live site (no terminal)

1. Go to **vercel.com** → sign up with your GitHub account (free Hobby plan).
2. First, update the repo: on github.com/PancakeNinja64/Archivum_Test, delete the old `src` and `public` folders (open each → "…" menu → Delete directory), then **Add file → Upload files** and drag in the *contents* of archivum-site-source.zip (unzip it on your computer first): the `src` and `public` folders, plus `next.config.ts`, `package.json`, `package-lock.json`, `tsconfig.json`, `postcss.config.mjs`, `eslint.config.mjs`. Commit.
3. In Vercel: **Add New → Project** → import `Archivum_Test` → deploy. It detects Next.js automatically and will build and host it. Done — you get a live `*.vercel.app` URL immediately, and you can attach a custom domain later in the project settings.

Alternative without Vercel: **Netlify Drop** (app.netlify.com/drop) — unzip archivum-site-static-out.zip and drag the `out` folder onto the page. Live in seconds. (You'd re-drag after every change, so the Vercel route is better long-term.)

## Three TODOs left in the code (all marked `TODO:` — search for it)

1. **Waitlist + publish forms** are stubbed. They validate and show success but don't send anywhere. When ready, create a free form endpoint (Formspree or Tally), and replace the `console.log` in `WaitlistModal.tsx`, `ClosingCTA.tsx`, and `PublishClient.tsx` with a `fetch` to it.
2. **Domain** — `src/app/sitemap.ts` and `robots.ts` use `https://archivum.example`. Replace with your real domain when you have one.
3. **Placeholder metrics** — "12,400 datasets indexed" on the homepage/footer is a mock number. Change it before real users see it, or keep it only while the whole site is clearly pre-launch.

## Later, when the product is real

- `src/lib/api/adapters/huggingface.ts` is a stub with the interface already defined. Implementing it (and swapping one line in `src/lib/api/client.ts`) makes the whole site — explore, dataset pages, homepage preview — run on live Hugging Face data with no other changes.
- Pricing is marked provisional on the page itself; confirm numbers before charging anyone.
