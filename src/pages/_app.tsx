import type { AppProps } from 'next/app';
import { I18nProvider } from '@/components/I18nProvider';
import { translations } from '@/lib/loadTranslations';
import '@/styles/globals.css';

import type { Translations } from '@/lib/i18n';
interface AppPropsWithTranslations extends AppProps {
  pageProps: {
    translations?: Record<string, Translations>;
  };
}

export default function App({ Component, pageProps }: AppPropsWithTranslations) {
  // Use translations from pageProps if available, otherwise use static translations
  const currentTranslations = pageProps.translations || translations;

  return (
    <I18nProvider translations={currentTranslations}>
      <Component {...pageProps} />
    </I18nProvider>
  );
}
