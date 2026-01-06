/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    // Handle react-pdf/pdfjs compatibility
    config.resolve.alias.canvas = false;
    return config;
  },
};

export default nextConfig;
