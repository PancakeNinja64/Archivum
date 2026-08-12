/**
 * Delisted records — frontend contract.
 *
 * Vocabulary note, load-bearing here: Archivum reports what was observed at the
 * final successful check. Nothing on this surface is a judgement about the
 * publisher. Records are delisted for good reasons — takedowns, licence
 * corrections, privacy complaints — and the copy must never imply otherwise.
 *
 * The decay index measures how far a RECORD has moved from retrievable. It is
 * never a statement about the publisher's conduct. See lib/graveyard/decay.ts.
 */

import type { CheckResult, CoverageDetail } from '@/lib/coverage/rules';
import { COVERAGE_CHECKS } from '@/lib/coverage/rules';
import type { CoverageBand, Platform } from '@/lib/types';

/** How the record stopped being retrievable. Observed, not inferred. */
export type EndState = 'superseded' | 'gated' | 'withdrawn' | 'unreachable';

export interface DelistedRecord {
  slug: string;
  name: string;
  publisher: string;
  platform: Platform;

  /** Last state observed while the record was still retrievable. */
  coverageTotal: number;
  coverageBand: CoverageBand;
  license: string;
  sizeRows: number;
  versions: number;

  /**
   * The 28 check outcomes at the final successful check, one character each,
   * in COVERAGE_CHECKS order. d = documented, r = reported, n = not found,
   * x = not applicable. Stored encoded because it is a frozen snapshot, never
   * recomputed — the source is gone, so there is nothing left to check.
   */
  checksAtLastCheck: string;

  endState: EndState;
  /** ISO date of the first successful check. */
  firstObserved: string;
  /** ISO date of the final successful check. */
  lastConfirmed: string;
  /** Consecutive failed probes since. Three promotes the record to unreachable. */
  consecutiveFailures: number;
  /** Named successor. Only for endState === 'superseded'. */
  supersededBy?: string;

  /**
   * Downstream references. Null until the ingestion exists.
   * NEVER substitute a placeholder. A fabricated dependency count on a
   * provenance product is the worst thing this codebase could ship.
   */
  dependentModels: number | null;
  dependentPapers: number | null;
}

export interface DelistedField {
  records: DelistedRecord[];
  total: number;
}

/** Active filter state, mirrored into the URL. */
export interface DelistedFilters {
  query: string;
  endStates: EndState[];
  platforms: Platform[];
}

export const END_STATES: EndState[] = ['superseded', 'gated', 'withdrawn', 'unreachable'];

export const END_STATE_LABEL: Record<EndState, string> = {
  superseded: 'Superseded',
  gated: 'Gated',
  withdrawn: 'Withdrawn',
  unreachable: 'Unreachable',
};

/** Observation, not verdict. Each reads as something the crawler saw. */
export const END_STATE_NOTE: Record<EndState, string> = {
  superseded: 'Publisher named a successor record.',
  gated: 'Still present. Access now requires approval.',
  withdrawn: 'Removed by the publisher.',
  unreachable: 'Endpoint returned an error on three consecutive checks.',
};

export const END_STATE_TOKEN: Record<EndState, string> = {
  superseded: '--tier-verified',
  gated: '--tier-inferred',
  withdrawn: '--tier-asserted',
  unreachable: '--risk',
};

/**
 * Severity of the mode of loss, ordered by RECOVERABILITY — not by how bad the
 * publisher's decision was. A superseded record still has a lineage to follow;
 * an unreachable one has not even an explanation attached to it.
 *
 * This ordering is also the left-to-right lane order on the board, so the X
 * axis carries meaning rather than being alphabetical.
 */
export const END_STATE_SEVERITY: Record<EndState, number> = {
  superseded: 0.15,
  gated: 0.4,
  withdrawn: 0.85,
  unreachable: 1,
};

const CODE_TO_RESULT: Record<string, CheckResult> = {
  d: 'documented',
  r: 'reported',
  n: 'not_found',
  x: 'n/a',
};

export const RESULT_TO_CODE: Record<CheckResult, string> = {
  documented: 'd',
  reported: 'r',
  not_found: 'n',
  'n/a': 'x',
};

/** Expand the frozen snapshot back into a CoverageDetail the shared UI understands. */
export function decodeChecks(encoded: string): CoverageDetail {
  const out: CoverageDetail = {};
  COVERAGE_CHECKS.forEach((check, i) => {
    out[check.id] = CODE_TO_RESULT[encoded[i]] ?? 'not_found';
  });
  return out;
}

/** Live figure about a record that is gone — derived at render, never stored. */
export function lightAge(lastConfirmed: string): number {
  const then = Date.parse(lastConfirmed);
  if (Number.isNaN(then)) return 0;
  return Math.max(0, Math.floor((Date.now() - then) / 86_400_000));
}
