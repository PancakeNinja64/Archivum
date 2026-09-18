import type { DelistedRecord, EndState } from '@/lib/graveyard/types';
import type { Platform } from '@/lib/types';
import { END_STATES, END_STATE_NOTE } from '@/lib/graveyard/types';
import { PLATFORM_LABELS } from '@/lib/graveyard/register';

export function filterRecords(
  records: DelistedRecord[],
  query: string,
  endState: EndState | '',
  platform: Platform | '',
): DelistedRecord[] {
  const q = query.trim().toLowerCase();
  return records
    .filter(
      (r) =>
        (!q ||
          `${r.name} ${r.publisher} ${r.license} ${r.slug}`
            .toLowerCase()
            .includes(q)) &&
        (!endState || r.endState === endState) &&
        (!platform || r.platform === platform),
    )
    .sort(
      (a, b) =>
        b.lastConfirmed.localeCompare(a.lastConfirmed) ||
        a.slug.localeCompare(b.slug),
    );
}

export function timelineBounds(
  records: DelistedRecord[],
): { min: number; max: number; span: number } {
  let min = Infinity;
  let max = -Infinity;
  for (const r of records) {
    const first = Date.parse(r.firstObserved);
    const last = Date.parse(r.lastConfirmed);
    if (Number.isFinite(first) && first < min) min = first;
    if (Number.isFinite(last) && last > max) max = last;
  }
  if (!Number.isFinite(min) || !Number.isFinite(max))
    return { min: 0, max: 0, span: 0 };
  return { min, max, span: max - min };
}

export function timelinePct(
  dateStr: string,
  min: number,
  span: number,
): number {
  if (span <= 0) return 0;
  const t = Date.parse(dateStr);
  if (!Number.isFinite(t)) return 0;
  return Math.max(0, Math.min(100, ((t - min) / span) * 100));
}

export function timelineYears(
  min: number,
  max: number,
): Array<{ year: number; pct: number }> {
  if (max <= min) return [];
  const span = max - min;
  const startYear = new Date(min).getUTCFullYear();
  const endYear = new Date(max).getUTCFullYear() + 1;
  const labels: Array<{ year: number; pct: number }> = [];
  for (let y = startYear; y <= endYear; y++) {
    const pct = ((Date.parse(`${y}-01-01`) - min) / span) * 100;
    if (pct >= -2 && pct <= 102)
      labels.push({ year: y, pct: Math.max(0, Math.min(100, pct)) });
  }
  return labels;
}

