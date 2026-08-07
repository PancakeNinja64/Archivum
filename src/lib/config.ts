/**
 * Environment access. Server secrets are validated lazily at first use so the
 * app can still build and run in mock mode with no environment configured.
 */

function missingPublic(name: 'NEXT_PUBLIC_SUPABASE_URL' | 'NEXT_PUBLIC_SUPABASE_ANON_KEY'): never {
  throw new Error(
    `Missing required environment variable ${name}. ` +
      `Copy .env.example to .env.local, fill it in, and restart npm run dev.`,
  );
}

/** Public — safe in the browser. Use direct process.env access so Next.js inlines values. */
export const publicConfig = {
  get supabaseUrl() {
    const v = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!v) missingPublic('NEXT_PUBLIC_SUPABASE_URL');
    return v;
  },
  get supabaseAnonKey() {
    const v = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!v) missingPublic('NEXT_PUBLIC_SUPABASE_ANON_KEY');
    return v;
  },
  get dataSource(): 'mock' | 'supabase' {
    return process.env.NEXT_PUBLIC_DATA_SOURCE === 'supabase' ? 'supabase' : 'mock';
  },
  get appUrl() {
    return process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
  },
};

function required(name: string): string {
  const v = process.env[name];
  if (!v) {
    throw new Error(
      `Missing required environment variable ${name}. ` +
        `Copy .env.example to .env.local and fill it in.`,
    );
  }
  return v;
}

/** Server-only. Importing this from a 'use client' file is a build error by design. */
export const serverConfig = {
  get serviceRoleKey() { return required('SUPABASE_SERVICE_ROLE_KEY'); },
  get hfToken() { return process.env.HF_TOKEN ?? null; },
  get githubToken() { return process.env.GITHUB_TOKEN ?? null; },
  get adminEmails(): string[] {
    return (process.env.ADMIN_EMAILS ?? '')
      .split(',').map((e) => e.trim().toLowerCase()).filter(Boolean);
  },
  get cronSecret() { return required('CRON_SECRET'); },
};

export const SAVED_DATASET_LIMIT = 50;
