-- =====================================================================
-- Archivum — Delisted / decay board
-- Paste into the Supabase SQL Editor and press Run. Safe to re-run.
--
-- Additive only. Nothing here alters an existing column, drops a policy
-- another feature depends on, or changes the meaning of `status`.
--
-- Design notes:
--   * `dataset_probes` is append-only. Rows are never updated or deleted;
--     a retraction is a new row, not an edit. The table is the evidence
--     behind every delisting claim the site makes, and evidence that can
--     be silently rewritten is not evidence.
--   * Delisting state lives ON `datasets`, not in a parallel table. A
--     delisted dataset is still a dataset — same slug, same page, same
--     version history. Forking the identity would make every existing
--     query union two sources.
--   * `status` is untouched. It means "should Archivum show this row",
--     which is a different question from "can the source still be
--     fetched". Delisted rows stay published; a record vanishing from the
--     site when the dataset vanishes from the internet defeats the page.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. dataset_probes  (append-only retrievability log)
-- ---------------------------------------------------------------------
create table if not exists public.dataset_probes (
  id          uuid primary key default gen_random_uuid(),
  dataset_id  uuid not null references public.datasets (id) on delete cascade,

  -- confirmed_present : source answered 200/304
  -- miss              : 404
  -- gated             : 401, or 403 that is not a rate limit
  -- transient         : timeout, 5xx, 429, network failure. NEVER a strike.
  -- returned          : a delisted record answered again. Written alongside
  --                     the confirmed_present row, so the recovery is visible
  --                     in the log rather than inferred from a state change.
  -- delisted          : the moment the three-strike rule promoted this record.
  outcome     text not null check (outcome in
              ('confirmed_present','miss','gated','transient','returned','delisted')),

  http_status integer,
  detail      text,

  -- Provenance of the observation itself. 'probe' and 'ingest' are things
  -- Archivum saw. Anything else is inferred, and the API must be able to
  -- tell the difference — see the seeded/replayed values used by the
  -- backfill script. Presenting a publisher's own timestamp as an Archivum
  -- observation is the one mistake that would cost the catalog its
  -- credibility, and it is invisible once the rows are in the table.
  source      text not null default 'probe'
              check (source in ('probe','ingest','seeded','replayed','manual')),

  probed_at   timestamptz not null default now(),

  -- Stored, not derived at read time. The three-strike rule counts DISTINCT
  -- UTC CALENDAR DAYS; computing that in each query would put a timezone
  -- assumption in every caller and make the rule depend on who is asking.
  probe_day   date generated always as (((probed_at at time zone 'utc'))::date) stored
);

create index if not exists dataset_probes_idx
  on public.dataset_probes (dataset_id, probed_at desc);
create index if not exists dataset_probes_day_idx
  on public.dataset_probes (dataset_id, probe_day);
create index if not exists dataset_probes_outcome_idx
  on public.dataset_probes (outcome, probed_at desc);

-- ---------------------------------------------------------------------
-- 2. Delisting state on datasets
-- ---------------------------------------------------------------------
alter table public.datasets
  add column if not exists end_state text
    check (end_state in ('superseded','gated','withdrawn','unreachable')),
  add column if not exists first_observed timestamptz,
  add column if not exists last_confirmed timestamptz,
  add column if not exists consecutive_failures integer not null default 0,
  add column if not exists superseded_by text,
  add column if not exists delisted_at timestamptz,
  add column if not exists last_probed_at timestamptz;

-- The frozen 28 checks at the final successful retrieval.
--
-- This column is why the panel can still show a coverage matrix for a
-- dataset that no longer exists. `coverage_detail` is overwritten on every
-- successful ingest and the source is gone, so once a record is delisted
-- there is no way to recompute what was documented. Without a frozen copy
-- taken at the moment of last success, that information is lost forever.
alter table public.datasets
  add column if not exists checks_at_last_check jsonb;

-- Partial index: the board reads only delisted rows, which are a small
-- fraction of the catalog.
create index if not exists datasets_delisted_idx
  on public.datasets (end_state, last_confirmed desc)
  where end_state is not null;

-- Probe scheduling reads this every run, across the whole catalog.
create index if not exists datasets_last_probed_idx
  on public.datasets (last_probed_at asc nulls first)
  where status = 'published';

-- ---------------------------------------------------------------------
-- 3. dataset_changes — two new change types
-- ---------------------------------------------------------------------
-- 'delisted' and 'returned' need to appear in the activity feed like any
-- other observed change. The existing check constraint has to be replaced
-- rather than extended; there is no ADD VALUE for a CHECK.
alter table public.dataset_changes
  drop constraint if exists dataset_changes_change_type_check;

alter table public.dataset_changes
  add constraint dataset_changes_change_type_check
  check (change_type in (
    'license-change','coverage-drop','coverage-gain','new-version',
    'deprecated','lineage-updated','delisted','returned'
  ));

