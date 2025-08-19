# Language Switching Features in HarakaPay

This document explains how to use the language switching features implemented in the HarakaPay application.

## Features Implemented

### 1. Language Selection at Login/Register
- Users can select their preferred language (English or French) before logging in
- Language selector is positioned in the top-right corner of login and register pages
- Selection is visually indicated with flags and language names

### 2. Language Switching in Settings
- Users can change their language preference from the Settings page
- Language selection is saved and persists across sessions
- Visual feedback when preferences are saved

### 3. Global Language Switcher in Navigation
- Compact language switcher in the dashboard navigation header
- Quick access to change language from anywhere in the dashboard
- Shows current language with flag and name

### 4. Persistent Language Preferences
- Language choices are stored in localStorage
- Preferences persist across browser sessions
- Automatic language restoration on app reload

## Components

### LanguageSelector
- Used on login and register pages
- Shows language options with flags and names
- Positioned in top-right corner

### LanguageSwitcher
- Used in dashboard navigation and settings
- Multiple variants: default, compact, dropdown
- Integrates with the language management system

### useLanguage Hook
- Manages language state and persistence
- Provides language switching functions
- Handles localStorage operations safely

## Usage Examples

### In a Component
```tsx
import { useLanguage } from '@/hooks/useLanguage';
import { useTranslations } from '@/lib/i18n';

function MyComponent() {
  const { t } = useTranslations();
  const { currentLanguage, changeLanguage } = useLanguage();

  return (
    <div>
      <h1>{t('common.title')}</h1>
      <button onClick={() => changeLanguage('fr')}>
        Switch to French
      </button>
    </div>
  );
}
```

### Adding Language Selector
```tsx
import { LanguageSelector } from '@/components/LanguageSelector';

function LoginPage() {
  return (
    <div>
      <div className="absolute top-4 right-4">
        <LanguageSelector />
      </div>
      {/* Rest of login form */}
    </div>
  );
}
```

### Adding Language Switcher to Navigation
```tsx
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

function Navigation() {
  return (
    <nav>
      {/* Navigation items */}
      <div className="flex items-center gap-4">
        <LanguageSwitcher variant="compact" />
        {/* Other nav elements */}
      </div>
    </nav>
  );
}
```

## Translation Files

### Structure
- `src/lib/translations.en.json` - English translations
- `src/lib/translations.fr.json` - French translations
- `src/lib/en/` - English namespace files
- `src/lib/fr/` - French namespace files

### Adding New Translations
1. Add the key to both English and French translation files
2. Use the key in your component with `t('namespace.key')`
3. Ensure consistent naming across both languages

### Example Translation
```json
// English
{
  "auth": {
    "welcome": "Welcome to HarakaPay",
    "login": "Login"
  }
}

// French
{
  "auth": {
    "welcome": "Bienvenue sur HarakaPay",
    "login": "Connexion"
  }
}
```

## Technical Details

### Language Storage
- Uses localStorage with key `harakapay-language`
- Fallback to English if no preference is stored
- Safe handling for SSR environments

### Context Provider
- `I18nProvider` wraps the entire application
- Provides translation functions and language switching
- Integrates with Next.js routing

### Performance
- Translations are loaded statically for better performance
- Dynamic imports available for code splitting
- Efficient language switching without page reloads

## Best Practices

1. **Always use translation keys** instead of hardcoded text
2. **Test both languages** to ensure proper display
3. **Use semantic keys** that describe the content, not the text
4. **Handle pluralization** when needed
5. **Consider RTL languages** for future expansion

## Troubleshooting

### Language not switching
- Check if the I18nProvider is properly wrapped around your component
- Verify that the translation key exists in both language files
- Ensure the useLanguage hook is being used correctly

### Translations not loading
- Verify the translation files are properly imported
- Check the file paths in loadTranslations.ts
- Ensure the I18nProvider has access to the translations

### localStorage errors
- The LanguageStorage utility handles errors gracefully
- Check browser console for any warnings
- Ensure the component is running in the browser (not SSR)

## Future Enhancements

- Support for additional languages
- Server-side language preference storage
- Automatic language detection based on browser settings
- RTL language support
- Translation management interface for administrators
