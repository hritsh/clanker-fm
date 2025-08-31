const { withCloudflarePages } = require('@cloudflare/next-on-pages')
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: { appDir: true },
  // …any other Next.js options you need
}
module.exports = withCloudflarePages(nextConfig)