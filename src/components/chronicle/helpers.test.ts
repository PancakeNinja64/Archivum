import { describe, it, expect } from 'vitest';
import {
  filterRecords,
  timelineBounds,
  timelinePct,
  timelineYears,
  formatRows,
  fmtDate,
  spanDays,
  spanLabel,
  buildBrief,
} from './helpers';
import type { DelistedRecord } from '@/lib/graveyard/types';

function rec(overrides: Partial<DelistedRecord> = {}): DelistedRecord {
  return {
    slug: 'test',
    name: 'Test Record',
    publisher: 'Test Publisher',
    platform: 'huggingface',
    coverageTotal: 50,
    coverageBand: 'partial',
    license: 'MIT',
    sizeRows: 1000,
    versions: 1,
    checksAtLastCheck: 'dddddddddddddddddddddddddddd'.slice(0, 28),
    endState: 'withdrawn',
    firstObserved: '2020-01-01',
    lastConfirmed: '2023-06-15',
    consecutiveFailures: 3,
    dependentModels: null,
    dependentPapers: null,
    ...overrides,
  };
}

describe('filterRecords', () => {
  const records = [
    rec({ slug: 'a', name: 'Alpha', endState: 'withdrawn', platform: 'huggingface', lastConfirmed: '2023-01-01' }),
    rec({ slug: 'b', name: 'Beta', endState: 'gated', platform: 'kaggle', lastConfirmed: '2024-01-01' }),
    rec({ slug: 'c', name: 'Gamma', endState: 'withdrawn', platform: 'github', lastConfirmed: '2022-01-01' }),
  ];

  it('returns all with no filters', () => {
    expect(filterRecords(records, '', '', '')).toHaveLength(3);
  });

  it('filters by query (case insensitive)', () => {
    const result = filterRecords(records, 'beta', '', '');
    expect(result).toHaveLength(1);
    expect(result[0].slug).toBe('b');
  });

  it('filters by endState', () => {
    expect(filterRecords(records, '', 'withdrawn', '')).toHaveLength(2);
  });

  it('filters by platform', () => {
    expect(filterRecords(records, '', '', 'kaggle')).toHaveLength(1);
  });

  it('sorts by lastConfirmed descending', () => {
    const result = filterRecords(records, '', '', '');
    expect(result[0].slug).toBe('b');
    expect(result[2].slug).toBe('c');
  });

  it('combines filters', () => {
    expect(filterRecords(records, '', 'gated', 'kaggle')).toHaveLength(1);
    expect(filterRecords(records, '', 'gated', 'github')).toHaveLength(0);
  });
});

describe('timelineBounds', () => {
  it('computes min/max across records', () => {
    const records = [
      rec({ firstObserved: '2020-01-01', lastConfirmed: '2022-06-01' }),
      rec({ firstObserved: '2019-06-01', lastConfirmed: '2023-01-01' }),
    ];
    const { min, max } = timelineBounds(records);
    expect(new Date(min).toISOString().slice(0, 10)).toBe('2019-06-01');
    expect(new Date(max).toISOString().slice(0, 10)).toBe('2023-01-01');
    expect(max).toBeGreaterThan(min);
  });

  it('handles empty array', () => {
    const result = timelineBounds([]);
    expect(result.span).toBe(0);
  });
});

describe('timelinePct', () => {
  const min = Date.parse('2020-01-01');
  const max = Date.parse('2024-01-01');
  const span = max - min;

  it('returns 0 for start', () => {
    expect(timelinePct('2020-01-01', min, span)).toBeCloseTo(0, 0);
  });

  it('returns 100 for end', () => {
    expect(timelinePct('2024-01-01', min, span)).toBeCloseTo(100, 0);
  });

  it('returns ~50 for midpoint', () => {
    expect(timelinePct('2022-01-01', min, span)).toBeCloseTo(50, 0);
  });

  it('clamps below 0 and above 100', () => {
    expect(timelinePct('2019-01-01', min, span)).toBe(0);
    expect(timelinePct('2025-01-01', min, span)).toBe(100);
  });

  it('returns 0 for zero span', () => {
    expect(timelinePct('2020-06-01', min, 0)).toBe(0);
  });
});

