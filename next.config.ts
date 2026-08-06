import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * Server-rendered application. The static export from the marketing-only
   * era is gone: Supabase auth (cookies), admin ingestion, and API routes
   * all require a server.
   */
  trailingSlash: true,
};

export default nextConfig;
