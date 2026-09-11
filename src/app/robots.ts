import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: process.env.NEXT_PUBLIC_DATA_SOURCE === "supabase" ? { userAgent: "*", allow: "/", disallow: ["/dashboard/", "/admin/", "/api/"] } : { userAgent: "*", disallow: "/" },
    sitemap: "https://archivum.tech/sitemap.xml",
  };
}
