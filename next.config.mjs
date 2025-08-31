import { withCloudflarePages } from "@cloudflare/next-on-pages";
/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	experimental: { appDir: true },
	// …any other Next.js options you need
};
export default withCloudflarePages(nextConfig);
