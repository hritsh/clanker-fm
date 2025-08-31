import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    // Enable edge runtime for API routes when deploying to Cloudflare
    runtime: process.env.CF_PAGES ? 'edge' : 'nodejs',
  },
  // Ensure compatibility with Cloudflare Pages
  env: {
    // Expose build-time environment variables
    CF_PAGES: process.env.CF_PAGES,
  },
};

export default nextConfig;