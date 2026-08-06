import { createHash } from 'crypto';

/**
 * The stable metadata hash. Two rules, both load-bearing:
 *  1. Only fields that mean "the dataset itself changed" go in. Download
 *     counts, stars, and likes NEVER do — they change daily and would mint
 *     a spurious version on every recheck.
 *  2. The field order is fixed forever. Reordering silently re-versions
 *     the entire catalog.
 */
export function metadataHash(inputs: (string | number | null)[]): string {
  const canonical = JSON.stringify(inputs.map((v) => (v === undefined ? null : v)));
  return createHash('sha256').update(canonical).digest('hex');
}

export function slugFor(platform: string, sourceId: string): string {
  const [owner, name] = sourceId.includes('/') ? sourceId.split('/') : [sourceId, sourceId];
  const clean = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  return `${platform}-${clean(owner)}-${clean(name)}`;
}
