/**
 * Decay index — how far a record has moved from retrievable.
 *
 * READ THIS BEFORE CHANGING ANYTHING HERE.
 *
 * The index is a property of the RECORD's retrievability. It is not a rating of
 * the dataset, not a measure of the publisher's diligence, and not a verdict of
 * any kind. Every term is an observation Archivum made and can point at.
 *
 * The index is only defensible because it is disclosed: every surface that
 * shows the number also shows which signals produced it and how many of the
 * four were available. A number without a visible method is an unsupported
 * claim; a number with one is an observation. Do not ship the number alone.
 *
 * Pure. No I/O, no DOM, no React.
 */

import { END_STATE_SEVERITY, lightAge, type DelistedRecord } from './types';

/** Elapsed-time term saturates here. Three years without a retrieval is the ceiling. */
export const AGE_CEILING_DAYS = 1095;

/**
 * Reference point for the downstream-reference term. Not a maximum: a record
 * with more references than this simply pins the term at 1.
 */
export const DEPS_REFERENCE = 500;

export type DecayTermKey = 'elapsed' | 'mode' | 'documentation' | 'downstream';

/** Nominal weights, all four signals present. */
export const NOMINAL_WEIGHTS: Record<DecayTermKey, number> = {
  elapsed: 0.45,
  mode: 0.25,
  documentation: 0.2,
  downstream: 0.1,
};

export const TERM_LABEL: Record<DecayTermKey, string> = {
  elapsed: 'Elapsed since last confirmed',
  mode: 'Mode of loss',
  documentation: 'Documentation deficit',
  downstream: 'Downstream references',
};

export const TERM_METHOD: Record<DecayTermKey, string> = {
  elapsed: 'Days since the final successful check, saturating at three years.',
  mode: 'How the record stopped being retrievable, ranked by recoverability.',
  documentation:
    'The share of the 28 coverage checks absent at the final check. A well-documented record leaves a usable description behind; a minimally documented one leaves nothing.',
  downstream:
    'Models and papers referencing a record that can no longer be retrieved.',
};

export interface DecayTerm {
  key: DecayTermKey;
  label: string;
  method: string;
  /** True when Archivum has the observation this term needs. */
  available: boolean;
  /** Normalised 0..1 reading. Null when unavailable. */
  value: number | null;
  /** Weight actually applied after renormalisation. Zero when unavailable. */
  weight: number;
  /** Points this term contributed to the index, 0..100. */
  contribution: number;
}

export interface DecayResult {
  /** 0..100, one decimal place. */
  index: number;
  terms: DecayTerm[];
  signalsUsed: number;
  signalsTotal: number;
}

export type DecayBand = 'shallow' | 'moderate' | 'deep';

export const DECAY_BAND_LABEL: Record<DecayBand, string> = {
  shallow: 'Shallow decay',
  moderate: 'Moderate decay',
  deep: 'Deep decay',
};

export function decayBand(index: number): DecayBand {
  if (index >= 65) return 'deep';
  if (index >= 35) return 'moderate';
  return 'shallow';
}

function clamp01(n: number): number {
  return Math.min(1, Math.max(0, n));
}

/** Sublinear on purpose: a loss six months old should still register visibly. */
export function elapsedTerm(days: number): number {
  return clamp01(days / AGE_CEILING_DAYS) ** 0.7;
}

export function downstreamTerm(total: number): number {
  return clamp01(Math.log10(1 + total) / Math.log10(1 + DEPS_REFERENCE));
}

/**
 * Compute the index for one record.
 *
 * When a signal is unavailable the remaining weights renormalise to sum to 1,
 * so the index stays on the same 0..100 scale rather than silently shrinking.
 * The alternative — treating a missing observation as a zero reading — would
 * report "no orphaned citations" when the truth is "not measured". That is
 * fabrication, and it is the one thing this file exists to prevent.
 */
export function decayIndex(rec: DelistedRecord): DecayResult {
  const deps =
    rec.dependentModels === null || rec.dependentPapers === null
      ? null
      : rec.dependentModels + rec.dependentPapers;

  const readings: Record<DecayTermKey, number | null> = {
    elapsed: elapsedTerm(lightAge(rec.lastConfirmed)),
    mode: END_STATE_SEVERITY[rec.endState],
    documentation: clamp01((100 - rec.coverageTotal) / 100),
    downstream: deps === null ? null : downstreamTerm(deps),
  };

  const keys = Object.keys(NOMINAL_WEIGHTS) as DecayTermKey[];
  const availableWeight = keys.reduce(
    (sum, k) => (readings[k] === null ? sum : sum + NOMINAL_WEIGHTS[k]),
    0,
  );

  let index = 0;
  const terms: DecayTerm[] = keys.map((key) => {
    const value = readings[key];
    const weight =
      value === null || availableWeight === 0 ? 0 : NOMINAL_WEIGHTS[key] / availableWeight;
    const contribution = value === null ? 0 : 100 * weight * value;
    index += contribution;
    return {
      key,
      label: TERM_LABEL[key],
      method: TERM_METHOD[key],
      available: value !== null,
      value,
      weight,
      contribution,
    };
  });

  return {
    index: Math.round(index * 10) / 10,
    terms,
    signalsUsed: terms.filter((t) => t.available).length,
    signalsTotal: keys.length,
  };
}

/** The disclosure that must travel with every index shown in the UI. */
export function signalsNote(result: DecayResult): string {
  const missing = result.terms.filter((t) => !t.available);
  const base = `Computed from ${result.signalsUsed} of ${result.signalsTotal} signals.`;
  if (missing.length === 0) return base;
  const names = missing.map((t) => t.label.toLowerCase()).join(', ');
  return `${base} Not yet measured: ${names}.`;
}
