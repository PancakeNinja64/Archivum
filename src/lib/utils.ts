import type { CoverageBand, EvidenceLabel } from './types';

export const fmtInt = (n: number) => n.toLocaleString('en-US');

export function fmtBytes(n: number): string {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let i = 0;
  while (n >= 1000 && i < units.length - 1) { n /= 1000; i++; }
  return `${n >= 100 ? Math.round(n) : n.toFixed(1)} ${units[i]}`;
}

export function fmtRelative(iso: string): string {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (days < 1) return 'today';
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  const y = Math.floor(days / 365);
  return `${y}y ago`;
}

export function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

/** Evidence labels — how a piece of information was established. */
export const evidenceLabel: Record<EvidenceLabel, string> = {
  documented: 'Documented',
  reported: 'Reported',
  not_found: 'Not found',
};

/** Reuses the existing token palette; the tokens themselves are unchanged. */
export const evidenceColorVar: Record<EvidenceLabel, string> = {
  documented: 'var(--tier-verified)',
  reported: 'var(--tier-inferred)',
  not_found: 'var(--tier-asserted)',
};

/** Dataset-level Documentation Coverage bands. Descriptive, never evaluative. */
export const bandLabel: Record<CoverageBand, string> = {
  extensive: 'Extensively documented',
  partial: 'Partially documented',
  minimal: 'Minimally documented',
};

export const bandColorVar: Record<CoverageBand, string> = {
  extensive: 'var(--tier-verified)',
  partial: 'var(--tier-inferred)',
  minimal: 'var(--tier-asserted)',
};

export function bandFor(total: number): CoverageBand {
  if (total >= 75) return 'extensive';
  if (total >= 40) return 'partial';
  return 'minimal';
}

export function coverageColorVar(total: number): string {
  return bandColorVar[bandFor(total)];
}

export const platformLabel: Record<string, string> = {
  huggingface: 'Hugging Face',
  kaggle: 'Kaggle',
  github: 'GitHub',
  academic: 'Academic',
  direct: 'Direct',
};

export const commercialUseLabel: Record<string, string> = {
  permitted: 'commercial use permitted',
  restricted: 'non-commercial terms',
  prohibited: 'commercial use prohibited',
  not_stated: 'terms not stated',
};
