import { describe, expect, it } from 'vitest';
import { DATASETS } from '@/lib/mock-data';
import {
  createShortlistStore, describeStorageStatus, normalizeShortlist, readShortlist, serializeShortlist,
  toShortlistItem, writeShortlist, SHORTLIST_LIMIT, SHORTLIST_STORAGE_KEY, type KeyValueStorage,
} from './shortlist';

const NOW = '2026-09-13T12:00:00.000Z';

function memoryStorage(initial: Record<string, string> = {}): KeyValueStorage & { data: Map<string, string> } {
  const data = new Map(Object.entries(initial));
  return {
    data,
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => { data.set(key, value); },
    removeItem: (key) => { data.delete(key); },
  };
}

describe('shortlist normalisation', () => {
  it('returns an empty list for nothing stored, and reports malformed JSON', () => {
    expect(normalizeShortlist(null, NOW)).toEqual({ items: [], problems: [] });
    expect(normalizeShortlist(undefined, NOW)).toEqual({ items: [], problems: [] });
    expect(normalizeShortlist('{not json', NOW).items).toEqual([]);
    expect(normalizeShortlist('{not json', NOW).problems[0]).toMatch(/not valid JSON/);
    expect(normalizeShortlist('"a string"', NOW).problems[0]).toMatch(/unexpected shape/);
    expect(normalizeShortlist(JSON.stringify({ version: 1, items: 'nope' }), NOW).problems[0]).toMatch(/unexpected shape/);
  });

  it('repairs partial entries and drops invalid, duplicate, and overflow entries', () => {
    const raw = JSON.stringify({
      version: 1,
      items: [
        { slug: 'Biomed-Abstracts-Open', name: '  Biomedical Abstracts  ', publisher: '', platform: 'mainframe', license: 42, coverageTotal: 195.6, coverageCheckedAt: 'not a date', savedAt: '2026-01-02T00:00:00Z' },
        { slug: 'biomed-abstracts-open', name: 'duplicate' },
        { slug: 'bad slug!' },
        'garbage',
        null,
        { slug: 'two', name: 'Two', platform: 'github', coverageTotal: -3 },
        { slug: 'three' },
        { slug: 'four' },
        { slug: 'five' },
      ],
    });
    const { items, problems } = normalizeShortlist(raw, NOW);
    expect(items.map((item) => item.slug)).toEqual(['biomed-abstracts-open', 'two', 'three', 'four']);
    expect(items[0]).toEqual({
      slug: 'biomed-abstracts-open', name: 'Biomedical Abstracts', publisher: 'Publisher not recorded', platform: null,
      license: 'Not stated', coverageTotal: 100, coverageCheckedAt: null, savedAt: '2026-01-02T00:00:00Z',
    });
    expect(items[1]).toMatchObject({ platform: 'github', coverageTotal: 0, savedAt: NOW });
    expect(items[2]).toMatchObject({ name: 'three', license: 'Not stated' });
    expect(problems).toHaveLength(1);
    expect(problems[0]).toMatch(/5 stored entries were unreadable, duplicated, or over the limit/);
  });

  it('accepts a bare array and flags a foreign version without discarding valid records', () => {
    expect(normalizeShortlist([{ slug: 'x', name: 'X' }], NOW).items).toHaveLength(1);
    const foreign = normalizeShortlist({ version: 7, items: [{ slug: 'x' }] }, NOW);
    expect(foreign.items).toHaveLength(1);
    expect(foreign.problems[0]).toMatch(/different version/);
  });

  it('keeps only stable slugs and limited display metadata from a record', () => {
    const item = toShortlistItem(DATASETS[0], NOW);
    expect(item).toEqual({
      slug: DATASETS[0].slug, name: DATASETS[0].name, publisher: DATASETS[0].publisher, platform: DATASETS[0].platform,
      license: DATASETS[0].license.spdx, coverageTotal: DATASETS[0].coverageTotal, coverageCheckedAt: DATASETS[0].coverageCheckedAt, savedAt: NOW,
    });
    expect(Object.keys(item)).not.toContain('description');
    expect(normalizeShortlist(serializeShortlist([item]), NOW)).toEqual({ items: [item], problems: [] });
  });
});

