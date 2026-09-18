import { describe, expect, it } from 'vitest';
import type { Dataset, DatasetSummary } from '@/lib/types';
import { buildLayers, formatBytes, formatDate, formatRows, hostOf } from './record-facts';

const summary: DatasetSummary = {
  slug: 'code-review-comments', name: 'Code Review Comment Threads', publisher: 'Commons Code Index', description: 'd', platform: 'github',
  domain: ['code', 'nlp'], languages: ['en'], modality: 'text', sizeRows: 3120887, sizeBytes: 9.2e9,
  license: { spdx: 'Apache-2.0', commercialUse: 'permitted', attribution: true, shareAlike: false, label: 'reported', notes: [] },
  coverageTotal: 71, coverageBand: 'partial', coverageCheckedAt: '2026-08-01T09:00:00Z', lastUpdated: '2026-02-14T00:00:00Z', version: 'v3.1',
};

describe('formatters', () => {
  it('keeps null distinct from zero', () => {
    expect(formatRows(null)).toBe('Not stated');
    expect(formatRows(0)).toBe('0');
    expect(formatBytes(null)).toBe('Not stated');
    expect(formatBytes(0)).toBe('0 B');
    expect(formatBytes(18400000000)).toBe('18.4 GB');
    expect(formatDate(null)).toBe('Not stated');
    expect(formatDate('nonsense')).toBe('Not stated');
    expect(formatDate('2026-02-14T00:00:00Z')).toBe('Feb 14, 2026');
  });
  it('only reports a host for a valid http(s) URL', () => {
    expect(hostOf('https://example.org/x/y')).toBe('example.org');
    expect(hostOf('ftp://example.org')).toBeNull();
    expect(hostOf('not a url')).toBeNull();
    expect(hostOf(null)).toBeNull();
  });
});

describe('buildLayers', () => {
  it('returns the four layers in order with seeds from the summary alone', () => {
    const layers = buildLayers(summary, null);
    expect(layers.map((l) => l.key)).toEqual(['source', 'licence', 'structure', 'history']);
    expect(layers[0].seed).toBe('Commons Code Index · GitHub');
    expect(layers[1].seed).toBe('Apache-2.0 · stated in prose');
    expect(layers[2].seed).toBe('3.1M records · text');
    expect(layers[3].seed).toBe('Version v3.1 · updated Feb 14, 2026');
  });
  it('marks facts that need the full record as pending, not unresolved', () => {
    const layers = buildLayers(summary, null);
    const pending = layers.flatMap((l) => l.facts).filter((f) => f.state === 'pending').map((f) => f.label);
    expect(pending).toEqual(['Source host', 'First published', 'Fields documented', 'Versions recorded', 'Lineage documented']);
  });
  it('carries the licence evidence label and keeps gaps visible', () => {
    const layers = buildLayers({ ...summary, license: { spdx: 'Not stated', commercialUse: 'not_stated', attribution: null, shareAlike: null, label: 'not_found', notes: [] }, sizeRows: null }, null);
    const licence = layers[1];
    expect(licence.seed).toBe('Not stated at the source');
    expect(licence.facts.every((f) => f.state === 'unresolved')).toBe(true);
    expect(layers[2].facts[0]).toMatchObject({ label: 'Records', value: 'Not stated', state: 'unresolved' });
    expect(buildLayers(summary, null)[1].facts[0]).toMatchObject({ value: 'Apache-2.0', state: 'reported' });
  });
  it('resolves the deep facts from the full record, including undocumented lineage stages', () => {
    const full = {
      ...summary, publisherSlug: 'x', platformUrl: 'https://github.com/example/repo', firstPublished: '2023-02-27T00:00:00Z', contentHash: 'sha256:x',
      coverageSections: [], coverageDetail: {}, coverageVersion: '1.0',
      lineage: { nodes: [], edges: [], completeness: 83, undocumentedStages: ['annotate'] },
      versions: [{ version: 'v3.1', date: null, rowsAdded: null, rowsRemoved: null, note: '', author: '', coverageTotal: null }, { version: 'v3.0', date: null, rowsAdded: null, rowsRemoved: null, note: '', author: '', coverageTotal: null }],
      schema: [{ name: 'id', type: 'string', nullable: false, description: '' }, { name: 'body', type: 'string', nullable: false, description: '' }, { name: 'author', type: 'string', nullable: true, description: '' }, { name: 'created', type: 'date', nullable: true, description: '' }],
      sampleRecords: [], relatedSlugs: [],
    } as unknown as Dataset;
    const layers = buildLayers(summary, full);
    expect(layers[0].facts[2]).toMatchObject({ label: 'Source host', value: 'github.com', state: 'documented' });
    expect(layers[0].facts[3]).toMatchObject({ value: 'Feb 27, 2023' });
    expect(layers[2].facts[2]).toMatchObject({ value: '4 · id, body, author, …', state: 'documented' });
    expect(layers[3].seed).toBe('2 versions · updated Feb 14, 2026');
    expect(layers[3].facts[3]).toMatchObject({ value: '83% · annotate undocumented', state: 'reported' });
  });
});
