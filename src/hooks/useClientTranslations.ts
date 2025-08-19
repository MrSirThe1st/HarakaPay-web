import { useContext } from 'react';
import { ClientI18nContext } from '@/components/I18nProvider';
import type { I18nContextType } from '@/lib/i18n';

export const useClientTranslations = (): I18nContextType => {
  const context = useContext(ClientI18nContext);
  if (!context) {
    throw new Error('useClientTranslations must be used within an I18nProvider');
  }
  return context;
};
