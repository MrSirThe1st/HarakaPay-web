import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Add other Next.js config options below as needed
  experimental: {
    // Add any experimental features you're using
  },

  // Enable gzip/brotli compression
  compress: true,

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
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=60, stale-while-revalidate=300',
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
  // Re-enable ESLint during builds now that we're fixing issues
  eslint: {
    ignoreDuringBuilds: false,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  // Webpack configuration for optimized code splitting
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Optimize client-side bundle splitting
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            // Separate vendor chunks for better caching
            default: false,
            vendors: false,
            // Framework chunk (React, React-DOM)
            framework: {
              name: 'framework',
              chunks: 'all',
              test: /(?<!node_modules.*)[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/,
              priority: 40,
              enforce: true,
            },
            // Supabase chunk
            supabase: {
              name: 'supabase',
              test: /[\\/]node_modules[\\/](@supabase)[\\/]/,
              priority: 30,
              reuseExistingChunk: true,
            },
            // Radix UI chunk
            radix: {
              name: 'radix-ui',
              test: /[\\/]node_modules[\\/](@radix-ui)[\\/]/,
              priority: 30,
              reuseExistingChunk: true,
            },
            // Heroicons chunk
            heroicons: {
              name: 'heroicons',
              test: /[\\/]node_modules[\\/](@heroicons)[\\/]/,
              priority: 25,
              reuseExistingChunk: true,
            },
            // Headless UI chunk
            headlessui: {
              name: 'headlessui',
              test: /[\\/]node_modules[\\/](@headlessui)[\\/]/,
              priority: 25,
              reuseExistingChunk: true,
            },
            // CSV parser chunk (papaparse if used)
            csv: {
              name: 'csv-parser',
              test: /[\\/]node_modules[\\/](papaparse)[\\/]/,
              priority: 20,
              reuseExistingChunk: true,
            },
            // Common vendor chunk for other libraries
            lib: {
              name: 'lib',
              minChunks: 2,
              priority: 20,
              reuseExistingChunk: true,
            },
            // Common chunk for shared code
            common: {
              name: 'common',
              minChunks: 2,
              priority: 10,
              reuseExistingChunk: true,
            },
          },
        },
      };
    }
    return config;
  },
};

export default nextConfig;
