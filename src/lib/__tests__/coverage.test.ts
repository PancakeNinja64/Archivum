import { describe, expect, it } from "vitest";
import {
  computeCoverage,
  coverageBand,
  type CoverageDetail,
} from "@/lib/coverage/rules";

describe("computeCoverage", () => {
  it("returns 100 when every check is documented", () => {
    const detail: CoverageDetail = {
      publisher_identified: "documented",
      publisher_is_organisation: "documented",
      upstream_sources_declared: "documented",
      collection_method_described: "documented",
      collection_timeframe_stated: "documented",
      annotation_process_described: "documented",
      maintainer_contact_listed: "documented",

      license_declared: "documented",
      license_file_present: "documented",
      license_spdx_recognised: "documented",
      commercial_terms_stated: "documented",
      attribution_terms_stated: "documented",
      redistribution_terms_stated: "documented",
      upstream_license_noted: "documented",

      description_present: "documented",
      schema_documented: "documented",
      splits_documented: "documented",
      row_count_available: "documented",
      file_manifest_available: "documented",
      file_sizes_available: "documented",
      sample_records_available: "documented",

      last_modified_known: "documented",
      version_history_available: "documented",
      release_notes_available: "documented",
      citation_provided: "documented",
      usage_statistics_available: "documented",
      known_limitations_documented: "documented",
      intended_use_documented: "documented",
    };

    const result = computeCoverage(detail);

    expect(result.total).toBe(100);
    expect(result.sections).toHaveLength(4);
  });

  it("gives reported checks half credit", () => {
    const detail: CoverageDetail = {
      publisher_identified: "reported",
      publisher_is_organisation: "reported",
      upstream_sources_declared: "reported",
      collection_method_described: "reported",
      collection_timeframe_stated: "reported",
      annotation_process_described: "reported",
      maintainer_contact_listed: "reported",
    };

    const result = computeCoverage(detail);

    const origin = result.sections.find(
      (section) => section.key === "origin",
    );

    expect(origin?.score).toBe(50);
  });
});

describe("coverageBand", () => {
  it("uses the expected coverage boundaries", () => {
    expect(coverageBand(39)).toBe("Minimal");
    expect(coverageBand(40)).toBe("Partial");
    expect(coverageBand(74)).toBe("Partial");
    expect(coverageBand(75)).toBe("Extensive");
  });
});