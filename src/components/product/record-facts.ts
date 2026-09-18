/**
 * Facts the homepage reveals from one record, grouped into the four evidence
 * layers. Every value is read from the record; nothing is inferred. A missing
 * value is returned as `unresolved` so the interface can show the gap rather
 * than hide it. Facts that need the full record report `pending` until it loads.
 */
import type { Dataset, DatasetSummary, EvidenceLabel } from '@/lib/types';
import type { InspectorTab } from '@/lib/workbench/query';

export type FactState = 'documented' | 'reported' | 'unresolved' | 'pending';

export interface Fact {
  label: string;
  value: string;
  state: FactState;
  /** Identifiers, dates, licences and counts render in mono. */
  mono?: boolean;
}

export type LayerKey = 'source' | 'licence' | 'structure' | 'history';

export interface Layer {
  key: LayerKey;
  index: number;
  title: string;
  /** One-line summary shown while the record is still folded. */
  seed: string;
  facts: Fact[];
  /** Workspace tab that holds the full evidence for this layer. */
  tab: InspectorTab;
}

export const PLATFORM_LABEL: Record<string, string> = {
  huggingface: 'Hugging Face', kaggle: 'Kaggle', github: 'GitHub', academic: 'Academic', direct: 'Direct',
};

export const platformLabel = (platform: string) => PLATFORM_LABEL[platform] ?? platform;

export function formatRows(n: number | null): string {
  if (n == null) return 'Not stated';
  return new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(n);
}

export function formatBytes(n: number | null): string {
  if (n == null) return 'Not stated';
  if (n === 0) return '0 B';
  if (n >= 1e12) return `${(n / 1e12).toFixed(1)} TB`;
  if (n >= 1e9) return `${(n / 1e9).toFixed(1)} GB`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)} MB`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)} KB`;
  return `${n} B`;
}

export function formatDate(value: string | null): string {
  if (!value) return 'Not stated';
  const t = Date.parse(value);
  if (Number.isNaN(t)) return 'Not stated';
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' }).format(new Date(t));
}

export function hostOf(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return null;
    return u.host;
  } catch {
    return null;
  }
}

const evidenceState = (label: EvidenceLabel | undefined): FactState =>
  label === 'documented' ? 'documented' : label === 'reported' ? 'reported' : 'unresolved';

const stated = (value: string | null | undefined, state: FactState = 'documented', mono = false): Omit<Fact, 'label'> =>
  value ? { value, state, mono } : { value: 'Not stated', state: 'unresolved', mono };

const pending = (mono = false): Omit<Fact, 'label'> => ({ value: '…', state: 'pending', mono });

const COMMERCIAL: Record<string, string> = {
  permitted: 'Permitted by the declared licence',
  restricted: 'Restricted by the declared licence',
  prohibited: 'Prohibited by the declared licence',
  not_stated: 'Not stated',
};

const tri = (v: boolean | null, yes: string, no: string): Omit<Fact, 'label'> =>
  v === null ? { value: 'Not established', state: 'unresolved' } : { value: v ? yes : no, state: 'documented' };

/**
 * Build the four layers. `full` is the complete record when loaded; the
 * summary alone carries enough for the seeds and most of the facts.
 */
