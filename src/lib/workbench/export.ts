/**
 * Research brief export.
 *
 * A brief is a faithful copy of what the record says, in a shape an ML
 * engineer can drop into a data-evaluation doc: every field carries its
 * evidence label, unknowns stay unknown (null in JSON, "Not stated" in
 * Markdown), and the origin of the data — live catalog or illustrative demo —
 * is stated at the top, not buried. It is produced entirely in the browser
 * and handed to the user as a download; nothing is submitted anywhere.
 */
import { COVERAGE_CHECKS, COVERAGE_SECTIONS, type CheckResult, type CoverageSectionKey } from '@/lib/coverage/rules';
import type { Dataset, EvidenceLabel } from '@/lib/types';
import { commercialUseLabel, evidenceLabel, fmtBytes, fmtDate, fmtInt, platformLabel, safeExternalUrl } from '@/lib/utils';
import { buildCompareRows, groupRows, type CompareColumn } from './compare';
import { recordHref } from './query';

export type BriefOrigin = 'catalog' | 'illustrative';
export type BriefScope = 'record' | 'shortlist' | 'comparison';

export interface BriefOptions {
  origin: BriefOrigin;
  scope: BriefScope;
  /** ISO timestamp. Injected so exports are reproducible in tests. */
  generatedAt: string;
  /** e.g. https://archivum.tech — used to build absolute record links. */
  siteOrigin: string;
}

export interface BriefUnavailable { slug: string; name?: string; reason: string }

export interface BriefSection { key: CoverageSectionKey; label: string; score: number | null; documented: number; reported: number; notFound: number; applicable: number }

export interface BriefRecord {
  slug: string;
  name: string;
  publisher: string;
  platform: string;
  platformLabel: string;
  recordUrl: string;
  /** Only present for live catalog records with a valid http(s) source. */
  sourceUrl: string | null;
  version: string | null;
  description: string;
  modality: string;
  languages: string[];
  domain: string[];
  license: {
    published: string | null;
    evidence: EvidenceLabel;
    evidenceLabel: string;
    lookup: { commercialUse: string; commercialUseLabel: string; attributionRequired: boolean | null; shareAlikeRequired: boolean | null };
    notes: string[];
  };
  size: { rows: number | null; bytes: number | null; rowsLabel: string; bytesLabel: string };
  dates: { firstPublished: string | null; sourceUpdated: string | null; archivumChecked: string | null };
  coverage: {
    total: number;
    band: string;
    methodVersion: string;
    checkedAt: string | null;
    sections: BriefSection[];
    checks: { id: string; section: CoverageSectionKey; label: string; result: CheckResult | 'unavailable' }[];
  };
  /** Labels of checks Archivum did not find in the published metadata. */
  gaps: string[];
  lineage: { recorded: boolean; completeness: number | null; undocumentedStages: string[]; stages: { stage: string; label: string; actor: string; timestamp: string | null; evidence: EvidenceLabel }[] };
  history: { versionsObserved: number; latest: { version: string; date: string | null; note: string } | null };
  structure: { schemaFields: number; previewRows: number; schema: { name: string; type: string; nullable: boolean; description: string }[] };
  contentHash: string | null;
}

export interface Brief {
  format: 'archivum-research-brief';
  formatVersion: 1;
  generatedAt: string;
  origin: BriefOrigin;
  originNote: string;
  scope: BriefScope;
  caveats: string[];
  records: BriefRecord[];
  unavailable: BriefUnavailable[];
  /** Only for scope 'comparison': the aligned rows as rendered on the desk. */
  comparison: { group: string; label: string; values: { slug: string; value: string | null }[] }[] | null;
}

export const ORIGIN_NOTE: Record<BriefOrigin, string> = {
  illustrative: 'Illustrative demo catalog. Publishers and records are fictional samples that demonstrate the interface; they are not source reports and carry no external source links.',
  catalog: 'Live Archivum catalog. Values reflect the source metadata Archivum retrieved at the recorded check time.',
};

export const COVERAGE_CAVEAT = 'Documentation Coverage reports what a dataset documents about itself at the source at the time of the check. It is a completeness measure, not a quality, safety, or legal assessment, and it grants no permission to use a dataset. "Not found" means Archivum did not locate the field in the published metadata — not that the dataset lacks that property.';
export const LICENCE_CAVEAT = 'Licence terms marked "lookup" are derived from a static SPDX table for the published identifier. Review the source licence text and any upstream restrictions before relying on them.';

