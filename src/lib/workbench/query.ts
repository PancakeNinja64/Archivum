/**
 * URL contract for the research desk.
 *
 * Every piece of desk state that a colleague should be able to receive in a
 * link lives in the query string: the search, the filters, the page, the
 * inspected record and its open tab. Nothing here reads localStorage — a
 * shared link never depends on the sender's device.
 */
import type { DatasetFilters, Modality, Platform } from '@/lib/types';

export const WORKSPACE_PAGE_SIZE = 24;
export const COMPARE_MIN = 2;
export const COMPARE_MAX = 4;

export const PLATFORMS: readonly Platform[] = ['huggingface', 'kaggle', 'github', 'academic', 'direct'];
export const MODALITIES: readonly Modality[] = ['text', 'image', 'audio', 'tabular', 'multimodal'];
export const SORTS = ['coverage', 'recent', 'size', 'name'] as const;
export type Sort = (typeof SORTS)[number];
export const INSPECTOR_TABS = ['overview', 'evidence', 'history', 'structure'] as const;
export type InspectorTab = (typeof INSPECTOR_TABS)[number];

/** Coverage floors offered by the desk. `0` means no floor. */
export const COVERAGE_FLOORS = [0, 40, 75] as const;

export interface WorkspaceQuery {
  q: string;
  dataset: string | null;
  platform: Platform[];
  domain: string[];
  modality: Modality[];
  /** Published licence identifiers, exactly as the catalog spells them (including "Not stated"). */
  license: string[];
  /** Only records whose published identifier maps, by static SPDX lookup, to permitted commercial use. */
  commercial: boolean;
  /** Minimum documentation coverage, 0–100. 0 means no floor. */
  min: number;
  sort: Sort;
  page: number;
  tab: InspectorTab;
}

export const EMPTY_WORKSPACE_QUERY: WorkspaceQuery = {
  q: '', dataset: null, platform: [], domain: [], modality: [], license: [], commercial: false, min: 0, sort: 'coverage', page: 1, tab: 'overview',
};

const SLUG = /^[a-z0-9](?:[a-z0-9._-]{0,159})$/i;

/** Catalog slugs are lowercase kebab identifiers; anything else is refused before it reaches an adapter. */
export function isSlug(value: unknown): boolean {
  return typeof value === 'string' && SLUG.test(value);
}

function list(params: URLSearchParams, key: string, max = 24): string[] {
  const values = params.getAll(key).flatMap((raw) => raw.split(','));
  const seen = new Set<string>();
  for (const value of values) {
    const trimmed = value.trim();
    if (trimmed && trimmed.length <= 80) seen.add(trimmed);
    if (seen.size >= max) break;
  }
  return [...seen];
}

function clampInt(raw: string | null, min: number, max: number, fallback: number): number {
  if (raw === null || raw.trim() === '') return fallback;
  const n = Number(raw);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, Math.floor(n)));
}

export function parseWorkspaceQuery(params: URLSearchParams): WorkspaceQuery {
  const rawDataset = params.get('dataset')?.trim() ?? '';
  const rawSort = params.get('sort');
  const rawTab = params.get('tab');
  return {
    q: (params.get('q') ?? '').trim().slice(0, 200),
    dataset: isSlug(rawDataset) ? rawDataset.toLowerCase() : null,
    platform: list(params, 'platform').filter((v): v is Platform => (PLATFORMS as readonly string[]).includes(v)),
    domain: list(params, 'domain'),
    modality: list(params, 'modality').filter((v): v is Modality => (MODALITIES as readonly string[]).includes(v)),
    license: list(params, 'license'),
    commercial: params.get('commercial') === '1',
    min: clampInt(params.get('min'), 0, 100, 0),
    sort: rawSort && (SORTS as readonly string[]).includes(rawSort) ? (rawSort as Sort) : 'coverage',
    page: clampInt(params.get('page'), 1, 100_000, 1),
    tab: rawTab && (INSPECTOR_TABS as readonly string[]).includes(rawTab) ? (rawTab as InspectorTab) : 'overview',
  };
}

