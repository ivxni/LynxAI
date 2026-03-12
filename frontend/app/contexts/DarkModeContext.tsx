import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, AppStateStatus, useColorScheme } from 'react-native';

// Define theme mode options
export type ThemeMode = 'system' | 'light' | 'dark';

type DarkModeContextType = {
  themeMode: ThemeMode;
  isDarkMode: boolean;
  setThemeMode: (mode: ThemeMode) => void;
};

const DarkModeContext = createContext<DarkModeContextType | undefined>(undefined);

export const useDarkMode = () => {
  const context = useContext(DarkModeContext);
  if (!context) {
    throw new Error('useDarkMode must be used within a DarkModeProvider');
  }
  return context;
};

interface DarkModeProviderProps {
  children: ReactNode;
}

export const DarkModeProvider: React.FC<DarkModeProviderProps> = ({ children }) => {
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');
  const [isLoading, setIsLoading] = useState(true);
  const systemColorScheme = useColorScheme();
  
  // Compute isDarkMode based on themeMode and system preference
  const isDarkMode = themeMode === 'system' 
    ? systemColorScheme === 'dark'
    : themeMode === 'dark';

  // Load saved theme mode preference
  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const savedPreference = await AsyncStorage.getItem('themeMode');
        if (savedPreference !== null && (savedPreference === 'system' || savedPreference === 'light' || savedPreference === 'dark')) {
          setThemeModeState(savedPreference as ThemeMode);
        }
      } catch (error) {
        console.error('Error loading theme preference:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadThemePreference();
  }, []);

  // Save theme mode preference when it changes
  useEffect(() => {
    if (!isLoading) {
      AsyncStorage.setItem('themeMode', themeMode).catch(error => {
        console.error('Error saving theme preference:', error);
      });
    }
  }, [themeMode, isLoading]);

  // Handle app state changes to ensure theme is applied correctly
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        // Force a re-render when app becomes active
        setThemeModeState(prev => prev);
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => {
      subscription.remove();
    };
  }, []);

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
  };

  return (
    <DarkModeContext.Provider value={{ themeMode, isDarkMode, setThemeMode }}>
      {children}
    </DarkModeContext.Provider>
  );
};

export default DarkModeProvider; 