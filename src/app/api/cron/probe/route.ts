import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { serverConfig } from '@/lib/config';
import { jsonError } from '@/lib/server/auth';
import { mapLimit } from '@/lib/sources/fetcher';
import { probeOne, type ProbeTarget } from '@/lib/probe/probeOne';

export const maxDuration = 300;

/**
 * Retrievability probe of the least-recently-probed published datasets.
 *
 * Runs three hours ahead of /api/cron/refresh so probing never competes with
 * ingest for the same rate-limit budget.
 *
 * BATCH is far larger than the ingest cron's 20 because the work is different:
 * one request per dataset, not five to eight. That difference is not a
 * performance nicety — see the staleness check below.
 */
const BATCH = 400;
const CONCURRENCY = 4;

/**
 * If the probe cycle is slower than roughly daily, `last_confirmed` carries the
 * cycle length as error, and the elapsed-time term — the largest contributor to
 * the decay index — starts measuring this cron's schedule rather than the loss
 * itself. The board would show a staircase of the batch size.
 *
 * Warn rather than fail: a stale cycle still produces usable data, it just
 * quantises the number. But it must be visible, because the symptom in the UI
 * looks like a data pattern rather than an infrastructure limit.
 */
const STALENESS_WARN_DAYS = 3;

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization') ?? '';
  let expected: string;
  try {
    expected = serverConfig.cronSecret;
  } catch {
    return jsonError(500, 'CRON_SECRET is not configured.');
  }
  if (auth !== `Bearer ${expected}`) return jsonError(401, 'Unauthorized.');

  const db = supabaseAdmin();

  const { data: due, error } = await db
    .from('datasets')
    .select(
      'id, slug, platform, source_identifier, end_state, consecutive_failures, created_at, first_observed',
    )
    .eq('status', 'published')
    .order('last_probed_at', { ascending: true, nullsFirst: true })
    .limit(BATCH);

  if (error) return jsonError(500, `Could not read the probe queue: ${error.message}`);
  if (!due?.length) return Response.json({ probed: 0 });

  const results = await mapLimit(due as ProbeTarget[], CONCURRENCY, (d) => probeOne(db, d));

  const tally = results.reduce<Record<string, number>>((acc, r) => {
    acc[r.outcome] = (acc[r.outcome] ?? 0) + 1;
    return acc;
  }, {});

  const promoted = results.filter((r) => r.promotedTo).map((r) => ({
    datasetId: r.datasetId,
    endState: r.promotedTo,
  }));
  const recovered = results.filter((r) => r.recovered).map((r) => r.datasetId);

  const { data: health } = await db.rpc('probe_health');
  const row = Array.isArray(health) ? health[0] : health;
  const stalest = Number(row?.stalest_probe_age ?? 0);
  const neverProbed = Number(row?.never_probed ?? 0);

  if (stalest > STALENESS_WARN_DAYS || neverProbed > 0) {
    console.warn(
      `[probe] cycle is falling behind: stalest probe ${stalest}d, ${neverProbed} never probed, ` +
        `batch ${BATCH} against ${row?.published_total ?? '?'} published. ` +
        `The decay index is quantising to the probe interval.`,
    );
  }

  return Response.json({
    probed: results.length,
    tally,
    promoted,
    recovered,
    health: {
      publishedTotal: Number(row?.published_total ?? 0),
      neverProbed,
      stalestProbeAgeDays: stalest,
      medianProbeAgeDays: Number(row?.median_probe_age ?? 0),
      warning: stalest > STALENESS_WARN_DAYS || neverProbed > 0,
    },
  });
}
