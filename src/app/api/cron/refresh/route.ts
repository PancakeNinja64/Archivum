import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { serverConfig } from '@/lib/config';
import { jsonError } from '@/lib/server/auth';
import { ingestOne, rebuildFacets } from '@/lib/ingest/ingestOne';
import { mapLimit } from '@/lib/sources/fetcher';

export const maxDuration = 300;

const BATCH = 20;

/**
 * Daily re-check of the 20 least-recently-checked published datasets.
 * Also the reason the free-tier database never idles into a pause.
 * Vercel Cron calls this with Authorization: Bearer CRON_SECRET.
 */
export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization') ?? '';
  let expected: string;
  try {
    expected = serverConfig.cronSecret;
  } catch {
    return jsonError(500, 'CRON_SECRET is not configured.');
  }
  if (auth !== `Bearer ${expected}`) return jsonError(401, 'Unauthorized.');

  const db = supabaseAdmin();
  const { data: due } = await db.from('datasets')
    .select('platform, source_identifier')
    .eq('status', 'published')
    .order('coverage_checked_at', { ascending: true, nullsFirst: true })
    .limit(BATCH);

  if (!due?.length) return Response.json({ checked: 0 });

  const results = await mapLimit(due, 3, (d) =>
    ingestOne(db, d.platform, d.source_identifier, 'cron'),
  );
  await rebuildFacets(db);

  const tally = results.reduce<Record<string, number>>((acc, r) => {
    acc[r.status] = (acc[r.status] ?? 0) + 1;
    return acc;
  }, {});
  return Response.json({ checked: results.length, tally });
}
