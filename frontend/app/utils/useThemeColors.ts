import { useMemo } from 'react';
import { useDarkMode } from '../contexts/DarkModeContext';
import colors from '../constants/colors';
import { ColorPalette } from '../constants/colors';

export const useThemeColors = (): ColorPalette => {
  const { isDarkMode } = useDarkMode();

  const themeColors = useMemo(() => {
    if (isDarkMode) {
      return {
        ...colors,
        // Override with dark mode colors
        background: colors.darkBackground,
        surface: colors.darkSurface,
        text: colors.darkText,
        textSecondary: colors.darkText + '99', // Add some transparency for secondary text
        border: colors.darkBorder,
        surfaceVariant: '#2A2A3F', // Darker variant for dark mode
      };
    }
    return colors;
  }, [isDarkMode]);

  return themeColors;
};

export default useThemeColors; 