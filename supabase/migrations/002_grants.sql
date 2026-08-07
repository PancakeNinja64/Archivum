-- Archivum — table privileges for Supabase API roles
-- Run in Supabase SQL Editor if anon/authenticated get "permission denied for table".
-- Safe to re-run.

grant usage on schema public to anon, authenticated, service_role;

grant select on public.profiles to anon, authenticated;
grant select on public.datasets to anon, authenticated;
grant select on public.dataset_versions to anon, authenticated;
grant select on public.dataset_files to anon, authenticated;
grant select on public.coverage_snapshots to anon, authenticated;
grant select on public.dataset_changes to anon, authenticated;
grant select on public.catalog_facets to anon, authenticated;

-- SELECT is required to read the watchlist / saved state; INSERT alone is not enough.
grant select, insert, update, delete on public.saved_datasets to authenticated;
grant insert on public.dataset_corrections to anon, authenticated;

grant all on all tables in schema public to service_role;
grant all on all sequences in schema public to service_role;
grant all on all routines in schema public to service_role;