describe('timelineYears', () => {
  it('generates year labels', () => {
    const min = Date.parse('2020-03-01');
    const max = Date.parse('2023-09-01');
    const years = timelineYears(min, max);
    const yearValues = years.map((y) => y.year);
    expect(yearValues).toContain(2021);
    expect(yearValues).toContain(2022);
    expect(yearValues).toContain(2023);
  });

  it('returns empty for invalid range', () => {
    expect(timelineYears(100, 50)).toHaveLength(0);
  });
});

describe('formatRows', () => {
  it('formats billions', () => expect(formatRows(1_500_000_000)).toBe('1.5B'));
  it('formats millions', () => expect(formatRows(2_300_000)).toBe('2.3M'));
  it('formats thousands', () => expect(formatRows(45_600)).toBe('45.6K'));
  it('returns raw for small', () => expect(formatRows(42)).toBe('42'));
});

describe('fmtDate', () => {
  it('formats a valid date', () => {
    const result = fmtDate('2023-06-15');
    expect(result).toContain('Jun');
    expect(result).toContain('2023');
  });

  it('handles invalid date', () => {
    expect(fmtDate('not-a-date')).toBe('Not recorded');
  });
});

describe('spanDays', () => {
  it('computes days between dates', () => {
    expect(spanDays('2020-01-01', '2020-01-31')).toBe(30);
  });

  it('returns 0 for same date', () => {
    expect(spanDays('2020-01-01', '2020-01-01')).toBe(0);
  });

  it('returns 0 for invalid dates', () => {
    expect(spanDays('bad', '2020-01-01')).toBe(0);
  });
});

describe('spanLabel', () => {
  it('formats years + months', () => expect(spanLabel(400)).toBe('1y 1m'));
  it('formats years only', () => expect(spanLabel(365)).toBe('1y'));
  it('formats months', () => expect(spanLabel(90)).toBe('3m'));
  it('formats days', () => expect(spanLabel(15)).toBe('15d'));
});

describe('buildBrief', () => {
  it('includes mode, asOf, disclaimer', () => {
    const brief = buildBrief([rec()], 'illustrative', '2026-09-10');
    expect(brief.mode).toBe('illustrative');
    expect(brief.asOf).toBe('2026-09-10');
    expect(brief.disclaimer).toContain('illustrative');
    expect(brief.source).toBe('Archivum preserved-record archive');
    expect(brief.records).toHaveLength(1);
  });

  it('catalog mode disclaimer differs', () => {
    const brief = buildBrief([], 'catalog', '2026-09-10');
    expect(brief.disclaimer).toContain('quality rating');
  });

  it('maps record fields', () => {
    const brief = buildBrief([rec({ slug: 'x', name: 'X' })], 'illustrative', '2026-09-10');
    expect(brief.records[0].slug).toBe('x');
    expect(brief.records[0].endStateExplanation).toBeTruthy();
  });
});

/* ---------- Usability revision: batching, URL state, keyboard, selection ---------- */

import {
  LEDGER_BATCH,
  buildLedgerUrl,
  rangeLabel,
  readLedgerUrl,
  requiredVisibleCount,
  resolveSelection,
  stepIndex,
} from './helpers';
import { DELISTED_FIXTURE } from '@/lib/graveyard/fixture';

describe('requiredVisibleCount', () => {
  it('is zero when nothing in the view is selected', () => {
    expect(requiredVisibleCount(-1)).toBe(0);
  });
  it('rounds up to whole batches so the selected row is inside the rendered set', () => {
    expect(requiredVisibleCount(0)).toBe(LEDGER_BATCH);
    expect(requiredVisibleCount(LEDGER_BATCH - 1)).toBe(LEDGER_BATCH);
    expect(requiredVisibleCount(LEDGER_BATCH)).toBe(LEDGER_BATCH * 2);
    expect(requiredVisibleCount(93)).toBe(96);
  });
});

