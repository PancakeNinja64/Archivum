import { describe, expect, it } from 'vitest';
import type { DatasetSummary, Facets } from '@/lib/types';
import { EMPTY_WORKSPACE_QUERY } from '@/lib/workbench/query';
import { SHORTLIST_LIMIT } from '@/lib/workbench/shortlist';
import { GUIDE_DOMAIN_LIMIT, startingPoints } from './guide';
import { LICENCE_UNSTATED, PLATFORM_UNRECORDED, PUBLISHER_UNSTATED, licenceIdentifier, platformName, publisherName, splitRecordMeta } from './recordMeta';
import { trayCompare, trayCountLabel, trayEmptyHint, trayMode } from './trayModel';

/* ---------- Shortlist tray ---------- */

describe('trayMode', () => {
  it('reports reading until the store has been read, so nothing flashes "empty"', () => {
    expect(trayMode({ hydrated: false, items: [] })).toBe('reading');
    expect(trayMode({ hydrated: false, items: [{}] })).toBe('reading');
  });
  it('folds to the compact line with nothing saved and expands once a record is saved', () => {
    expect(trayMode({ hydrated: true, items: [] })).toBe('empty');
    expect(trayMode({ hydrated: true, items: [{}] })).toBe('filled');
  });
});

describe('trayCompare', () => {
  it('never links the comparison desk to itself', () => {
    expect(trayCompare(['a', 'b', 'c'], 'compare')).toEqual({ kind: 'hidden' });
  });
  it('explains why Compare is disabled below two records', () => {
    expect(trayCompare([], 'workspace')).toEqual({ kind: 'disabled', reason: 'Save two records to compare them' });
    expect(trayCompare(['a'], 'collections')).toEqual({ kind: 'disabled', reason: 'Save one more record to compare' });
  });
  it('links with every saved slug once two or more are saved', () => {
    const result = trayCompare(['first-set', 'second-set'], 'workspace');
    expect(result.kind).toBe('link');
    if (result.kind !== 'link') return;
    expect(result.count).toBe(2);
    expect(result.href).toBe('/compare/?datasets=first-set%2Csecond-set');
  });
});

describe('tray labels', () => {
  it('shows the count against the device limit, and "reading" before the store answers', () => {
    expect(trayCountLabel('reading', 0)).toBe('reading…');
    expect(trayCountLabel('empty', 0)).toBe(`0 of ${SHORTLIST_LIMIT}`);
    expect(trayCountLabel('filled', 3)).toBe(`3 of ${SHORTLIST_LIMIT}`);
  });
  it('tells the workspace to save from the open record and other surfaces to go to the workspace', () => {
    expect(trayEmptyHint('workspace')).toContain('Save on this device');
    expect(trayEmptyHint('compare')).toContain('workspace');
    expect(trayEmptyHint('collections')).toContain('workspace');
  });
});

/* ---------- Record metadata split (sans names, mono identifiers) ---------- */

describe('splitRecordMeta', () => {
  it('puts publisher and platform in names and licence, version and date in identifiers', () => {
    const meta = splitRecordMeta({ publisher: 'Meridian Health Data Collective', platform: 'huggingface', license: { spdx: 'CC-BY-4.0' }, version: 'v2.1', lastUpdated: '2026-07-22T00:00:00Z' }, { updated: true });
    expect(meta.names).toEqual(['Meridian Health Data Collective', 'Hugging Face']);
    expect(meta.identifiers).toEqual(['CC-BY-4.0', 'v2.1', 'upd Jul 22, 2026']);
  });
  it('names what is unstated instead of leaving a blank', () => {
    const meta = splitRecordMeta({ publisher: '  ', platform: null, license: 'Not stated', lastUpdated: null }, { updated: true });
    expect(meta.names).toEqual([PUBLISHER_UNSTATED, PLATFORM_UNRECORDED]);
    expect(meta.identifiers).toEqual([LICENCE_UNSTATED, 'update date not stated']);
  });
  it('omits the date unless asked, and keeps an unknown platform id readable', () => {
    expect(splitRecordMeta({ publisher: 'P', platform: 'zenodo', license: 'MIT' })).toEqual({ names: ['P', 'zenodo'], identifiers: ['MIT'] });
    expect(publisherName(undefined)).toBe(PUBLISHER_UNSTATED);
    expect(platformName('kaggle')).toBe('Kaggle');
    expect(licenceIdentifier(null)).toBe(LICENCE_UNSTATED);
    expect(licenceIdentifier(' Apache-2.0 ')).toBe('Apache-2.0');
  });
});

