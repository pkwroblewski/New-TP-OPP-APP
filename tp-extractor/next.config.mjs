/** @type {import('next').NextConfig} */
const nextConfig = {
  // Turbopack config (Next.js 16+ default)
  turbopack: {},
  // Webpack fallback for non-Turbopack builds
  webpack: (config) => {
    // Handle react-pdf/pdfjs compatibility
    config.resolve.alias.canvas = false;
    return config;
  },
};

export default nextConfig;
