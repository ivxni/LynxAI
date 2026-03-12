import { useEffect } from 'react';
import { Platform } from 'react-native';
import { useAuth as useAuthContext } from '../contexts/AuthContext';
import subscriptionService from '../services/subscriptionService';

export const useAuth = () => {
  // Use the original hook from the context
  const authContext = useAuthContext();
  
  // This function will handle initializing purchases after login
  const initializePurchases = async (userId: string) => {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      try {
        await subscriptionService.initializePurchases(userId);
        console.log('RevenueCat initialized for user:', userId);
      } catch (error) {
        console.error('Failed to initialize RevenueCat:', error);
      }
    }
  };

  // Enhanced login function that also initializes purchases
  const login = async (email: string, password: string) => {
    const result = await authContext.login(email, password);
    
    // Initialize purchases if we're on mobile and have a user ID
    if (authContext.user?._id) {
      await initializePurchases(authContext.user._id);
    }
    
    return result;
  };

  // Check if user is logged in and initialize purchases
  useEffect(() => {
    const checkAndInitialize = async () => {
      if (authContext.user?._id && (Platform.OS === 'ios' || Platform.OS === 'android')) {
        await initializePurchases(authContext.user._id);
      }
    };
    
    checkAndInitialize();
  }, [authContext.user]);

  return {
    ...authContext,
    login, // Override login with our enhanced version
  };
};

export default useAuth; 