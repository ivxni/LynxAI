import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';
import colors from './colors';

// Create a custom theme type that allows any properties
type CustomTheme = typeof MD3LightTheme & {
  colors: {
    [key: string]: string;
  };
  roundness: number;
  animation: {
    scale: number;
  };
};

export const lightTheme: CustomTheme = {
  ...MD3LightTheme as any,
  roundness: 12, // More rounded corners for a modern look
  animation: {
    scale: 0.5, // Slightly faster animations
  },
  colors: {
    ...MD3LightTheme.colors,
    primary: colors.primary,
    primaryContainer: colors.primaryLight,
    onPrimaryContainer: colors.primaryDark,
    secondary: colors.secondary,
    background: colors.background,
    surface: colors.surface,
    surfaceVariant: colors.surfaceVariant,
    onSurface: colors.text,
    onSurfaceVariant: colors.textSecondary,
    outline: colors.border,
    text: colors.text,
    error: colors.error,
    disabled: colors.disabled,
    placeholder: colors.placeholder,
    backdrop: 'rgba(26, 26, 46, 0.3)', // Slightly tinted backdrop
  },
};

export const darkTheme: CustomTheme = {
  ...MD3DarkTheme as any,
  roundness: 12,
  animation: {
    scale: 0.5,
  },
  colors: {
    ...MD3DarkTheme.colors,
    primary: colors.primaryLight, // Lighter purple for dark mode
    primaryContainer: colors.primary,
    onPrimaryContainer: colors.white,
    secondary: colors.secondary,
    background: colors.darkBackground,
    surface: colors.darkSurface,
    surfaceVariant: '#2A2A3C', // Darker purple-tinted surface
    onSurface: colors.darkText,
    onSurfaceVariant: '#B0B0C0', // Light purple-gray text
    outline: colors.darkBorder,
    text: colors.darkText,
    error: colors.error,
    disabled: '#4D4D5F', // Darker disabled state
    placeholder: '#6E6E8A', // Darker placeholder
    backdrop: 'rgba(0, 0, 0, 0.5)',
  },
};

export interface AppThemes {
  lightTheme: CustomTheme;
  darkTheme: CustomTheme;
}

const themes: AppThemes = { lightTheme, darkTheme };

export default themes; 