import type { NextConfig } from "next";

const nextConfig: NextConfig = { 
  /* config options here */
  i18n: {
    locales: ['fr', 'en'], // Supported locales
    defaultLocale: 'fr', // Default locale (French for Congo)
    // Add this line to hide prefix for default locale

    //  localeDetection: false,
  },
  // Add other Next.js config options below as needed
  experimental: {
    // Add any experimental features you're using
  },
};

export default nextConfig;
