import { describe, expect, it } from "vitest";
import { optionalDate, optionalNumber, rowDataset, rowSummary } from "../api/adapters/normalize";

describe("catalog metadata boundaries", () => {
  it("preserves measured zero while keeping missing or invalid counts unknown", () => {
    expect(optionalNumber(0)).toBe(0);
    for (const value of [undefined, null, "0", -1, NaN, Infinity]) {
      expect(optionalNumber(value)).toBeNull();
    }
    expect(rowSummary({ size_rows: 0 }).sizeRows).toBe(0);
    expect(rowSummary({}).sizeRows).toBeNull();
    expect(rowSummary({}).sizeBytes).toBeNull();
  });

  it("does not manufacture an observation date", () => {
    for (const value of [undefined, null, "", "not a date"]) {
      expect(optionalDate(value)).toBeNull();
    }
    expect(optionalDate("2026-08-01T12:30:00Z")).toBe("2026-08-01T12:30:00Z");
    expect(rowSummary({}).coverageCheckedAt).toBeNull();
    expect(rowDataset({}, []).firstPublished).toBeNull();
  });

  it("keeps unmeasured historical deltas separate from observed zero changes", () => {
    const dataset = rowDataset({}, [
      { version_label: "unmeasured" },
      { version_label: "unchanged", rows_added: 0, rows_removed: 0, coverage_total: 0 },
    ]);
    expect(dataset.versions[0]).toMatchObject({ date: null, rowsAdded: null, rowsRemoved: null, coverageTotal: null });
    expect(dataset.versions[1]).toMatchObject({ rowsAdded: 0, rowsRemoved: 0, coverageTotal: 0 });
    expect(dataset.coverageSections).toEqual([]);
    expect(dataset.lineage.nodes).toEqual([]);
  });
});
