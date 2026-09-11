import type { Dataset, DatasetSummary, DatasetLicense, Platform, Modality, CoverageBand, LineageGraph } from '../../types';
import { bandFor } from '../../utils';
import { computeCoverage } from '../../coverage/rules';
import { attributionRequired, isRecognisedSpdx, shareAlikeRequired } from '../../sources/spdx';

/* ---------- row -> domain mapping ---------- */

export type Row = Record<string, unknown>;
const s = (v: unknown, fallback = ''): string => (typeof v === 'string' ? v : fallback);
const n = (v: unknown, fallback = 0): number => (typeof v === 'number' && Number.isFinite(v) ? v : fallback);
export const optionalNumber = (v: unknown): number | null => typeof v === 'number' && Number.isFinite(v) && v >= 0 ? v : null;
export const optionalDate = (v: unknown): string | null => typeof v === 'string' && v.trim() !== '' && Number.isFinite(Date.parse(v)) ? v : null;

export function rowLicense(r: Row): DatasetLicense {
  const spdx = s(r.license_spdx) || 'Not stated';
  return {
    spdx,
    commercialUse: (s(r.commercial_use) || 'not_stated') as DatasetLicense['commercialUse'],
    attribution: isRecognisedSpdx(spdx) ? attributionRequired(spdx) : null,
    shareAlike: isRecognisedSpdx(spdx) ? shareAlikeRequired(spdx) : null,
    label: (s(r.license_status) || 'not_found') as DatasetLicense['label'],
    notes: [],
  };
}

export function rowSummary(r: Row): DatasetSummary {
  const total = n(r.coverage_total);
  return {
    slug: s(r.slug),
    name: s(r.name),
    publisher: s(r.publisher),
    description: s(r.description),
    platform: s(r.platform, 'direct') as Platform,
    domain: (r.domain as string[]) ?? [],
    languages: (r.languages as string[]) ?? [],
    modality: (s(r.modality, 'text')) as Modality,
    sizeRows: optionalNumber(r.size_rows),
    sizeBytes: optionalNumber(r.size_bytes),
    license: rowLicense(r),
    coverageTotal: total,
    coverageBand: bandFor(total) as CoverageBand,
    coverageCheckedAt: optionalDate(r.coverage_checked_at),
    lastUpdated: optionalDate(r.last_source_update),
    version: s(r.source_revision, '').slice(0, 7) || 'current',
  };
}

export function rowDataset(r: Row, versions: Row[]): Dataset {
  const summary = rowSummary(r);
  // Sections are recomputed from the stored 28-check detail through the same
  // pure function the importer used — one source of arithmetic, everywhere.
  const detail = ((r.coverage_detail as Dataset['coverageDetail']) ?? {});
  const sections = Object.keys(detail).length ? computeCoverage(detail).sections : [];
  return {
    ...summary,
    publisherSlug: s(r.publisher_slug),
    platformUrl: s(r.source_url),
    coverageSections: sections,
    coverageDetail: detail,
    coverageVersion: s(r.coverage_version, '1.0'),
    firstPublished: optionalDate(r.first_published),
    contentHash: s(r.metadata_hash, ''),
    lineage: ((r.lineage as LineageGraph) ?? { nodes: [], edges: [], completeness: 0, undocumentedStages: [] }),
    versions: versions.map((v) => ({
      version: s(v.version_label),
      date: optionalDate(v.observed_at),
      rowsAdded: optionalNumber(v.rows_added),
      rowsRemoved: optionalNumber(v.rows_removed),
      note: s(v.note),
      author: s(v.author, summary.publisher),
      coverageTotal: optionalNumber(v.coverage_total),
    })),
    schema: ((r.schema_fields as Dataset['schema']) ?? []),
    sampleRecords: ((r.sample_records as Dataset['sampleRecords']) ?? []),
    relatedSlugs: [],
  };
}

