'use client';

import { createBrowserClient } from '@supabase/ssr';
import { publicConfig } from '../config';

/** Browser client. Anon key only; every read passes through Row Level Security. */
export function supabaseBrowser() {
  return createBrowserClient(publicConfig.supabaseUrl, publicConfig.supabaseAnonKey);
}
