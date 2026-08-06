import 'server-only';
import { supabaseServer } from '../supabase/server';
import { serverConfig } from '../config';

export async function currentUser() {
  try {
    const sb = await supabaseServer();
    const { data } = await sb.auth.getUser();
    return data?.user ?? null;
  } catch {
    return null;
  }
}

/** Admin = signed-in session whose email is on the ADMIN_EMAILS allowlist. */
export async function requireAdmin(): Promise<{ ok: true; email: string } | { ok: false; status: number }> {
  const user = await currentUser();
  if (!user?.email) return { ok: false, status: 401 };
  const email = user.email.toLowerCase();
  if (!serverConfig.adminEmails.includes(email)) return { ok: false, status: 403 };
  return { ok: true, email };
}

const MAX_BODY = 32 * 1024;

/** Parse JSON with a hard size cap. Returns null on anything suspicious. */
export async function readJson(req: Request): Promise<unknown | null> {
  try {
    const text = await req.text();
    if (text.length > MAX_BODY) return null;
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export function jsonError(status: number, message: string): Response {
  // Plain message only. Stack traces and internal details never leave the server.
  return Response.json({ error: message }, { status });
}
