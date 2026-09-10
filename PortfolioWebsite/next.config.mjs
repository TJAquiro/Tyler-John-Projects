/** @type {import('next').NextConfig} */
const nextConfig = {
  images: { unoptimized: true },
  distDir: process.env.PORTFOLIO_BUILD_DIR || ".next",
  poweredByHeader: false,
  async rewrites() {
    return process.env.PORTFOLIO_UPLOAD_DIR ? { beforeFiles: [{ source: "/images/:file([a-f0-9-]{36}\\.(?:png|jpg|webp))", destination: "/api/qa-image/:file" }] } : [];
  }
};
export default nextConfig;
