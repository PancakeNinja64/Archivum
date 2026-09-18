import type { Platform } from '@/lib/types';
import { fmtDate, platformLabel } from '@/lib/utils';

/**
 * Typography policy for record metadata: names people read (publisher,
 * platform) are set in sans; identifiers (licence, version, dates) are set in
 * mono. Every surface that lists a record splits its metadata the same way.
 */
export interface RecordMetaInput {
  publisher?: string | null;
  platform?: Platform | string | null;
  license?: string | { spdx: string } | null;
  version?: string | null;
  lastUpdated?: string | null;
}

export interface RecordMeta {
  /** Sans: publisher, then platform. Never empty — unstated values are named. */
  names: string[];
  /** Mono: licence identifier, version, source-update date. */
  identifiers: string[];
}

export const PUBLISHER_UNSTATED = 'Publisher not stated';
export const PLATFORM_UNRECORDED = 'Platform not recorded';
export const LICENCE_UNSTATED = 'Licence not stated';

export function publisherName(publisher: string | null | undefined): string {
  const trimmed = (publisher ?? '').trim();
  return trimmed || PUBLISHER_UNSTATED;
}

export function platformName(platform: Platform | string | null | undefined): string {
  if (!platform) return PLATFORM_UNRECORDED;
  return platformLabel[platform] ?? platform;
}

export function licenceIdentifier(license: string | { spdx: string } | null | undefined): string {
  const spdx = typeof license === 'string' ? license : license?.spdx;
  const trimmed = (spdx ?? '').trim();
  return trimmed && trimmed !== 'Not stated' ? trimmed : LICENCE_UNSTATED;
}

export function splitRecordMeta(input: RecordMetaInput, options: { updated?: boolean } = {}): RecordMeta {
  const identifiers = [licenceIdentifier(input.license)];
  if (input.version) identifiers.push(input.version);
  if (options.updated) identifiers.push(input.lastUpdated ? `upd ${fmtDate(input.lastUpdated)}` : 'update date not stated');
  return { names: [publisherName(input.publisher), platformName(input.platform)], identifiers };
}
