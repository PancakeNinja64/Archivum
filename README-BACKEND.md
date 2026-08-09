# Archivum — backend setup and operations

Everything here is browser-only. No terminal is required at any step.

## 1. What exists

- **Supabase** holds the catalog: datasets, versions, coverage snapshots,
  saved datasets, change log, ingestion runs, corrections. The schema is
  `supabase/migrations/001_init.sql` and is already applied.
- **The Next.js app** (at the repo root) reads the catalog directly from the browser
  with the anon key; Row Level Security limits reads to published datasets and
  each user's own rows. Privileged work — importing, publishing, the daily
  re-check — runs in API routes that use the service-role key, which never
  reaches a browser.
- **Sources**: Hugging Face and GitHub, metadata only. Archivum never
  downloads dataset contents — at most five sample rows through the official
  preview API, truncated to 500 characters per value.

## 2. Environment variables

Copy `.env.example` to `.env.local` for local work, and add the same
nine variables in Vercel → Project → Settings → Environment Variables.

| Variable | Where to find it |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API → anon public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API → service_role key. **Secret.** |
| `NEXT_PUBLIC_DATA_SOURCE` | `mock` until the first import succeeds, then `supabase` |
| `HF_TOKEN` | huggingface.co → Settings → Access Tokens (read). Optional but raises rate limits |
| `GITHUB_TOKEN` | github.com → Settings → Developer settings → Personal access tokens (public repo, read-only) |
| `ADMIN_EMAILS` | `business@archivum.tech` (comma-separate to add more) |
| `NEXT_PUBLIC_APP_URL` | The deployed URL, e.g. `https://archivum.vercel.app` |
| `CRON_SECRET` | Any long random string. Vercel Cron sends it; the endpoint checks it |

## 3. Deploy checklist (Vercel)

1. Import the GitHub repo. Leave **Root Directory blank** (repo root) — the
   app, `package.json`, and `next.config.ts` all live at the top level.
2. Add all nine environment variables with `NEXT_PUBLIC_DATA_SOURCE=mock`.
3. Deploy. Verify the demo site works at the deployment URL.
4. In Supabase → Authentication → Providers → Email: turn **off** "Confirm
   email" (password sign-in only, no OAuth).
5. In Supabase → Authentication → URL Configuration: set the Site URL to the
   deployment URL.

## 4. First import

1. On the deployed site, create the admin account: sign up with the address in
   `ADMIN_EMAILS`. A profile row appears automatically.
2. Visit `/admin`. Import `rajpurkar/squad` from Hugging Face — it should land
   in the draft queue within a minute with all 28 checks visible.
3. Import it a second time. The run log must say the source was unchanged and
   no duplicate version may appear — this is the idempotency check.
4. Run the seed import. 52 identifiers, batched; several will be skipped as
   gated or renamed. That is intended and logged, not a failure.
5. Publish the drafts you want public, then flip `NEXT_PUBLIC_DATA_SOURCE` to
   `supabase` in Vercel and redeploy.

## 5. What Documentation Coverage is

A dataset's coverage is the percentage of 28 provenance checks that were
present at the source at check time: 1 point when the artifact itself was
retrieved (a licence field, a file list), half a point when the publisher
stated it in prose, 0 when absent, and checks that cannot apply on a platform
are excluded from the denominator. Four sections — origin, licensing,
composition, maintenance — weighted equally. The arithmetic lives in
`src/lib/coverage/rules.ts` and nowhere else; the importer, the site, and
the docs page all call the same function.

It is a measure of the record, never a grade of the dataset, and the site's
copy is written to keep that distinction everywhere.

## 6. Ongoing operation

- **Daily re-check**: Vercel Cron hits `/api/cron/refresh` at 06:00 UTC and
  re-checks the 20 least-recently-checked published datasets. Changes append
  version rows and dashboard change entries; licence changes are flagged as
  warnings. This traffic also keeps the free-tier database from pausing.
- **Corrections**: anyone can submit one from a dataset page, no account
  needed. They arrive in `/admin` under Open corrections.
- **Costs today**: $0. Before real users: Vercel Hobby prohibits commercial
  use (Pro is $20/mo), and the free Supabase tier has no backups (Pro is
  $25/mo). Neither is needed to demo.
