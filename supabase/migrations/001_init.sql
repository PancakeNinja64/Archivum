-- =====================================================================
-- Archivum — initial schema
-- Paste this whole file into the Supabase SQL Editor and press Run.
-- It is idempotent enough to re-run safely on a fresh project.
--
-- Design notes:
--   * ONE database. Auth identities live in Supabase's auth schema.
--   * No organizations, no teams, no billing tables. Deferred on purpose.
--   * Lineage and coverage detail are JSONB columns, not graph tables.
--   * Public reads happen straight from the browser via the anon key,
--     protected by RLS. Only writes go through server routes.
-- =====================================================================

create extension if not exists pg_trgm;

-- ---------------------------------------------------------------------
-- 1. profiles
-- ---------------------------------------------------------------------
create table if not exists public.profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  plan         text not null default 'free' check (plan in ('free', 'pro')),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- Auto-create a profile whenever someone signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------
-- 2. datasets  (the catalog)
-- ---------------------------------------------------------------------
create table if not exists public.datasets (
  id                uuid primary key default gen_random_uuid(),

  -- identity
  slug              text unique not null,
  platform          text not null check (platform in ('huggingface','github','kaggle','academic','direct')),
  source_identifier text not null,          -- 'owner/name'
  source_url        text not null,

  -- descriptive
  name              text not null,
  publisher         text not null,
  publisher_slug    text not null,
  description       text,
  domain            text[] not null default '{}',
  modality          text,                   -- text | image | audio | tabular | multimodal
  languages         text[] not null default '{}',

  -- size
  size_rows         bigint,
  size_bytes        bigint,

  -- licensing (a report of what was found, never a legal conclusion)
  license_spdx      text,
  license_url       text,
  license_status    text not null default 'not_found'
                    check (license_status in ('documented','reported','not_found')),
  commercial_use    text not null default 'not_stated'
                    check (commercial_use in ('permitted','restricted','prohibited','not_stated')),

  -- Documentation Coverage
  coverage_total        integer not null default 0 check (coverage_total between 0 and 100),
  coverage_origin       integer not null default 0,
  coverage_licensing    integer not null default 0,
  coverage_composition  integer not null default 0,
  coverage_maintenance  integer not null default 0,
  coverage_detail       jsonb   not null default '{}'::jsonb,  -- the 28 individual checks
  coverage_version      text    not null default '1.0',
  coverage_checked_at   timestamptz,

  -- provenance, stored as a graph-shaped document rather than graph tables
  lineage           jsonb not null default '{"nodes":[],"edges":[],"completeness":0,"undocumentedStages":[]}'::jsonb,

  -- structure sampled from the source
  schema_fields     jsonb not null default '[]'::jsonb,
  sample_records    jsonb not null default '[]'::jsonb,

  -- freeform source payload we have not modelled yet
  metadata          jsonb not null default '{}'::jsonb,

  -- usage signals, reported as-is from the platform
  downloads         integer,
  likes             integer,
  stars             integer,

  first_published   timestamptz,
  last_source_update timestamptz,
  source_revision   text,
  metadata_hash     text,

  status            text not null default 'draft' check (status in ('draft','published','hidden')),

  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),

  unique (platform, source_identifier)
);

-- Full-text search vector, maintained by a trigger.
-- A trigger is used instead of a generated column because array_to_string()
-- is not marked IMMUTABLE by PostgreSQL.

alter table public.datasets
  drop column if exists search_vector;

alter table public.datasets
  add column search_vector tsvector;

