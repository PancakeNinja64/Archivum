import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Record a delisting-relevant outcome observed during ingest.
 *
 * Ingest and probing observe the same thing through different lenses. The
 * prober asks one question with one request; ingest asks many and happens to
 * learn the answer on the way. Both are real observations and both belong in
 * the same log — otherwise the three-strike rule sees only half the evidence,
 * and a dataset could fail ingest daily for a week while its probe history
 * stays empty.
 *
 * Kept out of probeOne.ts so ingestOne does not pull in the prober's HTTP path.
 */

type IngestOutcome = 'ok' | 'not_found' | 'gated' | 'error';

const OUTCOME_MAP: Record<IngestOutcome, string> = {
  ok: 'confirmed_present',
  not_found: 'miss',
  gated: 'gated',
  /* An error is a fact about the request, not about the dataset. Recorded so
     the history is complete, but it can never accumulate toward a delisting. */
  error: 'transient',
};

export async function recordIngestOutcome(
  db: SupabaseClient,
  datasetId: string,
  outcome: IngestOutcome,
  detail: string | null,
  previousEndState?: string | null,
): Promise<void> {
  const probeOutcome = OUTCOME_MAP[outcome];

  await db.from('dataset_probes').insert({
    dataset_id: datasetId,
    outcome: probeOutcome,
    detail: detail ?? `Observed during ingest: ${outcome}.`,
    source: 'ingest',
  });

  if (outcome === 'ok') {
    if (previousEndState) {
      await db
        .from('datasets')
        .update({ end_state: null, delisted_at: null })
        .eq('id', datasetId);

      await db.from('dataset_probes').insert({
        dataset_id: datasetId,
        outcome: 'returned',
        detail: `Previously recorded as ${previousEndState}. Retrieved again during ingest.`,
        source: 'ingest',
      });

      await db.from('dataset_changes').insert({
        dataset_id: datasetId,
        change_type: 'returned',
        severity: 'info',
        message: `Retrievable again after being recorded as ${previousEndState}.`,
        detail: { previous_end_state: previousEndState },
      });
    }
    return;
  }

  if (probeOutcome === 'transient') return;

  /* Increment the failure streak, then let the same rule the prober uses decide
     whether this is a delisting. Two code paths must never grow two different
     definitions of what counts as gone. */
  const { data: current } = await db
    .from('datasets')
    .select('slug, end_state, consecutive_failures')
    .eq('id', datasetId)
    .maybeSingle();

  await db
    .from('datasets')
    .update({
      consecutive_failures: (current?.consecutive_failures ?? 0) + 1,
      last_probed_at: new Date().toISOString(),
    })
    .eq('id', datasetId);

  const { data: promotion } = await db.rpc('evaluate_delisting', {
    p_dataset_id: datasetId,
  });
  const promotedTo = typeof promotion === 'string' ? promotion : null;
  if (!promotedTo || current?.end_state === promotedTo) return;

  const nowIso = new Date().toISOString();
  await db
    .from('datasets')
    .update({ end_state: promotedTo, delisted_at: nowIso })
    .eq('id', datasetId);

  await db.from('dataset_probes').insert({
    dataset_id: datasetId,
    outcome: 'delisted',
    detail: `Promoted to ${promotedTo}: failed on three distinct UTC days spanning at least 48 hours.`,
    source: 'ingest',
  });

  await db.from('dataset_changes').insert({
    dataset_id: datasetId,
    change_type: 'delisted',
    severity: 'warning',
    message:
      promotedTo === 'gated'
        ? `${current?.slug ?? 'This record'} is still present but now requires approval.`
        : `${current?.slug ?? 'This record'} no longer answers. Recorded as unreachable.`,
    detail: { end_state: promotedTo },
  });
}
