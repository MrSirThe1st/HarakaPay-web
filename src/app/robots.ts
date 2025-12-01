// Dynamic robots.txt generation
// Next.js 15 App Router approach

import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://harakapay.com';

  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/login',
          '/register',
          '/reset',
        ],
        disallow: [
          '/admin/*',
          '/school/*',
          '/parent/*',
          '/shared/*',
          '/api/*',
          '/*?*', // Disallow URLs with query parameters to avoid duplicate content
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: [
          '/',
          '/login',
          '/register',
        ],
        disallow: [
          '/admin/*',
          '/school/*',
          '/parent/*',
          '/api/*',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
