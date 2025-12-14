import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Add other Next.js config options below as needed
  experimental: {
    // Add any experimental features you're using
  },

  // Set workspace root to silence multiple lockfile warning
  outputFileTracingRoot: '/Users/marcim/HarakaPay-web',

  // Enable gzip/brotli compression
  compress: true,

  // Turbopack is now the default in Next.js 16
  // Setting empty config to acknowledge migration from webpack
  turbopack: {},

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'apdeuckmufukrnuffetv.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
    // Optimize images
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Add caching headers for better performance
  async headers() {
    return [
      {
        // Only cache public API endpoints
        source: '/api/public/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=60, stale-while-revalidate=300',
          },
        ],
      },
      {
        // Auth-dependent endpoints: no cache
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, must-revalidate',
          },
        ],
      },
      {
        source: '/:all*(svg|jpg|jpeg|png|gif|ico|webp)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
  // Production optimizations
  compiler: {
    // Remove console.* in production for better performance and security
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'], // Keep error and warn in production
    } : false,
  },
  // TypeScript configuration
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
