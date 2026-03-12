import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTranslation } from '../utils/i18n';
import { useDarkMode, ThemeMode } from '../contexts/DarkModeContext';
import useThemeColors from '../utils/useThemeColors';

export default function DarkModeScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { themeMode, setThemeMode } = useDarkMode();
  const { isDarkMode } = useDarkMode();
  const themeColors = useThemeColors();

  const handleThemeSelect = (mode: ThemeMode) => {
    setThemeMode(mode);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]} edges={['top']}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
      
      <View style={[
        styles.header, 
        { borderBottomColor: isDarkMode ? 'rgba(0,0,0,0.05)' : 'transparent',
          borderBottomWidth: isDarkMode ? 1 : 0 }
      ]}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <MaterialIcons name="arrow-back" size={24} color={themeColors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: themeColors.text }]}>{t('profile.appearance')}</Text>
        <View style={styles.placeholder} />
      </View>
      
      <View style={styles.content}>
        <Text style={[styles.sectionTitle, { color: themeColors.textSecondary }]}>
          {t('profile.selectTheme')}
        </Text>
        
        <View style={styles.optionsList}>
          {/* System Default Option */}
          <TouchableOpacity
            style={[
              styles.optionItem,
              themeMode === 'system' && [styles.selectedOption, { borderColor: themeColors.primary }],
              { backgroundColor: themeColors.surface }
            ]}
            onPress={() => handleThemeSelect('system')}
          >
            <View style={styles.optionInfo}>
              <MaterialIcons name="settings" size={24} color={themeColors.text} />
              <Text style={[styles.optionName, { color: themeColors.text }]}>
                {t('profile.systemDefault')}
              </Text>
            </View>
            
            {themeMode === 'system' && (
              <MaterialIcons name="check-circle" size={24} color={themeColors.primary} />
            )}
          </TouchableOpacity>
          
          {/* Light Mode Option */}
          <TouchableOpacity
            style={[
              styles.optionItem,
              themeMode === 'light' && [styles.selectedOption, { borderColor: themeColors.primary }],
              { backgroundColor: themeColors.surface }
            ]}
            onPress={() => handleThemeSelect('light')}
          >
            <View style={styles.optionInfo}>
              <MaterialIcons name="wb-sunny" size={24} color={themeColors.text} />
              <Text style={[styles.optionName, { color: themeColors.text }]}>
                {t('profile.lightMode')}
              </Text>
            </View>
            
            {themeMode === 'light' && (
              <MaterialIcons name="check-circle" size={24} color={themeColors.primary} />
            )}
          </TouchableOpacity>
          
          {/* Dark Mode Option */}
          <TouchableOpacity
            style={[
              styles.optionItem,
              themeMode === 'dark' && [styles.selectedOption, { borderColor: themeColors.primary }],
              { backgroundColor: themeColors.surface }
            ]}
            onPress={() => handleThemeSelect('dark')}
          >
            <View style={styles.optionInfo}>
              <MaterialIcons name="brightness-2" size={24} color={themeColors.text} />
              <Text style={[styles.optionName, { color: themeColors.text }]}>
                {t('profile.darkMode')}
              </Text>
            </View>
            
            {themeMode === 'dark' && (
              <MaterialIcons name="check-circle" size={24} color={themeColors.primary} />
            )}
          </TouchableOpacity>
        </View>
        
        <Text style={[styles.note, { color: themeColors.textSecondary }]}>
          {t('profile.themeChangeNote') || 'Changes will be applied immediately to the app interface.'}
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 60,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 16,
    marginBottom: 16,
  },
  optionsList: {
    gap: 12,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  selectedOption: {
    borderWidth: 2,
  },
  optionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionName: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 12,
  },
  note: {
    fontSize: 14,
    marginTop: 24,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
}); 