/** The adapter request for a desk state. Only set what differs from the adapter default. */
export function toFilters(query: WorkspaceQuery): DatasetFilters {
  return {
    query: query.q || undefined,
    platform: query.platform.length ? query.platform : undefined,
    domain: query.domain.length ? query.domain : undefined,
    modality: query.modality.length ? query.modality : undefined,
    license: query.license.length ? query.license : undefined,
    commercialOnly: query.commercial || undefined,
    minCoverage: query.min > 0 ? query.min : undefined,
    sort: query.sort,
    page: query.page,
    pageSize: WORKSPACE_PAGE_SIZE,
  };
}

/** The part of the state that changes result membership. Used as the request key. */
export function resultsKey(query: WorkspaceQuery): string {
  return JSON.stringify([query.q, query.platform, query.domain, query.modality, query.license, query.commercial, query.min, query.sort, query.page]);
}

/**
 * Serialise back to a query string, omitting defaults so links stay short and
 * stable. Result-changing patches reset the page unless the patch sets it.
 */
export function serializeWorkspaceQuery(query: WorkspaceQuery): string {
  const params = new URLSearchParams();
  if (query.q) params.set('q', query.q);
  if (query.platform.length) params.set('platform', query.platform.join(','));
  if (query.domain.length) params.set('domain', query.domain.join(','));
  if (query.modality.length) params.set('modality', query.modality.join(','));
  if (query.license.length) params.set('license', query.license.join(','));
  if (query.commercial) params.set('commercial', '1');
  if (query.min > 0) params.set('min', String(query.min));
  if (query.sort !== 'coverage') params.set('sort', query.sort);
  if (query.page > 1) params.set('page', String(query.page));
  if (query.dataset) params.set('dataset', query.dataset);
  if (query.tab !== 'overview' && query.dataset) params.set('tab', query.tab);
  return params.toString();
}

const RESULT_KEYS: (keyof WorkspaceQuery)[] = ['q', 'platform', 'domain', 'modality', 'license', 'commercial', 'min', 'sort'];

export function patchWorkspaceQuery(query: WorkspaceQuery, patch: Partial<WorkspaceQuery>): WorkspaceQuery {
  const next = { ...query, ...patch };
  const resultsChanged = RESULT_KEYS.some((key) => key in patch && JSON.stringify(patch[key]) !== JSON.stringify(query[key]));
  if (resultsChanged && !('page' in patch)) next.page = 1;
  if (!next.dataset) next.tab = 'overview';
  return next;
}

export function workspaceHref(query: Partial<WorkspaceQuery>): string {
  const qs = serializeWorkspaceQuery({ ...EMPTY_WORKSPACE_QUERY, ...query });
  return `/workspace/${qs ? `?${qs}` : ''}`;
}

/** Record detail link used everywhere the desk is referenced. */
export function recordHref(slug: string, tab?: InspectorTab): string {
  return workspaceHref({ dataset: slug, tab: tab ?? 'overview' });
}

/* ---------- Compare ---------- */

export interface CompareSelection {
  /** Valid, de-duplicated slugs, in the order given, capped at COMPARE_MAX. */
  slugs: string[];
  /** Slugs refused because they were malformed. */
  invalid: string[];
  /** How many valid slugs were dropped because the desk holds at most four. */
  overflow: number;
}

export function parseCompareSlugs(params: URLSearchParams): CompareSelection {
  const raw = params.getAll('datasets').flatMap((value) => value.split(','));
  const slugs: string[] = [];
  const invalid: string[] = [];
  let overflow = 0;
  for (const value of raw) {
    const trimmed = value.trim();
    if (!trimmed) continue;
    if (!isSlug(trimmed)) { if (invalid.length < 8) invalid.push(trimmed.slice(0, 40)); continue; }
    const slug = trimmed.toLowerCase();
    if (slugs.includes(slug)) continue;
    if (slugs.length >= COMPARE_MAX) { overflow += 1; continue; }
    slugs.push(slug);
  }
  return { slugs, invalid, overflow };
}

export function compareHref(slugs: readonly string[]): string {
  const clean = [...new Set(slugs.filter((slug) => isSlug(slug)).map((slug) => slug.toLowerCase()))].slice(0, COMPARE_MAX);
  if (!clean.length) return '/compare/';
  const params = new URLSearchParams();
  params.set('datasets', clean.join(','));
  return `/compare/?${params.toString()}`;
}
