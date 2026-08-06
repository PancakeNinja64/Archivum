import type { MetadataRoute } from "next";
import { getAllSlugs } from "@/lib/api/client";

export const dynamic = "force-static";

// TODO: replace with the real production domain before launch.
const BASE = "https://archivum.example";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const slugs = await getAllSlugs();
  const staticRoutes = ["", "explore", "docs", "pricing", "publish", "dashboard"].map((p) => ({
    url: `${BASE}/${p ? `${p}/` : ""}`,
    lastModified: new Date(),
  }));
  return [...staticRoutes, ...slugs.map((s) => ({ url: `${BASE}/datasets/${s}/`, lastModified: new Date() }))];
}
