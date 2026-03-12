import React, { ReactNode } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import useThemeColors from '../../utils/useThemeColors';

interface ProtectedRouteProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * A wrapper component that only renders its children if the user is authenticated.
 * Otherwise, it redirects to the login page or shows a fallback component.
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, fallback }) => {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const themeColors = useThemeColors();

  // If still loading auth state, show loading indicator
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: themeColors.background }}>
        <ActivityIndicator size="large" color={themeColors.primary} />
        <Text style={{ marginTop: 16, color: themeColors.textSecondary }}>Loading...</Text>
      </View>
    );
  }

  // If not authenticated, redirect to login or show fallback
  if (!isAuthenticated) {
    // If fallback is provided, show it
    if (fallback) {
      return <>{fallback}</>;
    }
    
    // Otherwise, redirect to login
    router.replace('/(auth)/signin');
    return null;
  }

  // If authenticated, render children
  return <>{children}</>;
};

export default ProtectedRoute; 