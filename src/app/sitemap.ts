// Dynamic sitemap.xml generation
// Next.js 15 App Router approach

import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://harakapay.com';
  const currentDate = new Date();

  // Public pages that should be indexed
  const routes = [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/register`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/reset`,
      lastModified: currentDate,
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    },
  ];

  // Future: Add dynamic routes here
  // For example, if you add a blog:
  // const blogPosts = await getBlogPosts();
  // blogPosts.forEach(post => {
  //   routes.push({
  //     url: `${baseUrl}/blog/${post.slug}`,
  //     lastModified: post.updatedAt,
  //     changeFrequency: 'monthly',
  //     priority: 0.6,
  //   });
  // });

  return routes;
}
