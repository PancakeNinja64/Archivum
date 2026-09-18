/**
 * The shortlist: up to four records kept on this device.
 *
 * It is deliberately not a "saved datasets" feature. Nothing leaves the
 * browser, nothing is tied to an account, and the UI names it "Saved on this
 * device" everywhere. Only stable slugs plus a little display metadata are
 * stored, so a stale entry can always be re-resolved against the catalog.
 *
 * Storage is treated as hostile: it may be missing (server render, privacy
 * modes, sandboxed frames), full, or hold malformed JSON from an older build.
 * Every failure is reported in `status` so the interface can explain it
 * instead of silently showing an empty list.
 */
import type { Dataset, DatasetSummary, Platform } from '@/lib/types';
import { isSlug, PLATFORMS } from './query';

export const SHORTLIST_LIMIT = 4;
export const SHORTLIST_STORAGE_KEY = 'archivum.shortlist.v1';
const STORAGE_VERSION = 1;

export interface ShortlistItem {
  slug: string;
  name: string;
  publisher: string;
  platform: Platform | null;
  /** Licence identifier exactly as the catalog published it. */
  license: string;
  coverageTotal: number | null;
  coverageCheckedAt: string | null;
  savedAt: string;
}

export type StorageStatus =
  | { kind: 'ok' }
  /** Storage could not be read at all. The list exists only for this page view. */
  | { kind: 'unavailable'; reason: string }
  /** Stored data was unreadable and has been discarded. */
  | { kind: 'reset'; reason: string }
  /** The last change is visible here but could not be persisted. */
  | { kind: 'write-failed'; reason: string };

export interface ShortlistState {
  items: ShortlistItem[];
  status: StorageStatus;
  /** False on the server and until the first client read. Lets the UI avoid a false "nothing saved" flash. */
  hydrated: boolean;
}

export type AddResult = { ok: true } | { ok: false; reason: 'full' | 'duplicate' };

/** The subset of the Web Storage API the store needs. Injectable for tests. */
export interface KeyValueStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

/* ---------- Pure normalisation ---------- */

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);
const text = (value: unknown, max: number): string | null => typeof value === 'string' && value.trim() ? value.trim().slice(0, max) : null;
const isoDate = (value: unknown): string | null => typeof value === 'string' && Number.isFinite(Date.parse(value)) ? value : null;

function normalizeItem(raw: unknown, now: string): ShortlistItem | null {
  if (!isRecord(raw)) return null;
  const slug = text(raw.slug, 160);
  if (!slug || !isSlug(slug)) return null;
  const platform = typeof raw.platform === 'string' && (PLATFORMS as readonly string[]).includes(raw.platform) ? (raw.platform as Platform) : null;
  const coverage = typeof raw.coverageTotal === 'number' && Number.isFinite(raw.coverageTotal) ? Math.round(Math.min(100, Math.max(0, raw.coverageTotal))) : null;
  return {
    slug: slug.toLowerCase(),
    name: text(raw.name, 200) ?? slug,
    publisher: text(raw.publisher, 200) ?? 'Publisher not recorded',
    platform,
    license: text(raw.license, 80) ?? 'Not stated',
    coverageTotal: coverage,
    coverageCheckedAt: isoDate(raw.coverageCheckedAt),
    savedAt: isoDate(raw.savedAt) ?? now,
  };
}

export interface NormalizedShortlist {
  items: ShortlistItem[];
  /** Human-readable notes about what was repaired or dropped. Empty when the data was clean. */
  problems: string[];
}

/**
 * Turn whatever was in storage into a valid list. Never throws. Duplicates
 * collapse to their first occurrence; anything beyond the limit is dropped.
 */
export function normalizeShortlist(raw: unknown, now = new Date().toISOString()): NormalizedShortlist {
  const problems: string[] = [];
  if (raw === null || raw === undefined) return { items: [], problems };
  let source: unknown = raw;
  if (typeof raw === 'string') {
    try { source = JSON.parse(raw); } catch { return { items: [], problems: ['Stored shortlist was not valid JSON.'] }; }
  }
  let list: unknown;
  if (Array.isArray(source)) list = source;
  else if (isRecord(source) && Array.isArray(source.items)) {
    if (source.version !== STORAGE_VERSION) problems.push('Stored shortlist came from a different version and was re-read defensively.');
    list = source.items;
  } else return { items: [], problems: ['Stored shortlist had an unexpected shape.'] };

  const items: ShortlistItem[] = [];
  const seen = new Set<string>();
  let dropped = 0;
  for (const entry of list as unknown[]) {
    const item = normalizeItem(entry, now);
    if (!item) { dropped += 1; continue; }
    if (seen.has(item.slug)) { dropped += 1; continue; }
    if (items.length >= SHORTLIST_LIMIT) { dropped += 1; continue; }
    seen.add(item.slug);
    items.push(item);
  }
  if (dropped) problems.push(`${dropped} stored ${dropped === 1 ? 'entry was' : 'entries were'} unreadable, duplicated, or over the limit and ${dropped === 1 ? 'was' : 'were'} dropped.`);
  return { items, problems };
}

export function serializeShortlist(items: readonly ShortlistItem[]): string {
  return JSON.stringify({ version: STORAGE_VERSION, items });
}

