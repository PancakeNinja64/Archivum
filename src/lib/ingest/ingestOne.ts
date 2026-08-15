import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';
import { computeCoverage } from '../coverage/rules';
import { adapterFor } from '../sources';
import { metadataHash, slugFor } from './hash';
import { attributionRequired, shareAlikeRequired } from '../sources/spdx';
import { recordIngestOutcome } from '../probe/recordIngestOutcome';

export interface IngestSummary {
  status: 'created' | 'updated' | 'unchanged' | 'skipped' | 'failed';
  slug?: string;
  datasetId?: string;
  coverageTotal?: number;
  detail?: string;
}

/**
 * Ingest one dataset. Idempotent by construction:
 *  - unknown identifier      -> draft row + version 1 + snapshot
 *  - known, hash unchanged   -> touch checked_at and usage counters only
 *  - known, hash changed     -> update row + append version + change rows
 * A failure anywhere records the run as failed/skipped and NEVER throws
 * out of this function — one bad identifier must not abort a batch.
 */
export async function ingestOne(
  db: SupabaseClient,
  platform: string,
  identifier: string,
  triggeredBy: string,
): Promise<IngestSummary> {
  const adapter = adapterFor(platform);
  if (!adapter) return { status: 'failed', detail: `Unknown platform: ${platform}` };
  const sourceId = adapter.parseIdentifier(identifier);
  if (!sourceId) return { status: 'failed', detail: `Could not parse identifier: ${identifier}` };

  // Open the run row first so even a crash leaves a trace.
  const { data: run } = await db.from('ingestion_runs')
    .insert({ platform, source_identifier: sourceId, status: 'running', triggered_by: triggeredBy })
    .select('id').single();
  const runId = run?.id as string | undefined;
  const closeRun = async (status: string, error?: string, datasetId?: string) => {
    if (!runId) return;
    await db.from('ingestion_runs').update({
      status, error_message: error ?? null, dataset_id: datasetId ?? null,
      completed_at: new Date().toISOString(),
    }).eq('id', runId);
  };

  try {
    // Existing row (by permanent slug first, then by source identity for renames).
    const slug = slugFor(platform, sourceId);
    const { data: existing } = await db.from('datasets')
      .select('id, slug, metadata_hash, license_spdx, coverage_total, status, metadata, end_state')
      .or(`slug.eq.${slug},and(platform.eq.${platform},source_identifier.eq.${sourceId})`)
      .maybeSingle();

    const priorEtag = (existing?.metadata as Record<string, unknown> | null)?.source_etag as string | undefined;
    const result = await adapter.ingest(sourceId, { etag: priorEtag ?? null });

    if (result.outcome === 'not_modified' && existing) {
      const seenAt = new Date().toISOString();
      await db.from('datasets').update({
        coverage_checked_at: seenAt, last_confirmed: seenAt, consecutive_failures: 0,
      }).eq('id', existing.id);
      await closeRun('skipped', 'Source reports no change since the last check (ETag match).', existing.id);
      return { status: 'unchanged', slug: existing.slug, datasetId: existing.id };
    }
    if (result.outcome === 'not_found' || result.outcome === 'gated' || result.outcome === 'error') {
      if (existing?.id) {
        await recordIngestOutcome(db, existing.id, result.outcome, result.detail ?? null);
      }
      await closeRun(result.outcome === 'error' ? 'failed' : 'skipped', result.detail, existing?.id);
      return { status: result.outcome === 'error' ? 'failed' : 'skipped', detail: result.detail };
    }

    const record = result.record!;
    const detail = result.coverage!;
    const coverage = computeCoverage(detail);
    const hash = metadataHash(record.hashInputs);
    const nowIso = new Date().toISOString();
    const bySection = Object.fromEntries(coverage.sections.map((s) => [s.key, s.score]));

    const row = {
      platform: record.platform,
      source_identifier: record.sourceId,
      source_url: record.sourceUrl,
      name: record.name,
      publisher: record.publisher,
      publisher_slug: record.owner.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description: record.description || null,
      modality: record.modality,
      languages: record.languages,
      size_rows: record.sizeRows,
      size_bytes: record.sizeBytes,
      license_spdx: record.licenseSpdx,
      license_status: record.licenseStatus,
      commercial_use: record.commercialUse,
      coverage_total: coverage.total,
      coverage_origin: bySection.origin ?? 0,
      coverage_licensing: bySection.licensing ?? 0,
      coverage_composition: bySection.composition ?? 0,
      coverage_maintenance: bySection.maintenance ?? 0,
      coverage_detail: detail,
      coverage_version: coverage.version,
      coverage_checked_at: nowIso,
      checks_at_last_check: detail,
      last_confirmed: nowIso,
      consecutive_failures: 0,
      lineage: result.lineage,
      schema_fields: record.schemaFields,
      sample_records: record.sampleRecords,
      last_source_update: record.lastSourceUpdate,
      source_revision: record.sourceRevision,
      metadata_hash: hash,
      downloads: record.downloads,
      likes: record.likes,
      stars: record.stars,
      metadata: {
        source_etag: result.etag ?? null,
        file_count_total: record.fileCountTotal,
        attribution: attributionRequired(record.licenseSpdx),
        share_alike: shareAlikeRequired(record.licenseSpdx),
        archived: record.archived,
        first_published: record.firstPublished,
      },
      first_published: record.firstPublished,
    } as Record<string, unknown>;

    const replaceFiles = async (datasetId: string) => {
      await db.from('dataset_files').delete().eq('dataset_id', datasetId);
      if (record.files.length) {
        await db.from('dataset_files').insert(record.files.map((f) => ({
          dataset_id: datasetId,
          file_name: f.path,
          file_size: f.bytes,
          file_type: f.path.includes('.') ? f.path.split('.').pop()!.slice(0, 16) : null,
        })));
      }
    };
    const snapshot = async (datasetId: string) => {
      await db.from('coverage_snapshots').insert({
        dataset_id: datasetId,
        coverage_total: coverage.total,
        sections: bySection,
        coverage_version: coverage.version,
      });
    };

    // ---------- New dataset: draft ----------
    if (!existing) {
      const { data: created, error } = await db.from('datasets')
        .insert({ ...row, slug, status: 'draft' }).select('id, slug').single();
      if (error || !created) {
        await closeRun('failed', `Insert failed: ${error?.message ?? 'unknown'}`);
        return { status: 'failed', detail: error?.message };
      }
      await db.from('dataset_versions').insert({
        dataset_id: created.id,
        version_label: 'v1',
        source_revision: record.sourceRevision,
        license_spdx: record.licenseSpdx,
        metadata_hash: hash,
        coverage_total: coverage.total,
        note: 'First recorded at Archivum.',
        author: record.publisher,
      });
      await replaceFiles(created.id);
      await snapshot(created.id);
      await closeRun('completed', undefined, created.id);
      return { status: 'created', slug: created.slug, datasetId: created.id, coverageTotal: coverage.total };
    }

    // ---------- Known, unchanged ----------
    if (existing.metadata_hash === hash) {
      await db.from('datasets').update({
        coverage_checked_at: nowIso,
        metadata: { ...(existing.metadata as Record<string, unknown> ?? {}), source_etag: result.etag ?? priorEtag ?? null },
      }).eq('id', existing.id);
      await snapshot(existing.id);
      await closeRun('completed', 'No change: metadata hash identical.', existing.id);
      return { status: 'unchanged', slug: existing.slug, datasetId: existing.id, coverageTotal: coverage.total };
    }

    // ---------- Known, changed: update + version + change rows ----------
    // The slug NEVER changes, even when the source renamed. Identity is ours.
    const { error: upErr } = await db.from('datasets').update(row).eq('id', existing.id);
    if (upErr) {
      await closeRun('failed', `Update failed: ${upErr.message}`, existing.id);
      return { status: 'failed', detail: upErr.message };
    }
    if (existing.end_state) {
      await recordIngestOutcome(db, existing.id, 'ok', 'Retrieved again during ingest.', existing.end_state as string);
    }
    const { count } = await db.from('dataset_versions')
      .select('id', { count: 'exact', head: true }).eq('dataset_id', existing.id);
    await db.from('dataset_versions').insert({
      dataset_id: existing.id,
      version_label: `v${(count ?? 0) + 1}`,
      source_revision: record.sourceRevision,
      license_spdx: record.licenseSpdx,
      metadata_hash: hash,
      coverage_total: coverage.total,
      note: 'Source metadata changed.',
      author: record.publisher,
    });

    const changes: { change_type: string; severity: string; message: string }[] = [];
    if ((existing.license_spdx ?? null) !== (record.licenseSpdx ?? null)) {
      changes.push({
        change_type: 'license-change', severity: 'warning',
        message: `Declared licence changed from ${existing.license_spdx ?? 'not stated'} to ${record.licenseSpdx ?? 'not stated'}.`,
      });
    }
    const delta = coverage.total - (existing.coverage_total ?? coverage.total);
    if (delta <= -5) changes.push({
      change_type: 'coverage-drop', severity: 'warning',
      message: `Documentation Coverage fell ${Math.abs(delta)} points: fields previously present were not found at the source.`,
    });
    if (delta >= 5) changes.push({
      change_type: 'coverage-gain', severity: 'info',
      message: `Documentation Coverage rose ${delta} points: the source now documents more of the record.`,
    });
    if (record.archived) changes.push({
      change_type: 'deprecated', severity: 'warning',
      message: 'The source marks this dataset as archived.',
    });
    changes.push({ change_type: 'new-version', severity: 'info', message: `Version v${(count ?? 0) + 1} recorded from the source.` });
    await db.from('dataset_changes').insert(changes.map((c) => ({ ...c, dataset_id: existing.id })));

    await replaceFiles(existing.id);
    await snapshot(existing.id);
    await closeRun('completed', undefined, existing.id);
    return { status: 'updated', slug: existing.slug, datasetId: existing.id, coverageTotal: coverage.total };
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown ingest failure';
    await closeRun('failed', msg);
    return { status: 'failed', detail: msg };
  }
}

/** Call once at the end of any batch that touched the catalog. */
export async function rebuildFacets(db: SupabaseClient): Promise<void> {
  await db.rpc('rebuild_catalog_facets');
}