create or replace function public.update_dataset_search_vector()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.search_vector :=
    setweight(to_tsvector('english', coalesce(new.name, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(new.publisher, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(new.description, '')), 'C') ||
    setweight(
      to_tsvector(
        'english',
        coalesce(array_to_string(new.domain, ' '), '')
      ),
      'C'
    );

  return new;
end;
$$;

drop trigger if exists datasets_search_vector_update on public.datasets;

create trigger datasets_search_vector_update
  before insert or update of name, publisher, description, domain
  on public.datasets
  for each row
  execute function public.update_dataset_search_vector();

-- Backfill the search vector if any dataset rows already exist.
update public.datasets
set search_vector =
  setweight(to_tsvector('english', coalesce(name, '')), 'A') ||
  setweight(to_tsvector('english', coalesce(publisher, '')), 'B') ||
  setweight(to_tsvector('english', coalesce(description, '')), 'C') ||
  setweight(
    to_tsvector(
      'english',
      coalesce(array_to_string(domain, ' '), '')
    ),
    'C'
  );

create index if not exists datasets_search_idx      on public.datasets using gin (search_vector);
create index if not exists datasets_name_trgm_idx   on public.datasets using gin (name gin_trgm_ops);
create index if not exists datasets_status_idx      on public.datasets (status);
create index if not exists datasets_platform_idx    on public.datasets (platform);
create index if not exists datasets_coverage_idx    on public.datasets (coverage_total desc);
create index if not exists datasets_updated_idx     on public.datasets (last_source_update desc);
create index if not exists datasets_domain_idx      on public.datasets using gin (domain);
create index if not exists datasets_languages_idx   on public.datasets using gin (languages);

-- ---------------------------------------------------------------------
-- 3. dataset_versions  (append-only history of meaningful source changes)
-- ---------------------------------------------------------------------
create table if not exists public.dataset_versions (
  id              uuid primary key default gen_random_uuid(),
  dataset_id      uuid not null references public.datasets (id) on delete cascade,
  version_label   text not null,
  source_revision text,
  license_spdx    text,
  metadata_hash   text not null,
  coverage_total  integer,
  note            text,
  author          text,
  raw_metadata    jsonb not null default '{}'::jsonb,
  observed_at     timestamptz not null default now()
);
create index if not exists dataset_versions_dataset_idx on public.dataset_versions (dataset_id, observed_at desc);

-- ---------------------------------------------------------------------
-- 4. dataset_files  (manifest only — never file contents)
-- ---------------------------------------------------------------------
create table if not exists public.dataset_files (
  id           uuid primary key default gen_random_uuid(),
  dataset_id   uuid not null references public.datasets (id) on delete cascade,
  file_name    text not null,
  file_size    bigint,
  file_type    text,
  source_url   text,
  created_at   timestamptz not null default now()
);
create index if not exists dataset_files_dataset_idx on public.dataset_files (dataset_id);

-- ---------------------------------------------------------------------
-- 5. coverage_snapshots  (one row per recheck — powers the sparkline)
-- ---------------------------------------------------------------------
create table if not exists public.coverage_snapshots (
  id               uuid primary key default gen_random_uuid(),
  dataset_id       uuid not null references public.datasets (id) on delete cascade,
  coverage_total   integer not null,
  sections         jsonb not null default '{}'::jsonb,
  coverage_version text not null default '1.0',
  observed_at      timestamptz not null default now()
);
create index if not exists coverage_snapshots_idx on public.coverage_snapshots (dataset_id, observed_at desc);

-- ---------------------------------------------------------------------
-- 6. saved_datasets
-- ---------------------------------------------------------------------
create table if not exists public.saved_datasets (
  user_id    uuid not null references public.profiles (id) on delete cascade,
  dataset_id uuid not null references public.datasets (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, dataset_id)
);

-- ---------------------------------------------------------------------
-- 7. dataset_changes  (feeds the dashboard activity list)
-- ---------------------------------------------------------------------
create table if not exists public.dataset_changes (
  id          uuid primary key default gen_random_uuid(),
  dataset_id  uuid not null references public.datasets (id) on delete cascade,
  change_type text not null check (change_type in
              ('license-change','coverage-drop','coverage-gain','new-version','deprecated','lineage-updated')),
  severity    text not null default 'info' check (severity in ('info','warning','critical')),
  message     text not null,
  detail      jsonb not null default '{}'::jsonb,
  detected_at timestamptz not null default now()
);
create index if not exists dataset_changes_idx on public.dataset_changes (detected_at desc);

-- ---------------------------------------------------------------------
-- 8. ingestion_runs
-- ---------------------------------------------------------------------
create table if not exists public.ingestion_runs (
  id                uuid primary key default gen_random_uuid(),
  dataset_id        uuid references public.datasets (id) on delete set null,
  platform          text not null,
  source_identifier text not null,
  status            text not null default 'pending' check (status in ('pending','running','completed','failed','skipped')),
  error_message     text,
  triggered_by      text,
  started_at        timestamptz not null default now(),
  completed_at      timestamptz
);
create index if not exists ingestion_runs_idx on public.ingestion_runs (started_at desc);

-- ---------------------------------------------------------------------
-- 9. dataset_corrections  (public correction channel — see §Corrections)
-- ---------------------------------------------------------------------
create table if not exists public.dataset_corrections (
  id           uuid primary key default gen_random_uuid(),
  dataset_id   uuid references public.datasets (id) on delete cascade,
  dataset_slug text not null,
  submitter_email text,
  field        text,
  message      text not null,
  status       text not null default 'open' check (status in ('open','reviewing','resolved','rejected')),
  created_at   timestamptz not null default now(),
  resolved_at  timestamptz
);
create index if not exists dataset_corrections_idx on public.dataset_corrections (status, created_at desc);

-- ---------------------------------------------------------------------
-- 10. catalog_facets  (single cached row — avoids N count queries per page)
-- ---------------------------------------------------------------------
create table if not exists public.catalog_facets (
  id         integer primary key default 1 check (id = 1),
  payload    jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
insert into public.catalog_facets (id, payload) values (1, '{}'::jsonb) on conflict (id) do nothing;

create or replace function public.rebuild_catalog_facets()
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  update public.catalog_facets set
    payload = jsonb_build_object(
      'platforms',  (select coalesce(jsonb_agg(t), '[]'::jsonb) from
                      (select platform as value, count(*) as count from public.datasets
                       where status = 'published' group by platform order by count desc) t),
      'domains',    (select coalesce(jsonb_agg(t), '[]'::jsonb) from
                      (select unnest(domain) as value, count(*) as count from public.datasets
                       where status = 'published' group by 1 order by count desc limit 40) t),
      'modalities', (select coalesce(jsonb_agg(t), '[]'::jsonb) from
                      (select modality as value, count(*) as count from public.datasets
                       where status = 'published' and modality is not null group by modality order by count desc) t),
      'languages',  (select coalesce(jsonb_agg(t), '[]'::jsonb) from
                      (select unnest(languages) as value, count(*) as count from public.datasets
                       where status = 'published' group by 1 order by count desc limit 40) t),
      'licenses',   (select coalesce(jsonb_agg(t), '[]'::jsonb) from
                      (select coalesce(license_spdx, 'Not stated') as value, count(*) as count
                       from public.datasets where status = 'published' group by 1 order by count desc limit 40) t),
      'total',      (select count(*) from public.datasets where status = 'published')
    ),
    updated_at = now()
  where id = 1;
end;
$$;

-- ---------------------------------------------------------------------
-- 11. search RPC — one call does text match, filters, sort and paging
-- ---------------------------------------------------------------------
create or replace function public.search_datasets(
  p_query        text default null,
  p_platforms    text[] default null,
  p_domains      text[] default null,
  p_modalities   text[] default null,
  p_languages    text[] default null,
  p_licenses     text[] default null,
  p_min_coverage integer default null,
  p_commercial   boolean default false,
  p_updated_within_days integer default null,
  p_sort         text default 'coverage',
  p_limit        integer default 20,
  p_offset       integer default 0
)
returns table (
  total_count bigint,
  id uuid, slug text, name text, publisher text, publisher_slug text,
  description text, platform text, source_url text, domain text[],
  modality text, languages text[], size_rows bigint, size_bytes bigint,
  license_spdx text, license_status text, commercial_use text,
  coverage_total integer, last_source_update timestamptz
)
language sql stable
as $$
  with filtered as (
    select d.* from public.datasets d
    where d.status = 'published'
      and (p_query is null or p_query = '' or
           d.search_vector @@ websearch_to_tsquery('english', p_query) or
           d.name ilike '%' || p_query || '%')
      and (p_platforms  is null or d.platform = any(p_platforms))
      and (p_domains    is null or d.domain && p_domains)
      and (p_modalities is null or d.modality = any(p_modalities))
      and (p_languages  is null or d.languages && p_languages)
      and (p_licenses   is null or d.license_spdx = any(p_licenses))
      and (p_min_coverage is null or d.coverage_total >= p_min_coverage)
      and (p_commercial is false or d.commercial_use = 'permitted')
      and (p_updated_within_days is null or
           d.last_source_update >= now() - (p_updated_within_days || ' days')::interval)
  )
  select count(*) over () as total_count,
         f.id, f.slug, f.name, f.publisher, f.publisher_slug, f.description,
         f.platform, f.source_url, f.domain, f.modality, f.languages,
         f.size_rows, f.size_bytes, f.license_spdx, f.license_status,
         f.commercial_use, f.coverage_total, f.last_source_update
  from filtered f
  order by
    case when p_sort = 'coverage' then f.coverage_total end desc nulls last,
    case when p_sort = 'recent'   then f.last_source_update end desc nulls last,
    case when p_sort = 'size'     then f.size_rows end desc nulls last,
    case when p_sort = 'name'     then f.name end asc,
    f.name asc
  limit greatest(1, least(p_limit, 100))
  offset greatest(0, p_offset);
$$;

-- ---------------------------------------------------------------------
-- 12. Row Level Security
-- ---------------------------------------------------------------------
alter table public.profiles            enable row level security;
alter table public.datasets            enable row level security;
alter table public.dataset_versions    enable row level security;
alter table public.dataset_files       enable row level security;
alter table public.coverage_snapshots  enable row level security;
alter table public.saved_datasets      enable row level security;
alter table public.dataset_changes     enable row level security;
alter table public.ingestion_runs      enable row level security;
alter table public.dataset_corrections enable row level security;
alter table public.catalog_facets      enable row level security;

-- profiles: you see and edit only yourself.
drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own on public.profiles
  for select using (auth.uid() = id);
drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- datasets: anyone may read PUBLISHED rows. Nobody may write from the browser.
drop policy if exists datasets_select_published on public.datasets;
create policy datasets_select_published on public.datasets
  for select using (status = 'published');

-- child tables: readable only when the parent dataset is published.
drop policy if exists versions_select on public.dataset_versions;
create policy versions_select on public.dataset_versions
  for select using (exists (select 1 from public.datasets d
    where d.id = dataset_id and d.status = 'published'));

drop policy if exists files_select on public.dataset_files;
create policy files_select on public.dataset_files
  for select using (exists (select 1 from public.datasets d
    where d.id = dataset_id and d.status = 'published'));

drop policy if exists snapshots_select on public.coverage_snapshots;
create policy snapshots_select on public.coverage_snapshots
  for select using (exists (select 1 from public.datasets d
    where d.id = dataset_id and d.status = 'published'));

drop policy if exists changes_select on public.dataset_changes;
create policy changes_select on public.dataset_changes
  for select using (exists (select 1 from public.datasets d
    where d.id = dataset_id and d.status = 'published'));

-- saved_datasets: strictly your own rows.
drop policy if exists saved_select_own on public.saved_datasets;
create policy saved_select_own on public.saved_datasets
  for select using (auth.uid() = user_id);
drop policy if exists saved_insert_own on public.saved_datasets;
create policy saved_insert_own on public.saved_datasets
  for insert with check (auth.uid() = user_id);
drop policy if exists saved_delete_own on public.saved_datasets;
create policy saved_delete_own on public.saved_datasets
  for delete using (auth.uid() = user_id);

-- corrections: anyone may submit; nobody may read them back from the browser.
drop policy if exists corrections_insert_any on public.dataset_corrections;
create policy corrections_insert_any on public.dataset_corrections
  for insert with check (true);

-- facets: world-readable.
drop policy if exists facets_select on public.catalog_facets;
create policy facets_select on public.catalog_facets
  for select using (true);

-- ingestion_runs: no browser access at all. Service role only, which bypasses RLS.

-- ---------------------------------------------------------------------
-- 13. updated_at maintenance
-- ---------------------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

drop trigger if exists datasets_touch on public.datasets;
create trigger datasets_touch before update on public.datasets
  for each row execute function public.touch_updated_at();

drop trigger if exists profiles_touch on public.profiles;
create trigger profiles_touch before update on public.profiles
  for each row execute function public.touch_updated_at();

-- Done.
