import * as NextMdx from '@next/mdx';

/** @type {import('next').NextConfig} */
const nextConfig = {
  swcMinify: true,
  webpack: (config) => {
    config.experiments = {
      asyncWebAssembly: true,
      topLevelAwait: true,
      layers: true, // optional, with some bundlers/frameworks it doesn't work without
    };

    return config;
  },
  pageExtensions: ['jsx', 'js', 'ts', 'tsx', 'mdx'],
};

const withMDX = NextMdx.default({
  extension: /\.mdx?$/,
});

export default withMDX(nextConfig);
