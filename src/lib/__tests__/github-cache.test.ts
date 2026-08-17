import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/cache", () => ({
  getCachedJson: vi.fn(),
  setCachedJson: vi.fn(),
}));

vi.mock("@/lib/sources/fetcher", () => ({
  MAX_README_BYTES: 100_000,
  sourceFetch: vi.fn(),
}));

import { getCachedJson, setCachedJson } from "@/lib/cache";
import { sourceFetch } from "@/lib/sources/fetcher";
import { github } from "@/lib/sources/github";

const mockGetCachedJson = vi.mocked(getCachedJson);
const mockSetCachedJson = vi.mocked(setCachedJson);
const mockSourceFetch = vi.mocked(sourceFetch);

function mockSuccessfulGitHubFetches() {
  // 1. Main repository request
  mockSourceFetch.mockResolvedValueOnce({
    ok: true,
    status: 200,
    notModified: false,
    etag: '"repo-etag"',
    text: null,
    rateLimitRemaining: null,
    json: {
      full_name: "facebook/react",
      name: "react",
      description: "A JavaScript library for building user interfaces",
      html_url: "https://github.com/facebook/react",
      owner: {
        type: "Organization",
      },
      default_branch: "main",
      fork: false,
      archived: false,
      has_issues: true,
      size: 1000,
      created_at: "2013-05-24T16:15:54Z",
      pushed_at: "2026-01-01T00:00:00Z",
      updated_at: "2026-01-01T00:00:00Z",
      stargazers_count: 200000,
    },
  });

  // 2. License
  mockSourceFetch.mockResolvedValueOnce({
    ok: true,
    status: 200,
    notModified: false,
    etag: null,
    text: null,
    rateLimitRemaining: null,
    json: {
      license: {
        spdx_id: "MIT",
      },
    },
  });

  // 3. README
  mockSourceFetch.mockResolvedValueOnce({
    ok: true,
    status: 200,
    notModified: false,
    etag: null,
    text: null,
    rateLimitRemaining: null,
    json: {
      content: Buffer.from(
        "# React\n\nIntended use: building user interfaces.",
      ).toString("base64"),
    },
  });

  // 4. Repository tree
  mockSourceFetch.mockResolvedValueOnce({
    ok: true,
    status: 200,
    notModified: false,
    etag: null,
    text: null,
    rateLimitRemaining: null,
    json: {
      tree: [
        {
          type: "blob",
          path: "README.md",
          size: 1000,
        },
        {
          type: "blob",
          path: "LICENSE",
          size: 1000,
        },
      ],
    },
  });

  // 5. Commits
  mockSourceFetch.mockResolvedValueOnce({
    ok: true,
    status: 200,
    notModified: false,
    etag: null,
    text: null,
    rateLimitRemaining: null,
    json: [
      {
        sha: "abc123",
      },
    ],
  });

  // 6. Releases
  mockSourceFetch.mockResolvedValueOnce({
    ok: true,
    status: 200,
    notModified: false,
    etag: null,
    text: null,
    rateLimitRemaining: null,
    json: [],
  });
}

describe("GitHub Redis caching", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches from GitHub and caches the result on a cache miss", async () => {
    mockGetCachedJson.mockResolvedValue(null);
    mockSetCachedJson.mockResolvedValue(undefined);

    mockSuccessfulGitHubFetches();

    const result = await github.ingest("facebook/react", {
      etag: undefined,
    });

    expect(result.outcome).toBe("ok");

    // Main request + 5 secondary GitHub requests.
    expect(mockSourceFetch).toHaveBeenCalledTimes(6);

    expect(mockSetCachedJson).toHaveBeenCalledTimes(1);

    expect(mockSetCachedJson).toHaveBeenCalledWith(
      "github:ingest:facebook/react",
      expect.objectContaining({
        outcome: "ok",
      }),
      3600,
    );
  });

  it("returns cached data without calling GitHub on a cache hit", async () => {
    const cachedResult = {
      outcome: "ok" as const,
      record: {} as never,
      coverage: {} as never,
      lineage: {} as never,
      etag: '"cached-etag"',
    };

    mockGetCachedJson.mockResolvedValue(cachedResult);

    const result = await github.ingest("facebook/react", {
      etag: undefined,
    });

    expect(result).toBe(cachedResult);

    // This is the most important cache-hit assertion:
    expect(mockSourceFetch).not.toHaveBeenCalled();

    // We already had the data, so don't write it again.
    expect(mockSetCachedJson).not.toHaveBeenCalled();
  });

  it("continues using GitHub when Redis is unavailable", async () => {
    mockGetCachedJson.mockRejectedValue(
      new Error("Redis unavailable"),
    );

    // Also simulate Redis failing when we try to write.
    mockSetCachedJson.mockRejectedValue(
      new Error("Redis unavailable"),
    );

    mockSuccessfulGitHubFetches();

    const result = await github.ingest("facebook/react", {
      etag: undefined,
    });

    // Redis failed, but the actual feature still works.
    expect(result.outcome).toBe("ok");

    expect(mockSourceFetch).toHaveBeenCalledTimes(6);

    expect(mockSetCachedJson).toHaveBeenCalledTimes(1);
  });
});