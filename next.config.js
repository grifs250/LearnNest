const webpack = require('webpack');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [],
    unoptimized: process.env.NODE_ENV === 'development',
  },
  experimental: {
    serverActions: {
      enabled: true,
    },
    optimizePackageImports: ['lucide-react'],
  },
  webpack: (config) => {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        crypto: require.resolve('crypto-browserify'),
        stream: require.resolve('stream-browserify'),
        buffer: require.resolve('buffer'),
        os: require.resolve('os-browserify/browser'),
        path: require.resolve('path-browserify'),
        constants: require.resolve('constants-browserify'),
        assert: require.resolve('assert/'),
        util: require.resolve('util/'),
        process: require.resolve('process/browser'),
        events: require.resolve('events/'),
      };

    // Optimize SVG imports
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });

    return config;
  },
  // Temporarily ignore TypeScript errors during build
  // This is a workaround for the Next.js 14+ App Router params/searchParams typing issue
  typescript: {
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;
