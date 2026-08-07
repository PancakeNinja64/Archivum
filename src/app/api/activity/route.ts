import { supabaseAdmin } from '@/lib/supabase/admin';
import { currentUser, jsonError } from '@/lib/server/auth';
import type { ActivityEvent } from '@/lib/types';

/** GET /api/activity — change events for the signed-in user's saved datasets. */
export async function GET() {
  const user = await currentUser();
  if (!user) return jsonError(401, 'Sign in required.');

  const db = supabaseAdmin();
  const { data: saved, error: savedError } = await db
    .from('saved_datasets')
    .select('dataset_id')
    .eq('user_id', user.id);
  if (savedError) return jsonError(500, 'Could not load activity.');

  const ids = (saved ?? []).map((r) => r.dataset_id as string);
  if (!ids.length) return Response.json([] satisfies ActivityEvent[]);

  const { data, error } = await db
    .from('dataset_changes')
    .select('id, dataset_id, change_type, severity, message, detected_at, datasets!inner(slug, name)')
    .in('dataset_id', ids)
    .order('detected_at', { ascending: false })
    .limit(30);
  if (error) return jsonError(500, 'Could not load activity.');

  type Row = Record<string, unknown>;
  const events: ActivityEvent[] = ((data ?? []) as unknown as Row[]).map((r) => {
    const ds = r.datasets as { slug?: string; name?: string } | null;
    return {
      id: String(r.id ?? ''),
      type: String(r.change_type ?? 'lineage-updated') as ActivityEvent['type'],
      severity: String(r.severity ?? 'info') as ActivityEvent['severity'],
      datasetSlug: String(ds?.slug ?? ''),
      datasetName: String(ds?.name ?? ''),
      message: String(r.message ?? ''),
      timestamp: String(r.detected_at ?? ''),
    };
  });

  return Response.json(events);
}