export function buildLayers(summary: DatasetSummary, full: Dataset | null): Layer[] {
  const licenceKnown = summary.license.spdx && summary.license.spdx !== 'Not stated';
  const licenceState = licenceKnown ? evidenceState(summary.license.label) : 'unresolved';
  const versions = full?.versions.length ?? null;
  const lineage = full?.lineage ?? null;
  const undocumented = lineage?.undocumentedStages ?? [];

  const source: Layer = {
    key: 'source', index: 0, title: 'Source', tab: 'overview',
    seed: `${summary.publisher} · ${platformLabel(summary.platform)}`,
    facts: [
      { label: 'Publisher', ...stated(summary.publisher) },
      { label: 'Platform', ...stated(platformLabel(summary.platform)) },
      { label: 'Source host', ...(full ? stated(hostOf(full.platformUrl), 'documented', true) : pending(true)) },
      { label: 'First published', ...(full ? stated(full.firstPublished ? formatDate(full.firstPublished) : null, 'documented', true) : pending(true)) },
    ],
  };

  const licence: Layer = {
    key: 'licence', index: 1, title: 'Licence', tab: 'evidence',
    seed: licenceKnown ? `${summary.license.spdx} · ${summary.license.label === 'documented' ? 'file retrieved' : summary.license.label === 'reported' ? 'stated in prose' : 'not found'}` : 'Not stated at the source',
    facts: [
      { label: 'Declared identifier', value: licenceKnown ? summary.license.spdx : 'Not stated', state: licenceState, mono: true },
      { label: 'Commercial use', value: COMMERCIAL[summary.license.commercialUse] ?? 'Not stated', state: summary.license.commercialUse === 'not_stated' ? 'unresolved' : 'documented' },
      { label: 'Attribution', ...tri(summary.license.attribution, 'Required', 'Not required') },
      { label: 'Share-alike', ...tri(summary.license.shareAlike, 'Required', 'Not required') },
    ],
  };

  const structure: Layer = {
    key: 'structure', index: 2, title: 'Structure', tab: 'structure',
    seed: `${summary.sizeRows == null ? 'Record count not stated' : `${formatRows(summary.sizeRows)} records`} · ${summary.modality}`,
    facts: [
      { label: 'Records', value: formatRows(summary.sizeRows), state: summary.sizeRows == null ? 'unresolved' : 'documented', mono: true },
      { label: 'Size', value: formatBytes(summary.sizeBytes), state: summary.sizeBytes == null ? 'unresolved' : 'documented', mono: true },
      { label: 'Fields documented', ...(full ? (full.schema.length ? { value: `${full.schema.length} · ${full.schema.slice(0, 3).map((f) => f.name).join(', ')}${full.schema.length > 3 ? ', …' : ''}`, state: 'documented' as FactState, mono: true } : { value: 'No schema published', state: 'unresolved' as FactState }) : pending(true)) },
      { label: 'Languages', ...stated(summary.languages.length ? summary.languages.join(', ') : null, 'documented', true) },
    ],
  };

  const history: Layer = {
    key: 'history', index: 3, title: 'History', tab: 'history',
    seed: `${versions == null ? `Version ${summary.version || 'not stated'}` : `${versions} version${versions === 1 ? '' : 's'}`} · updated ${formatDate(summary.lastUpdated)}`,
    facts: [
      { label: 'Current version', ...stated(summary.version || null, 'documented', true) },
      { label: 'Last source update', ...stated(summary.lastUpdated ? formatDate(summary.lastUpdated) : null, 'documented', true) },
      { label: 'Versions recorded', ...(full ? { value: String(versions), state: (versions ? 'documented' : 'unresolved') as FactState, mono: true } : pending(true)) },
      { label: 'Lineage documented', ...(lineage ? { value: `${lineage.completeness}%${undocumented.length ? ` · ${undocumented.join(', ')} undocumented` : ''}`, state: (undocumented.length ? 'reported' : 'documented') as FactState, mono: true } : pending(true)) },
    ],
  };

  return [source, licence, structure, history];
}

/** Sections of Documentation Coverage, for the record surface. */
export interface SectionSummary {
  key: string;
  label: string;
  score: number;
  documented: number;
  reported: number;
  notFound: number;
  applicable: number;
}

export function coverageSections(full: Dataset | null): SectionSummary[] {
  if (!full) return [];
  return full.coverageSections.map((s) => ({
    key: s.key, label: s.label, score: s.score, documented: s.documented, reported: s.reported, notFound: s.notFound, applicable: s.applicable,
  }));
}
