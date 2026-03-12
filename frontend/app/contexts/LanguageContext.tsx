import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define available languages
export type Language = 'en' | 'de' | 'ru' | 'tr' | 'ja' | 'es' | 'fr';

export interface LanguageOption {
  code: Language;
  name: string;
  nativeName: string;
}

export const LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語' },
];

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => Promise<void>;
  languages: LanguageOption[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = '@language_preference';

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    // Load saved language preference
    const loadLanguage = async () => {
      try {
        const savedLanguage = await AsyncStorage.getItem(STORAGE_KEY);
        if (savedLanguage && isValidLanguage(savedLanguage)) {
          setLanguageState(savedLanguage as Language);
        }
      } catch (error) {
        console.error('Failed to load language preference:', error);
      }
    };

    loadLanguage();
  }, []);

  const isValidLanguage = (lang: string): boolean => {
    return LANGUAGES.some(l => l.code === lang);
  };

  const setLanguage = async (newLanguage: Language) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, newLanguage);
      setLanguageState(newLanguage);
    } catch (error) {
      console.error('Failed to save language preference:', error);
    }
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, languages: LANGUAGES }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// Add a default export to fix the warning
export default LanguageContext; 