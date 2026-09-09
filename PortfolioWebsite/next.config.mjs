/** @type {import('next').NextConfig} */
const nextConfig = {
  images: { unoptimized: true },
  distDir: process.env.PORTFOLIO_BUILD_DIR || ".next",
  poweredByHeader: false
};
export default nextConfig;
