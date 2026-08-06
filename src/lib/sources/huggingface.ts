import 'server-only';
import type { CoverageDetail, CheckResult } from '../coverage/rules';
import type { LineageGraph, LineageNode, Modality, SchemaField } from '../types';
import { serverConfig } from '../config';
import { sourceFetch, MAX_README_BYTES } from './fetcher';
import { readmeSignals } from './readme-signals';
import { commercialUseFor, isRecognisedSpdx } from './spdx';
import type { IngestFetchResult, NormalisedRecord, SourceAdapter } from './types';

const HF = 'https://huggingface.co';
const DS_SERVER = 'https://datasets-server.huggingface.co';

type J = Record<string, unknown>;
const j = (v: unknown): J => (v && typeof v === 'object' ? (v as J) : {});
const str = (v: unknown): string | null => (typeof v === 'string' && v ? v : null);
const num = (v: unknown): number | null => (typeof v === 'number' && Number.isFinite(v) ? v : null);

function modalityFrom(tags: string[]): Modality | null {
  const t = tags.join(' ');
  const hits: Modality[] = [];
  if (/modality:image|image-classification|object-detection|image-to-/.test(t)) hits.push('image');
  if (/modality:audio|automatic-speech|audio-classification|text-to-speech/.test(t)) hits.push('audio');
  if (/modality:tabular|tabular-/.test(t)) hits.push('tabular');
  if (/modality:text|text-classification|question-answering|summarization|translation|text-generation|fill-mask|token-classification/.test(t)) hits.push('text');
  if (hits.length > 1) return 'multimodal';
  return hits[0] ?? null;
}

/** From YAML-ish card data already parsed by the HF API (cardData). */
function listOf(v: unknown): string[] {
  if (Array.isArray(v)) return v.filter((x): x is string => typeof x === 'string');
  if (typeof v === 'string') return [v];
  return [];
}

