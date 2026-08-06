# Archivum

A catalog of public AI datasets with one consistent record each — origin,
licensing, lineage, and Documentation Coverage: how much of its own provenance
each dataset documents at the source.

## Layout

```
site/       The Next.js application (App Router, server-rendered)
supabase/   Database schema. 001_init.sql is applied to the live project.
```

## Develop

```
cd site
npm install
npm run dev
```

Open http://localhost:3000. With no environment configured the site runs in
mock mode against a built-in demo catalog.

## Deploy

The app is server-rendered and deploys to Vercel with the **Root Directory set
to `site`**. Environment variables, database setup, and the import workflow are
documented in [`README-BACKEND.md`](./README-BACKEND.md).

© Archivum LLC