function toBriefRecord(record: Dataset, options: BriefOptions): BriefRecord {
  const checks = COVERAGE_CHECKS.map((check) => ({ id: check.id, section: check.section, label: check.label, result: (record.coverageDetail?.[check.id] ?? 'unavailable') as CheckResult | 'unavailable' }));
  const sections: BriefSection[] = (Object.keys(COVERAGE_SECTIONS) as CoverageSectionKey[]).map((key) => {
    const found = record.coverageSections?.find((s) => s.key === key);
    return found
      ? { key, label: found.label, score: found.applicable ? found.score : null, documented: found.documented, reported: found.reported, notFound: found.notFound, applicable: found.applicable }
      : { key, label: COVERAGE_SECTIONS[key].label, score: null, documented: 0, reported: 0, notFound: 0, applicable: 0 };
  });
  const latest = record.versions?.[0] ?? null;
  return {
    slug: record.slug,
    name: record.name,
    publisher: record.publisher,
    platform: record.platform,
    platformLabel: platformLabel[record.platform] ?? record.platform,
    recordUrl: `${options.siteOrigin}${recordHref(record.slug)}`,
    sourceUrl: options.origin === 'catalog' ? safeExternalUrl(record.platformUrl) : null,
    version: record.version || null,
    description: record.description ?? '',
    modality: record.modality,
    languages: record.languages ?? [],
    domain: record.domain ?? [],
    license: {
      published: record.license.spdx && record.license.spdx !== 'Not stated' ? record.license.spdx : null,
      evidence: record.license.label,
      evidenceLabel: evidenceLabel[record.license.label],
      lookup: {
        commercialUse: record.license.commercialUse,
        commercialUseLabel: commercialUseLabel[record.license.commercialUse] ?? record.license.commercialUse,
        attributionRequired: record.license.attribution,
        shareAlikeRequired: record.license.shareAlike,
      },
      notes: record.license.notes ?? [],
    },
    size: { rows: record.sizeRows, bytes: record.sizeBytes, rowsLabel: fmtInt(record.sizeRows), bytesLabel: fmtBytes(record.sizeBytes) },
    dates: { firstPublished: record.firstPublished, sourceUpdated: record.lastUpdated, archivumChecked: record.coverageCheckedAt },
    coverage: { total: record.coverageTotal, band: record.coverageBand, methodVersion: record.coverageVersion, checkedAt: record.coverageCheckedAt, sections, checks },
    gaps: checks.filter((check) => check.result === 'not_found').map((check) => check.label),
    lineage: {
      recorded: Boolean(record.lineage?.nodes?.length),
      completeness: record.lineage?.nodes?.length ? record.lineage.completeness : null,
      undocumentedStages: record.lineage?.undocumentedStages ?? [],
      stages: (record.lineage?.nodes ?? []).map((node) => ({ stage: node.stage, label: node.label, actor: node.actor, timestamp: node.timestamp || null, evidence: node.evidence })),
    },
    history: { versionsObserved: record.versions?.length ?? 0, latest: latest ? { version: latest.version, date: latest.date, note: latest.note } : null },
    structure: { schemaFields: record.schema?.length ?? 0, previewRows: record.sampleRecords?.length ?? 0, schema: (record.schema ?? []).map((f) => ({ name: f.name, type: f.type, nullable: f.nullable, description: f.description })) },
    contentHash: record.contentHash || null,
  };
}

export function buildBrief(records: readonly Dataset[], unavailable: readonly BriefUnavailable[], options: BriefOptions): Brief {
  const caveats = [COVERAGE_CAVEAT, LICENCE_CAVEAT];
  if (options.origin === 'illustrative') caveats.unshift('These records are illustrative. Do not cite them as evidence about any real dataset.');
  if (unavailable.length) caveats.push(`${unavailable.length} requested ${unavailable.length === 1 ? 'record was' : 'records were'} unavailable at export time and ${unavailable.length === 1 ? 'is' : 'are'} listed separately.`);
  const comparison = options.scope === 'comparison' && records.length >= 2
    ? buildCompareRows(records.map((record): CompareColumn => ({ slug: record.slug, state: 'ready', record }))).map((row) => ({
      group: row.group, label: row.label, values: row.cells.map((cell, index) => ({ slug: records[index].slug, value: cell.known ? cell.text : null })),
    }))
    : null;
  return {
    format: 'archivum-research-brief',
    formatVersion: 1,
    generatedAt: options.generatedAt,
    origin: options.origin,
    originNote: ORIGIN_NOTE[options.origin],
    scope: options.scope,
    caveats,
    records: records.map((record) => toBriefRecord(record, options)),
    unavailable: [...unavailable],
    comparison,
  };
}

