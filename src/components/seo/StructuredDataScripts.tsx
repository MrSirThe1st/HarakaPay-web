// Structured Data Scripts Component
// Renders JSON-LD scripts for SEO

import Script from 'next/script';
import {
  getOrganizationSchema,
  getSoftwareApplicationSchema,
  getWebsiteSchema,
  renderJsonLd,
} from '@/lib/seo/structuredData';

/**
 * Global structured data that appears on all pages
 */
export function GlobalStructuredData() {
  const organizationSchema = getOrganizationSchema();
  const websiteSchema = getWebsiteSchema();

  return (
    <>
      <Script
        id="organization-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={renderJsonLd(organizationSchema)}
      />
      <Script
        id="website-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={renderJsonLd(websiteSchema)}
      />
    </>
  );
}

/**
 * Homepage specific structured data
 */
export function HomePageStructuredData() {
  const softwareSchema = getSoftwareApplicationSchema();

  return (
    <Script
      id="software-application-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={renderJsonLd(softwareSchema)}
    />
  );
}

/**
 * FAQ Page structured data
 */
interface FAQStructuredDataProps {
  faqs: Array<{ question: string; answer: string }>;
}

export function FAQStructuredData({ faqs }: FAQStructuredDataProps) {
  const faqSchema = {
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

  return (
    <Script
      id="faq-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={renderJsonLd(faqSchema)}
    />
  );
}

/**
 * Breadcrumb structured data
 */
interface BreadcrumbStructuredDataProps {
  items: Array<{ name: string; url: string }>;
}

export function BreadcrumbStructuredData({ items }: BreadcrumbStructuredDataProps) {
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <Script
      id="breadcrumb-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={renderJsonLd(breadcrumbSchema)}
    />
  );
}
