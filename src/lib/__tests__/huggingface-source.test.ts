import { describe, expect, it } from "vitest";
import { huggingface } from "@/lib/sources/huggingface";

describe("Hugging Face source identifier parsing", () => {
  it("accepts owner/dataset identifiers", () => {
    expect(
      huggingface.parseIdentifier("openai/example-dataset"),
    ).toBe("openai/example-dataset");
  });

  it("normalizes Hugging Face dataset URLs", () => {
    expect(
      huggingface.parseIdentifier(
        "https://huggingface.co/datasets/openai/example-dataset",
      ),
    ).toBe("openai/example-dataset");
  });

  it("accepts canonical single-name datasets", () => {
    expect(huggingface.parseIdentifier("squad")).toBe("squad");
  });

  it("rejects malformed identifiers", () => {
    expect(
      huggingface.parseIdentifier("owner/dataset/extra"),
    ).toBeNull();

    expect(huggingface.parseIdentifier("")).toBeNull();
  });
});