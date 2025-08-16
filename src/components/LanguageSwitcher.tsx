import React from 'react';
import { useTranslations, getOppositeLocale } from '@/lib/i18n';
import { Globe } from 'lucide-react';

interface LanguageSwitcherProps {
  variant?: 'default' | 'compact' | 'dropdown';
  className?: string;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ 
  variant = 'default',
  className = '' 
}) => {
  const { locale, switchLanguage, t } = useTranslations();
  const oppositeLocale = getOppositeLocale(locale);

  const handleLanguageSwitch = () => {
    switchLanguage(oppositeLocale);
  };

  const getLanguageDisplay = (lang: string) => {
    return {
      fr: { name: 'Français', flag: '🇨🇩' },
      en: { name: 'English', flag: '🇺🇸' }
    }[lang];
  };

  const currentLang = getLanguageDisplay(locale);
  const targetLang = getLanguageDisplay(oppositeLocale);

  if (variant === 'compact') {
    return (
      <button
        onClick={handleLanguageSwitch}
        className={`flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition-colors ${className}`}
        title={t('common.switchTo', { language: targetLang?.name || '' })}
      >
        <Globe className="h-4 w-4" />
        <span className="hidden sm:inline">{currentLang?.name}</span>
        <span className="sm:hidden">{currentLang?.flag}</span>
      </button>
    );
  }

  if (variant === 'dropdown') {
    return (
      <div className={`relative ${className}`}>
        <select
          value={locale}
          onChange={(e) => switchLanguage(e.target.value)}
          className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="fr">🇨🇩 Français</option>
          <option value="en">🇺🇸 English</option>
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
          <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    );
  }

  // Default variant
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <button
        onClick={handleLanguageSwitch}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition-colors border border-gray-200"
      >
        <Globe className="h-4 w-4" />
        <span>{currentLang?.flag} {currentLang?.name}</span>
        <span className="text-gray-400">→</span>
        <span>{targetLang?.flag} {targetLang?.name}</span>
      </button>
    </div>
  );
};
