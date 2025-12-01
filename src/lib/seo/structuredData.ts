// Structured Data (JSON-LD) Schemas
// Used for rich snippets in search results

import { BASE_URL, SITE_NAME, COMPANY_NAME } from './metadata';

/**
 * Organization Schema
 * Helps search engines understand your business
 */
export function getOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: COMPANY_NAME,
    legalName: COMPANY_NAME,
    url: BASE_URL,
    logo: `${BASE_URL}/logo.png`,
    foundingDate: '2023', // Update with actual founding date
    description:
      'HarakaPay is a comprehensive school fee management platform serving educational institutions across Africa.',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'CD', // Congo
      // Add more address details if available
    },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Support',
      email: 'support@harakapay.com', // Update with actual email
      availableLanguage: ['French', 'English'],
    },
    sameAs: [
      // Add your social media profiles
      'https://twitter.com/harakapay',
      'https://facebook.com/harakapay',
      'https://linkedin.com/company/harakapay',
    ],
  };
}

/**
 * Software Application Schema
 * For the main product
 */
export function getSoftwareApplicationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: SITE_NAME,
    applicationCategory: 'BusinessApplication',
    applicationSubCategory: 'Education Management',
    operatingSystem: 'Web Browser',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      priceValidUntil: '2025-12-31',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '150', // Update with actual data
      bestRating: '5',
      worstRating: '1',
    },
    description:
      'School fee management platform that streamlines payment collection, tracks fees, and connects schools with parents seamlessly.',
    featureList: [
      'Fee Management',
      'Payment Processing',
      'Student Management',
      'Parent Portal',
      'Mobile Money Integration',
      'Receipt Generation',
      'Payment Plans',
      'Real-time Notifications',
    ],
    screenshot: `${BASE_URL}/screenshots/dashboard.png`,
    url: BASE_URL,
    author: {
      '@type': 'Organization',
      name: COMPANY_NAME,
    },
  };
}

/**
 * Website Schema
 * Basic website information
 */
export function getWebsiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: BASE_URL,
    description: 'School fee management platform for modern educational institutions',
    inLanguage: ['fr-FR', 'en-US'],
    potentialAction: {
      '@type': 'SearchAction',
      target: `${BASE_URL}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };
}

/**
 * FAQ Page Schema
 * For the FAQ section
 */
export function getFAQPageSchema(faqs: Array<{ question: string; answer: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

/**
 * Breadcrumb Schema
 * For navigation breadcrumbs
 */
export function getBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${BASE_URL}${item.url}`,
    })),
  };
}

/**
 * Local Business Schema (if you have physical locations)
 */
export function getLocalBusinessSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': BASE_URL,
    name: COMPANY_NAME,
    image: `${BASE_URL}/logo.png`,
    url: BASE_URL,
    telephone: '+243-XXX-XXX-XXX', // Update with actual phone
    priceRange: '$$',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Your Street Address', // Update
      addressLocality: 'Kinshasa', // Update
      addressRegion: 'Kinshasa', // Update
      postalCode: 'XXXXX', // Update
      addressCountry: 'CD',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: -4.3276, // Update with actual coordinates
      longitude: 15.3136,
    },
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '08:00',
      closes: '18:00',
    },
  };
}

/**
 * Product Schema (for specific features/plans)
 */
export function getProductSchema(product: {
  name: string;
  description: string;
  price: string;
  currency: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: product.currency,
      availability: 'https://schema.org/InStock',
      url: BASE_URL,
    },
  };
}

/**
 * Helper function to render JSON-LD script tag
 */
export function renderJsonLd(data: Record<string, unknown> | Array<Record<string, unknown>>) {
  return {
    __html: JSON.stringify(data),
  };
}
