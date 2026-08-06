import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { publicConfig } from '../config';

/** Server component / route-handler client bound to the request cookies. */
export async function supabaseServer() {
  const cookieStore = await cookies();
  return createServerClient(publicConfig.supabaseUrl, publicConfig.supabaseAnonKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (all) => {
        try {
          all.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Called from a Server Component — middleware handles the refresh.
        }
      },
    },
  });
}
