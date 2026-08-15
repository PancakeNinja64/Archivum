import 'server-only';

/**
 * The only function in this codebase that talks to external hosts.
 * Allowlist enforced here, once, for every adapter.
 */
const ALLOWED_HOSTS = new Set([
  'huggingface.co',
  'datasets-server.huggingface.co',
  'api.github.com',
]);

const TIMEOUT_MS = 10_000;
const MAX_BYTES = 2 * 1024 * 1024;      // 2 MB per response
export const MAX_README_BYTES = 200 * 1024; // 200 KB of README is plenty

export interface FetchOutcome {
  status: number;          // HTTP status; 0 = network / timeout failure
  ok: boolean;
  notModified: boolean;    // 304 via ETag
  etag: string | null;
  json: unknown | null;
  text: string | null;
  /**
   * `x-ratelimit-remaining`, verbatim, or null when the host does not send it.
   *
   * Exposed because GitHub answers 403 for BOTH a private repository and an
   * exhausted rate limit, and the status code alone cannot tell them apart.
   * For ingest the difference is immaterial — skip either way. For the prober
   * it is decisive: treating a rate limit as a gate invents delistings that
   * never happened, in bursts, across whichever datasets happened to be in the
   * batch when the budget ran out.
   *
   * One field rather than the whole Headers object: this is the only header
   * any caller needs, and a narrow surface is easier to keep honest.
   */
  rateLimitRemaining: string | null;
}

async function once(url: string, headers: Record<string, string>): Promise<FetchOutcome> {
  const u = new URL(url);
  if (u.protocol !== 'https:') throw new Error(`Refusing non-https URL: ${url}`);
  if (!ALLOWED_HOSTS.has(u.hostname)) throw new Error(`Host not allowlisted: ${u.hostname}`);

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, { headers, signal: ctrl.signal, redirect: 'follow' });
    const rateLimitRemaining = res.headers.get('x-ratelimit-remaining');
    if (res.status === 304) {
      return {
        status: 304, ok: false, notModified: true,
        etag: res.headers.get('etag'), json: null, text: null, rateLimitRemaining,
      };
    }
    const raw = await res.arrayBuffer();
    const body = raw.byteLength > MAX_BYTES ? raw.slice(0, MAX_BYTES) : raw;
    const text = new TextDecoder().decode(body);
    let json: unknown = null;
    const ct = res.headers.get('content-type') ?? '';
    if (ct.includes('json')) { try { json = JSON.parse(text); } catch { /* leave null */ } }
    return {
      status: res.status, ok: res.ok, notModified: false,
      etag: res.headers.get('etag'), json, text, rateLimitRemaining,
    };
  } catch {
    return {
      status: 0, ok: false, notModified: false,
      etag: null, json: null, text: null, rateLimitRemaining: null,
    };
  } finally {
    clearTimeout(timer);
  }
}

/** Fetch with 429/5xx backoff: 2 s, 4 s, 8 s, then give up. */
export async function sourceFetch(
  url: string,
  opts: { token?: string | null; etag?: string | null; accept?: string } = {},
): Promise<FetchOutcome> {
  const headers: Record<string, string> = {
    'User-Agent': 'Archivum/1.0 (catalog; contact: business@archivum.tech)',
    Accept: opts.accept ?? 'application/json',
  };
  if (opts.token) headers.Authorization = `Bearer ${opts.token}`;
  if (opts.etag) headers['If-None-Match'] = opts.etag;

  let out = await once(url, headers);
  for (const wait of [2000, 4000, 8000]) {
    if (out.status !== 429 && (out.status < 500 || out.status === 0)) break;
    await new Promise((r) => setTimeout(r, wait));
    out = await once(url, headers);
  }
  return out;
}

/** Bounded concurrency for batch work. Never more than 3 requests in flight. */
export async function mapLimit<T, R>(items: T[], limit: number, fn: (t: T) => Promise<R>): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let i = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (i < items.length) {
      const idx = i++;
      results[idx] = await fn(items[idx]);
    }
  });
  await Promise.all(workers);
  return results;
}
