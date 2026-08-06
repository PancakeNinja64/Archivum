/**
 * Static SPDX → commercial-use lookup. A table, not an interpretation:
 * anything not in the table is 'not_stated'. Never inferred from prose.
 */
import type { CommercialUse } from '../types';

const PERMITTED = new Set([
  'mit', 'apache-2.0', 'bsd-2-clause', 'bsd-3-clause', 'isc', 'unlicense',
  'cc0-1.0', 'cc-by-2.0', 'cc-by-2.5', 'cc-by-3.0', 'cc-by-4.0',
  'cc-by-sa-3.0', 'cc-by-sa-4.0', 'odc-by', 'odbl', 'odbl-1.0', 'pddl',
  'cdla-permissive-1.0', 'cdla-permissive-2.0', 'cdla-sharing-1.0',
  'gpl-2.0', 'gpl-3.0', 'lgpl-3.0', 'agpl-3.0', 'mpl-2.0',
  'afl-3.0', 'artistic-2.0', 'bsl-1.0', 'etalab-2.0', 'eupl-1.1', 'eupl-1.2',
  'openrail', 'openrail++', 'creativeml-openrail-m', 'bigscience-openrail-m',
]);

const RESTRICTED = new Set([
  'cc-by-nc-2.0', 'cc-by-nc-3.0', 'cc-by-nc-4.0',
  'cc-by-nc-sa-2.0', 'cc-by-nc-sa-3.0', 'cc-by-nc-sa-4.0',
  'cc-by-nc-nd-3.0', 'cc-by-nc-nd-4.0', 'cc-by-nd-4.0',
]);

export function commercialUseFor(spdx: string | null | undefined): CommercialUse {
  if (!spdx) return 'not_stated';
  const k = spdx.trim().toLowerCase();
  if (k === 'other' || k === 'unknown' || k === 'not stated' || k === '') return 'not_stated';
  if (PERMITTED.has(k)) return 'permitted';
  if (RESTRICTED.has(k)) return 'restricted';
  return 'not_stated';
}

/** Is the declared licence a recognised SPDX-style identifier at all? */
export function isRecognisedSpdx(spdx: string | null | undefined): boolean {
  if (!spdx) return false;
  const k = spdx.trim().toLowerCase();
  return PERMITTED.has(k) || RESTRICTED.has(k);
}

export function attributionRequired(spdx: string | null | undefined): boolean {
  if (!spdx) return false;
  return /^cc-by|^apache|^bsd|^mit$|^odc-by|^cdla/i.test(spdx.trim());
}

export function shareAlikeRequired(spdx: string | null | undefined): boolean {
  if (!spdx) return false;
  return /-sa\b|-sa-|^gpl|^agpl|^odbl/i.test(spdx.trim().toLowerCase());
}
