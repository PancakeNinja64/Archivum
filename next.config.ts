import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * Server-rendered application. The static export from the marketing-only
   * era is gone: Supabase auth (cookies), admin ingestion, and API routes
   * all require a server.
   */
  trailingSlash: true,

  // Produces a minimal production server for Docker deployments.
  output: process.env.VERCEL ? undefined : "standalone",
};

export default nextConfig;