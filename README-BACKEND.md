<p align="center">
  <a href="https://archivum.tech">
    <img src="./public/logo-mark-new.svg" alt="Archivum" width="72" />
  </a>
</p>

<p align="center">
  <strong>Archivum — backend setup &amp; operations</strong><br />
  Supabase · environment · Vercel · first import · coverage · cron
</p>

<p align="center">
  <a href="https://archivum.tech"><strong>Live site → archivum.tech</strong></a>
  ·
  <a href="./README.md">Product README</a>
  ·
  <a href="mailto:business@archivum.tech">Contact</a>
</p>

---

# Backend setup and operations

This file is the **runbook**. For what Archivum is and how to run the UI locally, start with **[README.md](./README.md)**.

Most day-to-day ops can be done in the browser (Supabase dashboard, Vercel project settings, `/admin` on the site). A terminal is only required for local development.

## Architecture (short)

| Piece | Role |
| --- | --- |
| **Supabase** | Catalog store: datasets, versions, coverage snapshots, saves, change log, ingestion runs, corrections. Schema: `supabase/migrations/` (already applied on the live project). |
| **Next.js app** (repo root) | Server-rendered site + API routes. Browser clients use the **anon** key; RLS limits reads to published datasets and each user’s own rows. |
| **Service role** | Used only in API routes for import, publish, and cron refresh. Never exposed to the browser. |
| **Sources** | Hugging Face and GitHub — **metadata only**. At most a few sample rows via the official preview API, truncated (e.g. 500 characters per value). Dataset files are never downloaded into Archivum. |

```text
Browser ──anon key──► Supabase (RLS)
Admin / Cron ──service role──► API routes ──► Supabase + HF/GitHub APIs
```

## Environment variables

Copy `.env.example` → `.env.local` for local work. In production, set the same keys in **Vercel → Project → Settings → Environment Variables**.

| Variable | Where to find it / notes |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API → anon **public** key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API → `service_role` key. **Secret. Server only.** |
| `NEXT_PUBLIC_DATA_SOURCE` | `mock` until the first successful import + publish path works, then `supabase` |
| `HF_TOKEN` | huggingface.co → Settings → Access Tokens (read). Optional; raises rate limits |
| `GITHUB_TOKEN` | GitHub → Settings → Developer settings → PAT (public repo, read-only). Optional |
| `ADMIN_EMAILS` | Comma-separated allowlist, e.g. `business@archivum.tech` |
| `NEXT_PUBLIC_APP_URL` | Canonical site URL, e.g. `https://archivum.tech` or your `*.vercel.app` URL |
| `CRON_SECRET` | Long random string. Vercel Cron sends it; `/api/cron/refresh` verifies it |

There are **no** Stripe / billing variables in this version.

## Deploy checklist (Vercel)

1. Import the GitHub repo. Leave **Root Directory blank** — `package.json` and `next.config.ts` live at the repo root.
2. Add all environment variables above with `NEXT_PUBLIC_DATA_SOURCE=mock` for the first deploy.
3. Deploy and confirm the demo/mock site loads at the deployment URL.
4. Supabase → Authentication → Providers → Email: turn **off** “Confirm email” if you want password sign-in without a mailbox loop (adjust if you prefer confirmed email).
5. Supabase → Authentication → URL Configuration: set **Site URL** (and redirect URLs) to the deployment / custom domain.
6. After the first real import and publish (below), flip `NEXT_PUBLIC_DATA_SOURCE` to `supabase` and redeploy.

Cron is declared in `vercel.json` (`/api/cron/refresh` at 06:00 UTC). Ensure `CRON_SECRET` matches what the route expects.

## First import

1. On the deployed site, sign up with an address listed in `ADMIN_EMAILS`. A profile row is created automatically.
2. Open `/admin`. Import a known public set (e.g. `rajpurkar/squad` from Hugging Face). It should appear in the draft queue with all 28 coverage checks visible.
3. Import the **same** identifier again. The run log should report the source unchanged and **must not** create a duplicate version (idempotency check).
4. Run the seed import when ready (batched identifiers; gated or renamed sources are skipped and logged — that is expected).
5. Publish the drafts you want public, set `NEXT_PUBLIC_DATA_SOURCE=supabase`, redeploy.

## What Documentation Coverage is

Coverage is the percentage of **applicable** provenance checks that were present at the source at check time:

| Evidence | Score |
| --- | --- |
| Artifact retrieved (licence field, file list, schema, …) | 1 |
| Stated in publisher prose only | 0.5 |
| Absent | 0 |
| Not applicable on that platform | excluded from the denominator |

Four sections — **origin**, **licensing**, **composition**, **maintenance** — are weighted equally. Arithmetic lives in **`src/lib/coverage/rules.ts`** only; the importer, site, and docs page all call the same function.

It measures the **record**, not the quality of the dataset. Product copy should keep that distinction everywhere.

## Ongoing operation

- **Daily re-check** — Cron re-checks the least-recently-checked published datasets (batch size configured in the refresh route). Changes append version rows and dashboard activity; licence changes are flagged as warnings. Regular traffic also helps keep free-tier databases from pausing.
- **Corrections** — Submitted from a dataset page (no account required). Review under **Open corrections** in `/admin`.
- **Costs today** — Can stay at $0 for demos. Before commercial use: Vercel Hobby restricts commercial projects (Pro is paid); free Supabase has limited backups (Pro recommended before real users).

## What’s next (ops / platform)

- [ ] Confirm production domain everywhere (`NEXT_PUBLIC_APP_URL`, Auth Site URL, `sitemap.ts` / `robots.ts`)
- [ ] Connect waitlist / publish forms to Formspree, Tally, or an API route
- [ ] Enable database backups and decide on Vercel Pro before charging or heavy traffic
- [ ] Monitor HF / GitHub rate limits as the catalog grows; keep tokens scoped read-only
- [ ] Add billing env + webhook handlers only when Team / Enterprise checkout ships

## Related paths

| Path | Notes |
| --- | --- |
| `supabase/migrations/` | Canonical schema |
| `src/lib/coverage/rules.ts` | Coverage scoring |
| `src/lib/sources/` | Platform fetchers |
| `src/app/api/admin/` | Ingest, publish, corrections |
| `src/app/api/cron/refresh/route.ts` | Scheduled re-check |
| `.env.example` | Template for all keys |

© Archivum LLC
