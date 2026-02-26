/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  images: { unoptimized: true },
  trailingSlash: true,   // important for SPA fallback
};
module.exports = nextConfig;
