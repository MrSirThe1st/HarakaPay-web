"use client";

import React, { ReactNode, createContext, useContext, useState, useEffect } from 'react';
import { I18nContext, translate, type Translations, type I18nContextType } from '@/lib/i18n';

interface I18nProviderProps {
  children: ReactNode;
  translations: Record<string, Translations>;
}

// Create a new context for the client-side I18nProvider
const ClientI18nContext = createContext<I18nContextType | null>(null);

export const I18nProvider: React.FC<I18nProviderProps> = ({ 
  children, 
  translations 
}) => {
  const [locale, setLocale] = useState('en');

  // Initialize locale from localStorage on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('harakapay-language');
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'fr')) {
      setLocale(savedLanguage);
    }
  }, []);

  const t = (key: string, params?: Record<string, string>): string => {
    const currentTranslations = translations[locale] || translations['en'];
    return translate(currentTranslations, key, params);
  };

  const switchLanguage = (newLocale: string) => {
    setLocale(newLocale);
    localStorage.setItem('harakapay-language', newLocale);
  };

  const contextValue: I18nContextType = {
    locale,
    t,
    switchLanguage,
  };

  return (
    <ClientI18nContext.Provider value={contextValue}>
      {children}
    </ClientI18nContext.Provider>
  );
};

// Export the context for use in other components
export { ClientI18nContext };
