// SEO Metadata Configuration
// Centralized metadata management for consistent SEO across the application

import type { Metadata } from 'next';

// Base URL - Update this with your production domain
export const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://harakapay.com';
export const SITE_NAME = 'HarakaPay';
export const COMPANY_NAME = 'HarakaPay Inc.';

// Default metadata that applies to all pages
export const DEFAULT_METADATA = {
  metadataBase: new URL(BASE_URL),
  applicationName: SITE_NAME,
  authors: [{ name: COMPANY_NAME }],
  generator: 'Next.js',
  keywords: [
    'school fee management',
    'student payment system',
    'school management software',
    'fee collection platform',
    'gestion frais scolaires',
    'paiement frais école',
    'système de paiement scolaire',
    'Congo',
    'DRC',
    'Africa',
    'education payment',
    'school payments',
    'tuition management',
  ],
  creator: COMPANY_NAME,
  publisher: COMPANY_NAME,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  robots: 'index, follow',
};

// Default Open Graph configuration
export const DEFAULT_OG = {
  siteName: SITE_NAME,
  locale: 'fr_FR',
  alternateLocale: ['en_US'],
  type: 'website' as const,
};

// Default Twitter Card configuration
export const DEFAULT_TWITTER = {
  card: 'summary_large_image' as const,
  creator: '@harakapay', // Update with your Twitter handle
  site: '@harakapay',
};

interface PageMetadataParams {
  title: string;
  description: string;
  keywords?: string[];
  ogImage?: string;
  ogType?: 'website' | 'article';
  canonicalUrl?: string;
  noIndex?: boolean;
}

/**
 * Generate metadata for a specific page
 * @param params - Page-specific metadata parameters
 * @returns Complete Metadata object for Next.js
 */
export function generateMetadata({
  title,
  description,
  keywords = [],
  ogImage = '/og-image.png',
  ogType = 'website',
  canonicalUrl,
  noIndex = false,
}: PageMetadataParams): Metadata {
  const fullTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;
  const url = canonicalUrl ? `${BASE_URL}${canonicalUrl}` : BASE_URL;
  const imageUrl = ogImage.startsWith('http') ? ogImage : `${BASE_URL}${ogImage}`;

  return {
    ...DEFAULT_METADATA,
    title: fullTitle,
    description,
    keywords: [...DEFAULT_METADATA.keywords, ...keywords],
    alternates: {
      canonical: url,
      languages: {
        'fr-FR': url,
        'en-US': url.replace('/fr', '/en'), // Adjust based on your URL structure
      },
    },
    openGraph: {
      ...DEFAULT_OG,
      title: fullTitle,
      description,
      url,
      type: ogType,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      ...DEFAULT_TWITTER,
      title: fullTitle,
      description,
      images: [imageUrl],
    },
    robots: noIndex ? 'noindex, nofollow' : DEFAULT_METADATA.robots,
  };
}

// Pre-configured metadata for common pages
export const HOME_METADATA = generateMetadata({
  title: 'School Fee Management Made Simple',
  description:
    'HarakaPay is the leading school fee management platform in Africa. Streamline payments, track fees, and connect with parents seamlessly. Trusted by schools across Congo and beyond.',
  keywords: [
    'payment tracking',
    'student management',
    'fee automation',
    'mobile money integration',
    'M-Pesa',
    'African schools',
  ],
  canonicalUrl: '/',
});

export const LOGIN_METADATA = generateMetadata({
  title: 'Login',
  description: 'Sign in to your HarakaPay account to manage school fees, track payments, and access your dashboard.',
  canonicalUrl: '/login',
  noIndex: true, // Don't index login pages
});

export const REGISTER_METADATA = generateMetadata({
  title: 'Register Your School',
  description:
    'Join hundreds of schools using HarakaPay for fee management. Register now and start managing school payments efficiently.',
  keywords: ['school registration', 'sign up', 'create account'],
  canonicalUrl: '/register',
});

export const DASHBOARD_METADATA = generateMetadata({
  title: 'Dashboard',
  description: 'Access your HarakaPay dashboard to manage school fees, students, and payments.',
  canonicalUrl: '/school/dashboard',
  noIndex: true, // Don't index protected pages
});

// Metadata for admin pages (no index)
export const ADMIN_METADATA = generateMetadata({
  title: 'Admin Dashboard',
  description: 'HarakaPay admin dashboard',
  noIndex: true,
});
