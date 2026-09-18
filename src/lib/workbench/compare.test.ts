import { describe, expect, it } from 'vitest';
import { DATASETS } from '@/lib/mock-data';
import type { Dataset } from '@/lib/types';
import { buildCompareRows, groupRows, type CompareColumn } from './compare';

const ready = (record: Dataset): CompareColumn => ({ slug: record.slug, state: 'ready', record });
const rowByKey = (rows: ReturnType<typeof buildCompareRows>, key: string) => rows.find((row) => row.key === key)!;

describe('comparison rows', () => {
  it('aligns one fact per row across every column, including absent ones', () => {
    const rows = buildCompareRows([ready(DATASETS[0]), { slug: 'gone', state: 'absent' }, { slug: 'slow', state: 'loading' }]);
    expect(rows.length).toBeGreaterThan(20);
    for (const row of rows) {
      expect(row.cells).toHaveLength(3);
      expect(row.cells[1]).toEqual({ text: '—', known: false });
      expect(row.cells[2]).toEqual({ text: '—', known: false });
      expect(row.differs).toBe(false);
    }
    expect(rowByKey(rows, 'publisher').cells[0]).toMatchObject({ text: DATASETS[0].publisher, known: true });
    expect(groupRows(rows).map((group) => group.group)).toEqual(['Identity', 'Licence', 'Size', 'Recency', 'Content', 'Documentation', 'Record']);
  });

  it('treats unknown as distinct from zero and from any known value', () => {
    const stated: Dataset = { ...DATASETS[0], sizeRows: 0, sizeBytes: null, lastUpdated: null, license: { ...DATASETS[0].license, attribution: null } };
    const other: Dataset = { ...DATASETS[1], sizeRows: null, sizeBytes: 0 };
    const rows = buildCompareRows([ready(stated), ready(other)]);
    expect(rowByKey(rows, 'rows').cells).toEqual([{ text: '0', known: true }, { text: 'Not stated', known: false }]);
    expect(rowByKey(rows, 'rows').differs).toBe(true);
    expect(rowByKey(rows, 'bytes').cells).toEqual([{ text: 'Not stated', known: false }, { text: '0 B', known: true }]);
    expect(rowByKey(rows, 'updated').cells[0]).toEqual({ text: 'Not stated', known: false });
    expect(rowByKey(rows, 'attribution').cells[0]).toEqual({ text: 'Not established', known: false });
  });

  it('marks a row as differing only when at least two loaded columns disagree', () => {
    const twin: Dataset = { ...DATASETS[0], slug: 'twin' };
    const same = buildCompareRows([ready(DATASETS[0]), ready(twin)]);
    expect(same.every((row) => !row.differs)).toBe(true);
    const mixed = buildCompareRows([ready(DATASETS[0]), ready(twin), ready(DATASETS[7])]);
    expect(rowByKey(mixed, 'publisher').differs).toBe(true);
    expect(rowByKey(mixed, 'license').differs).toBe(DATASETS[0].license.spdx !== DATASETS[7].license.spdx);
    const single = buildCompareRows([ready(DATASETS[0]), { slug: 'x', state: 'error', message: 'boom' }]);
    expect(single.every((row) => !row.differs)).toBe(true);
  });

  it('exposes the four documentation sections with their evidence counts and never a verdict', () => {
    const rows = buildCompareRows([ready(DATASETS[0])]);
    const sections = rows.filter((row) => row.key.startsWith('section:'));
    expect(sections.map((row) => row.label)).toEqual(['Origin & Sourcing', 'Licensing & Terms', 'Composition & Structure', 'Maintenance & Usage']);
    expect(sections[0].cells[0].detail).toMatch(/documented · \d+ reported · \d+ not found/);
    expect(rowByKey(rows, 'coverage').note).toMatch(/not a quality rating/);
    expect(JSON.stringify(rows)).not.toMatch(/recommended|best|winner/i);
  });
});
