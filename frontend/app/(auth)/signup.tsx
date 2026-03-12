import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Dimensions, StatusBar, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import AppLayout from '../components/layout/AppLayout';
import AppleSignInButton from '../components/common/AppleSignInButton';
import { useAuth } from '../hooks/useAuth';
import colors from '../constants/colors';
import { useDarkMode } from '../contexts/DarkModeContext';
import useThemeColors from '../utils/useThemeColors';

const { width, height } = Dimensions.get('window');

export default function SignUp() {
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

  const handleAppleSignUp = async () => {
    setLoading(true);
    setError(null);

    try {
      await signInWithApple();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace('/(app)/dashboard');
    } catch (err: any) {
      if (err.message !== 'Apple Sign-In was cancelled') {
        setError(err.message || 'Sign up failed');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: themeColors.background }]} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      enabled={Platform.OS === 'ios'}
      keyboardVerticalOffset={0}
    >
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <MaterialIcons name="arrow-back" size={24} color={themeColors.text} />
      </TouchableOpacity>
      
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.logoContainer}>
          <View style={[styles.logoBackground, { 
            backgroundColor: themeColors.primary,
            shadowColor: themeColors.primary
          }]}>
            <Image 
              source={require('../assets/img/logo.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
        </View>
        
        <Text style={[styles.title, { color: themeColors.text }]}>Get Started</Text>
        <Text style={[styles.subtitle, { color: themeColors.textSecondary }]}>Create your SnapOCR account</Text>
        
        <View style={styles.formContainer}>
          {error && (
            <Text style={[styles.errorText, { color: themeColors.error }]}>{error}</Text>
          )}
          
          <AppleSignInButton 
            onPress={handleAppleSignUp}
            loading={loading}
            style={styles.appleButton}
            buttonType="signUp"
          />
          
          {Platform.OS !== 'ios' && (
            <View style={[styles.noticeContainer, { backgroundColor: themeColors.surfaceVariant }]}>
              <MaterialIcons name="info" size={20} color={themeColors.primary} />
              <Text style={[styles.noticeText, { color: themeColors.textSecondary }]}>
                Apple Sign-In is only available on iOS devices
              </Text>
            </View>
          )}
          
          <Text style={[styles.termsText, { color: themeColors.textSecondary }]}>
            By creating an account, you agree to our{' '}
            <Text style={[styles.termsLink, { color: themeColors.primary }]}>Terms of Service</Text> and{' '}
            <Text style={[styles.termsLink, { color: themeColors.primary }]}>Privacy Policy</Text>
          </Text>
        </View>
        
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: themeColors.textSecondary }]}>Already have an account?</Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/signin')}>
            <Text style={[styles.footerLink, { color: themeColors.primary }]}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 32,
    paddingTop: 20,
    paddingBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: height - 90, // Subtract some height for the status bar and safe area
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
    padding: 8,
  },
  logoContainer: {
    marginTop: 0,
    marginBottom: 20,
    alignItems: 'center',
  },
  logoBackground: {
    borderRadius: 20,
    padding: 0,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 12,
  },
  logoImage: {
    width: 80,
    height: 80,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  formContainer: {
    width: '100%',
    maxWidth: Math.min(500, width * 0.9),
  },
  errorText: {
    marginTop: 8,
    marginBottom: 8,
    fontSize: 14,
    textAlign: 'center',
  },
  appleButton: {
    marginTop: 12,
    marginBottom: 12,
    height: 50,
    borderRadius: 12,
  },
  noticeContainer: {
    marginTop: 8,
    marginBottom: 8,
    padding: 12,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  noticeText: {
    fontSize: 12,
    marginLeft: 8,
  },
  termsText: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 8,
  },
  termsLink: {
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
    gap: 8,
    marginBottom: 10,
  },
  footerText: {
    fontSize: 16,
  },
  footerLink: {
    fontWeight: '600',
    fontSize: 16,
  },
}); 