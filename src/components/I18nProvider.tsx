import React, { ReactNode } from 'react';
import { useRouter } from 'next/router';
import { I18nContext, translate, type Translations, type I18nContextType } from '@/lib/i18n';

interface I18nProviderProps {
  children: ReactNode;
  translations: Record<string, Translations>;
}

export const I18nProvider: React.FC<I18nProviderProps> = ({ 
  children, 
  translations 
}) => {
  const router = useRouter();
  const { locale = 'fr' } = router;

  const t = (key: string, params?: Record<string, string>): string => {
    const currentTranslations = translations[locale] || translations['fr'];
    return translate(currentTranslations, key, params);
  };

  const switchLanguage = (newLocale: string) => {
    const { pathname, asPath, query } = router;
    router.push({ pathname, query }, asPath, { locale: newLocale });
  };

  const contextValue: I18nContextType = {
    locale,
    t,
    switchLanguage,
  };

  return (
    <I18nContext.Provider value={contextValue}>
      {children}
    </I18nContext.Provider>
  );
};
