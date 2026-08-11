/**
 * Specimen record for the homepage Problem section.
 *
 * This is a COMPOSITE. It is not a real published dataset and must never be
 * presented as one: naming a real publisher on the homepage and showing their
 * record as thinly documented is the exposure Archivum avoids everywhere else,
 * and it would be more prominent here than anywhere in the catalog.
 *
 * The outcomes below are representative of what a typical source card answers.
 * The shape of them is the actual argument: the machine-readable fields —
 * schema, splits, row counts, file manifests — are well covered because the
 * platform emits them automatically. The fields that need a person to sit down
 * and write them — where the data came from, what the licence permits, what the
 * known limitations are — are the ones that come back empty.
 *
 * Nothing here is scored by hand. The figures shown in the UI come from
 * computeCoverage() in src/lib/coverage/rules.ts, the same function the catalog
 * uses, so this section cannot drift from the published methodology.
 */

import type { CheckResult, CoverageDetail, CoverageSectionKey } from '@/lib/coverage/rules';

export const SPECIMEN_DETAIL: CoverageDetail = {
  // Origin & Sourcing — who assembled it, and from what
  publisher_identified: 'documented',
  publisher_is_organisation: 'documented',
  upstream_sources_declared: 'not_found',
  collection_method_described: 'not_found',
  collection_timeframe_stated: 'not_found',
  annotation_process_described: 'not_found',
  maintainer_contact_listed: 'reported',

  // Licensing & Terms — a licence tag, and almost nothing behind it
  license_declared: 'documented',
  license_file_present: 'not_found',
  license_spdx_recognised: 'reported',
  commercial_terms_stated: 'not_found',
  attribution_terms_stated: 'not_found',
  redistribution_terms_stated: 'not_found',
  upstream_license_noted: 'not_found',

  // Composition & Structure — emitted by the platform, so nearly complete
  description_present: 'documented',
  schema_documented: 'documented',
  splits_documented: 'documented',
  row_count_available: 'documented',
  file_manifest_available: 'documented',
  file_sizes_available: 'documented',
  sample_records_available: 'reported',

  // Maintenance & Usage — timestamps yes, intent and limitations no
  last_modified_known: 'documented',
  version_history_available: 'documented',
  release_notes_available: 'not_found',
  citation_provided: 'not_found',
  usage_statistics_available: 'documented',
  known_limitations_documented: 'not_found',
  intended_use_documented: 'not_found',
};

/** Outcome presentation. Observation, never judgement — see rules.ts. */
export const RESULT_PRESENTATION: Record<
  Exclude<CheckResult, 'n/a'>,
  { label: string; token: string; struck: boolean }
> = {
  documented: { label: 'Documented', token: '--tier-verified', struck: false },
  reported: { label: 'Partially stated', token: '--tier-inferred', struck: false },
  not_found: { label: 'Not documented', token: '--tier-asserted', struck: true },
};

export interface RiskProbe {
  id: string;
  title: string;
  body: string;
  /** The section whose checks bear on this risk. */
  section: CoverageSectionKey;
  /** Shown when the probe is active. */
  connection: string;
}

/**
 * The three claims, each pointing at the named checks that would have caught it.
 * This is what turns a generic complaint into an argument.
 */
export const RISK_PROBES: RiskProbe[] = [
  {
    id: 'wrong-answers',
    title: 'Wrong answers ship',
    body: 'Outdated or dirty data reaches production, and the model hallucinates with confidence.',
    section: 'composition',
    connection: 'Seven checks describe what is inside a dataset and how it is organised.',
  },
  {
    id: 'licenses-late',
    title: 'Licences surface too late',
    body: 'Commercial restrictions get discovered after training, not before.',
    section: 'licensing',
    connection: 'Seven checks cover the terms a publisher attached to reuse.',
  },
  {
    id: 'weeks-gone',
    title: 'Weeks disappear',
    body: 'Searching, validating, and cleaning eats the time you meant to spend building.',
    section: 'origin',
    connection: 'Seven checks answer where the data came from and who assembled it.',
  },
];
