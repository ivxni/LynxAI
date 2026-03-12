interface ColorPalette {
  primary: string;
  primaryLight: string;
  primaryDark: string;
  secondary: string;
  background: string;
  surface: string;
  surfaceVariant: string;
  white: string;
  black: string;
  text: string;
  textSecondary: string;
  border: string;
  success: string;
  error: string;
  warning: string;
  info: string;
  disabled: string;
  placeholder: string;
  darkBackground: string;
  darkSurface: string;
  darkText: string;
  darkBorder: string;
}

export type { ColorPalette };

export const colors: ColorPalette = {
  // Modern purple as primary color
  primary: '#7B68EE',        // Medium purple
  primaryLight: '#9F8FFF',   // Light purple
  primaryDark: '#5A4FCF',    // Dark purple
  secondary: '#FF6B9D',      // Pink accent
  
  // Clean white backgrounds
  background: '#FFFFFF',     // Pure white
  surface: '#F8F9FF',        // Very light purple tint
  surfaceVariant: '#F0F2FF', // Light purple background
  
  white: '#FFFFFF',
  black: '#000000',
  
  // Typography
  text: '#1A1A2E',           // Almost black with slight blue tint
  textSecondary: '#666687',  // Medium gray with purple tint
  
  border: '#E6E8F0',         // Light gray with purple tint
  
  // Status colors
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FFC107',
  info: '#2196F3',
  
  // Utility colors
  disabled: '#DADCE8',
  placeholder: '#9EA0B4',
  
  // Dark mode colors
  darkBackground: '#121220',
  darkSurface: '#1E1E2E',
  darkText: '#E0E0F0',
  darkBorder: '#333344',
};

export default colors; 