describe('rangeLabel', () => {
  it('reports the visible range, the complete set, and the empty case', () => {
    expect(rangeLabel(24, 96)).toBe('Showing 1–24 of 96 records');
    expect(rangeLabel(96, 96)).toBe('Showing all 96 records');
    expect(rangeLabel(1, 1)).toBe('Showing all 1 record');
    expect(rangeLabel(0, 0)).toBe('No records to show');
  });
});

describe('stepIndex', () => {
  it('steps and wraps across the whole filtered list', () => {
    expect(stepIndex(-1, 5, 'ArrowDown')).toBe(0);
    expect(stepIndex(4, 5, 'ArrowDown')).toBe(0);
    expect(stepIndex(0, 5, 'ArrowUp')).toBe(4);
    expect(stepIndex(-1, 5, 'ArrowUp')).toBe(4);
    expect(stepIndex(2, 5, 'Home')).toBe(0);
    expect(stepIndex(2, 5, 'End')).toBe(4);
  });
  it('returns -1 for an empty list', () => {
    expect(stepIndex(0, 0, 'ArrowDown')).toBe(-1);
  });
});

describe('ledger URL state', () => {
  it('round-trips filters and the selected record', () => {
    const state = { query: 'wiki', endState: 'gated' as const, platform: 'kaggle' as const, selected: 'a-b' };
    const url = buildLedgerUrl('/delisted/', state, false);
    expect(url).toBe('/delisted/?q=wiki&state=gated&platform=kaggle&record=a-b');
    expect(readLedgerUrl(url.slice(url.indexOf('?')))).toEqual(state);
  });
  it('omits empty values, keeps the demo flag, and can target the dossier anchor', () => {
    expect(buildLedgerUrl('/delisted/', { query: '', endState: '', platform: '', selected: '' }, false)).toBe('/delisted/');
    expect(buildLedgerUrl('/delisted/', { query: '', endState: '', platform: '', selected: 'x' }, true, 'delisted-dossier'))
      .toBe('/delisted/?demo=1&record=x#delisted-dossier');
  });
  it('drops unknown states and platforms instead of filtering on them', () => {
    expect(readLedgerUrl('?state=vanished&platform=myspace&record=x')).toEqual({
      query: '', endState: '', platform: '', selected: 'x',
    });
  });
  it('caps free-text values', () => {
    expect(readLedgerUrl(`?q=${'a'.repeat(300)}`).query).toHaveLength(250);
  });
});

describe('resolveSelection', () => {
  const all = DELISTED_FIXTURE.records;

  it('opens a record chosen outside the current filters and reports it as out of view', () => {
    const gated = filterRecords(all, '', 'gated', '');
    const target = all.find((r) => r.endState !== 'gated')!;
    const { record, index } = resolveSelection(all, gated, target.slug);
    expect(record?.slug).toBe(target.slug);
    expect(index).toBe(-1);
  });

  it('locates a record beyond the first batch so the register can extend to it', () => {
    const view = filterRecords(all, '', '', '');
    const deep = view[view.length - 1];
    const { record, index } = resolveSelection(all, view, deep.slug);
    expect(record?.slug).toBe(deep.slug);
    expect(index).toBe(view.length - 1);
    expect(requiredVisibleCount(index)).toBeGreaterThan(LEDGER_BATCH);
    expect(requiredVisibleCount(index)).toBeGreaterThanOrEqual(view.length);
  });

  it('yields nothing for an empty or unknown slug', () => {
    expect(resolveSelection(all, all, '')).toEqual({ record: null, index: -1 });
    expect(resolveSelection(all, all, 'not-a-record')).toEqual({ record: null, index: -1 });
  });
});
