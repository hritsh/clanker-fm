import pkg from "@cloudflare/next-on-pages";
const { withCloudflarePages } = pkg;

/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	experimental: { appDir: true },
};

export default withCloudflarePages(nextConfig);
