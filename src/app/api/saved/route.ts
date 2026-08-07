import { z } from 'zod';
import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { currentUser, readJson, jsonError } from '@/lib/server/auth';
import { SAVED_DATASET_LIMIT } from '@/lib/config';

const Body = z.object({
  slug: z.string().min(1).max(200),
});

async function resolvePublished(slug: string): Promise<{ id: string } | { error: string }> {
  const db = supabaseAdmin();
  const { data, error } = await db
    .from('datasets')
    .select('id')
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle();
  if (error) return { error: 'Could not look up this dataset.' };
  if (!data) return { error: 'This dataset is not available to save.' };
  return { id: data.id as string };
}

/** GET /api/saved?slug=… — whether the signed-in user has saved this dataset. */
export async function GET(req: NextRequest) {
  const user = await currentUser();
  if (!user) return jsonError(401, 'Sign in required.');

  const slug = req.nextUrl.searchParams.get('slug')?.trim() ?? '';
  if (!slug) return jsonError(400, 'Missing slug.');

  const resolved = await resolvePublished(slug);
  if ('error' in resolved) return jsonError(404, resolved.error);

  const db = supabaseAdmin();
  const { data, error } = await db
    .from('saved_datasets')
    .select('dataset_id')
    .eq('user_id', user.id)
    .eq('dataset_id', resolved.id)
    .maybeSingle();
  if (error) return jsonError(500, 'Could not check whether this dataset is saved.');
  return Response.json({ saved: Boolean(data), datasetId: resolved.id });
}

/** POST /api/saved { slug } — save a published dataset for the signed-in user. */
export async function POST(req: NextRequest) {
  const user = await currentUser();
  if (!user) return jsonError(401, 'Sign in required.');

  const parsed = Body.safeParse(await readJson(req));
  if (!parsed.success) return jsonError(400, 'Expected { slug }.');

  const resolved = await resolvePublished(parsed.data.slug);
  if ('error' in resolved) return jsonError(404, resolved.error);

  const db = supabaseAdmin();
  const { count, error: countError } = await db
    .from('saved_datasets')
    .select('dataset_id', { count: 'exact', head: true })
    .eq('user_id', user.id);
  if (countError) return jsonError(500, 'Could not check your saved list.');
  if ((count ?? 0) >= SAVED_DATASET_LIMIT) {
    return jsonError(409, `You have ${SAVED_DATASET_LIMIT} saved datasets — remove one to save this.`);
  }

  const { error } = await db.from('saved_datasets').insert({
    user_id: user.id,
    dataset_id: resolved.id,
  });
  if (error) {
    if (error.code === '23505') return Response.json({ ok: true, saved: true }); // already saved
    return jsonError(500, 'Could not save this dataset.');
  }
  return Response.json({ ok: true, saved: true });
}

/** DELETE /api/saved { slug } — remove from the signed-in user's saved list. */
export async function DELETE(req: NextRequest) {
  const user = await currentUser();
  if (!user) return jsonError(401, 'Sign in required.');

  const parsed = Body.safeParse(await readJson(req));
  if (!parsed.success) return jsonError(400, 'Expected { slug }.');

  const resolved = await resolvePublished(parsed.data.slug);
  if ('error' in resolved) return jsonError(404, resolved.error);

  const db = supabaseAdmin();
  const { error } = await db
    .from('saved_datasets')
    .delete()
    .eq('user_id', user.id)
    .eq('dataset_id', resolved.id);
  if (error) return jsonError(500, 'Could not remove this dataset from your saved list.');
  return Response.json({ ok: true, saved: false });
}
