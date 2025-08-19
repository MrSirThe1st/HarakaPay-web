import { useState, useEffect } from 'react';
import { useClientTranslations } from '@/hooks/useClientTranslations';
import { LanguageStorage } from '@/lib/languageStorage';

export const useLanguage = () => {
  const { locale, switchLanguage } = useClientTranslations();
  const [userLanguage, setUserLanguage] = useState(locale);

  // Load user's preferred language from localStorage on mount
  useEffect(() => {
    const savedLanguage = LanguageStorage.getLanguage();
    if (savedLanguage && savedLanguage !== locale) {
      setUserLanguage(savedLanguage);
      switchLanguage(savedLanguage);
    }
  }, [locale, switchLanguage]);

  // Save language preference to localStorage
  const changeLanguage = (newLanguage: 'en' | 'fr') => {
    if (LanguageStorage.isSupportedLanguage(newLanguage)) {
      setUserLanguage(newLanguage);
      LanguageStorage.setLanguage(newLanguage);
      switchLanguage(newLanguage);
    }
  };

  // Get available languages
  const availableLanguages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'fr', name: 'Français', flag: '🇨🇩' }
  ];

  return {
    currentLanguage: userLanguage,
    changeLanguage,
    availableLanguages,
    isEnglish: userLanguage === 'en',
    isFrench: userLanguage === 'fr'
  };
};
