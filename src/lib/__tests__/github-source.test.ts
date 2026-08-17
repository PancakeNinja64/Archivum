import { describe, expect, it } from "vitest";
import { github } from "@/lib/sources/github";

describe("GitHub source identifier parsing", () => {
  it("accepts normal owner/repository identifiers", () => {
    expect(github.parseIdentifier("facebook/react")).toBe("facebook/react");
  });

  it("normalizes GitHub URLs", () => {
    expect(
      github.parseIdentifier("https://github.com/facebook/react"),
    ).toBe("facebook/react");

    expect(
      github.parseIdentifier("https://github.com/facebook/react.git"),
    ).toBe("facebook/react");
  });

  it("rejects malformed repository identifiers", () => {
    expect(github.parseIdentifier("facebook")).toBeNull();
    expect(github.parseIdentifier("facebook/react/extra")).toBeNull();
    expect(github.parseIdentifier("")).toBeNull();
  });
});