/**
 * Delisted records — frontend contract.
 *
 * Vocabulary note, load-bearing here: Archivum reports what was observed at the
 * final successful check. Nothing on this surface is a judgement about the
 * publisher. Records are delisted for good reasons — takedowns, licence
 * corrections, privacy complaints — and the copy must never imply otherwise.
 */

import type { CoverageBand, Platform } from '@/lib/types';

/** How the record stopped being retrievable. Observed, not inferred. */
export type EndState = 'superseded' | 'gated' | 'withdrawn' | 'unreachable';

/** What the terrain's depth channel encodes. Mass is a choice, so it is a control. */
export type MassMetric = 'rows' | 'coverage' | 'dependents';

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

  endState: EndState;
  /** ISO date of the final successful check. */
  lastConfirmed: string;
  /** Named successor. Only for endState === 'superseded'. */
  supersededBy?: string;

  /**
   * Downstream references. Null until the ingestion exists.
   * NEVER substitute a placeholder. A fabricated dependency count on a
   * provenance product is the worst thing this codebase could ship.
   */
  dependentModels: number | null;
  dependentPapers: number | null;

  /** Terrain position, roughly -700..700 by -450..600. */
  x: number;
  z: number;
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
  mass: MassMetric;
}

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

/** Live figure about a dead object — derived at render, never stored. */
export function lightAge(lastConfirmed: string): number {
  const then = Date.parse(lastConfirmed);
  if (Number.isNaN(then)) return 0;
  return Math.max(0, Math.floor((Date.now() - then) / 86_400_000));
}
