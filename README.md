# Archivum

A catalog of public AI datasets with one consistent record each — origin,
licensing, lineage, and Documentation Coverage: how much of its own provenance
each dataset documents at the source.

## Layout

```
src/        Next.js application (App Router, server-rendered)
supabase/   Database schema. 001_init.sql is applied to the live project.
public/     Static assets
```

## Develop

```bash
npm install
npm run dev
```

Open http://localhost:3000. With no environment configured the site runs in
mock mode against a built-in demo catalog.

Copy `.env.example` to `.env.local` when connecting to Supabase.

## Deploy

The app is server-rendered and deploys to Vercel from the **repo root** (no
Root Directory override). Environment variables, database setup, and the import
workflow are documented in [`README-BACKEND.md`](./README-BACKEND.md).

© Archivum LLC
