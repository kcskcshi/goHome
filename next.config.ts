import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  assetPrefix: '',
  basePath: '',
  experimental: {
    esmExternals: false,
  },
};

export default nextConfig;
