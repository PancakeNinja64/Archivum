import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';
import { serverConfig } from '../config';
import { adapterFor } from '../sources';
import { sourceFetch } from '../sources/fetcher';

/**
 * Retrievability probe.
 *
 * Separate from ingestOne on purpose. Ingest asks "what does this dataset
 * contain now" and issues five to eight requests to answer it. The prober asks
 * one question — does the source still answer — and issues one request.
 *
 * The two also run on different schedules for a reason. Ingest is about content
 * freshness and can lag by days without consequence. Probing is about WHEN
 * something stopped being retrievable, and every day of lag is a day of error
 * in the largest term of the decay index.
 *
 * Nothing here judges a publisher. A probe records what an HTTP endpoint did.
 */

export type ProbeOutcome =
  | 'confirmed_present'
  | 'miss'
  | 'gated'
  | 'transient';

export interface ProbeResult {
  outcome: ProbeOutcome;
  httpStatus: number;
  detail: string;
}

export interface ProbeSummary extends ProbeResult {
  datasetId: string;
  /** Set when this probe promoted the record to a terminal end state. */
  promotedTo?: string;
  /** Set when a delisted record answered again. */
  recovered?: boolean;
}

/** Where each adapter's cheapest existence check lives. */
function probeUrl(platform: string, sourceId: string): string | null {
  if (platform === 'huggingface') return `https://huggingface.co/api/datasets/${sourceId}`;
  if (platform === 'github') return `https://api.github.com/repos/${sourceId}`;
  return null;
}

function tokenFor(platform: string): string | null {
  if (platform === 'huggingface') return serverConfig.hfToken;
  if (platform === 'github') return serverConfig.githubToken;
  return null;
}

/**
 * Map one HTTP response to a probe outcome.
 *
 * Exported so it can be tested directly against synthesised responses. The
 * cost of getting this wrong is not a broken page — it is a published claim
 * that a dataset disappeared when it did not.
 */
export function classify(
  platform: string,
  status: number,
  rateLimitRemaining: string | null,
  sourceId: string,
): ProbeResult {
  if (status === 200 || status === 304) {
    return {
      outcome: 'confirmed_present',
      httpStatus: status,
      detail: `Retrieved ${sourceId} from ${platform}.`,
    };
  }

  if (status === 404 || status === 410) {
    return {
      outcome: 'miss',
      httpStatus: status,
      detail: `${platform} returned ${status} for ${sourceId}.`,
    };
  }

  if (status === 401) {
    return {
      outcome: 'gated',
      httpStatus: status,
      detail: `${platform} returned 401 for ${sourceId} — access now requires credentials.`,
    };
  }

  if (status === 403) {
    /*
     * The one genuinely ambiguous status, and it is ambiguous on GitHub only.
     *
     * GitHub answers 403 both for a private repository and for an exhausted
     * rate limit, and only `x-ratelimit-remaining` separates them. Read it as a
     * rate limit when the budget is at zero, and also when the header is absent
     * entirely: an unknown cause must not become a published claim that a
     * publisher restricted access. A missed gate is a delisting recorded a few
     * days late. A misread rate limit is a fabricated cluster of delistings
     * across every dataset that happened to be in the batch when the budget ran
     * out.
     *
     * Hugging Face does not send that header and uses 403 to mean the dataset
     * is gated behind terms. Applying GitHub's caution there would mean HF
     * gating is NEVER recorded — every gated dataset would read as a permanent
     * transient and the `gated` lane would stay empty forever.
     */
    if (platform === 'github') {
      const exhausted = rateLimitRemaining === null || rateLimitRemaining === '0';
      if (exhausted) {
        return {
          outcome: 'transient',
          httpStatus: 403,
          detail: `GitHub returned 403 for ${sourceId} with the rate-limit budget exhausted or unreported. Not treated as a gate.`,
        };
      }
      return {
        outcome: 'gated',
        httpStatus: 403,
        detail: `GitHub returned 403 for ${sourceId} with rate-limit budget remaining — access now requires approval.`,
      };
    }

    return {
      outcome: 'gated',
      httpStatus: 403,
      detail: `${platform} returned 403 for ${sourceId} — access now requires approval.`,
    };
  }

  /* 429, 5xx, and status 0 (timeout or network failure). Never a strike. */
  return {
    outcome: 'transient',
    httpStatus: status,
    detail:
      status === 0
        ? `No response from ${platform} for ${sourceId} — timeout or network failure.`
        : `${platform} returned ${status} for ${sourceId}.`,
  };
}

