import { z } from 'zod';
import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { readJson, jsonError } from '@/lib/server/auth';

/**
 * The public correction channel. No account required — being correctable in
 * public is the product's legitimacy. Abuse control: an IP rate limit and a
 * honeypot field that humans never see.
 */
const Schema = z.object({
  datasetSlug: z.string().min(3).max(200),
  field: z.string().max(120).optional(),
  message: z.string().min(5).max(4000),
  email: z.string().email().max(200).optional(),
  website: z.string().optional(), // honeypot — any content silently discards
});

const LIMIT_PER_HOUR = 3;

export async function POST(req: NextRequest) {
  const parsed = Schema.safeParse(await readJson(req));
  if (!parsed.success) return jsonError(400, 'A correction needs a dataset slug and a message.');

  // Honeypot: pretend success, store nothing.
  if (parsed.data.website && parsed.data.website.trim() !== '') {
    return Response.json({ ok: true });
  }

  const ip = (req.headers.get('x-forwarded-for') ?? 'unknown').split(',')[0].trim();
  const db = supabaseAdmin();

  const hourAgo = new Date(Date.now() - 3_600_000).toISOString();
  const { count } = await db.from('dataset_corrections')
    .select('id', { count: 'exact', head: true })
    .eq('submitter_email', `ip:${ip}`).gte('created_at', hourAgo);
  // The rate-limit key rides in submitter_email when no email was given —
  // documented here so the admin view doesn't surprise anyone.
  const { count: emailCount } = parsed.data.email
    ? await db.from('dataset_corrections')
        .select('id', { count: 'exact', head: true })
        .eq('submitter_email', parsed.data.email).gte('created_at', hourAgo)
    : { count: 0 };
  if ((count ?? 0) >= LIMIT_PER_HOUR || (emailCount ?? 0) >= LIMIT_PER_HOUR) {
    return jsonError(429, 'Correction limit reached — three per hour. Try again later.');
  }

  const { data: ds } = await db.from('datasets').select('id').eq('slug', parsed.data.datasetSlug).maybeSingle();

  const { error } = await db.from('dataset_corrections').insert({
    dataset_id: ds?.id ?? null,
    dataset_slug: parsed.data.datasetSlug,
    submitter_email: parsed.data.email ?? `ip:${ip}`,
    field: parsed.data.field ?? null,
    message: parsed.data.message,
  });
  if (error) return jsonError(500, 'The correction could not be saved. Try again shortly.');
  return Response.json({ ok: true });
}