/* ---------- Idle guide ---------- */

const summary = (slug: string, name: string): DatasetSummary => ({
  slug, name, publisher: 'P', description: '', platform: 'huggingface', domain: [], languages: [], modality: 'text',
  sizeRows: null, sizeBytes: null, license: { spdx: 'MIT', commercialUse: 'permitted', attribution: true, shareAlike: false, label: 'documented', notes: [] },
  coverageTotal: 50, coverageBand: 'partial', coverageCheckedAt: null, lastUpdated: null, version: 'v1',
});
const facets: Facets = {
  total: 20,
  platforms: [], modalities: [], languages: [], licenses: [],
  domains: [{ value: 'legal', count: 2 }, { value: 'biomedical', count: 5 }, { value: 'code', count: 5 }, { value: 'empty', count: 0 }],
};

describe('startingPoints', () => {
  it('offers the count, the current order and the first listed record once results are ready', () => {
    const points = startingPoints({ state: 'ready', data: { items: [summary('a', 'Alpha'), summary('b', 'Beta')], total: 2, page: 1, pageSize: 24 } }, facets, EMPTY_WORKSPACE_QUERY);
    expect(points.total).toBe(2);
    expect(points.first).toEqual({ slug: 'a', name: 'Alpha' });
    expect(points.order).toBe('documentation coverage, highest first');
    expect(points.narrowed).toBe(false);
  });
  it('offers nothing to open while loading, after an error, or with no matches', () => {
    expect(startingPoints({ state: 'loading' }, facets, EMPTY_WORKSPACE_QUERY).first).toBeNull();
    expect(startingPoints({ state: 'loading' }, facets, EMPTY_WORKSPACE_QUERY).total).toBeNull();
    expect(startingPoints({ state: 'error', message: 'x' }, facets, EMPTY_WORKSPACE_QUERY).first).toBeNull();
    const empty = startingPoints({ state: 'ready', data: { items: [], total: 0, page: 1, pageSize: 24 } }, facets, EMPTY_WORKSPACE_QUERY);
    expect(empty.first).toBeNull();
    expect(empty.total).toBe(0);
  });
  it('lists real domains largest first, ties by name, without zero counts or domains already applied', () => {
    const points = startingPoints({ state: 'loading' }, facets, { ...EMPTY_WORKSPACE_QUERY, domain: ['code'] });
    expect(points.domains).toEqual([{ value: 'biomedical', count: 5 }, { value: 'legal', count: 2 }]);
    expect(points.narrowed).toBe(true);
    expect(startingPoints({ state: 'loading' }, null, EMPTY_WORKSPACE_QUERY).domains).toEqual([]);
  });
  it('caps the domain list and follows the sort in the URL', () => {
    const many: Facets = { ...facets, domains: Array.from({ length: 10 }, (_, i) => ({ value: `d${i}`, count: 10 - i })) };
    expect(startingPoints({ state: 'loading' }, many, EMPTY_WORKSPACE_QUERY).domains).toHaveLength(GUIDE_DOMAIN_LIMIT);
    expect(startingPoints({ state: 'loading' }, many, { ...EMPTY_WORKSPACE_QUERY, sort: 'name' }).order).toBe('name, A to Z');
    expect(startingPoints({ state: 'loading' }, many, { ...EMPTY_WORKSPACE_QUERY, q: 'wiki' }).narrowed).toBe(true);
  });
});