export const huggingface: SourceAdapter = {
  platform: 'huggingface',

  parseIdentifier(input: string): string | null {
    const cleaned = input.trim()
      .replace(/^https?:\/\/huggingface\.co\/datasets\//, '')
      .replace(/\/+$/, '');
    if (/^[\w.-]+\/[\w.-]+$/.test(cleaned)) return cleaned;
    if (/^[\w.-]+$/.test(cleaned)) return cleaned; // canonical datasets like 'squad' redirect to owner form
    return null;
  },

  async ingest(id, { etag }): Promise<IngestFetchResult> {
    const token = serverConfig.hfToken;

    // 1. The dataset record itself. ?full=true includes siblings (the file list).
    const main = await sourceFetch(`${HF}/api/datasets/${id}?full=true`, { token, etag });
    if (main.notModified) return { outcome: 'not_modified', etag: main.etag };
    if (main.status === 404) return { outcome: 'not_found', detail: `Hugging Face returned 404 for ${id} — renamed, removed, or never existed.` };
    if (main.status === 401 || main.status === 403) return { outcome: 'gated', detail: `Hugging Face returned ${main.status} for ${id} — gated or requires accepting terms.` };
    if (!main.ok || !main.json) return { outcome: 'error', detail: `Hugging Face API failed for ${id} (status ${main.status}).` };

    const m = j(main.json);
    const card = j(m.cardData);
    const tags = listOf(m.tags);
    const siblings = Array.isArray(m.siblings) ? (m.siblings as J[]) : [];
    const canonicalId = str(m.id) ?? id;
    const [owner = canonicalId, shortName = canonicalId] = canonicalId.includes('/')
      ? canonicalId.split('/') : [canonicalId, canonicalId];

    // 2. Parallel secondary fetches. Every one is allowed to fail without aborting.
    const [readmeRes, refsRes, commitsRes, orgRes, splitsRes, sizeRes, rowsRes] = await Promise.all([
      sourceFetch(`${HF}/datasets/${canonicalId}/raw/main/README.md`, { token, accept: 'text/plain' }),
      sourceFetch(`${HF}/api/datasets/${canonicalId}/refs`, { token }),
      sourceFetch(`${HF}/api/datasets/${canonicalId}/commits/main`, { token }),
      sourceFetch(`${HF}/api/organizations/${owner}/overview`, { token }),
      sourceFetch(`${DS_SERVER}/splits?dataset=${encodeURIComponent(canonicalId)}`, { token }),
      sourceFetch(`${DS_SERVER}/size?dataset=${encodeURIComponent(canonicalId)}`, { token }),
      sourceFetch(`${DS_SERVER}/first-rows?dataset=${encodeURIComponent(canonicalId)}&config=default&split=train`, { token }),
    ]);

    const readme = readmeRes.ok && readmeRes.text ? readmeRes.text.slice(0, MAX_README_BYTES) : null;
    const prose = readmeSignals(readme);

    // Organisation vs individual: the org endpoint 404s for user accounts.
    const publisherIsOrg = orgRes.status === 404 ? false : orgRes.ok ? true : null;

    // Splits / size / first rows from the datasets server (may be unavailable for any dataset).
    const splitsJson = j(splitsRes.json);
    const splits = Array.isArray(splitsJson.splits) ? (splitsJson.splits as J[]) : [];
    const sizeJson = j(j(sizeRes.json).size);
    const sizeDataset = j(sizeJson.dataset);
    const sizeRows = num(sizeDataset.num_rows);
    const sizeBytes = num(sizeDataset.num_bytes_original_files) ?? num(sizeDataset.num_bytes_parquet_files);

    const firstRows = j(rowsRes.json);
    const features = Array.isArray(firstRows.features) ? (firstRows.features as J[]) : [];
    const rows = Array.isArray(firstRows.rows) ? (firstRows.rows as J[]) : [];

    const schemaFields: SchemaField[] = features.slice(0, 40).map((f) => {
      const ftype = j(f.type);
      return {
        name: str(f.name) ?? 'field',
        type: str(ftype.dtype) ?? str(ftype._type) ?? 'unknown',
        nullable: true,
        description: '',
      };
    });

    const sampleRecords = rows.slice(0, 5).map((r) => {
      const row = j(r.row);
      const out: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(row)) {
        out[k] = typeof v === 'string' && v.length > 500 ? `${v.slice(0, 500)}…` : v;
      }
      return out;
    });

    // File manifest from siblings; sizes usually need the tree endpoint, so treat as unknown here.
    const files = siblings.slice(0, 200).map((s) => ({ path: str(s.rfilename) ?? '', bytes: num(s.size) }))
      .filter((f) => f.path);
    const hasLicenseFile = siblings.some((s) => /^licen[cs]e/i.test(str(s.rfilename) ?? ''));

    const licenseRaw = listOf(card.license)[0] ?? str(card.license) ?? tags.find((t) => t.startsWith('license:'))?.slice(8) ?? null;
    const licenseSpdx = licenseRaw ? licenseRaw.trim() : null;

    const commits = Array.isArray(commitsRes.json) ? (commitsRes.json as J[]) : [];
    const lastCommit = commits[0] ? j(commits[0]) : null;
    const sourceRevision = str(m.sha) ?? (lastCommit ? str(lastCommit.id) : null);

    const languages = listOf(card.language).map((l) => l.toLowerCase());
    const upstreamIds = listOf(card.source_datasets);

    const record: NormalisedRecord = {
      platform: 'huggingface',
      sourceId: canonicalId,
      owner,
      name: str(card.pretty_name) ?? shortName,
      sourceUrl: `${HF}/datasets/${canonicalId}`,
      description: str(m.description) ?? str(card.description) ?? firstProseParagraph(readme) ?? '',
      publisher: owner,
      publisherIsOrg,
      licenseSpdx,
      licenseStatus: licenseSpdx ? 'documented' : prose.licenseMention ? 'reported' : 'not_found',
      commercialUse: commercialUseFor(licenseSpdx),
      modality: modalityFrom(tags),
      languages,
      sizeRows,
      sizeBytes,
      firstPublished: str(m.createdAt),
      lastSourceUpdate: str(m.lastModified),
      sourceRevision,
      schemaFields,
      sampleRecords,
      files,
      fileCountTotal: siblings.length,
      archived: Boolean(m.disabled),
      downloads: num(m.downloads),
      likes: num(m.likes),
      stars: null,
      hashInputs: [
        str(card.pretty_name) ?? shortName,
        str(m.description) ?? '',
        licenseSpdx,
        sourceRevision,
        siblings.length,
        sizeBytes,
        str(m.lastModified),
      ],
      lineageHints: {
        upstreamIds,
        forkParent: null,
        readme,
        createdAt: str(m.createdAt),
        lastModified: str(m.lastModified),
      },
    };

    // ---- The 28 checks, Hugging Face mapping (spec §7) ----
    const D: CheckResult = 'documented', R: CheckResult = 'reported', N: CheckResult = 'not_found';
    const coverage: CoverageDetail = {
      // origin
      publisher_identified: owner ? D : N,
      publisher_is_organisation: publisherIsOrg === true ? D : publisherIsOrg === false ? N : N,
      upstream_sources_declared: upstreamIds.length ? D : prose.upstreamSources ? R : N,
      collection_method_described: prose.collectionMethod ? R : N,
      collection_timeframe_stated: prose.collectionTimeframe ? R : N,
      annotation_process_described: prose.annotationProcess ? R : N,
      maintainer_contact_listed: prose.maintainerContact ? R : N,
      // licensing
      license_declared: licenseSpdx ? D : N,
      license_file_present: hasLicenseFile ? D : N,
      license_spdx_recognised: isRecognisedSpdx(licenseSpdx) ? D : N,
      commercial_terms_stated: commercialUseFor(licenseSpdx) !== 'not_stated' ? D : prose.commercialTerms ? R : N,
      attribution_terms_stated: isRecognisedSpdx(licenseSpdx) ? D : prose.attributionTerms ? R : N,
      redistribution_terms_stated: isRecognisedSpdx(licenseSpdx) ? D : prose.redistributionTerms ? R : N,
      upstream_license_noted: prose.upstreamLicense ? R : N,
      // composition
      description_present: record.description ? D : N,
      schema_documented: schemaFields.length ? D : N,
      splits_documented: splits.length ? D : N,
      row_count_available: sizeRows !== null ? D : N,
      file_manifest_available: files.length ? D : N,
      file_sizes_available: files.some((f) => f.bytes !== null) ? D : N,
      sample_records_available: sampleRecords.length ? D : N,
      // maintenance
      last_modified_known: record.lastSourceUpdate ? D : N,
      version_history_available: commits.length ? D : N,
      release_notes_available: 'n/a', // Hugging Face datasets have no tagged-release mechanism
      citation_provided: str(card.citation) || prose.citation ? (str(card.citation) ? D : R) : N,
      usage_statistics_available: num(m.downloads) !== null || num(m.likes) !== null ? D : N,
      known_limitations_documented: prose.limitations ? R : N,
      intended_use_documented: prose.intendedUse ? R : N,
    };

    const lineage = deriveLineage(record, coverage);
    return { outcome: 'ok', record, coverage, lineage, etag: main.etag };
  },
};

