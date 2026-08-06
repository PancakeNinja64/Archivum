/**
 * Archivum — Documentation Coverage v1.0
 *
 * This measures ONE thing: how much of a dataset's provenance is documented
 * at the source, at the moment we checked.
 *
 * It is not a quality rating, a trust score, or an opinion about the publisher.
 * Every check answers a factual question with a verifiable answer:
 * was this artifact present in the source metadata, yes or no?
 *
 * Three outcomes per check:
 *   'documented'  — we retrieved the artifact itself      -> 1.0 point
 *   'reported'    — the publisher stated it, unverified   -> 0.5 point
 *   'not_found'   — absent from the source when checked   -> 0.0 point
 *   'n/a'         — cannot apply to this platform         -> excluded from denominator
 *
 * Four sections, seven checks each, 25 points each. Equal weight is deliberate:
 * we are counting documentation, not ranking its importance.
 */

export type CheckResult = 'documented' | 'reported' | 'not_found' | 'n/a';

export type CoverageSectionKey =
  | 'origin'
  | 'licensing'
  | 'composition'
  | 'maintenance';

export const COVERAGE_SECTIONS: Record<
  CoverageSectionKey,
  { label: string; weight: number; question: string }
> = {
  origin: {
    label: 'Origin & Sourcing',
    weight: 25,
    question: 'Where did this data come from, and who assembled it?',
  },
  licensing: {
    label: 'Licensing & Terms',
    weight: 25,
    question: 'What terms did the publisher attach to reuse?',
  },
  composition: {
    label: 'Composition & Structure',
    weight: 25,
    question: 'What is actually inside, and how is it organised?',
  },
  maintenance: {
    label: 'Maintenance & Usage',
    weight: 25,
    question: 'Is it still maintained, and how is it being used?',
  },
};

export interface CoverageCheck {
  id: string;
  section: CoverageSectionKey;
  /** Shown verbatim in the UI. Phrase as an observation, never a judgment. */
  label: string;
  /** One line explaining what we looked at. Shown on hover. */
  method: string;
}

export const COVERAGE_CHECKS: CoverageCheck[] = [
  // --- Origin & Sourcing -------------------------------------------------
  { id: 'publisher_identified',      section: 'origin', label: 'Publisher identified',            method: 'Owner or organisation name present on the source record.' },
  { id: 'publisher_is_organisation', section: 'origin', label: 'Published by an organisation',    method: 'Source account is an organisation rather than an individual profile.' },
  { id: 'upstream_sources_declared', section: 'origin', label: 'Upstream sources declared',       method: 'Card metadata or documentation names the data it was derived from.' },
  { id: 'collection_method_described', section: 'origin', label: 'Collection method described',   method: 'Documentation describes how the data was gathered.' },
  { id: 'collection_timeframe_stated', section: 'origin', label: 'Collection timeframe stated',   method: 'Documentation gives dates or a period of collection.' },
  { id: 'annotation_process_described', section: 'origin', label: 'Annotation process described', method: 'Documentation describes labelling or human review, where applicable.' },
  { id: 'maintainer_contact_listed', section: 'origin', label: 'Maintainer contact listed',       method: 'A contact address, issue tracker, or discussion channel is given.' },

  // --- Licensing & Terms -------------------------------------------------
  { id: 'license_declared',          section: 'licensing', label: 'Licence declared',             method: 'A licence field is set on the source record.' },
  { id: 'license_file_present',      section: 'licensing', label: 'Licence file present',         method: 'A LICENSE file exists in the repository tree.' },
  { id: 'license_spdx_recognised',   section: 'licensing', label: 'Licence maps to a known identifier', method: 'The declared licence matches a recognised SPDX identifier.' },
  { id: 'commercial_terms_stated',   section: 'licensing', label: 'Commercial terms stated',      method: 'The licence text or card states whether commercial use is addressed.' },
  { id: 'attribution_terms_stated',  section: 'licensing', label: 'Attribution terms stated',     method: 'Attribution requirements are stated in the licence or card.' },
  { id: 'redistribution_terms_stated', section: 'licensing', label: 'Redistribution terms stated', method: 'Redistribution or sharing terms are stated.' },
  { id: 'upstream_license_noted',    section: 'licensing', label: 'Upstream licences noted',      method: 'Documentation notes the terms of the sources it was built from.' },

  // --- Composition & Structure -------------------------------------------
  { id: 'description_present',       section: 'composition', label: 'Description present',        method: 'A non-empty summary is set on the source record.' },
  { id: 'schema_documented',         section: 'composition', label: 'Field schema available',     method: 'Column or feature names and types are retrievable.' },
  { id: 'splits_documented',         section: 'composition', label: 'Splits documented',          method: 'Train, validation, or test splits are declared.' },
  { id: 'row_count_available',       section: 'composition', label: 'Record count available',     method: 'A row or example count is published.' },
  { id: 'file_manifest_available',   section: 'composition', label: 'File manifest available',    method: 'The list of files in the dataset is retrievable.' },
  { id: 'file_sizes_available',      section: 'composition', label: 'File sizes available',       method: 'Byte sizes are published for the listed files.' },
  { id: 'sample_records_available',  section: 'composition', label: 'Sample records available',   method: 'Example rows are retrievable without downloading the dataset.' },

  // --- Maintenance & Usage -----------------------------------------------
  { id: 'last_modified_known',       section: 'maintenance', label: 'Last modified date known',   method: 'The source reports when the dataset last changed.' },
  { id: 'version_history_available', section: 'maintenance', label: 'Version history available',  method: 'A commit or revision history is retrievable.' },
  { id: 'release_notes_available',   section: 'maintenance', label: 'Release notes available',    method: 'Tagged releases or a changelog are published.' },
  { id: 'citation_provided',         section: 'maintenance', label: 'Citation provided',          method: 'A citation block, DOI, or paper reference is given.' },
  { id: 'usage_statistics_available', section: 'maintenance', label: 'Usage statistics available', method: 'Download, star, or reuse counts are published by the platform.' },
  { id: 'known_limitations_documented', section: 'maintenance', label: 'Known limitations documented', method: 'Documentation includes a limitations, bias, or caveats section.' },
  { id: 'intended_use_documented',   section: 'maintenance', label: 'Intended use documented',    method: 'Documentation states what the dataset is intended for.' },
];

