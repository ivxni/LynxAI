import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Image, Platform, ScrollView, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import AppLayout from './components/layout/AppLayout';
import AppleSignInButton from './components/common/AppleSignInButton';
import colors from './constants/colors';
import { useAuth } from './hooks/useAuth';
import { useDarkMode } from './contexts/DarkModeContext';
import useThemeColors from './utils/useThemeColors';

const { width, height } = Dimensions.get('window');

export default function Home() {
  const router = useRouter();
  const { signInWithApple, isAuthenticated } = useAuth();
  const { isDarkMode } = useDarkMode();
  const themeColors = useThemeColors();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/(app)/dashboard');
    }
  }, [isAuthenticated]);

  const handleGetStarted = async () => {
    setLoading(true);
    setError(null);

    try {
      await signInWithApple();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace('/(app)/dashboard');
    } catch (err: any) {
      if (err.message !== 'Apple Sign-In was cancelled') {
        setError(err.message || 'Getting started failed');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <ScrollView 
        style={[styles.container, { backgroundColor: themeColors.background }]}
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* Logo */}
          <View style={styles.logoContainer}>
            <View style={[styles.logoBackground, { 
              backgroundColor: themeColors.primary,
              shadowColor: themeColors.primary
            }]}>
              <Image 
                source={require('./assets/img/logo.png')}
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>
          </View>
          
          {/* Welcome Text */}
          <Text style={[styles.title, { color: themeColors.text }]}>Welcome to SnapOCR</Text>
          <Text style={[styles.subtitle, { color: themeColors.textSecondary }]}>
            Get started with your Apple ID to unlock powerful OCR document processing
          </Text>
          
          {/* Features List */}
          <View style={styles.featuresContainer}>
            <View style={styles.featureItem}>
              <MaterialIcons name="document-scanner" size={24} color={themeColors.primary} />
              <Text style={[styles.featureText, { color: themeColors.text }]}>
                Scan & extract text from any document
              </Text>
            </View>
            
            <View style={styles.featureItem}>
              <MaterialIcons name="cloud-sync" size={24} color={themeColors.primary} />
              <Text style={[styles.featureText, { color: themeColors.text }]}>
                Sync across all your devices
              </Text>
            </View>
            
            <View style={styles.featureItem}>
              <MaterialIcons name="security" size={24} color={themeColors.primary} />
              <Text style={[styles.featureText, { color: themeColors.text }]}>
                Secure & private with Apple Sign-In
            </Text>
            </View>
          </View>
          
          {/* Error Message */}
          {error && (
            <View style={[styles.errorContainer, { backgroundColor: themeColors.error + '15' }]}>
              <MaterialIcons name="error-outline" size={20} color={themeColors.error} />
              <Text style={[styles.errorText, { color: themeColors.error }]}>{error}</Text>
            </View>
          )}
          
          {/* Get Started Button */}
          <View style={styles.buttonContainer}>
            <AppleSignInButton 
              onPress={handleGetStarted}
              loading={loading}
              style={styles.getStartedButton}
              buttonType="getStarted"
            />
            
            {Platform.OS !== 'ios' && (
              <View style={[styles.noticeContainer, { backgroundColor: themeColors.surfaceVariant }]}>
                <MaterialIcons name="info" size={20} color={themeColors.primary} />
                <Text style={[styles.noticeText, { color: themeColors.textSecondary }]}>
                  Apple Sign-In is only available on iOS devices. Web and Android support coming soon.
                </Text>
              </View>
            )}
          </View>
          
          {/* Terms */}
          <Text style={[styles.termsText, { color: themeColors.textSecondary }]}>
            By continuing, you agree to our{' '}
            <Text style={[styles.termsLink, { color: themeColors.primary }]}>Terms of Service</Text> and{' '}
            <Text style={[styles.termsLink, { color: themeColors.primary }]}>Privacy Policy</Text>
          </Text>
        </View>
      </ScrollView>
    </AppLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    minHeight: height - 100,
  },
  content: {
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: 60,
    paddingBottom: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 32,
    alignItems: 'center',
  },
  logoBackground: {
    borderRadius: 22,
    padding: 0,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 12,
  },
  logoImage: {
    width: 90,
    height: 90,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  featuresContainer: {
    width: '100%',
    marginBottom: 40,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  featureText: {
    fontSize: 16,
    marginLeft: 16,
    flex: 1,
    fontWeight: '500',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
    alignSelf: 'stretch',
  },
  errorText: {
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 320,
    marginBottom: 32,
  },
  getStartedButton: {
    height: 56,
    borderRadius: 16,
    marginBottom: 16,
  },
  noticeContainer: {
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  noticeText: {
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },
  termsText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  termsLink: {
    fontWeight: '600',
  },
}); 