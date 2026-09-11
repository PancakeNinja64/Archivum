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
  LineageGraph, ActivityEvent, WatchedDataset,
} from '../../types';
import { rowDataset, rowSummary, type Row } from './normalize';

/** One client per environment. On the server we use a plain anon client (no cookies needed for public reads). */
function sb() {
  if (typeof window === 'undefined') {
    return createClient(publicConfig.supabaseUrl, publicConfig.supabaseAnonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return createBrowserClient(publicConfig.supabaseUrl, publicConfig.supabaseAnonKey);
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
  const { data: versions, error: versionsError } = await client.from('dataset_versions').select('*')
    .eq('dataset_id', d.id).order('observed_at', { ascending: false }).limit(20);
  if (versionsError) throw new Error(`getDataset history failed: ${versionsError.message}`);
  return rowDataset(d as Row, (versions ?? []) as Row[]);
}

export async function getLineage(slug: string): Promise<LineageGraph | null> {
  const { data, error } = await sb().from('datasets').select('lineage').eq('slug', slug).maybeSingle();
  if (error) throw new Error(`getLineage failed: ${error.message}`);
  return (data?.lineage as LineageGraph) ?? null;
}

export async function getFacets(): Promise<Facets> {
  const empty: Facets = {
    total: 0,
    platforms: [],
    domains: [],
    modalities: [],
    languages: [],
    licenses: [],
  };
  const client = sb();
  const { data, error } = await client.from('catalog_facets').select('payload').eq('id', 1).maybeSingle();
  if (error) throw new Error(`getFacets failed: ${error.message}`);
  const p = (data?.payload ?? {}) as Record<string, unknown>;
  if (!p || Object.keys(p).length === 0) {
    const { count, error: countError } = await client
      .from('datasets')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'published');
    if (countError || count === null) throw new Error('Catalog totals are unavailable.');
    return { ...empty, total: count };
  }
  let total = typeof p.total === 'number' ? p.total : 0;
  if (!total) {
    const { count, error: countError } = await client
      .from('datasets')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'published');
    if (countError || count === null) throw new Error('Catalog totals are unavailable.');
    total = count;
  }
  return {
    total,
    platforms: (p.platforms ?? []) as Facets['platforms'],
    domains: (p.domains ?? []) as Facets['domains'],
    modalities: (p.modalities ?? []) as Facets['modalities'],
    languages: (p.languages ?? []) as Facets['languages'],
    licenses: (p.licenses ?? []) as Facets['licenses'],
  };
}

export async function getAllSlugs(): Promise<string[]> {
  const { data, error } = await sb().from('datasets').select('slug').eq('status', 'published').limit(1000);
  if (error) throw new Error(`getAllSlugs failed: ${error.message}`);
  return (data ?? []).map((r) => r.slug as string);
}

export async function getFeatured(count = 6): Promise<DatasetSummary[]> {
  const client = sb();
  // Well-documented entries plus the thinnest one — the contrast is the demonstration.
  const [{ data: top, error: topError }, { data: low, error: lowError }] = await Promise.all([
    client.from('datasets').select(SUMMARY_COLS).eq('status', 'published')
      .order('coverage_total', { ascending: false }).limit(count - 1),
    client.from('datasets').select(SUMMARY_COLS).eq('status', 'published')
      .order('coverage_total', { ascending: true }).limit(1),
  ]);
  if (topError || lowError) throw new Error('Featured records are unavailable.');
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
  if (!res.ok) throw new Error(res.status === 401 ? 'Sign in to load saved data.' : 'Saved data could not be loaded.');
  return (await res.json()) as ActivityEvent[];
}

export async function getWatchlist(): Promise<WatchedDataset[]> {
  if (typeof window === 'undefined') return [];
  const res = await fetch('/api/watchlist', { credentials: 'same-origin' });
  if (!res.ok) throw new Error(res.status === 401 ? 'Sign in to load saved data.' : 'Saved data could not be loaded.');
  return (await res.json()) as WatchedDataset[];
}
