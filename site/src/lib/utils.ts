import type { TrustTier } from './types';

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

export const tierLabel: Record<TrustTier, string> = {
  verified: 'Verified',
  inferred: 'Inferred',
  asserted: 'Asserted',
};

export const tierColorVar: Record<TrustTier, string> = {
  verified: 'var(--tier-verified)',
  inferred: 'var(--tier-inferred)',
  asserted: 'var(--tier-asserted)',
};

export const platformLabel: Record<string, string> = {
  huggingface: 'Hugging Face',
  kaggle: 'Kaggle',
  github: 'GitHub',
  academic: 'Academic',
  direct: 'Direct',
};

export function scoreColorVar(score: number): string {
  if (score >= 85) return 'var(--tier-verified)';
  if (score >= 60) return 'var(--tier-inferred)';
  if (score >= 45) return 'var(--tier-asserted)';
  return 'var(--risk)';
}
