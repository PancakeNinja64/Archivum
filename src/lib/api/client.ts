/**
 * The ONLY module pages and components may import for data.
 * The adapter is selected by NEXT_PUBLIC_DATA_SOURCE:
 *   'mock'     — the built-in demo catalog; works with no environment at all.
 *   'supabase' — the live catalog.
 */
import type {
  Dataset, DatasetFilters, DatasetSummary, Paginated, Facets,
  LineageGraph, ActivityEvent, WatchedDataset,
} from '../types';
import * as mock from './adapters/mock';
import * as supabase from './adapters/supabase';

const adapter = process.env.NEXT_PUBLIC_DATA_SOURCE === 'supabase' ? supabase : mock;

export const getDatasets = (f?: DatasetFilters): Promise<Paginated<DatasetSummary>> => adapter.getDatasets(f);
export const getDataset = (slug: string): Promise<Dataset | null> => adapter.getDataset(slug);
export const getLineage = (slug: string): Promise<LineageGraph | null> => adapter.getLineage(slug);
export const getFacets = (): Promise<Facets> => adapter.getFacets();
export const getAllSlugs = (): Promise<string[]> => adapter.getAllSlugs();
export const getFeatured = (n?: number): Promise<DatasetSummary[]> => adapter.getFeatured(n);
export const getRelated = (slug: string): Promise<DatasetSummary[]> => adapter.getRelated(slug);
export const getActivity = (): Promise<ActivityEvent[]> => adapter.getActivity();
export const getWatchlist = (): Promise<WatchedDataset[]> => adapter.getWatchlist();
