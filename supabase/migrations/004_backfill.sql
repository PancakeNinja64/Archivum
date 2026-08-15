-- =====================================================================
-- Archivum — Delisted backfill (OPTIONAL, run once, read §Seeding first)
--
-- This script replays observations Archivum already made into the probe log.
-- It does NOT invent anything, but it does change what the decay index means,
-- and that change must be disclosed on /docs/ before the board goes public.
--
-- Every row it writes carries source = 'replayed' or 'seeded', so the API can
-- tell an inferred date from an observed one. Do not remove that distinction
-- to tidy the data. Once seeded rows are indistinguishable from live probes,
-- Archivum can no longer answer "how do you know" about its own board, and
-- that question is the entire product.
--
-- Run each section separately and read the counts before proceeding.
-- =====================================================================

-- ---------------------------------------------------------------------
-- Section 1 — replay ingestion_runs (STRONGEST source; run this first)
-- ---------------------------------------------------------------------
-- Every `skipped` run since the cron went live carries a timestamp, a dataset,
-- and prose naming the outcome. These are real Archivum observations that were
-- simply never persisted against the dataset. Replaying them is recovery, not
-- inference — which is why they are the only backfill worth doing unreservedly.
--
-- Preview first:
select
  count(*) as replayable_runs,
  count(distinct dataset_id) as datasets_affected,
  min(started_at)::date as earliest,
  max(started_at)::date as latest
from public.ingestion_runs
where status = 'skipped'
  and dataset_id is not null
  and (error_message ilike '%404%' or error_message ilike '%403%' or error_message ilike '%401%');

-- Then insert:
insert into public.dataset_probes (dataset_id, outcome, http_status, detail, source, probed_at)
select
  r.dataset_id,
  case
    when r.error_message ilike '%404%' then 'miss'
    else 'gated'
  end,
  case
    when r.error_message ilike '%404%' then 404
    when r.error_message ilike '%403%' then 403
    when r.error_message ilike '%401%' then 401
  end,
  'Replayed from ingestion_runs: ' || coalesce(r.error_message, 'outcome recorded without detail'),
  'replayed',
  r.started_at
from public.ingestion_runs r
where r.status = 'skipped'
  and r.dataset_id is not null
  and (r.error_message ilike '%404%' or r.error_message ilike '%403%' or r.error_message ilike '%401%')
  -- Idempotent: never double-replay the same run.
  and not exists (
    select 1 from public.dataset_probes p
    where p.dataset_id = r.dataset_id
      and p.source = 'replayed'
      and p.probed_at = r.started_at
  );

-- A GitHub 403 in this data cannot be disambiguated from a rate limit —
-- x-ratelimit-remaining was not captured at the time. Downgrade those to
-- transient rather than let them count toward a delisting. A late delisting is
-- a small cost; a fabricated one is not.
update public.dataset_probes p
set outcome = 'transient',
    detail = detail || ' [Downgraded: GitHub 403 could not be distinguished from a rate limit in historical data.]'
from public.datasets d
where p.dataset_id = d.id
  and p.source = 'replayed'
  and p.outcome = 'gated'
  and p.http_status = 403
  and d.platform = 'github';

-- ---------------------------------------------------------------------
-- Section 2 — successful ingests as confirmed_present
-- ---------------------------------------------------------------------
-- coverage_snapshots has one row per successful re-check. Each is proof the
-- source answered on that date. Replaying them gives the three-strike rule its
-- "most recent success" boundary and stops a single old failure from looking
-- like an unbroken streak.
insert into public.dataset_probes (dataset_id, outcome, http_status, detail, source, probed_at)
select
  cs.dataset_id, 'confirmed_present', 200,
  'Replayed from coverage_snapshots: coverage was computed, so the source answered.',
  'replayed', cs.observed_at
from public.coverage_snapshots cs
where not exists (
  select 1 from public.dataset_probes p
  where p.dataset_id = cs.dataset_id
    and p.source = 'replayed'
    and p.probed_at = cs.observed_at
);

-- ---------------------------------------------------------------------
-- Section 3 — seed last_confirmed for records with no probe history
-- ---------------------------------------------------------------------
-- WEAKEST source. Read this paragraph before running it.
--
-- `last_source_update` is the PUBLISHER's timestamp, not Archivum's. It says
-- when the source last changed, which is a lower bound on when it last existed
-- — not the same claim. Using it makes the board's dates partly inferred.
--
-- Only justifiable if the alternative is a board with nothing on it, and only
-- with the disclosure in place. If in doubt, skip this section: option A in the
-- spec (probe forward and wait) costs months and buys a defensible number.
--
-- Uncomment to run.
--
-- insert into public.dataset_probes (dataset_id, outcome, http_status, detail, source, probed_at)
-- select d.id, 'confirmed_present', null,
--        'Seeded from platform metadata (last_source_update). Inferred, not observed by Archivum.',
--        'seeded', d.last_source_update
-- from public.datasets d
-- where d.status = 'published'
--   and d.last_source_update is not null
--   and not exists (select 1 from public.dataset_probes p where p.dataset_id = d.id);

-- ---------------------------------------------------------------------
-- Section 4 — derive dataset state from the replayed log
-- ---------------------------------------------------------------------
-- last_confirmed and first_observed follow from the probe rows.
update public.datasets d
set last_confirmed = sub.last_ok,
    first_observed = coalesce(d.first_observed, sub.first_seen, d.created_at)
from (
  select dataset_id,
         max(probed_at) filter (where outcome = 'confirmed_present') as last_ok,
         min(probed_at) as first_seen
  from public.dataset_probes
  group by dataset_id
) sub
where d.id = sub.dataset_id
  and sub.last_ok is not null;

-- Apply the three-strike rule to the replayed history. Same function the live
-- prober uses — two code paths must never grow two definitions of "gone".
update public.datasets d
set end_state = public.evaluate_delisting(d.id),
    delisted_at = now()
where d.status = 'published'
  and d.end_state is null
  and public.evaluate_delisting(d.id) is not null;

-- ---------------------------------------------------------------------
-- Section 5 — verify before trusting any of it
-- ---------------------------------------------------------------------
select
  count(*) filter (where end_state is not null) as delisted,
  count(*) filter (where end_state = 'unreachable') as unreachable,
  count(*) filter (where end_state = 'gated') as gated,
  count(*) filter (where end_state = 'withdrawn') as withdrawn,
  count(*) filter (where end_state = 'superseded') as superseded,
  count(*) filter (where end_state is not null and checks_at_last_check is null)
    as delisted_missing_checks
from public.datasets
where status = 'published';

-- `delisted_missing_checks` above SHOULD be non-zero after a backfill, and that
-- is the honest cost of it: checks_at_last_check can only be captured at the
-- moment of a successful ingest, so records that were already gone have no
-- frozen coverage matrix and never will. The panel must handle that gap rather
-- than have it filled in.

-- What proportion of the board rests on inference rather than observation.
-- If this is high, say so on /docs/.
select
  count(*) filter (where p.source in ('probe','ingest')) as observed,
  count(*) filter (where p.source in ('seeded','replayed')) as inferred
from public.dataset_probes p;
