import { DATASETS } from '../../mock-data';
import { ACTIVITY, WATCHLIST } from '../../mock-dashboard';
import type {
  Dataset, DatasetFilters, DatasetSummary, Paginated, Facets,
  LineageGraph, ActivityEvent, WatchedDataset, Platform, Modality,
} from '../../types';

/** Artificial latency so loading and skeleton states actually get built. */
const delay = <T,>(value: T, ms = 220 + Math.random() * 260): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value), ms));

const toSummary = (d: Dataset): DatasetSummary => ({
  slug: d.slug, name: d.name, publisher: d.publisher, description: d.description,
  platform: d.platform, domain: d.domain, languages: d.languages, modality: d.modality,
  sizeRows: d.sizeRows, sizeBytes: d.sizeBytes, license: d.license,
  coverageTotal: d.coverageTotal, coverageBand: d.coverageBand, coverageCheckedAt: d.coverageCheckedAt, lastUpdated: d.lastUpdated, version: d.version,
});

export async function getDatasets(f: DatasetFilters = {}): Promise<Paginated<DatasetSummary>> {
  const { page = 1, pageSize = 24, sort = 'coverage' } = f;
  let rows = DATASETS.slice();

  if (f.query) {
    const q = f.query.toLowerCase();
    rows = rows.filter((d) =>
      [d.name, d.publisher, d.description, ...d.domain, ...d.languages, d.license.spdx]
        .join(' ').toLowerCase().includes(q));
  }
  if (f.platform?.length) rows = rows.filter((d) => f.platform!.includes(d.platform));
  if (f.modality?.length) rows = rows.filter((d) => f.modality!.includes(d.modality));
  if (f.domain?.length) rows = rows.filter((d) => d.domain.some((x) => f.domain!.includes(x)));
  if (f.languages?.length) rows = rows.filter((d) => d.languages.some((x) => f.languages!.includes(x)));
  if (f.license?.length) rows = rows.filter((d) => f.license!.includes(d.license.spdx));
    if (f.commercialOnly) rows = rows.filter((d) => d.license.commercialUse === 'permitted');
  if (typeof f.minCoverage === 'number') rows = rows.filter((d) => d.coverageTotal >= f.minCoverage!);
  if (f.updatedWithinDays) {
    const cutoff = Date.now() - f.updatedWithinDays * 86_400_000;
    rows = rows.filter((d) => new Date(d.lastUpdated).getTime() >= cutoff);
  }

  rows.sort((a, b) => {
    if (sort === 'recent') return +new Date(b.lastUpdated) - +new Date(a.lastUpdated);
    if (sort === 'size') return b.sizeRows - a.sizeRows;
    if (sort === 'name') return a.name.localeCompare(b.name);
    return b.coverageTotal - a.coverageTotal;
  });

  const total = rows.length;
  const items = rows.slice((page - 1) * pageSize, page * pageSize).map(toSummary);
  return delay({ items, total, page, pageSize });
}

export const getDataset = (slug: string): Promise<Dataset | null> =>
  delay(DATASETS.find((d) => d.slug === slug) ?? null);

export const getLineage = (slug: string): Promise<LineageGraph | null> =>
  delay(DATASETS.find((d) => d.slug === slug)?.lineage ?? null);

export const getAllSlugs = async (): Promise<string[]> => DATASETS.map((d) => d.slug);

export const getFeatured = (n = 6): Promise<DatasetSummary[]> =>
  // Deliberately mixed: well-documented entries plus one thin one — the contrast is the demonstration.
  delay([...DATASETS.slice(0, n - 1), DATASETS[DATASETS.length - 1]].map(toSummary));

export const getRelated = (slug: string): Promise<DatasetSummary[]> => {
  const d = DATASETS.find((x) => x.slug === slug);
  if (!d) return delay([]);
  return delay(d.relatedSlugs
    .map((s) => DATASETS.find((x) => x.slug === s))
    .filter((x): x is Dataset => Boolean(x))
    .map(toSummary));
};

export async function getFacets(): Promise<Facets> {
  const tally = <T extends string>(vals: T[]) => {
    const m = new Map<T, number>();
    vals.forEach((v) => m.set(v, (m.get(v) ?? 0) + 1));
    return [...m.entries()]
      .map(([value, count]) => ({ value, count }))
      .sort((a, b) => b.count - a.count);
  };
  return delay({
    total: DATASETS.length,
    platforms: tally(DATASETS.map((d) => d.platform) as Platform[]),
    modalities: tally(DATASETS.map((d) => d.modality) as Modality[]),
    domains: tally(DATASETS.flatMap((d) => d.domain)),
    languages: tally(DATASETS.flatMap((d) => d.languages)),
    licenses: tally(DATASETS.map((d) => d.license.spdx)),
  });
}

export const getActivity = (): Promise<ActivityEvent[]> => delay(ACTIVITY);
export const getWatchlist = (): Promise<WatchedDataset[]> => delay(WATCHLIST);
