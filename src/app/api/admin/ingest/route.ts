import { z } from 'zod';
import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { requireAdmin, readJson, jsonError } from '@/lib/server/auth';
import { ingestOne, rebuildFacets } from '@/lib/ingest/ingestOne';
import { mapLimit } from '@/lib/sources/fetcher';
import { CURATED_DATASETS, SEED_BATCH_SIZE } from '@/lib/seed/curated-datasets';

export const maxDuration = 300; // seed batches make many source calls

const SingleSchema = z.object({
  platform: z.enum(['huggingface', 'github']),
  identifier: z.string().min(2).max(300),
});
const SeedSchema = z.object({
  seed: z.literal(true),
  offset: z.number().int().min(0).default(0),
  limit: z.number().int().min(1).max(10).default(SEED_BATCH_SIZE),
});

export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin.ok) return jsonError(admin.status, admin.status === 401 ? 'Sign in required.' : 'Not an admin account.');

  const body = await readJson(req);
  if (body === null) return jsonError(400, 'Invalid or oversized request body.');
  const db = supabaseAdmin();

  const seed = SeedSchema.safeParse(body);
  if (seed.success) {
    const { offset, limit } = seed.data;
    const batch = CURATED_DATASETS.slice(offset, offset + limit);
    if (!batch.length) return Response.json({ done: true, total: CURATED_DATASETS.length, results: [] });
    const results = await mapLimit(batch, 3, (entry) =>
      ingestOne(db, entry.platform, entry.id, `admin:${admin.email}:seed`),
    );
    await rebuildFacets(db);
    return Response.json({
      done: offset + limit >= CURATED_DATASETS.length,
      nextOffset: offset + limit,
      total: CURATED_DATASETS.length,
      results: batch.map((entry, i) => ({ identifier: entry.id, ...results[i] })),
    });
  }

  const single = SingleSchema.safeParse(body);
  if (single.success) {
    const result = await ingestOne(db, single.data.platform, single.data.identifier, `admin:${admin.email}`);
    await rebuildFacets(db);
    return Response.json(result, { status: result.status === 'failed' ? 422 : 200 });
  }

  return jsonError(400, 'Expected {platform, identifier} or {seed: true, offset, limit}.');
}
