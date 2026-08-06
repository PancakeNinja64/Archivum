import { z } from 'zod';
import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { requireAdmin, readJson, jsonError } from '@/lib/server/auth';

const Schema = z.object({
  correctionId: z.string().uuid(),
  status: z.enum(['resolved', 'rejected', 'reviewing']),
});

export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin.ok) return jsonError(admin.status, admin.status === 401 ? 'Sign in required.' : 'Not an admin account.');

  const parsed = Schema.safeParse(await readJson(req));
  if (!parsed.success) return jsonError(400, 'Expected {correctionId, status}.');

  const db = supabaseAdmin();
  const { error } = await db.from('dataset_corrections').update({
    status: parsed.data.status,
    resolved_at: parsed.data.status === 'reviewing' ? null : new Date().toISOString(),
  }).eq('id', parsed.data.correctionId);
  if (error) return jsonError(500, 'Update failed.');
  return Response.json({ ok: true });
}
