import { withCloudflarePages } from '@cloudflare/next-on-pages'
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};

export default withCloudflarePages(nextConfig)