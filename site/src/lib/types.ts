/**
 * Archivum — core domain types.
 * These are the contract between the data layer and every component.
 * When a real API replaces the mock adapter, these shapes stay fixed.
 */

/** How a claim was established. The credibility mechanic of the whole product. */
export type TrustTier = 'verified' | 'inferred' | 'asserted';

export type Platform = 'huggingface' | 'kaggle' | 'github' | 'academic' | 'direct';

export type Modality = 'text' | 'image' | 'audio' | 'tabular' | 'multimodal';

export type LineageStage =
  | 'source'
  | 'scrape'
  | 'clean'
  | 'annotate'
  | 'embed'
  | 'current';

export type TrustFactorKey =
  | 'sourceTransparency'
  | 'communityVerification'
  | 'updateFrequency'
  | 'documentationQuality';

/** Weights sum to 100. Displayed on /docs#methodology and in the Trust Scoring section. */
export const TRUST_WEIGHTS: Record<TrustFactorKey, number> = {
  sourceTransparency: 35,
  communityVerification: 25,
  updateFrequency: 20,
  documentationQuality: 20,
};

export interface TrustFactor {
  key: TrustFactorKey;
  label: string;
  weight: number;
  score: number; // 0-100
  tier: TrustTier;
  summary: string;
}

export interface DatasetLicense {
  spdx: string; // 'MIT' | 'CC-BY-4.0' | 'Unspecified' | ...
  commercialUse: boolean;
  attribution: boolean;
  shareAlike: boolean;
  tier: TrustTier;
  /** Unresolved terms inherited from upstream sources. Empty when clean. */
  conflicts: string[];
}

export interface LineageNode {
  id: string;
  stage: LineageStage;
  label: string;
  description: string;
  actor: string;
  hash: string; // 'sha256:abcd…wxyz'
  timestamp: string; // ISO
  tier: TrustTier;
  url: string | null;
}

export interface LineageEdge {
  from: string;
  to: string;
  tier: TrustTier;
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
  /** Score at the time of this version — lets the UI show trust drift. */
  trustScore: number;
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

  trustScore: number; // 0-100, weighted from trustBreakdown
  trustTier: TrustTier;
  trustBreakdown: Record<TrustFactorKey, number>;
  trustFactors: TrustFactor[];
  methodologyVersion: string;

  primarySourceCount: number;
  humanVerificationPct: number;
  duplicatesRemovedPct: number;

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
  | 'trustScore' | 'trustTier' | 'lastUpdated' | 'version'
>;

export interface DatasetFilters {
  query?: string;
  platform?: Platform[];
  domain?: string[];
  modality?: Modality[];
  languages?: string[];
  license?: string[];
  commercialOnly?: boolean;
  minTrustScore?: number;
  tier?: TrustTier[];
  updatedWithinDays?: number;
  sort?: 'trust' | 'recent' | 'size' | 'name';
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

/* ---------- Dashboard (mocked, no auth) ---------- */

export type AlertSeverity = 'info' | 'warning' | 'critical';

export interface ActivityEvent {
  id: string;
  type: 'license-change' | 'score-drop' | 'new-version' | 'deprecated' | 'lineage-updated';
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
  trustScore: number;
  scoreDelta: number;
  licenseStatus: 'ok' | 'changed' | 'unresolved';
  lastVerified: string;
  /** 12 points, oldest first — for the sparkline. */
  scoreHistory: number[];
}
