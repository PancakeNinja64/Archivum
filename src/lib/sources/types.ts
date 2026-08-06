import type { CoverageDetail } from '../coverage/rules';
import type { CommercialUse, EvidenceLabel, LineageGraph, Modality, SchemaField } from '../types';

/** Everything the ingest pipeline needs, normalised away from platform shape. */
export interface NormalisedRecord {
  platform: 'huggingface' | 'github';
  /** owner/name exactly as the platform states it. */
  sourceId: string;
  owner: string;
  name: string;
  sourceUrl: string;
  description: string;
  publisher: string;
  publisherIsOrg: boolean | null; // null = could not determine
  licenseSpdx: string | null;     // exactly as published, null if absent
  licenseStatus: EvidenceLabel;
  commercialUse: CommercialUse;
  modality: Modality | null;
  languages: string[];
  sizeRows: number | null;
  sizeBytes: number | null;
  firstPublished: string | null;  // ISO
  lastSourceUpdate: string | null;
  sourceRevision: string | null;  // commit sha / revision
  schemaFields: SchemaField[];
  sampleRecords: Record<string, unknown>[];
  files: { path: string; bytes: number | null }[];
  fileCountTotal: number;
  archived: boolean;
  /** Display-only usage signals. NEVER hashed — they change daily. */
  downloads: number | null;
  likes: number | null;
  stars: number | null;
  /** Values that feed the stable metadata hash. Order matters; keep it fixed. */
  hashInputs: (string | number | null)[];
  /** Raw material for lineage derivation (card fields, fork parent, README). */
  lineageHints: {
    upstreamIds: string[];
    forkParent: string | null;
    readme: string | null;
    createdAt: string | null;
    lastModified: string | null;
  };
}

export interface IngestFetchResult {
  outcome: 'ok' | 'not_found' | 'gated' | 'error' | 'not_modified';
  detail?: string;
  record?: NormalisedRecord;
  coverage?: CoverageDetail;
  lineage?: LineageGraph;
  etag?: string | null;
}

export interface SourceAdapter {
  platform: 'huggingface' | 'github';
  /** 'owner/name' | full URL -> canonical 'owner/name', or null if unparseable. */
  parseIdentifier(input: string): string | null;
  /** Fetch + normalise + evaluate + derive lineage, in one pass. */
  ingest(id: string, opts: { etag?: string | null }): Promise<IngestFetchResult>;
}
