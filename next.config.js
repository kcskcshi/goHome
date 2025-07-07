const isProd = process.env.NODE_ENV === 'production';

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: isProd ? '/go-home' : '',
  assetPrefix: isProd ? '/go-home/' : '',
};

module.exports = nextConfig; 