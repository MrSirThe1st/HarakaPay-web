import { createContext, useContext } from 'react';

// Translation type definitions
export interface Translations {
  [key: string]: string | Translations;
}

export interface I18nContextType {
  locale: string;
  t: (key: string, params?: Record<string, string>) => string;
  switchLanguage: (locale: string) => void;
}

// Create the context
export const I18nContext = createContext<I18nContextType | null>(null);

// Custom hook to use translations
export const useTranslations = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useTranslations must be used within an I18nProvider');
  }
  return context;
};

// Translation helper function
export const translate = (
  translations: Translations,
  key: string,
  params?: Record<string, string>
): string => {
  const keys = key.split('.');
  let value: string | Translations = translations;

  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      console.warn(`Translation key "${key}" not found`);
      return key;
    }
  }

  if (typeof value !== 'string') {
    console.warn(`Translation key "${key}" is not a string`);
    return key;
  }

  // Replace parameters in the translation
  if (params) {
    return Object.entries(params).reduce((str, [param, replacement]) => {
      return str.replace(new RegExp(`{{${param}}}`, 'g'), replacement);
    }, value);
  }

  return value;
};

// Language switcher utility
export const getOppositeLocale = (currentLocale: string): string => {
  return currentLocale === 'fr' ? 'en' : 'fr';
};

// Format currency for Congo (CDF - Congolese Franc)
export const formatCurrency = (amount: number, locale: string): string => {
  return new Intl.NumberFormat(locale === 'fr' ? 'fr-CD' : 'en-US', {
    style: 'currency',
    currency: 'CDF',
  }).format(amount);
};

// Format date for Congo context
export const formatDate = (date: Date, locale: string): string => {
  return new Intl.DateTimeFormat(locale === 'fr' ? 'fr-CD' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
};
