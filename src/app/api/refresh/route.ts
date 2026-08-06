import { z } from 'zod';
import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { currentUser, readJson, jsonError } from '@/lib/server/auth';
import { ingestOne, rebuildFacets } from '@/lib/ingest/ingestOne';

export const maxDuration = 60;

const Schema = z.object({ slug: z.string().min(3).max(200) });
const LIMIT_PER_HOUR = 5;

/** Signed-in users may ask for a re-check of a published dataset. */
export async function POST(req: NextRequest) {
  const user = await currentUser();
  if (!user) return jsonError(401, 'Sign in to request a re-check.');

  const parsed = Schema.safeParse(await readJson(req));
  if (!parsed.success) return jsonError(400, 'Expected {slug}.');

  const db = supabaseAdmin();
  const { data: ds } = await db.from('datasets')
    .select('id, platform, source_identifier, status').eq('slug', parsed.data.slug).maybeSingle();
  if (!ds || ds.status !== 'published') return jsonError(404, 'No published dataset with that slug.');

  const hourAgo = new Date(Date.now() - 3_600_000).toISOString();
  const { count } = await db.from('ingestion_runs')
    .select('id', { count: 'exact', head: true })
    .eq('triggered_by', `user:${user.id}`).gte('started_at', hourAgo);
  if ((count ?? 0) >= LIMIT_PER_HOUR) {
    return jsonError(429, 'Re-check limit reached — five per hour. Try again later.');
  }

  const result = await ingestOne(db, ds.platform, ds.source_identifier, `user:${user.id}`);
  await rebuildFacets(db);
  return Response.json(result);
}
