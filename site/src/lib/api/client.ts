/**
 * The ONLY module pages and components may import for data.
 * Swapping to a real backend means editing ./adapters/ — nothing else.
 */
import type {
  Dataset, DatasetFilters, DatasetSummary, Paginated, Facets,
  LineageGraph, ActivityEvent, WatchedDataset,
} from '../types';
import * as mock from './adapters/mock';

const adapter = mock; // switch here when a real adapter exists

export const getDatasets = (f?: DatasetFilters): Promise<Paginated<DatasetSummary>> => adapter.getDatasets(f);
export const getDataset = (slug: string): Promise<Dataset | null> => adapter.getDataset(slug);
export const getLineage = (slug: string): Promise<LineageGraph | null> => adapter.getLineage(slug);
export const getFacets = (): Promise<Facets> => adapter.getFacets();
export const getAllSlugs = (): Promise<string[]> => adapter.getAllSlugs();
export const getFeatured = (n?: number): Promise<DatasetSummary[]> => adapter.getFeatured(n);
export const getRelated = (slug: string): Promise<DatasetSummary[]> => adapter.getRelated(slug);
export const getActivity = (): Promise<ActivityEvent[]> => adapter.getActivity();
export const getWatchlist = (): Promise<WatchedDataset[]> => adapter.getWatchlist();
