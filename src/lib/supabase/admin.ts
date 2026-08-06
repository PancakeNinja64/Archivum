import 'server-only';
import { createClient } from '@supabase/supabase-js';
import { publicConfig, serverConfig } from '../config';

/**
 * Service-role client. BYPASSES Row Level Security.
 * Route handlers and server code only. Never import from a client component —
 * the 'server-only' package makes that a build failure rather than a leak.
 */
export function supabaseAdmin() {
  return createClient(publicConfig.supabaseUrl, serverConfig.serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
