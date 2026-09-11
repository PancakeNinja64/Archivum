import type { MetadataRoute } from "next";
import { getAllSlugs } from "@/lib/api/client";

export const dynamic = "force-static";

const BASE = "https://archivum.tech";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (process.env.NEXT_PUBLIC_DATA_SOURCE !== "supabase") return [];
  const slugs = await getAllSlugs().catch(() => []);
  const staticRoutes = ["", "explore", "delisted", "docs", "pricing", "publish"].map((p) => ({
    url: `${BASE}/${p ? `${p}/` : ""}`,
  }));
  return [...staticRoutes, ...slugs.map((s) => ({ url: `${BASE}/datasets/${s}/` }))];
}
