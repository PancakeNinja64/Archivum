import 'server-only';
import type { CoverageDetail, CheckResult } from '../coverage/rules';
import type { SchemaField } from '../types';
import { serverConfig } from '../config';
import { sourceFetch, MAX_README_BYTES } from './fetcher';
import { readmeSignals } from './readme-signals';
import { commercialUseFor, isRecognisedSpdx } from './spdx';
import type { IngestFetchResult, NormalisedRecord, SourceAdapter } from './types';
import { deriveLineage } from './huggingface';

const GH = 'https://api.github.com';

type J = Record<string, unknown>;
const j = (v: unknown): J => (v && typeof v === 'object' ? (v as J) : {});
const str = (v: unknown): string | null => (typeof v === 'string' && v ? v : null);
const num = (v: unknown): number | null => (typeof v === 'number' && Number.isFinite(v) ? v : null);

export const github: SourceAdapter = {
  platform: 'github',

  parseIdentifier(input: string): string | null {
    const cleaned = input.trim()
      .replace(/^https?:\/\/github\.com\//, '')
      .replace(/\.git$/, '')
      .replace(/\/+$/, '');
    return /^[\w.-]+\/[\w.-]+$/.test(cleaned) ? cleaned : null;
  },

  async ingest(id, { etag }): Promise<IngestFetchResult> {
    const token = serverConfig.githubToken;

    const main = await sourceFetch(`${GH}/repos/${id}`, { token, etag });
    if (main.notModified) return { outcome: 'not_modified', etag: main.etag };
    if (main.status === 404) return { outcome: 'not_found', detail: `GitHub returned 404 for ${id} — renamed, removed, or private.` };
    if (main.status === 401 || main.status === 403) return { outcome: 'gated', detail: `GitHub returned ${main.status} for ${id} — private, rate-limited, or requires auth.` };
    if (!main.ok || !main.json) return { outcome: 'error', detail: `GitHub API failed for ${id} (status ${main.status}).` };

    const m = j(main.json);
    const fullName = str(m.full_name) ?? id;
    const [owner = fullName, shortName = fullName] = fullName.includes('/') ? fullName.split('/') : [fullName, fullName];
    const ownerObj = j(m.owner);
    const defaultBranch = str(m.default_branch) ?? 'main';

    const [licenseRes, readmeRes, treeRes, commitsRes, releasesRes] = await Promise.all([
      sourceFetch(`${GH}/repos/${fullName}/license`, { token }),
      sourceFetch(`${GH}/repos/${fullName}/readme`, { token }),
      sourceFetch(`${GH}/repos/${fullName}/git/trees/${defaultBranch}?recursive=1`, { token }),
      sourceFetch(`${GH}/repos/${fullName}/commits?per_page=20`, { token }),
      sourceFetch(`${GH}/repos/${fullName}/releases?per_page=5`, { token }),
    ]);

    // README arrives base64-encoded.
    let readme: string | null = null;
    const readmeJson = j(readmeRes.json);
    const enc = str(readmeJson.content);
    if (readmeRes.ok && enc) {
      try { readme = Buffer.from(enc, 'base64').toString('utf8').slice(0, MAX_README_BYTES); } catch { readme = null; }
    }
    const prose = readmeSignals(readme);

    const licJson = j(licenseRes.json);
    const licObj = j(licJson.license);
    const spdxRaw = str(licObj.spdx_id);
    const licenseSpdx = spdxRaw && spdxRaw !== 'NOASSERTION' ? spdxRaw : null;
    const hasLicenseFile = licenseRes.ok; // the /license endpoint 404s when no licence file exists

    const treeJson = j(treeRes.json);
    const tree = Array.isArray(treeJson.tree) ? (treeJson.tree as J[]) : [];
    const blobs = tree.filter((t) => str(t.type) === 'blob');
    const files = blobs
      .map((t) => ({ path: str(t.path) ?? '', bytes: num(t.size) }))
      .filter((f) => f.path)
      .sort((a, b) => (b.bytes ?? 0) - (a.bytes ?? 0))
      .slice(0, 200);

    const commits = Array.isArray(commitsRes.json) ? (commitsRes.json as J[]) : [];
    const headSha = commits[0] ? str(j(commits[0]).sha) : null;
    const releases = Array.isArray(releasesRes.json) ? (releasesRes.json as J[]) : [];
    const hasChangelog = blobs.some((t) => /^changelog/i.test(str(t.path) ?? ''));

    const parentObj = j(m.parent);
    const forkParent = Boolean(m.fork) ? str(parentObj.full_name) : null;
    const archived = Boolean(m.archived);

    const record: NormalisedRecord = {
      platform: 'github',
      sourceId: fullName,
      owner,
      name: shortName,
      sourceUrl: str(m.html_url) ?? `https://github.com/${fullName}`,
      description: str(m.description) ?? '',
      publisher: owner,
      publisherIsOrg: str(ownerObj.type) === 'Organization',
      licenseSpdx,
      licenseStatus: licenseSpdx ? 'documented' : hasLicenseFile ? 'documented' : prose.licenseMention ? 'reported' : 'not_found',
      commercialUse: commercialUseFor(licenseSpdx),
      modality: null, // a repository does not declare one; left for admin curation
      languages: [],
      sizeRows: null,          // n/a for repositories
      sizeBytes: num(m.size) !== null ? (num(m.size)! * 1024) : null, // API reports KB
      firstPublished: str(m.created_at),
      lastSourceUpdate: str(m.pushed_at) ?? str(m.updated_at),
      sourceRevision: headSha,
      schemaFields: [] as SchemaField[], // n/a for repositories
      sampleRecords: [],                 // n/a — never read file contents
      files,
      fileCountTotal: blobs.length,
      archived,
      downloads: null,
      likes: null,
      stars: num(m.stargazers_count),
      hashInputs: [
        shortName,
        str(m.description) ?? '',
        licenseSpdx,
        headSha,
        blobs.length,
        num(m.size),
        str(m.pushed_at),
      ],
      lineageHints: {
        upstreamIds: [],
        forkParent,
        readme,
        createdAt: str(m.created_at),
        lastModified: str(m.pushed_at),
      },
    };

    const D: CheckResult = 'documented', R: CheckResult = 'reported', N: CheckResult = 'not_found', NA: CheckResult = 'n/a';
    const coverage: CoverageDetail = {
      // origin
      publisher_identified: owner ? D : N,
      publisher_is_organisation: record.publisherIsOrg ? D : N,
      upstream_sources_declared: forkParent ? D : prose.upstreamSources ? R : N,
      collection_method_described: prose.collectionMethod ? R : N,
      collection_timeframe_stated: prose.collectionTimeframe ? R : N,
      annotation_process_described: prose.annotationProcess ? R : N,
      maintainer_contact_listed: Boolean(m.has_issues) ? D : prose.maintainerContact ? R : N,
      // licensing
      license_declared: licenseSpdx ? D : N,
      license_file_present: hasLicenseFile ? D : N,
      license_spdx_recognised: isRecognisedSpdx(licenseSpdx) ? D : N,
      commercial_terms_stated: commercialUseFor(licenseSpdx) !== 'not_stated' ? D : prose.commercialTerms ? R : N,
      attribution_terms_stated: isRecognisedSpdx(licenseSpdx) ? D : prose.attributionTerms ? R : N,
      redistribution_terms_stated: isRecognisedSpdx(licenseSpdx) ? D : prose.redistributionTerms ? R : N,
      upstream_license_noted: prose.upstreamLicense ? R : N,
      // composition — several checks cannot apply to a repository
      description_present: record.description ? D : N,
      schema_documented: NA,
      splits_documented: NA,
      row_count_available: NA,
      file_manifest_available: files.length ? D : N,
      file_sizes_available: files.some((f) => f.bytes !== null) ? D : N,
      sample_records_available: NA,
      // maintenance
      last_modified_known: record.lastSourceUpdate ? D : N,
      version_history_available: commits.length ? D : N,
      release_notes_available: releases.length ? D : hasChangelog ? D : N,
      citation_provided: blobs.some((t) => /^citation\.cff$/i.test(str(t.path) ?? '')) ? D : prose.citation ? R : N,
      usage_statistics_available: num(m.stargazers_count) !== null ? D : N,
      known_limitations_documented: prose.limitations ? R : N,
      intended_use_documented: prose.intendedUse ? R : (record.description ? R : N),
    };

    const lineage = deriveLineage(
      forkParent
        ? { ...record, lineageHints: { ...record.lineageHints, upstreamIds: [forkParent] } }
        : record,
      coverage,
    );
    // Fork parents live on GitHub, not Hugging Face — repoint the node URL.
    for (const node of lineage.nodes) {
      if (node.stage === 'source' && forkParent) node.url = `https://github.com/${forkParent}`;
    }

    return { outcome: 'ok', record, coverage, lineage, etag: main.etag };
  },
};