function firstProseParagraph(readme: string | null): string | null {
  if (!readme) return null;
  const body = readme.replace(/^---[\s\S]*?---/, '').trim(); // strip YAML front-matter
  for (const para of body.split(/\n{2,}/)) {
    const p = para.replace(/^#+.*$/gm, '').replace(/[*_`>\[\]()!]/g, '').trim();
    if (p.length > 60) return p.slice(0, 280);
  }
  return null;
}

/**
 * Lineage: ONLY what the source documents. Nodes come from declared upstream
 * datasets and the record's own existence. Undocumented stages stay gaps.
 */
export function deriveLineage(record: NormalisedRecord, coverage: CoverageDetail): LineageGraph {
  const nodes: LineageNode[] = [];
  const now = record.lineageHints.lastModified ?? new Date().toISOString();

  record.lineageHints.upstreamIds.slice(0, 3).forEach((up, i) => {
    nodes.push({
      id: `source-${i}`,
      stage: 'source',
      label: up,
      description: 'Declared as a source dataset on the card.',
      actor: up.includes('/') ? up.split('/')[0] : record.publisher,
      hash: '',
      timestamp: record.lineageHints.createdAt ?? now,
      evidence: 'documented',
      url: up.includes('/') ? `https://huggingface.co/datasets/${up}` : null,
    });
  });
  if (!nodes.length && coverage.upstream_sources_declared === 'reported') {
    nodes.push({
      id: 'source-0',
      stage: 'source',
      label: 'Upstream sources (as described)',
      description: 'The README describes upstream sources in prose; no structured reference is published.',
      actor: record.publisher,
      hash: '',
      timestamp: record.lineageHints.createdAt ?? now,
      evidence: 'reported',
      url: null,
    });
  }

  if (coverage.collection_method_described === 'reported') {
    nodes.push({
      id: 'scrape-0', stage: 'scrape', label: 'Collection (as described)',
      description: 'The documentation describes how the data was gathered.',
      actor: record.publisher, hash: '', timestamp: record.lineageHints.createdAt ?? now,
      evidence: 'reported', url: null,
    });
  }
  if (coverage.annotation_process_described === 'reported') {
    nodes.push({
      id: 'annotate-0', stage: 'annotate', label: 'Annotation (as described)',
      description: 'The documentation describes a labelling or review process.',
      actor: record.publisher, hash: '', timestamp: record.lineageHints.createdAt ?? now,
      evidence: 'reported', url: null,
    });
  }

  nodes.push({
    id: 'current',
    stage: 'current',
    label: `Current version at ${record.platform === 'huggingface' ? 'Hugging Face' : 'GitHub'}`,
    description: 'The record as published at the source.',
    actor: record.publisher,
    hash: record.sourceRevision ? `rev:${record.sourceRevision.slice(0, 12)}` : '',
    timestamp: now,
    evidence: 'documented',
    url: record.sourceUrl,
  });

  const edges = nodes.slice(0, -1).map((n) => ({
    from: n.id,
    to: 'current',
    evidence: n.evidence,
  }));

  const stagesPresent = new Set(nodes.map((n) => n.stage));
  const allStages = ['source', 'scrape', 'clean', 'annotate', 'current'] as const;
  const undocumentedStages = allStages.filter((s) => !stagesPresent.has(s));
  const completeness = Math.round(((allStages.length - undocumentedStages.length) / allStages.length) * 100);

  return { nodes, edges, completeness, undocumentedStages };
}
