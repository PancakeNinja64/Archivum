import type { DatasetFilters, Modality, Platform } from '@/lib/types';

export const CATALOG_PAGE_SIZE = 24;
export type CatalogView = 'list' | 'atlas';
export type CatalogState = { filters: DatasetFilters; view: CatalogView };

const platforms = new Set<Platform>(['huggingface', 'kaggle', 'github', 'academic', 'direct']);
const modalities = new Set<Modality>(['text', 'image', 'audio', 'tabular', 'multimodal']);
const sorts = new Set(['coverage', 'recent', 'size', 'name']);

/** Old grid/table links remain readable; view changes never change result membership. */
export function readCatalogQuery(params: URLSearchParams): CatalogState {
  const list = (key: string) => [...new Set((params.get(key) ?? '').split(',').map((value) => value.trim()).filter(Boolean))];
  const rawPage = Number(params.get('page'));
  const rawMin = Number(params.get('min'));
  const rawSort = params.get('sort');
  return {
    view: params.get('view') === 'atlas' ? 'atlas' : 'list',
    filters: {
      query: params.get('q')?.trim() || undefined,
      platform: list('platform').filter((value): value is Platform => platforms.has(value as Platform)),
      modality: list('modality').filter((value): value is Modality => modalities.has(value as Modality)),
      domain: list('domain'),
      languages: list('language'),
      license: list('license'),
      commercialOnly: params.get('commercial') === '1',
      minCoverage: Number.isFinite(rawMin) ? Math.max(0, Math.min(100, rawMin)) : 0,
      sort: rawSort && sorts.has(rawSort) ? rawSort as DatasetFilters['sort'] : 'coverage',
      page: Number.isFinite(rawPage) && rawPage >= 1 ? Math.min(Number.MAX_SAFE_INTEGER, Math.floor(rawPage)) : 1,
      pageSize: CATALOG_PAGE_SIZE,
    },
  };
}

/** Preserve unrelated parameters and reset pagination only when the result set changes. */
export function updateCatalogQuery(
  params: URLSearchParams,
  patch: Record<string, string | null>,
  preservePage = false,
): string {
  const next = new URLSearchParams(params);
  for (const [key, value] of Object.entries(patch)) {
    if (value === null || value === '') next.delete(key);
    else next.set(key, value);
  }
  if (!preservePage && !('page' in patch)) next.delete('page');
  return next.toString();
}
