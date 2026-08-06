import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * Static export. `npm run build` emits a fully static site to ./out
   * that can be served from any static host (Vercel, Netlify, Cloudflare
   * Pages, S3 + CloudFront, GitHub Pages) with no Node server.
   */
  output: "export",

  /** The default image optimizer needs a server; static export cannot use it. */
  images: { unoptimized: true },

  /** Emits /about/index.html rather than /about.html — safer across static hosts. */
  trailingSlash: true,
};

export default nextConfig;
