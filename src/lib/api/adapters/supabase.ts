/**
 * Live adapter. Reads go straight to Supabase with the anon key; Row Level
 * Security restricts every query to published datasets and the caller's own rows.
 * Never import this from components — go through ../client.
 */
import { createBrowserClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { publicConfig } from '../../config';
import type {
  Dataset, DatasetFilters, DatasetSummary, Paginated, Facets,
  LineageGraph, ActivityEvent, WatchedDataset, Platform, Modality,
  DatasetLicense, CoverageBand,
} from '../../types';
import { bandFor } from '../../utils';
import { computeCoverage } from '../../coverage/rules';

/** One client per environment. On the server we use a plain anon client (no cookies needed for public reads). */
function sb() {
  if (typeof window === 'undefined') {
    return createClient(publicConfig.supabaseUrl, publicConfig.supabaseAnonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return createBrowserClient(publicConfig.supabaseUrl, publicConfig.supabaseAnonKey);
}

/* ---------- row -> domain mapping ---------- */

type Row = Record<string, unknown>;
const s = (v: unknown, fallback = ''): string => (typeof v === 'string' ? v : fallback);
const n = (v: unknown, fallback = 0): number => (typeof v === 'number' ? v : fallback);

function rowLicense(r: Row): DatasetLicense {
  const spdx = s(r.license_spdx) || 'Not stated';
  return {
    spdx,
    commercialUse: (s(r.commercial_use) || 'not_stated') as DatasetLicense['commercialUse'],
    attribution: /^CC-BY|MIT|Apache|BSD/i.test(spdx),
    shareAlike: /-SA/i.test(spdx),
    label: (s(r.license_status) || 'not_found') as DatasetLicense['label'],
    notes: [],
  };
}

function rowSummary(r: Row): DatasetSummary {
  const total = n(r.coverage_total);
  return {
    slug: s(r.slug),
    name: s(r.name),
    publisher: s(r.publisher),
    description: s(r.description),
    platform: s(r.platform, 'direct') as Platform,
    domain: (r.domain as string[]) ?? [],
    languages: (r.languages as string[]) ?? [],
    modality: (s(r.modality, 'text')) as Modality,
    sizeRows: n(r.size_rows),
    sizeBytes: n(r.size_bytes),
    license: rowLicense(r),
    coverageTotal: total,
    coverageBand: bandFor(total) as CoverageBand,
    coverageCheckedAt: s(r.coverage_checked_at, new Date().toISOString()),
    lastUpdated: s(r.last_source_update, s(r.updated_at, new Date().toISOString())),
    version: s(r.source_revision, '').slice(0, 7) || 'current',
  };
}

function rowDataset(r: Row, versions: Row[]): Dataset {
  const summary = rowSummary(r);
  // Sections are recomputed from the stored 28-check detail through the same
  // pure function the importer used — one source of arithmetic, everywhere.
  const detail = ((r.coverage_detail as Dataset['coverageDetail']) ?? {});
  const sections = Object.keys(detail).length ? computeCoverage(detail).sections : [];
  return {
    ...summary,
    publisherSlug: s(r.publisher_slug),
    platformUrl: s(r.source_url),
    coverageSections: sections,
    coverageDetail: detail,
    coverageVersion: s(r.coverage_version, '1.0'),
    firstPublished: s(r.first_published, s(r.created_at, new Date().toISOString())),
    contentHash: s(r.metadata_hash, ''),
    lineage: ((r.lineage as LineageGraph) ?? { nodes: [], edges: [], completeness: 0, undocumentedStages: [] }),
    versions: versions.map((v) => ({
      version: s(v.version_label),
      date: s(v.observed_at),
      rowsAdded: 0,
      rowsRemoved: 0,
      note: s(v.note),
      author: s(v.author, summary.publisher),
      coverageTotal: n(v.coverage_total, summary.coverageTotal),
    })),
    schema: ((r.schema_fields as Dataset['schema']) ?? []),
    sampleRecords: ((r.sample_records as Dataset['sampleRecords']) ?? []),
    relatedSlugs: [],
  };
}

const SUMMARY_COLS =
  'id, slug, name, publisher, publisher_slug, description, platform, source_url, domain, modality, languages, ' +
  'size_rows, size_bytes, license_spdx, license_status, commercial_use, coverage_total, coverage_checked_at, ' +
  'last_source_update, updated_at, source_revision';

/* ---------- API surface ---------- */

export async function getDatasets(f: DatasetFilters = {}): Promise<Paginated<DatasetSummary>> {
  const { page = 1, pageSize = 24, sort = 'coverage' } = f;
  const { data, error } = await sb().rpc('search_datasets', {
    p_query: f.query ?? null,
    p_platforms: f.platform?.length ? f.platform : null,
    p_domains: f.domain?.length ? f.domain : null,
    p_modalities: f.modality?.length ? f.modality : null,
    p_languages: f.languages?.length ? f.languages : null,
    p_licenses: f.license?.length ? f.license : null,
    p_min_coverage: typeof f.minCoverage === 'number' ? f.minCoverage : null,
    p_commercial: Boolean(f.commercialOnly),
    p_updated_within_days: f.updatedWithinDays ?? null,
    p_sort: sort,
    p_limit: pageSize,
    p_offset: (page - 1) * pageSize,
  });
  if (error) throw new Error(`search_datasets failed: ${error.message}`);
  const rows = (data ?? []) as Row[];
  const total = rows.length ? Number(rows[0].total_count ?? rows.length) : 0;
  return { items: rows.map(rowSummary), total, page, pageSize };
}

export async function getDataset(slug: string): Promise<Dataset | null> {
  const client = sb();
  const { data: d, error } = await client
    .from('datasets').select('*').eq('slug', slug).maybeSingle();
  if (error) throw new Error(`getDataset failed: ${error.message}`);
  if (!d) return null;
  const { data: versions } = await client.from('dataset_versions').select('*')
    .eq('dataset_id', d.id).order('observed_at', { ascending: false }).limit(20);
  return rowDataset(d as Row, (versions ?? []) as Row[]);
}

export async function getLineage(slug: string): Promise<LineageGraph | null> {
  const { data } = await sb().from('datasets').select('lineage').eq('slug', slug).maybeSingle();
  return (data?.lineage as LineageGraph) ?? null;
}

export async function getFacets(): Promise<Facets> {
  const empty: Facets = { platforms: [], domains: [], modalities: [], languages: [], licenses: [] };
  const { data } = await sb().from('catalog_facets').select('payload').eq('id', 1).maybeSingle();
  const p = (data?.payload ?? {}) as Record<string, { value: string; count: number }[]>;
  if (!p) return empty;
  return {
    platforms: (p.platforms ?? []) as Facets['platforms'],
    domains: p.domains ?? [],
    modalities: (p.modalities ?? []) as Facets['modalities'],
    languages: p.languages ?? [],
    licenses: p.licenses ?? [],
  };
}

export async function getAllSlugs(): Promise<string[]> {
  const { data } = await sb().from('datasets').select('slug').eq('status', 'published').limit(1000);
  return (data ?? []).map((r) => r.slug as string);
}

export async function getFeatured(count = 6): Promise<DatasetSummary[]> {
  const client = sb();
  // Well-documented entries plus the thinnest one — the contrast is the demonstration.
  const [{ data: top }, { data: low }] = await Promise.all([
    client.from('datasets').select(SUMMARY_COLS).eq('status', 'published')
      .order('coverage_total', { ascending: false }).limit(count - 1),
    client.from('datasets').select(SUMMARY_COLS).eq('status', 'published')
      .order('coverage_total', { ascending: true }).limit(1),
  ]);
  const rows = [...(top ?? []), ...(low ?? [])] as unknown as Row[];
  const seen = new Set<string>();
  return rows.filter((r) => !seen.has(r.slug as string) && seen.add(r.slug as string)).map(rowSummary);
}

export async function getRelated(slug: string): Promise<DatasetSummary[]> {
  const client = sb();
  const { data: d } = await client.from('datasets')
    .select('id, domain, modality').eq('slug', slug).maybeSingle();
  if (!d) return [];
  const { data } = await client.from('datasets').select(SUMMARY_COLS)
    .eq('status', 'published').neq('slug', slug)
    .overlaps('domain', (d.domain as string[]) ?? [])
    .limit(3);
  return ((data ?? []) as unknown as Row[]).map(rowSummary);
}

/**
 * Watchlist / activity go through API routes so the service role can read
 * saved_datasets even when the authenticated role is missing SELECT grants.
 * Browser-only: these are called from DashboardClient.
 */
export async function getActivity(): Promise<ActivityEvent[]> {
  if (typeof window === 'undefined') return [];
  const res = await fetch('/api/activity', { credentials: 'same-origin' });
  if (res.status === 401 || !res.ok) return [];
  return (await res.json()) as ActivityEvent[];
}

export async function getWatchlist(): Promise<WatchedDataset[]> {
  if (typeof window === 'undefined') return [];
  const res = await fetch('/api/watchlist', { credentials: 'same-origin' });
  if (res.status === 401 || !res.ok) return [];
  return (await res.json()) as WatchedDataset[];
}
