import type { CoverageBand, EvidenceLabel } from './types';

export const fmtInt = (n: number | null | undefined) => n == null || !Number.isFinite(n) ? 'Not stated' : n.toLocaleString('en-US');

export function fmtBytes(n: number | null | undefined): string {
  if (n == null || !Number.isFinite(n) || n < 0) return 'Not stated';
  if (n === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let i = 0;
  while (n >= 1000 && i < units.length - 1) { n /= 1000; i++; }
  return `${n >= 100 ? Math.round(n) : n.toFixed(1)} ${units[i]}`;
}

export function fmtRelative(iso: string | null | undefined): string {
  if (!iso || !Number.isFinite(Date.parse(iso))) return 'Not stated';
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (days < 0) return fmtDate(iso);
  if (days < 1) return 'today';
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  const y = Math.floor(days / 365);
  return `${y}y ago`;
}

export function fmtDate(iso: string | null | undefined): string {
  if (!iso || !Number.isFinite(Date.parse(iso))) return 'Not stated';
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' });
}

/** Evidence labels — how a piece of information was established. */
export const evidenceLabel: Record<EvidenceLabel, string> = {
  documented: 'Documented',
  reported: 'Reported',
  not_found: 'Not found',
};

/** Reuses the existing token palette; the tokens themselves are unchanged. */
export const evidenceColorVar: Record<EvidenceLabel, string> = {
  documented: 'var(--foreground)',
  reported: 'var(--muted-foreground)',
  not_found: 'var(--muted-foreground)',
};

/** Dataset-level Documentation Coverage bands. Descriptive, never evaluative. */
export const bandLabel: Record<CoverageBand, string> = {
  extensive: 'Extensively documented',
  partial: 'Partially documented',
  minimal: 'Minimally documented',
};

export const bandColorVar: Record<CoverageBand, string> = {
  extensive: 'var(--accent)',
  partial: 'var(--accent)',
  minimal: 'var(--accent)',
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

/** Source metadata can only become an external HTTP(S) link. */
export function safeExternalUrl(value: string | null | undefined): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.href : null;
  } catch { return null; }
}

/** Auth return destinations are restricted to the public routes that request sign-in. */
export function safeReturnPath(value: string | null | undefined): string {
  return value && /^\/(?:datasets\/[a-zA-Z0-9_-]+\/?|dashboard\/?|explore\/?)$/.test(value) ? value : '/dashboard/';
}
