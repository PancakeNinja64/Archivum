import { describe, expect, it } from "vitest";
import { readmeSignals } from "@/lib/sources/readme-signals";

describe("readmeSignals", () => {
    it("detects common dataset documentation signals", () => {
        const readme = `
          # Example Dataset
      
          This dataset was derived from an upstream corpus.
      
          Collection timeframe: 2021-2023.
          Samples were annotated by human reviewers.
      
          ## Intended Use
          This dataset is intended for text classification research.
      
          ## Limitations
          Known limitations include demographic bias.
      
          ## Citation
          Please cite this dataset when using it.
      
          ## License
          Commercial use is permitted with attribution.
        `;
      
        const result = readmeSignals(readme);
      
        expect(result.upstreamSources).toBe(true);
        expect(result.collectionTimeframe).toBe(true);
        expect(result.annotationProcess).toBe(true);
        expect(result.intendedUse).toBe(true);
        expect(result.limitations).toBe(true);
        expect(result.citation).toBe(true);
        expect(result.licenseMention).toBe(true);
      });

  it("does not report documentation signals for empty input", () => {
    const result = readmeSignals(null);

    expect(result.citation).toBe(false);
    expect(result.intendedUse).toBe(false);
    expect(result.licenseMention).toBe(false);
  });
});