export function formatRows(n: number): string {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

export function fmtDate(value: string): string {
  const d = new Date(value);
  if (!Number.isFinite(d.getTime())) return 'Not recorded';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(d);
}

export function spanDays(first: string, last: string): number {
  const a = Date.parse(first);
  const b = Date.parse(last);
  if (!Number.isFinite(a) || !Number.isFinite(b)) return 0;
  return Math.max(0, Math.round((b - a) / 86_400_000));
}

export function spanLabel(days: number): string {
  if (days >= 365) {
    const years = Math.floor(days / 365);
    const months = Math.floor((days % 365) / 30);
    return months > 0 ? `${years}y ${months}m` : `${years}y`;
  }
  if (days >= 30) return `${Math.floor(days / 30)}m`;
  return `${days}d`;
}

export function buildBrief(
  records: DelistedRecord[],
  mode: 'illustrative' | 'catalog',
  asOf: string,
) {
  return {
    mode,
    asOf,
    source: 'Archivum preserved-record archive',
    disclaimer:
      mode === 'illustrative'
        ? 'These records are illustrative fictional examples that demonstrate the experience. They do not represent real observations.'
        : 'Documentation Coverage reflects what was present at the source when Archivum checked. It is not a quality rating, trust score, or permission grant.',
    records: records.map((r) => ({
      slug: r.slug,
      name: r.name,
      publisher: r.publisher,
      platform: r.platform,
      endState: r.endState,
      endStateExplanation: END_STATE_NOTE[r.endState],
      firstObserved: r.firstObserved,
      lastConfirmed: r.lastConfirmed,
      license: r.license,
      coverageTotal: r.coverageTotal,
      coverageBand: r.coverageBand,
      sourceUrl: r.sourceUrl ?? null,
      successorUrl: r.successorUrl ?? null,
      supersededBy: r.supersededBy ?? null,
      observationEvidence: r.observationEvidence ?? null,
      checksAtLastCheck: r.checksAtLastCheck,
      sizeRows: r.sizeRows,
      versions: r.versions,
      consecutiveFailures: r.consecutiveFailures,
      dependentModels: r.dependentModels,
      dependentPapers: r.dependentPapers,
    })),
  };
}

/* ---------- Ledger batching, URL state and keyboard stepping ---------- */

/** Records shown per "Show more" step. Keeps the phone register in page flow manageable. */
export const LEDGER_BATCH = 24;

/**
 * How many records must be visible for the record at `selectedIndex` to be on
 * screen, rounded up to a whole batch. Zero when nothing in the list is selected.
 */
export function requiredVisibleCount(selectedIndex: number, batch = LEDGER_BATCH): number {
  if (selectedIndex < 0) return 0;
  return Math.ceil((selectedIndex + 1) / batch) * batch;
}

export function rangeLabel(shown: number, total: number): string {
  if (total === 0) return 'No records to show';
  if (shown >= total) return `Showing all ${total} record${total === 1 ? '' : 's'}`;
  return `Showing 1–${shown} of ${total} records`;
}

export type StepKey = 'ArrowDown' | 'ArrowUp' | 'Home' | 'End';

/** Next index for roving keyboard selection. Wraps at both ends; -1 means nothing selected yet. */
export function stepIndex(current: number, length: number, key: StepKey): number {
  if (length <= 0) return -1;
  switch (key) {
    case 'Home': return 0;
    case 'End': return length - 1;
    case 'ArrowDown': return current < length - 1 ? current + 1 : 0;
    case 'ArrowUp': return current > 0 ? current - 1 : length - 1;
  }
}

export interface LedgerUrlState {
  query: string;
  endState: EndState | '';
  platform: Platform | '';
  selected: string;
}

/** Parse the register's URL state. Unknown states and platforms fall back to "all". */
export function readLedgerUrl(search: string): LedgerUrlState {
  const p = new URLSearchParams(search);
  const state = p.get('state') ?? '';
  const platform = p.get('platform') ?? '';
  return {
    query: (p.get('q') ?? '').slice(0, 250),
    endState: END_STATES.includes(state as EndState) ? (state as EndState) : '',
    platform: Object.hasOwn(PLATFORM_LABELS, platform) ? (platform as Platform) : '',
    selected: (p.get('record') ?? '').slice(0, 250),
  };
}

/** Serialise register state to a URL. Empty values are omitted so the canonical URL stays short. */
export function buildLedgerUrl(pathname: string, state: LedgerUrlState, isDemo: boolean, hash = ''): string {
  const p = new URLSearchParams();
  if (isDemo) p.set('demo', '1');
  if (state.query) p.set('q', state.query);
  if (state.endState) p.set('state', state.endState);
  if (state.platform) p.set('platform', state.platform);
  if (state.selected) p.set('record', state.selected);
  const qs = p.toString();
  return `${pathname}${qs ? `?${qs}` : ''}${hash ? `#${hash}` : ''}`;
}

/**
 * Resolve the chosen record against the WHOLE archive, then report where it sits
 * in the filtered view. A record outside the filters still opens (index -1), so a
 * direct URL or a field choice never silently loses its dossier.
 */
export function resolveSelection(
  all: DelistedRecord[],
  filtered: DelistedRecord[],
  slug: string,
): { record: DelistedRecord | null; index: number } {
  if (!slug) return { record: null, index: -1 };
  const record = all.find((r) => r.slug === slug) ?? null;
  return { record, index: record ? filtered.findIndex((r) => r.slug === slug) : -1 };
}
