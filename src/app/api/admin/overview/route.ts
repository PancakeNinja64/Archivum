import { supabaseAdmin } from '@/lib/supabase/admin';
import { requireAdmin, jsonError } from '@/lib/server/auth';

export const dynamic = 'force-dynamic';

/** Everything the admin console shows, in one round trip, via the service role. */
export async function GET() {
  const admin = await requireAdmin();
  if (!admin.ok) return jsonError(admin.status, admin.status === 401 ? 'Sign in required.' : 'Not an admin account.');

  const db = supabaseAdmin();
  const [{ data: datasets }, { data: runs }, { data: corrections }] = await Promise.all([
    db.from('datasets')
      .select('id, slug, name, publisher, platform, status, coverage_total, coverage_checked_at, license_spdx, coverage_detail, source_url')
      .order('updated_at', { ascending: false }).limit(200),
    db.from('ingestion_runs').select('*').order('started_at', { ascending: false }).limit(50),
    db.from('dataset_corrections').select('*').eq('status', 'open').order('created_at', { ascending: false }).limit(50),
  ]);

  return Response.json({
    datasets: datasets ?? [],
    runs: runs ?? [],
    corrections: corrections ?? [],
  });
}
