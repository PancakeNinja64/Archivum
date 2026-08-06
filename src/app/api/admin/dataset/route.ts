import { z } from 'zod';
import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { requireAdmin, readJson, jsonError } from '@/lib/server/auth';

/**
 * Curation PATCH. Descriptive fields only — coverage figures, licence status,
 * and evidence labels are NEVER editable by hand. If a record is wrong, fix
 * the source or re-run the importer; the numbers must always be recomputable.
 */
const Schema = z.object({
  datasetId: z.string().uuid(),
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional(),
  domain: z.array(z.string().min(1).max(40)).max(8).optional(),
  modality: z.enum(['text', 'image', 'audio', 'tabular', 'multimodal']).optional(),
  languages: z.array(z.string().min(1).max(16)).max(20).optional(),
});

export async function PATCH(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin.ok) return jsonError(admin.status, admin.status === 401 ? 'Sign in required.' : 'Not an admin account.');

  const parsed = Schema.safeParse(await readJson(req));
  if (!parsed.success) return jsonError(400, 'Only name, description, domain, modality, and languages are editable.');

  const { datasetId, ...fields } = parsed.data;
  if (!Object.keys(fields).length) return jsonError(400, 'Nothing to update.');

  const db = supabaseAdmin();
  const { error } = await db.from('datasets').update(fields).eq('id', datasetId);
  if (error) return jsonError(500, 'Update failed.');
  return Response.json({ ok: true });
}
