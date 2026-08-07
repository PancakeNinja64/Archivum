import { supabaseAdmin } from '@/lib/supabase/admin';
import { currentUser, jsonError } from '@/lib/server/auth';
import type { WatchedDataset } from '@/lib/types';

/** GET /api/watchlist — saved datasets for the signed-in user (service role; scoped by session). */
export async function GET() {
  const user = await currentUser();
  if (!user) return jsonError(401, 'Sign in required.');

  const db = supabaseAdmin();
  const { data: saved, error } = await db
    .from('saved_datasets')
    .select('dataset_id, datasets!inner(id, slug, name, publisher, coverage_total, coverage_checked_at, license_status)')
    .eq('user_id', user.id);
  if (error) return jsonError(500, 'Could not load your saved list.');

  type Row = Record<string, unknown>;
  const rows = (saved ?? []) as unknown as Row[];
  if (!rows.length) return Response.json([] satisfies WatchedDataset[]);

  const ids = rows.map((r) => r.dataset_id as string);
  const { data: snaps } = await db
    .from('coverage_snapshots')
    .select('dataset_id, coverage_total, observed_at')
    .in('dataset_id', ids)
    .order('observed_at', { ascending: false })
    .limit(12 * ids.length);

  const history = new Map<string, number[]>();
  for (const snap of snaps ?? []) {
    const key = snap.dataset_id as string;
    const arr = history.get(key) ?? [];
    if (arr.length < 12) {
      arr.push(snap.coverage_total as number);
      history.set(key, arr);
    }
  }

  const watchlist: WatchedDataset[] = rows.map((r) => {
    const d = r.datasets as Row;
    const coverageTotal = typeof d.coverage_total === 'number' ? d.coverage_total : 0;
    const hist = (history.get(r.dataset_id as string) ?? [coverageTotal]).slice().reverse();
    const delta = hist.length >= 2 ? hist[hist.length - 1] - hist[hist.length - 2] : 0;
    return {
      slug: String(d.slug ?? ''),
      name: String(d.name ?? ''),
      publisher: String(d.publisher ?? ''),
      coverageTotal,
      coverageDelta: delta,
      licenseStatus: (String(d.license_status) === 'not_found' ? 'unresolved' : 'ok') as WatchedDataset['licenseStatus'],
      lastChecked: String(d.coverage_checked_at ?? new Date().toISOString()),
      coverageHistory: hist,
    };
  });

  return Response.json(watchlist);
}
