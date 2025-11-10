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
};

export default nextConfig;
