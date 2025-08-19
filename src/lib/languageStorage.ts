const LANGUAGE_STORAGE_KEY = 'harakapay-language';

export const LanguageStorage = {
  // Get the stored language preference
  getLanguage(): string {
    if (typeof window === 'undefined') return 'en';
    
    try {
      const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
      return stored === 'fr' ? 'fr' : 'en';
    } catch (error) {
      console.warn('Failed to read language from localStorage:', error);
      return 'en';
    }
  },

  // Set the language preference
  setLanguage(language: 'en' | 'fr'): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    } catch (error) {
      console.warn('Failed to save language to localStorage:', error);
    }
  },

  // Clear the stored language preference
  clearLanguage(): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.removeItem(LANGUAGE_STORAGE_KEY);
    } catch (error) {
      console.warn('Failed to clear language from localStorage:', error);
    }
  },

  // Check if a language is supported
  isSupportedLanguage(language: string): language is 'en' | 'fr' {
    return language === 'en' || language === 'fr';
  }
};
