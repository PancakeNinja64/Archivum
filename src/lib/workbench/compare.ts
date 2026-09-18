/**
 * Row model for the comparison desk.
 *
 * Every row is one fact aligned across columns. A cell is either a known
 * value or an explicit "not stated" — never a zero standing in for missing
 * data. Difference detection compares the rendered text of known-or-unknown
 * cells, so "Not stated" versus "12,000" counts as a difference.
 */
import { COVERAGE_SECTIONS, type CoverageSectionKey } from '@/lib/coverage/rules';
import type { Dataset, EvidenceLabel } from '@/lib/types';
import { commercialUseLabel, evidenceLabel, fmtBytes, fmtDate, fmtInt, platformLabel } from '@/lib/utils';

export interface CompareCell {
  text: string;
  /** False when the source did not state the value. Rendered muted, exported as null. */
  known: boolean;
  detail?: string;
  evidence?: EvidenceLabel;
}

export interface CompareRow {
  key: string;
  group: string;
  label: string;
  cells: CompareCell[];
  /** True when at least two loaded columns show different values. */
  differs: boolean;
  note?: string;
}

export type CompareColumn =
  | { slug: string; state: 'loading' }
  | { slug: string; state: 'absent' }
  | { slug: string; state: 'error'; message: string }
  | { slug: string; state: 'ready'; record: Dataset };

const unknown = (text = 'Not stated'): CompareCell => ({ text, known: false });
const known = (text: string, extra: Partial<CompareCell> = {}): CompareCell => ({ text, known: true, ...extra });

const lookup = (value: boolean | null, yes: string, no: string): CompareCell =>
  value === null ? unknown('Not established') : known(value ? yes : no);

function sectionCell(record: Dataset, key: CoverageSectionKey): CompareCell {
  const section = record.coverageSections.find((s) => s.key === key);
  if (!section) return unknown('Not available');
  if (section.applicable === 0) return known('Not applicable', { detail: 'No checks apply on this platform.' });
  return known(`${section.score}%`, { detail: `${section.documented} documented · ${section.reported} reported · ${section.notFound} not found` });
}

type RowSpec = { key: string; group: string; label: string; note?: string; cell: (record: Dataset) => CompareCell };

const ROWS: RowSpec[] = [
  { key: 'publisher', group: 'Identity', label: 'Publisher', cell: (d) => (d.publisher ? known(d.publisher) : unknown()) },
  { key: 'platform', group: 'Identity', label: 'Platform', cell: (d) => known(platformLabel[d.platform] ?? d.platform) },
  { key: 'version', group: 'Identity', label: 'Version at source', cell: (d) => (d.version ? known(d.version) : unknown()) },

  { key: 'license', group: 'Licence', label: 'Published licence', note: 'Identifier exactly as the source published it.', cell: (d) => (d.license.spdx && d.license.spdx !== 'Not stated' ? known(d.license.spdx, { evidence: d.license.label, detail: evidenceLabel[d.license.label] }) : unknown()) },
  { key: 'commercial', group: 'Licence', label: 'Commercial use (lookup)', note: 'Derived from a static SPDX lookup of the identifier, not from the source text.', cell: (d) => (d.license.commercialUse === 'not_stated' ? unknown('Terms not stated') : known(commercialUseLabel[d.license.commercialUse] ?? d.license.commercialUse)) },
  { key: 'attribution', group: 'Licence', label: 'Attribution required (lookup)', cell: (d) => lookup(d.license.attribution, 'Yes', 'No') },
  { key: 'shareAlike', group: 'Licence', label: 'Share-alike required (lookup)', cell: (d) => lookup(d.license.shareAlike, 'Yes', 'No') },
  { key: 'licenseNotes', group: 'Licence', label: 'Unresolved upstream terms', cell: (d) => (d.license.notes.length ? known(`${d.license.notes.length} ${d.license.notes.length === 1 ? 'note' : 'notes'}`, { detail: d.license.notes.join(' · ') }) : known('None recorded')) },

  { key: 'rows', group: 'Size', label: 'Records', cell: (d) => (d.sizeRows === null ? unknown() : known(fmtInt(d.sizeRows))) },
  { key: 'bytes', group: 'Size', label: 'Download size', cell: (d) => (d.sizeBytes === null ? unknown() : known(fmtBytes(d.sizeBytes))) },

  { key: 'updated', group: 'Recency', label: 'Source updated', cell: (d) => (d.lastUpdated ? known(fmtDate(d.lastUpdated)) : unknown()) },
  { key: 'firstPublished', group: 'Recency', label: 'First published at source', cell: (d) => (d.firstPublished ? known(fmtDate(d.firstPublished)) : unknown()) },
  { key: 'checked', group: 'Recency', label: 'Archivum checked', cell: (d) => (d.coverageCheckedAt ? known(fmtDate(d.coverageCheckedAt)) : unknown()) },

  { key: 'modality', group: 'Content', label: 'Modality', cell: (d) => known(d.modality) },
  { key: 'languages', group: 'Content', label: 'Languages', cell: (d) => (d.languages.length ? known(d.languages.join(', ')) : unknown()) },
  { key: 'domain', group: 'Content', label: 'Domains', cell: (d) => (d.domain.length ? known(d.domain.join(', ')) : unknown()) },

  { key: 'coverage', group: 'Documentation', label: 'Documentation coverage', note: 'Share of provenance fields present at the source when checked. A completeness measure, not a quality rating.', cell: (d) => known(`${d.coverageTotal}%`, { detail: `${d.coverageBand} · v${d.coverageVersion}` }) },
  ...(Object.keys(COVERAGE_SECTIONS) as CoverageSectionKey[]).map((key): RowSpec => ({ key: `section:${key}`, group: 'Documentation', label: COVERAGE_SECTIONS[key].label, cell: (d) => sectionCell(d, key) })),

  { key: 'lineage', group: 'Record', label: 'Lineage recorded', cell: (d) => (d.lineage?.nodes?.length ? known(`${d.lineage.completeness}% of stages`, { detail: d.lineage.undocumentedStages.length ? `Undocumented: ${d.lineage.undocumentedStages.join(', ')}` : 'All stages documented' }) : unknown('Not recorded')) },
  { key: 'versions', group: 'Record', label: 'Versions observed', cell: (d) => known(`${d.versions.length}`) },
  { key: 'schema', group: 'Record', label: 'Schema fields', cell: (d) => (d.schema.length ? known(`${d.schema.length}`) : unknown('Not available')) },
  { key: 'samples', group: 'Record', label: 'Preview rows', cell: (d) => (d.sampleRecords.length ? known(`${d.sampleRecords.length}`) : unknown('Not available')) },
];

const PLACEHOLDER: CompareCell = { text: '—', known: false };

export function buildCompareRows(columns: readonly CompareColumn[]): CompareRow[] {
  return ROWS.map((spec) => {
    const cells = columns.map((column) => (column.state === 'ready' ? spec.cell(column.record) : PLACEHOLDER));
    const loaded = columns.map((column, index) => (column.state === 'ready' ? cells[index].text : null)).filter((text): text is string => text !== null);
    const differs = loaded.length >= 2 && new Set(loaded).size > 1;
    return { key: spec.key, group: spec.group, label: spec.label, note: spec.note, cells, differs };
  });
}

export function groupRows(rows: readonly CompareRow[]): { group: string; rows: CompareRow[] }[] {
  const groups: { group: string; rows: CompareRow[] }[] = [];
  for (const row of rows) {
    const last = groups[groups.length - 1];
    if (last && last.group === row.group) last.rows.push(row);
    else groups.push({ group: row.group, rows: [row] });
  }
  return groups;
}
