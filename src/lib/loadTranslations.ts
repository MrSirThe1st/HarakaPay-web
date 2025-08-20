import { Translations } from './i18n';

// Import French translations
import frCommon from './translations.fr.json';
import frAuth from './fr/auth.json';
import frDashboard from './fr/dashboard.json';
import frStudents from './fr/students.json';
import frPayments from './fr/payments.json';

// Import English translations
import enCommon from './translations.en.json';
import enAuth from './en/auth.json';
import enDashboard from './en/dashboard.json';
import enStudents from './en/students.json';
import enPayments from './en/payments.json';

// Combine all translations for static loading
export const translations: Record<string, Translations> = {
  fr: {
    ...frCommon,
    ...frAuth,
    ...frDashboard,
    ...frStudents,
    ...frPayments,
  },
  en: {
    ...enCommon,
    ...enAuth,
    ...enDashboard,
    ...enStudents,
    ...enPayments,
  }
};

// Dynamic loading function for better performance (code splitting)
export async function loadTranslations(locale: string): Promise<Translations> {
  try {
    // Dynamic imports for better code splitting
    const [common, auth, dashboard, students, payments] = await Promise.all([
      import(`./translations.${locale}.json`),
      import(`./${locale}/auth.json`),
      import(`./${locale}/dashboard.json`),
      import(`./${locale}/students.json`),
      import(`./${locale}/payments.json`),
    ]);
    
    return {
      ...common.default,
      ...auth.default,
      ...dashboard.default,
      ...students.default,
      ...payments.default,
    };
  } catch (error) {
    console.warn(`Failed to load translations for locale: ${locale}`, error);
    // Fallback to French if the locale doesn't exist
    if (locale !== 'fr') {
      return loadTranslations('fr');
    }
    throw error;
  }
}

// Server-side translation loading for getStaticProps/getServerSideProps
export function getTranslationsForLocale(locale: string): Translations {
  return translations[locale] || translations['fr'];
}

// Helper function to get available locales
export function getAvailableLocales(): string[] {
  return Object.keys(translations);
}

// Helper function to check if a locale is supported
export function isLocaleSupported(locale: string): boolean {
  return getAvailableLocales().includes(locale);
}

// Helper function to get namespace-specific translations
export function getNamespaceTranslations(locale: string, namespace: string): string | Translations {
  const allTranslations = getTranslationsForLocale(locale);
  return allTranslations[namespace] || {};
}

// Helper function for loading translations in Next.js pages
export async function getStaticTranslations(locale: string = 'fr') {
  return {
    props: {
      translations: {
        [locale]: getTranslationsForLocale(locale)
      }
    }
  };
}

// Export individual namespaces for direct access if needed
export const frenchTranslations = {
  common: frCommon,
  auth: frAuth,
  dashboard: frDashboard,
  students: frStudents,
  payments: frPayments,
};

export const englishTranslations = {
  common: enCommon,
  auth: enAuth,
  dashboard: enDashboard,
  students: enStudents,
  payments: enPayments,
};
