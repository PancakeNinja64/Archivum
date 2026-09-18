import type { DatasetSummary, Facets, Paginated } from '@/lib/types';
import type { WorkspaceQuery } from '@/lib/workbench/query';
import { SORT_SENTENCE } from './labels';

export type GuideResults =
  | { state: 'loading' }
  | { state: 'error'; message: string }
  | { state: 'ready'; data: Paginated<DatasetSummary> };

export interface StartingPoints {
  /** Total matching records once the list has answered; null while loading or failed. */
  total: number | null;
  /** The record at the top of the list under the current order — a position, never a verdict. */
  first: { slug: string; name: string } | null;
  /** How the list is ordered, for a sentence. */
  order: string;
  /** Domains from the catalog facets that are not already applied, largest first. */
  domains: { value: string; count: number }[];
  /** True when a search or a filter is narrowing the list. */
  narrowed: boolean;
}

export const GUIDE_DOMAIN_LIMIT = 6;

/**
 * What the idle evidence desk can honestly offer: the count and order of the
 * list beside it, the record listed first, and real facet values to narrow by.
 * Nothing here ranks, scores, or recommends a record.
 */
export function startingPoints(results: GuideResults, facets: Facets | null, query: WorkspaceQuery, limit = GUIDE_DOMAIN_LIMIT): StartingPoints {
  const ready = results.state === 'ready' ? results.data : null;
  const first = ready?.items[0];
  const domains = (facets?.domains ?? [])
    .filter((facet) => facet.count > 0 && !query.domain.includes(facet.value))
    .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value))
    .slice(0, Math.max(0, limit));
  const narrowed = Boolean(query.q) || query.domain.length > 0 || query.platform.length > 0 || query.modality.length > 0 || query.license.length > 0 || query.commercial || query.min > 0;
  return {
    total: ready ? ready.total : null,
    first: first ? { slug: first.slug, name: first.name } : null,
    order: SORT_SENTENCE[query.sort],
    domains,
    narrowed,
  };
}