-- ---------------------------------------------------------------------
-- 4. evaluate_delisting — the three-strike rule
-- ---------------------------------------------------------------------
-- Promote only when BOTH hold:
--   1. failed probes on three DISTINCT UTC calendar days
--   2. at least 48 hours between the first and most recent failure
--
-- Two conditions rather than one because they catch different mistakes.
-- Three days alone would let a single bad afternoon — three probes at
-- 23:50, 23:55, 00:05 — cross two calendar days and look like persistence.
-- Forty-eight hours alone would let one long outage promote a record that
-- was only ever checked twice.
create or replace function public.evaluate_delisting(p_dataset_id uuid)
returns text
language plpgsql
stable
security definer set search_path = public
as $$
declare
  v_days    integer;
  v_first   timestamptz;
  v_last    timestamptz;
  v_outcome text;
  v_success timestamptz;
begin
  -- Only the failure streak since the most recent success counts. A dataset
  -- that failed twice in March, came back, and failed once today has one
  -- strike, not three.
  select max(probed_at) into v_success
  from public.dataset_probes
  where dataset_id = p_dataset_id and outcome = 'confirmed_present';

  select count(distinct probe_day), min(probed_at), max(probed_at)
    into v_days, v_first, v_last
  from public.dataset_probes
  where dataset_id = p_dataset_id
    and outcome in ('miss','gated')
    and probed_at > coalesce(v_success, '-infinity'::timestamptz);

  if coalesce(v_days, 0) < 3 then
    return null;
  end if;
  if (v_last - v_first) < interval '48 hours' then
    return null;
  end if;

  -- The most recent failure names the mode. A record that 404s after having
  -- been gated is unreachable; one still answering 403 is gated.
  select outcome into v_outcome
  from public.dataset_probes
  where dataset_id = p_dataset_id
    and outcome in ('miss','gated')
    and probed_at > coalesce(v_success, '-infinity'::timestamptz)
  order by probed_at desc
  limit 1;

  -- Only these two states are reachable from HTTP.
  --
  -- 'withdrawn' asserts the publisher CHOSE to remove the record, and
  -- 'superseded' asserts a named successor exists. Neither fact is in a
  -- status code. Both require a publisher signal or human entry. Defaulting
  -- a 404 to 'withdrawn' would have Archivum claim an act it never observed.
  return case when v_outcome = 'gated' then 'gated' else 'unreachable' end;
end;
$$;

-- ---------------------------------------------------------------------
-- 5. get_delisted_records — the board's read path
-- ---------------------------------------------------------------------
create or replace function public.get_delisted_records()
returns table (
  slug                 text,
  name                 text,
  publisher            text,
  platform             text,
  coverage_total       integer,
  license_spdx         text,
  size_rows            bigint,
  versions             integer,
  checks_at_last_check jsonb,
  end_state            text,
  first_observed       timestamptz,
  last_confirmed       timestamptz,
  consecutive_failures integer,
  superseded_by        text,
  observed             boolean
)
language sql
stable
as $$
  select
    d.slug, d.name, d.publisher, d.platform,
    d.coverage_total, d.license_spdx, d.size_rows,
    (select count(*)::integer from public.dataset_versions v where v.dataset_id = d.id),
    d.checks_at_last_check,
    d.end_state, d.first_observed, d.last_confirmed,
    d.consecutive_failures, d.superseded_by,
    -- True when at least one probe behind this record was a live Archivum
    -- observation rather than a seeded or replayed one. Surfaced so the UI
    -- can label inferred dates instead of passing them off as observations.
    exists (
      select 1 from public.dataset_probes p
      where p.dataset_id = d.id and p.source in ('probe','ingest')
    )
  from public.datasets d
  where d.status = 'published'
    and d.end_state is not null
  order by d.last_confirmed desc nulls last;
$$;

-- ---------------------------------------------------------------------
-- 6. probe_health — the invariant the decay index depends on
-- ---------------------------------------------------------------------
-- If the probe cycle is slower than roughly daily, `last_confirmed` carries
-- the cycle length as error, and the elapsed-time term — the single largest
-- contributor to the decay index — starts measuring the cron schedule
-- rather than the loss. This function makes that measurable instead of
-- something discovered later from a staircase-shaped board.
create or replace function public.probe_health()
returns table (
  published_total    bigint,
  never_probed       bigint,
  stalest_probe_age  numeric,
  median_probe_age   numeric
)
language sql
stable
as $$
  select
    count(*),
    count(*) filter (where last_probed_at is null),
    round(max(extract(epoch from (now() - last_probed_at)) / 86400)::numeric, 2),
    round((percentile_cont(0.5) within group (
      order by extract(epoch from (now() - last_probed_at)) / 86400))::numeric, 2)
  from public.datasets
  where status = 'published';
$$;

-- ---------------------------------------------------------------------
-- 7. Row Level Security
-- ---------------------------------------------------------------------
alter table public.dataset_probes enable row level security;

-- Readable when the parent dataset is published — the same shape as the
-- coverage_snapshots and dataset_changes policies.
drop policy if exists probes_select on public.dataset_probes;
create policy probes_select on public.dataset_probes
  for select using (exists (
    select 1 from public.datasets d
    where d.id = dataset_id and d.status = 'published'
  ));

-- Writes are service-role only, which bypasses RLS. No insert policy by
-- design: nothing in a browser should ever append to the evidence log.

grant select on public.dataset_probes to anon, authenticated;
grant execute on function public.get_delisted_records() to anon, authenticated;
grant execute on function public.probe_health() to service_role;
grant execute on function public.evaluate_delisting(uuid) to service_role;

-- Done.
