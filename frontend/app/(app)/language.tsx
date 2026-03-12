import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import colors from '../constants/colors';
import { useTranslation } from '../utils/i18n';
import { useDarkMode } from '../contexts/DarkModeContext';
import useThemeColors from '../utils/useThemeColors';
import { useLanguage, Language, LANGUAGES } from '../contexts/LanguageContext';

export default function LanguageScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { language: currentLanguage, setLanguage } = useLanguage();
  const { isDarkMode } = useDarkMode();
  const themeColors = useThemeColors();
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(currentLanguage);

  const handleLanguageSelect = (langCode: Language) => {
    setSelectedLanguage(langCode);
    setLanguage(langCode);
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
        <Text style={[styles.headerTitle, { color: themeColors.text }]}>{t('language.title')}</Text>
        <View style={styles.placeholder} />
      </View>
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.sectionTitle, { color: themeColors.textSecondary }]}>
          {t('language.selectLanguage')}
        </Text>
        
        <View style={styles.languageList}>
          {LANGUAGES.map((lang) => (
            <TouchableOpacity
              key={lang.code}
              style={[
                styles.languageItem,
                selectedLanguage === lang.code && [styles.selectedLanguage, { borderColor: themeColors.primary }],
                { backgroundColor: themeColors.surface }
              ]}
              onPress={() => handleLanguageSelect(lang.code)}
            >
              <View style={styles.languageInfo}>
                <Text style={[styles.languageName, { color: themeColors.text }]}>{lang.name}</Text>
                <Text style={[styles.languageNative, { color: themeColors.textSecondary }]}>{lang.nativeName}</Text>
              </View>
              
              {selectedLanguage === lang.code && (
                <MaterialIcons name="check-circle" size={24} color={themeColors.primary} />
              )}
            </TouchableOpacity>
          ))}
        </View>
        
        <Text style={[styles.note, { color: themeColors.textSecondary }]}>
          {t('language.changeNote')}
        </Text>
      </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 16,
    marginBottom: 16,
  },
  languageList: {
    gap: 12,
  },
  languageItem: {
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
  selectedLanguage: {
    borderWidth: 2,
  },
  languageInfo: {
    flex: 1,
  },
  languageName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  languageNative: {
    fontSize: 14,
  },
  note: {
    fontSize: 14,
    marginTop: 24,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
}); 