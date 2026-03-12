import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Platform } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import { MaterialIcons } from '@expo/vector-icons';
import useThemeColors from '../../utils/useThemeColors';

interface AppleSignInButtonProps {
  onPress: () => Promise<void>;
  loading?: boolean;
  style?: any;
  buttonType?: 'signIn' | 'signUp' | 'getStarted';
}

export default function AppleSignInButton({ 
  onPress, 
  loading = false, 
  style, 
  buttonType = 'signIn' 
}: AppleSignInButtonProps) {
  const themeColors = useThemeColors();

  // Only show on iOS
  if (Platform.OS !== 'ios') {
    return null;
  }

  const handlePress = async () => {
    if (loading) return;
    await onPress();
  };

  const buttonText = buttonType === 'signUp' ? 'Sign up with Apple' : buttonType === 'getStarted' ? 'Get Started with Apple' : 'Sign in with Apple';

  return (
    <TouchableOpacity 
      style={[styles.appleButton, style]} 
      onPress={handlePress}
      disabled={loading}
      activeOpacity={0.8}
    >
      <View style={styles.buttonContent}>
        <MaterialIcons 
          name="apple" 
          size={20} 
          color="#FFFFFF" 
          style={styles.appleIcon}
        />
        <Text style={styles.buttonText}>
          {loading ? 'Signing in...' : buttonText}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  appleButton: {
    backgroundColor: '#000000',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44, // Apple's minimum touch target
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  appleIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'Roboto',
  },
}); 