export function briefToJson(brief: Brief): string {
  return `${JSON.stringify(brief, null, 2)}\n`;
}

/* ---------- Markdown ---------- */

/** C0 and DEL control characters, stripped before anything reaches a Markdown line. */
const CONTROL_CHARACTERS = /[ --]/g;

/** Escape anything that could open Markdown structure inside prose or a table cell. */
export function mdInline(value: string | null | undefined): string {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(CONTROL_CHARACTERS, '')
    .replace(/\s+/g, ' ')
    .replace(/([\\`*_{}[\]<>#+|~])/g, '\\$1')
    .trim();
}

const mdUrl = (url: string) => url.replace(/[<>()\s]/g, (c) => encodeURIComponent(c));
const yesNo = (value: boolean | null) => (value === null ? 'not established' : value ? 'yes' : 'no');
const dateOrNot = (iso: string | null) => (iso ? `${fmtDate(iso)} (${iso})` : 'Not stated');
const code = (value: string) => value.replace(/[`\r\n]/g, '');

function recordMarkdown(record: BriefRecord, index: number, origin: BriefOrigin): string[] {
  const lines: string[] = [];
  lines.push(`## ${index + 1}. ${mdInline(record.name)}`, '');
  lines.push(`- Record: <${mdUrl(record.recordUrl)}>`);
  lines.push(`- Source: ${record.sourceUrl ? `<${mdUrl(record.sourceUrl)}>` : origin === 'illustrative' ? 'no source link (illustrative record)' : 'no valid source link recorded'}`);
  lines.push(`- Publisher: ${mdInline(record.publisher)} · Platform: ${mdInline(record.platformLabel)} · Version: ${record.version ? mdInline(record.version) : 'Not stated'}`);
  lines.push(`- Licence: ${record.license.published ? mdInline(record.license.published) : 'Not stated'} (${record.license.evidenceLabel.toLowerCase()}) · ${mdInline(record.license.lookup.commercialUseLabel)} (lookup) · attribution required: ${yesNo(record.license.lookup.attributionRequired)} · share-alike required: ${yesNo(record.license.lookup.shareAlikeRequired)}`);
  if (record.license.notes.length) lines.push(`- Licence notes: ${record.license.notes.map(mdInline).join('; ')}`);
  lines.push(`- Size: ${record.size.rows === null ? 'records not stated' : `${record.size.rowsLabel} records`} · ${record.size.bytes === null ? 'download size not stated' : record.size.bytesLabel}`);
  lines.push(`- Dates: first published ${dateOrNot(record.dates.firstPublished)} · source updated ${dateOrNot(record.dates.sourceUpdated)} · Archivum checked ${dateOrNot(record.dates.archivumChecked)}`);
  lines.push(`- Content: ${mdInline(record.modality)} · languages ${record.languages.length ? mdInline(record.languages.join(', ')) : 'not stated'} · domains ${record.domain.length ? mdInline(record.domain.join(', ')) : 'not stated'}`);
  lines.push(`- Documentation coverage: ${record.coverage.total}% (${record.coverage.band}), method v${mdInline(record.coverage.methodVersion)}`, '');
  lines.push('| Section | Score | Documented | Reported | Not found | Applicable |', '| --- | ---: | ---: | ---: | ---: | ---: |');
  for (const section of record.coverage.sections) lines.push(`| ${mdInline(section.label)} | ${section.score === null ? 'n/a' : `${section.score}%`} | ${section.documented} | ${section.reported} | ${section.notFound} | ${section.applicable} |`);
  lines.push('');
  lines.push(`- Documentation gaps (not found at source): ${record.gaps.length ? record.gaps.map(mdInline).join('; ') : 'none of the 28 checks'}`);
  lines.push(`- Lineage: ${record.lineage.recorded ? `${record.lineage.completeness}% of stages documented${record.lineage.undocumentedStages.length ? `; undocumented: ${mdInline(record.lineage.undocumentedStages.join(', '))}` : ''}` : 'not recorded'}`);
  lines.push(`- History: ${record.history.versionsObserved} ${record.history.versionsObserved === 1 ? 'version' : 'versions'} observed${record.history.latest ? `; latest ${mdInline(record.history.latest.version)}${record.history.latest.date ? ` on ${fmtDate(record.history.latest.date)}` : ''}` : ''}`);
  lines.push(`- Structure: ${record.structure.schemaFields ? `${record.structure.schemaFields} schema fields` : 'schema not available'} · ${record.structure.previewRows ? `${record.structure.previewRows} preview rows` : 'no preview rows'}`);
  if (record.contentHash) lines.push(`- Content hash: \`${code(record.contentHash)}\``);
  if (record.description) lines.push('', `> ${mdInline(record.description)}`);
  lines.push('');
  return lines;
}

export function briefToMarkdown(brief: Brief): string {
  const lines: string[] = [];
  const scopeLabel = brief.scope === 'comparison' ? 'Comparison' : brief.scope === 'shortlist' ? 'Shortlist (saved on this device)' : 'Single record';
  lines.push('# Archivum research brief', '');
  lines.push(`- Generated: ${brief.generatedAt}`);
  lines.push(`- Origin: **${brief.origin === 'illustrative' ? 'Illustrative demo catalog' : 'Live catalog'}** — ${mdInline(brief.originNote)}`);
  lines.push(`- Scope: ${scopeLabel} · ${brief.records.length} ${brief.records.length === 1 ? 'record' : 'records'}${brief.unavailable.length ? ` · ${brief.unavailable.length} unavailable` : ''}`, '');
  brief.caveats.forEach((caveat, index) => { lines.push(`> ${mdInline(caveat)}`); if (index < brief.caveats.length - 1) lines.push('>'); });
  lines.push('');
  if (brief.comparison) {
    lines.push('## Side by side', '');
    const header = brief.records.map((record) => mdInline(record.name));
    lines.push(`| Field | ${header.join(' | ')} |`, `| --- | ${header.map(() => '---').join(' | ')} |`);
    const grouped = groupRows(brief.comparison.map((row) => ({ key: row.label, group: row.group, label: row.label, cells: row.values.map((v) => ({ text: v.value ?? 'Not stated', known: v.value !== null })), differs: false })));
    for (const group of grouped) {
      lines.push(`| **${mdInline(group.group)}** | ${header.map(() => '').join(' | ')} |`);
      for (const row of group.rows) lines.push(`| ${mdInline(row.label)} | ${row.cells.map((cell) => (cell.known ? mdInline(cell.text) : '_Not stated_')).join(' | ')} |`);
    }
    lines.push('');
  }
  brief.records.forEach((record, index) => lines.push(...recordMarkdown(record, index, brief.origin)));
  if (brief.unavailable.length) {
    lines.push('## Unavailable at export time', '');
    for (const entry of brief.unavailable) lines.push(`- ${mdInline(entry.name ?? entry.slug)} (\`${code(entry.slug)}\`): ${mdInline(entry.reason)}`);
    lines.push('');
  }
  lines.push('---', '', 'Produced by Archivum in the browser. Record links open the research desk; no data was submitted anywhere to create this file.', '');
  return lines.join('\n');
}

/* ---------- Files ---------- */

export function briefFilename(brief: Brief, extension: 'json' | 'md'): string {
  const stamp = brief.generatedAt.replace(/[^0-9T]/g, '').slice(0, 13).replace('T', '-');
  const subject = brief.scope === 'record' && brief.records[0] ? brief.records[0].slug : brief.scope;
  return `archivum-brief-${subject.replace(/[^a-z0-9-]/gi, '').slice(0, 60) || 'records'}-${stamp}.${extension}`;
}

/** Browser download through a Blob URL. No network, no endpoint. */
export function downloadTextFile(filename: string, content: string, mime: string): void {
  if (typeof document === 'undefined' || typeof URL === 'undefined' || typeof URL.createObjectURL !== 'function') throw new Error('Downloads are only available in a browser.');
  const blob = new Blob([content], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = 'noopener';
  anchor.style.display = 'none';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1_000);
}