export interface ProbeTarget {
  id: string;
  slug: string;
  platform: string;
  source_identifier: string;
  end_state: string | null;
  consecutive_failures: number;
  created_at: string;
  first_observed: string | null;
}

/**
 * Probe one dataset and record the result.
 *
 * Never throws. One unparseable identifier must not abort a batch — the same
 * contract ingestOne keeps.
 */
export async function probeOne(
  db: SupabaseClient,
  target: ProbeTarget,
): Promise<ProbeSummary> {
  const nowIso = new Date().toISOString();

  const adapter = adapterFor(target.platform);
  const url = probeUrl(target.platform, target.source_identifier);
  if (!adapter || !url) {
    /* An unsupported platform is a gap in Archivum, not a fact about the
       dataset. Record it as transient so it can never accumulate strikes. */
    const detail = `No prober for platform ${target.platform}.`;
    await db.from('dataset_probes').insert({
      dataset_id: target.id,
      outcome: 'transient',
      http_status: null,
      detail,
      source: 'probe',
    });
    return { datasetId: target.id, outcome: 'transient', httpStatus: 0, detail };
  }

  const res = await sourceFetch(url, { token: tokenFor(target.platform) });
  const result = classify(
    target.platform,
    res.status,
    res.rateLimitRemaining,
    target.source_identifier,
  );

  await db.from('dataset_probes').insert({
    dataset_id: target.id,
    outcome: result.outcome,
    http_status: result.httpStatus || null,
    detail: result.detail,
    source: 'probe',
  });

  /* last_probed_at moves on every probe including transients — it measures
     coverage of the probing schedule, not success. last_confirmed only moves
     on success, because that is what the decay index reads. */
  const patch: Record<string, unknown> = { last_probed_at: nowIso };

  if (result.outcome === 'transient') {
    await db.from('datasets').update(patch).eq('id', target.id);
    return { datasetId: target.id, ...result };
  }

  if (result.outcome === 'confirmed_present') {
    patch.last_confirmed = nowIso;
    patch.consecutive_failures = 0;
    patch.first_observed = target.first_observed ?? target.created_at;

    const recovered = target.end_state !== null;
    if (recovered) {
      patch.end_state = null;
      patch.delisted_at = null;
    }

    await db.from('datasets').update(patch).eq('id', target.id);

    if (recovered) {
      /*
       * A record coming back is the most informative event this system can
       * observe: direct evidence about whether the three-strike rule is
       * over-eager. It gets its own probe row and its own change row rather
       * than being a silent state reversion, so the history stays auditable.
       */
      await db.from('dataset_probes').insert({
        dataset_id: target.id,
        outcome: 'returned',
        http_status: result.httpStatus,
        detail: `Previously recorded as ${target.end_state}. Retrieved again.`,
        source: 'probe',
      });
      await db.from('dataset_changes').insert({
        dataset_id: target.id,
        change_type: 'returned',
        severity: 'info',
        message: `${target.slug} is retrievable again after being recorded as ${target.end_state}.`,
        detail: { previous_end_state: target.end_state },
      });
    }

    return { datasetId: target.id, ...result, recovered };
  }

  /* miss or gated */
  patch.consecutive_failures = target.consecutive_failures + 1;
  await db.from('datasets').update(patch).eq('id', target.id);

  const { data: promotion } = await db.rpc('evaluate_delisting', {
    p_dataset_id: target.id,
  });
  const promotedTo = typeof promotion === 'string' ? promotion : null;

  if (promotedTo && target.end_state !== promotedTo) {
    await db
      .from('datasets')
      .update({ end_state: promotedTo, delisted_at: nowIso })
      .eq('id', target.id);

    await db.from('dataset_probes').insert({
      dataset_id: target.id,
      outcome: 'delisted',
      http_status: result.httpStatus,
      detail: `Promoted to ${promotedTo}: failed on three distinct UTC days spanning at least 48 hours.`,
      source: 'probe',
    });

    await db.from('dataset_changes').insert({
      dataset_id: target.id,
      change_type: 'delisted',
      severity: 'warning',
      message:
        promotedTo === 'gated'
          ? `${target.slug} is still present but now requires approval.`
          : `${target.slug} no longer answers. Recorded as unreachable.`,
      detail: { end_state: promotedTo, http_status: result.httpStatus },
    });

    return { datasetId: target.id, ...result, promotedTo };
  }

  return { datasetId: target.id, ...result };
}