export type CoverageDetail = Record<string, CheckResult>;

export interface CoverageSectionResult {
  key: CoverageSectionKey;
  label: string;
  /** 0–100 within this section. */
  score: number;
  documented: number;
  reported: number;
  notFound: number;
  applicable: number;
}

export interface CoverageResult {
  /** 0–100. Weighted mean of the four sections. */
  total: number;
  sections: CoverageSectionResult[];
  detail: CoverageDetail;
  version: string;
  checkedAt: string;
}

const POINTS: Record<CheckResult, number> = {
  documented: 1,
  reported: 0.5,
  not_found: 0,
  'n/a': 0,
};

export const COVERAGE_VERSION = '1.0';

/**
 * Pure function. Same detail in, same numbers out, forever.
 * Never add randomness, time-decay, or platform bonuses here — the whole
 * point is that a publisher can reproduce our arithmetic themselves.
 */
export function computeCoverage(detail: CoverageDetail): CoverageResult {
  const sections = (Object.keys(COVERAGE_SECTIONS) as CoverageSectionKey[]).map((key) => {
    const checks = COVERAGE_CHECKS.filter((c) => c.section === key);
    let points = 0;
    let applicable = 0;
    let documented = 0;
    let reported = 0;
    let notFound = 0;

    for (const check of checks) {
      const result = detail[check.id] ?? 'not_found';
      if (result === 'n/a') continue;
      applicable += 1;
      points += POINTS[result];
      if (result === 'documented') documented += 1;
      else if (result === 'reported') reported += 1;
      else notFound += 1;
    }

    return {
      key,
      label: COVERAGE_SECTIONS[key].label,
      score: applicable === 0 ? 0 : Math.round((points / applicable) * 100),
      documented,
      reported,
      notFound,
      applicable,
    };
  });

  const usable = sections.filter((s) => s.applicable > 0);
  const total =
    usable.length === 0
      ? 0
      : Math.round(
          usable.reduce((sum, s) => sum + s.score * COVERAGE_SECTIONS[s.key].weight, 0) /
            usable.reduce((sum, s) => sum + COVERAGE_SECTIONS[s.key].weight, 0),
        );

  return {
    total,
    sections,
    detail,
    version: COVERAGE_VERSION,
    checkedAt: new Date().toISOString(),
  };
}

/** Plain-language band label. Descriptive, not evaluative. */
export function coverageBand(total: number): 'Extensive' | 'Partial' | 'Minimal' {
  if (total >= 75) return 'Extensive';
  if (total >= 40) return 'Partial';
  return 'Minimal';
}

/**
 * The sentence that must appear wherever a coverage figure is shown.
 * Absence of documentation is a fact about the record, not a defect in the data.
 */
export function coverageDisclaimer(checkedAt: string, platform: string): string {
  const date = new Date(checkedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  return `Documentation Coverage reflects what was present in the ${platform} record on ${date}. A field marked "not found" means Archivum did not locate it in the published metadata — not that the dataset lacks that property.`;
}
