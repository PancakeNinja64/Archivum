import { z } from 'zod';
import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { requireAdmin, readJson, jsonError } from '@/lib/server/auth';
import { rebuildFacets } from '@/lib/ingest/ingestOne';

const Schema = z.object({
  datasetId: z.string().uuid(),
  status: z.enum(['published', 'hidden', 'draft']),
});

export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin.ok) return jsonError(admin.status, admin.status === 401 ? 'Sign in required.' : 'Not an admin account.');

  const parsed = Schema.safeParse(await readJson(req));
  if (!parsed.success) return jsonError(400, 'Expected {datasetId, status}.');

  const db = supabaseAdmin();
  const { error } = await db.from('datasets')
    .update({ status: parsed.data.status }).eq('id', parsed.data.datasetId);
  if (error) return jsonError(500, 'Status update failed.');
  await rebuildFacets(db);
  return Response.json({ ok: true });
}
