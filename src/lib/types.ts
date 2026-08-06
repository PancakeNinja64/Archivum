/**
 * Archivum — core domain types.
 * These are the contract between the data layer and every component.
 *
 * Vocabulary note (deliberate, load-bearing):
 * Archivum REPORTS what a dataset documents about itself. It does not grade
 * datasets. The figure shown everywhere is Documentation Coverage — the
 * percentage of provenance fields present at the source when we checked.
 */

import type { CoverageDetail, CoverageSectionResult } from './coverage/rules';

export type { CoverageDetail, CoverageSectionResult };

/**
 * How a piece of information was established.
 *  - documented: Archivum retrieved a structured artifact from the platform API.
 *  - reported:   the publisher stated it in prose; retrieved, not independently confirmed.
 *  - not_found:  absent from the published metadata when Archivum checked.
 */
export type EvidenceLabel = 'documented' | 'reported' | 'not_found';

/** Dataset-level band, derived from coverageTotal. Descriptive, never evaluative. */
export type CoverageBand = 'extensive' | 'partial' | 'minimal';

export type Platform = 'huggingface' | 'kaggle' | 'github' | 'academic' | 'direct';

export type Modality = 'text' | 'image' | 'audio' | 'tabular' | 'multimodal';

export type LineageStage =
  | 'source'
  | 'scrape'
  | 'clean'
  | 'annotate'
  | 'embed'
  | 'current';

export type CommercialUse = 'permitted' | 'restricted' | 'prohibited' | 'not_stated';

export interface DatasetLicense {
  /** 'MIT' | 'CC-BY-4.0' | 'Not stated' | ... exactly as published by the source. */
  spdx: string;
  /** Derived from a static SPDX lookup — never inferred from prose. */
  commercialUse: CommercialUse;
  attribution: boolean;
  shareAlike: boolean;
  /** Was the licence retrieved as an artifact, stated in prose, or absent? */
  label: EvidenceLabel;
  /** Unresolved terms inherited from upstream sources. Empty when clean. */
  notes: string[];
}

export interface LineageNode {
  id: string;
  stage: LineageStage;
  label: string;
  description: string;
  actor: string;
  hash: string; // 'sha256:abcd…wxyz'
  timestamp: string; // ISO
  evidence: EvidenceLabel;
  url: string | null;
}

export interface LineageEdge {
  from: string;
  to: string;
  evidence: EvidenceLabel;
}

export interface LineageGraph {
  nodes: LineageNode[];
  edges: LineageEdge[];
  /** 0-100. Below 100 means stages are undocumented — render the gap, do not hide it. */
  completeness: number;
  undocumentedStages: LineageStage[];
}

export interface DatasetVersion {
  version: string;
  date: string; // ISO date
  rowsAdded: number;
  rowsRemoved: number;
  note: string;
  author: string;
  /** Coverage at the time of this version — lets the UI show documentation drift. */
  coverageTotal: number;
}

export interface SchemaField {
  name: string;
  type: string;
  nullable: boolean;
  description: string;
}

export interface Dataset {
  slug: string;
  name: string;
  publisher: string;
  publisherSlug: string;
  description: string;

  platform: Platform;
  platformUrl: string;
  domain: string[];
  languages: string[];
  modality: Modality;

  sizeRows: number;
  sizeBytes: number;

  license: DatasetLicense;

  /** Documentation Coverage, 0-100. The weighted mean of the four sections. */
  coverageTotal: number;
  coverageBand: CoverageBand;
  coverageSections: CoverageSectionResult[];
  /** All 28 individual check outcomes. */
  coverageDetail: CoverageDetail;
  coverageVersion: string;
  /** ISO timestamp of the check the figures describe. Shown wherever coverage is shown. */
  coverageCheckedAt: string;

  firstPublished: string; // ISO
  lastUpdated: string; // ISO
  contentHash: string;
  version: string;

  lineage: LineageGraph;
  versions: DatasetVersion[];
  schema: SchemaField[];
  sampleRecords: Record<string, unknown>[];
  relatedSlugs: string[];
}

/** Summary shape used by cards and tables. A Dataset satisfies this structurally. */
export type DatasetSummary = Pick<
  Dataset,
  | 'slug' | 'name' | 'publisher' | 'description' | 'platform' | 'domain'
  | 'languages' | 'modality' | 'sizeRows' | 'sizeBytes' | 'license'
  | 'coverageTotal' | 'coverageBand' | 'coverageCheckedAt' | 'lastUpdated' | 'version'
>;

export interface DatasetFilters {
  query?: string;
  platform?: Platform[];
  domain?: string[];
  modality?: Modality[];
  languages?: string[];
  license?: string[];
  commercialOnly?: boolean;
  minCoverage?: number;
  updatedWithinDays?: number;
  sort?: 'coverage' | 'recent' | 'size' | 'name';
  page?: number;
  pageSize?: number;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface Facets {
  platforms: { value: Platform; count: number }[];
  domains: { value: string; count: number }[];
  modalities: { value: Modality; count: number }[];
  languages: { value: string; count: number }[];
  licenses: { value: string; count: number }[];
}

/* ---------- Dashboard ---------- */

export type AlertSeverity = 'info' | 'warning' | 'critical';

export interface ActivityEvent {
  id: string;
  type: 'license-change' | 'coverage-drop' | 'coverage-gain' | 'new-version' | 'deprecated' | 'lineage-updated';
  severity: AlertSeverity;
  datasetSlug: string;
  datasetName: string;
  message: string;
  timestamp: string;
}

export interface WatchedDataset {
  slug: string;
  name: string;
  publisher: string;
  coverageTotal: number;
  coverageDelta: number;
  licenseStatus: 'ok' | 'changed' | 'unresolved';
  lastChecked: string;
  /** 12 points, oldest first — for the sparkline. */
  coverageHistory: number[];
}
