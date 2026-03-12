import React, { createContext, useContext, useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import authService from '../services/authService';
import { User, RegisterData, ProfileUpdateData, AuthState } from '../types/auth.types';
import subscriptionService from '../services/subscriptionService';

// Create context with default values
interface AuthContextType extends AuthState {
  register: (userData: RegisterData) => Promise<User>;
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  updateProfile: (userData: ProfileUpdateData) => Promise<User>;
  signInWithApple: () => Promise<User>;
  token: string | null;
  initialized: boolean;
  updateUser: (user: User) => Promise<void>;
}

const defaultContext: AuthContextType = {
  user: null,
  loading: false,
  error: null,
  isAuthenticated: false,
  register: async () => { throw new Error('Not implemented'); },
  login: async () => { throw new Error('Not implemented'); },
  logout: async () => { throw new Error('Not implemented'); },
  updateProfile: async () => { throw new Error('Not implemented'); },
  signInWithApple: async () => { throw new Error('Not implemented'); },
  token: null,
  initialized: false,
  updateUser: async () => { throw new Error('Not implemented'); },
};

const AuthContext = createContext<AuthContextType>(defaultContext);

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [initialized, setInitialized] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // On mount, check if user is logged in
  useEffect(() => {
    const checkLoggedIn = async () => {
      try {
        setLoading(true);
        // Get token from secure storage or async storage
        const storedToken = await getToken();
        
        if (storedToken) {
          setToken(storedToken);
          // Get user profile
          const profile = await authService.getUserProfile();
          setUser(profile);
          
          // Initialize purchases if on mobile
          if ((Platform.OS === 'ios' || Platform.OS === 'android') && profile?._id) {
            try {
              await subscriptionService.initializePurchases(profile._id);
              console.log('RevenueCat initialized during auth context setup');
            } catch (error) {
              console.error('Failed to initialize RevenueCat:', error);
            }
          }
        }
      } catch (error) {
        console.error('Error checking login state:', error);
        // Clear token and user in case of error
        await clearStorage();
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
        setInitialized(true);
      }
    };

    checkLoggedIn();
  }, []);

  const saveToken = async (newToken: string) => {
    try {
      if (Platform.OS === 'web') {
        // Use AsyncStorage on web
        await AsyncStorage.setItem('token', newToken);
      } else {
        // Use SecureStore on native
        await SecureStore.setItemAsync('token', newToken);
      }
      setToken(newToken);
    } catch (error) {
      console.error('Error saving token:', error);
    }
  };

  const getToken = async (): Promise<string | null> => {
    try {
      if (Platform.OS === 'web') {
        return await AsyncStorage.getItem('token');
      } else {
        return await SecureStore.getItemAsync('token');
      }
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  };

  const clearStorage = async () => {
    try {
      if (Platform.OS === 'web') {
        await AsyncStorage.removeItem('token');
      } else {
        await SecureStore.deleteItemAsync('token');
      }
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  };

  // Register user
  const register = async (userData: RegisterData): Promise<User> => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.register(userData);
      setUser(response);
      
      // Initialize purchases if on mobile
      if ((Platform.OS === 'ios' || Platform.OS === 'android') && response._id) {
        try {
          await subscriptionService.initializePurchases(response._id);
          console.log('RevenueCat initialized after registration');
        } catch (error) {
          console.error('Failed to initialize RevenueCat after registration:', error);
        }
      }
      
      await saveToken(response.token as string);
      return response;
    } catch (error: any) {
      setError(error.response?.data?.message || 'Registration failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Login user
  const login = async (email: string, password: string): Promise<User> => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.login(email, password);
      setUser(response);
      
      // Initialize purchases if on mobile
      if ((Platform.OS === 'ios' || Platform.OS === 'android') && response._id) {
        try {
          await subscriptionService.initializePurchases(response._id);
          console.log('RevenueCat initialized after login');
        } catch (error) {
          console.error('Failed to initialize RevenueCat after login:', error);
        }
      }
      
        await saveToken(response.token as string);
      return response;
    } catch (error: any) {
      setError(error.response?.data?.message || 'Login failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Apple Sign-In
  const signInWithApple = async (): Promise<User> => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.signInWithApple();
      setUser(response);
      
      // Initialize purchases if on mobile
      if ((Platform.OS === 'ios' || Platform.OS === 'android') && response._id) {
        try {
          await subscriptionService.initializePurchases(response._id);
          console.log('RevenueCat initialized after Apple Sign-In');
        } catch (error) {
          console.error('Failed to initialize RevenueCat after Apple Sign-In:', error);
        }
      }
      
      await saveToken(response.token as string);
      return response;
    } catch (error: any) {
      setError(error.message || 'Apple Sign-In failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Logout user
  const logout = async (): Promise<void> => {
    setLoading(true);
    try {
      // First set user to null to prevent any API calls that depend on authentication
      setUser(null);
      // Then clear the token
      await clearStorage();
    } catch (error: any) {
      console.error('Logout error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Update user profile
  const updateProfile = async (userData: ProfileUpdateData): Promise<User> => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.updateUserProfile(userData);
      setUser((prevUser) => prevUser ? { ...prevUser, ...response } : response);
      
      // Initialize purchases if on mobile
      if ((Platform.OS === 'ios' || Platform.OS === 'android') && response._id) {
        try {
          await subscriptionService.initializePurchases(response._id);
          console.log('RevenueCat initialized after profile update');
        } catch (error) {
          console.error('Failed to initialize RevenueCat after profile update:', error);
        }
      }
      
      return response;
    } catch (error: any) {
      setError(error.response?.data?.message || 'Profile update failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (updatedUser: User) => {
    setUser(updatedUser);
  };

  const value = {
    user,
    loading,
    error,
    register,
    login,
    logout,
    updateProfile,
    isAuthenticated: !!user,
    token,
    initialized,
    updateUser,
    signInWithApple,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Add default export
export default AuthProvider; 