export function toShortlistItem(record: DatasetSummary | Dataset, savedAt = new Date().toISOString()): ShortlistItem {
  return {
    slug: record.slug,
    name: record.name,
    publisher: record.publisher,
    platform: record.platform,
    license: record.license?.spdx?.trim() || 'Not stated',
    coverageTotal: Number.isFinite(record.coverageTotal) ? Math.round(record.coverageTotal) : null,
    coverageCheckedAt: record.coverageCheckedAt ?? null,
    savedAt,
  };
}

/* ---------- Storage access ---------- */

const describe = (error: unknown) => (error instanceof Error && error.message ? error.message : 'unknown error');

export function readShortlist(storage: KeyValueStorage | null, now?: string): { items: ShortlistItem[]; status: StorageStatus } {
  if (!storage) return { items: [], status: { kind: 'unavailable', reason: 'Browser storage is not available here.' } };
  let raw: string | null;
  try { raw = storage.getItem(SHORTLIST_STORAGE_KEY); }
  catch (error) { return { items: [], status: { kind: 'unavailable', reason: `Browser storage could not be read (${describe(error)}).` } }; }
  const { items, problems } = normalizeShortlist(raw, now);
  if (!problems.length) return { items, status: { kind: 'ok' } };
  // Repair in place so the next read is clean. A failed repair is not fatal.
  try { if (items.length) storage.setItem(SHORTLIST_STORAGE_KEY, serializeShortlist(items)); else storage.removeItem(SHORTLIST_STORAGE_KEY); } catch { /* reported below */ }
  return { items, status: { kind: 'reset', reason: problems.join(' ') } };
}

export function writeShortlist(storage: KeyValueStorage | null, items: readonly ShortlistItem[]): StorageStatus {
  if (!storage) return { kind: 'unavailable', reason: 'Browser storage is not available here.' };
  try {
    if (items.length) storage.setItem(SHORTLIST_STORAGE_KEY, serializeShortlist(items));
    else storage.removeItem(SHORTLIST_STORAGE_KEY);
    return { kind: 'ok' };
  } catch (error) {
    return { kind: 'write-failed', reason: `The change could not be saved to this device (${describe(error)}).` };
  }
}

/** localStorage, or null when the environment refuses it. Probed on every call: availability can change. */
export function browserStorage(): KeyValueStorage | null {
  if (typeof window === 'undefined') return null;
  try {
    const storage = window.localStorage;
    const probe = '__archivum_probe__';
    storage.setItem(probe, '1');
    storage.removeItem(probe);
    return storage;
  } catch { return null; }
}

/* ---------- Store ---------- */

export interface ShortlistStore {
  getSnapshot(): ShortlistState;
  getServerSnapshot(): ShortlistState;
  subscribe(listener: () => void): () => void;
  add(record: DatasetSummary | Dataset): AddResult;
  remove(slug: string): void;
  clear(): void;
  has(slug: string): boolean;
  /** Re-read storage (used after cross-tab changes). */
  reload(): void;
}

const SERVER_SNAPSHOT: ShortlistState = Object.freeze({ items: [], status: { kind: 'ok' }, hydrated: false }) as ShortlistState;

export function createShortlistStore(getStorage: () => KeyValueStorage | null, clock: () => string = () => new Date().toISOString()): ShortlistStore {
  let snapshot: ShortlistState = SERVER_SNAPSHOT;
  let hydrated = false;
  const listeners = new Set<() => void>();
  const emit = () => listeners.forEach((listener) => listener());

  const load = () => {
    const { items, status } = readShortlist(getStorage(), clock());
    snapshot = { items, status, hydrated: true };
    hydrated = true;
  };
  const ensure = () => { if (!hydrated) load(); };
  const commit = (items: ShortlistItem[]) => {
    const status = writeShortlist(getStorage(), items);
    snapshot = { items, status, hydrated: true };
    emit();
  };

  const onStorage = (event: StorageEvent) => {
    if (event.key !== null && event.key !== SHORTLIST_STORAGE_KEY) return;
    load();
    emit();
  };

  return {
    getSnapshot() { ensure(); return snapshot; },
    getServerSnapshot() { return SERVER_SNAPSHOT; },
    subscribe(listener) {
      listeners.add(listener);
      if (listeners.size === 1 && typeof window !== 'undefined') window.addEventListener('storage', onStorage);
      return () => {
        listeners.delete(listener);
        if (listeners.size === 0 && typeof window !== 'undefined') window.removeEventListener('storage', onStorage);
      };
    },
    add(record) {
      ensure();
      if (snapshot.items.some((item) => item.slug === record.slug)) return { ok: false, reason: 'duplicate' };
      if (snapshot.items.length >= SHORTLIST_LIMIT) return { ok: false, reason: 'full' };
      commit([...snapshot.items, toShortlistItem(record, clock())]);
      return { ok: true };
    },
    remove(slug) {
      ensure();
      if (!snapshot.items.some((item) => item.slug === slug)) return;
      commit(snapshot.items.filter((item) => item.slug !== slug));
    },
    clear() { ensure(); if (snapshot.items.length) commit([]); },
    has(slug) { ensure(); return snapshot.items.some((item) => item.slug === slug); },
    reload() { load(); emit(); },
  };
}

/** The one store every desk surface shares. Module-level so navigation between pages keeps the same state. */
export const shortlistStore = createShortlistStore(browserStorage);

export function describeStorageStatus(status: StorageStatus): string | null {
  switch (status.kind) {
    case 'ok': return null;
    case 'unavailable': return `${status.reason} Records you add stay only until you leave this page.`;
    case 'reset': return `${status.reason} The list shown here is what could be recovered.`;
    case 'write-failed': return status.reason;
  }
}
