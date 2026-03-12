# Language Configuration System

This document outlines the language configuration system implemented in the SnapOCR app. The system allows users to select their preferred language and provides a framework for translating the app's UI elements.

## Overview

The language configuration system consists of:

1. **LanguageContext**: Manages the current language selection and provides it to the entire app
2. **i18n Utility**: Provides translation functions and dictionaries
3. **Language Selection Screen**: Allows users to change their language preference

## Supported Languages

The app currently supports the following languages:

- English (en) - Default
- German (de)
- Russian (ru)
- Turkish (tr)
- Japanese (ja)

## Implementation Details

### LanguageContext

Located at `app/contexts/LanguageContext.tsx`, this context:

- Defines the available languages
- Stores the user's language preference in AsyncStorage
- Provides the current language to the app
- Offers a function to change the language

```typescript
// Example usage
const { language, setLanguage, languages } = useLanguage();
```

### i18n Utility

Located at `app/utils/i18n.ts`, this utility:

- Defines translation keys organized by feature
- Provides translation dictionaries for each supported language
- Offers a hook for easy translation in components
- Includes a string formatting function for dynamic content

```typescript
// Example usage
const { t, format, language } = useTranslation();

// Simple translation
const translatedText = t('profile.title');

// Formatted translation with variables
const formattedText = format(t('dashboard.welcome'), { name: user.firstName });
```

### Language Selection Screen

Located at `app/app/(app)/language.tsx`, this screen:

- Displays all available languages
- Shows the currently selected language
- Allows the user to select a different language
- Provides information about language usage in the app

## Adding New Translations

To add translations for a new feature:

1. Add new translation keys to the `TranslationKey` type in `i18n.ts`
2. Add translations for each language in their respective dictionaries
3. Use the `useTranslation` hook in your components to access translations

## Adding a New Language

To add support for a new language:

1. Add the language code to the `Language` type in `LanguageContext.tsx`
2. Add the language to the `LANGUAGES` array with its name and native name
3. Create a new translation dictionary in `i18n.ts`
4. Add the dictionary to the `translations` record

## Best Practices

1. **Organize Keys**: Keep translation keys organized by feature
2. **Use Descriptive Keys**: Make keys descriptive of their content
3. **Avoid Hardcoded Strings**: Always use the translation system for UI text
4. **Test All Languages**: Verify that UI elements display correctly in all languages
5. **Consider Text Length**: Some languages may have longer text, ensure your UI can accommodate this

## Future Improvements

- Add support for RTL languages
- Implement a system for pluralization
- Add a language detection feature based on device locale
- Support for language-specific formatting (dates, numbers, etc.) 