describe('shortlist storage', () => {
  it('explains an unavailable store and keeps working in memory', () => {
    const read = readShortlist(null, NOW);
    expect(read.items).toEqual([]);
    expect(read.status.kind).toBe('unavailable');
    expect(describeStorageStatus(read.status)).toMatch(/stay only until you leave this page/);
    expect(writeShortlist(null, []).kind).toBe('unavailable');
  });

  it('reports a read failure and a write failure separately', () => {
    const throwing: KeyValueStorage = {
      getItem: () => { throw new Error('SecurityError'); },
      setItem: () => { throw new Error('QuotaExceededError'); },
      removeItem: () => {},
    };
    expect(readShortlist(throwing, NOW).status).toEqual({ kind: 'unavailable', reason: 'Browser storage could not be read (SecurityError).' });
    const status = writeShortlist(throwing, [toShortlistItem(DATASETS[0], NOW)]);
    expect(status.kind).toBe('write-failed');
    expect(describeStorageStatus(status)).toMatch(/QuotaExceededError/);
  });

  it('repairs a malformed store in place and reports the reset', () => {
    const storage = memoryStorage({ [SHORTLIST_STORAGE_KEY]: JSON.stringify({ version: 1, items: [{ slug: 'ok' }, 'junk'] }) });
    const read = readShortlist(storage, NOW);
    expect(read.items.map((i) => i.slug)).toEqual(['ok']);
    expect(read.status.kind).toBe('reset');
    expect(JSON.parse(storage.data.get(SHORTLIST_STORAGE_KEY)!)).toEqual({ version: 1, items: read.items });
    const emptyAfterRepair = memoryStorage({ [SHORTLIST_STORAGE_KEY]: '[[[' });
    expect(readShortlist(emptyAfterRepair, NOW).status.kind).toBe('reset');
    expect(emptyAfterRepair.data.has(SHORTLIST_STORAGE_KEY)).toBe(false);
  });
});

describe('shortlist store', () => {
  it('serves an identical empty snapshot on the server and hydrates on the client', () => {
    const storage = memoryStorage({ [SHORTLIST_STORAGE_KEY]: serializeShortlist([toShortlistItem(DATASETS[1], NOW)]) });
    const store = createShortlistStore(() => storage, () => NOW);
    expect(store.getServerSnapshot()).toEqual({ items: [], status: { kind: 'ok' }, hydrated: false });
    expect(store.getServerSnapshot()).toBe(store.getServerSnapshot());
    const first = store.getSnapshot();
    expect(first.hydrated).toBe(true);
    expect(first.items.map((i) => i.slug)).toEqual([DATASETS[1].slug]);
    expect(store.getSnapshot()).toBe(first);
  });

  it('enforces the four-record limit, refuses duplicates, and persists every change', () => {
    const storage = memoryStorage();
    const store = createShortlistStore(() => storage, () => NOW);
    let notified = 0;
    const unsubscribe = store.subscribe(() => { notified += 1; });
    for (const record of DATASETS.slice(0, SHORTLIST_LIMIT)) expect(store.add(record)).toEqual({ ok: true });
    expect(store.add(DATASETS[0])).toEqual({ ok: false, reason: 'duplicate' });
    expect(store.add(DATASETS[SHORTLIST_LIMIT])).toEqual({ ok: false, reason: 'full' });
    expect(store.getSnapshot().items).toHaveLength(SHORTLIST_LIMIT);
    expect(notified).toBe(SHORTLIST_LIMIT);
    store.remove(DATASETS[1].slug);
    store.remove('never-saved');
    expect(store.getSnapshot().items.map((i) => i.slug)).toEqual([DATASETS[0].slug, DATASETS[2].slug, DATASETS[3].slug]);
    expect(notified).toBe(SHORTLIST_LIMIT + 1);
    expect(store.has(DATASETS[2].slug)).toBe(true);
    expect(normalizeShortlist(storage.data.get(SHORTLIST_STORAGE_KEY), NOW).items).toEqual(store.getSnapshot().items);
    store.clear();
    expect(storage.data.has(SHORTLIST_STORAGE_KEY)).toBe(false);
    unsubscribe();
  });

  it('keeps the visible change and reports when persistence fails', () => {
    const storage = memoryStorage();
    let broken = false;
    const flaky: KeyValueStorage = { ...storage, setItem: (key, value) => { if (broken) throw new Error('QuotaExceededError'); storage.setItem(key, value); } };
    const store = createShortlistStore(() => flaky, () => NOW);
    expect(store.add(DATASETS[0])).toEqual({ ok: true });
    broken = true;
    expect(store.add(DATASETS[1])).toEqual({ ok: true });
    const snapshot = store.getSnapshot();
    expect(snapshot.items).toHaveLength(2);
    expect(snapshot.status.kind).toBe('write-failed');
  });

  it('re-reads storage on reload so another tab can change the list', () => {
    const storage = memoryStorage();
    const store = createShortlistStore(() => storage, () => NOW);
    expect(store.getSnapshot().items).toEqual([]);
    storage.setItem(SHORTLIST_STORAGE_KEY, serializeShortlist([toShortlistItem(DATASETS[4], NOW)]));
    store.reload();
    expect(store.getSnapshot().items.map((i) => i.slug)).toEqual([DATASETS[4].slug]);
  });
});
