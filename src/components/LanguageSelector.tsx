import React from 'react';
import { useClientTranslations } from '@/shared/hooks/useClientTranslations';
import { useLanguage } from '@/shared/hooks/useLanguage';
import { IoGlobe } from 'react-icons/io5';

interface LanguageSelectorProps {
  className?: string;
  showLabel?: boolean;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  className = '',
  showLabel = true
}) => {
  const { t } = useClientTranslations();
  const { currentLanguage, changeLanguage, availableLanguages } = useLanguage();

  return (
    <div className={`flex flex-col items-center space-y-3 ${className}`}>
      {showLabel && (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <IoGlobe className="h-4 w-4" />
          <span>{t('auth.selectLanguage')}</span>
        </div>
      )}
      
      <div className="flex gap-2">
        {availableLanguages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => changeLanguage(lang.code as 'en' | 'fr')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all duration-200 ${
              currentLanguage === lang.code
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            <span className="text-lg">{lang.flag}</span>
            <span className="font-medium">{lang.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
