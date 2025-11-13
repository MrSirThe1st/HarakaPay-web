import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Add other Next.js config options below as needed
  experimental: {
    // Add any experimental features you're using
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'apdeuckmufukrnuffetv.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  // Temporarily ignore ESLint errors during build for MVP
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Temporarily ignore TypeScript errors during build for MVP
  typescript: {
    ignoreBuildErrors: false, // Keep TypeScript errors, just ignore ESLint
  },
};

export default nextConfig;
