import api, { setAuthToken, clearAuthToken } from './api';
import { ENDPOINTS } from '../constants/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, RegisterData, ProfileUpdateData } from '../types/auth.types';
import * as AppleAuthentication from 'expo-apple-authentication';
import { Platform } from 'react-native';

// Apple Sign-In
export const signInWithApple = async (): Promise<User> => {
  try {
    if (Platform.OS !== 'ios') {
      throw new Error('Apple Sign-In is only available on iOS');
    }

    // Check if Apple Sign-In is available
    const isAvailable = await AppleAuthentication.isAvailableAsync();
    if (!isAvailable) {
      throw new Error('Apple Sign-In is not available on this device');
    }

    // Request Apple Sign-In
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });

    // Send credential to our backend
    const response = await api.post(ENDPOINTS.APPLE_SIGNIN, {
      identityToken: credential.identityToken,
      authorizationCode: credential.authorizationCode,
      user: credential.user,
      email: credential.email,
      fullName: credential.fullName,
    });
    
    if (response.data.token) {
      await setAuthToken(response.data.token);
      await AsyncStorage.setItem('user', JSON.stringify(response.data));
    }
    
    return response.data;
  } catch (error: any) {
    if (error.code === 'ERR_CANCELED') {
      throw new Error('Apple Sign-In was cancelled');
    }
    throw error;
  }
};

// Register a new user
export const register = async (userData: RegisterData): Promise<User> => {
  try {
    const response = await api.post(ENDPOINTS.REGISTER, userData);
    
    if (response.data.token) {
      await setAuthToken(response.data.token);
      await AsyncStorage.setItem('user', JSON.stringify(response.data));
    }
    
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Login user
export const login = async (email: string, password: string): Promise<User> => {
  try {
    const response = await api.post(ENDPOINTS.LOGIN, { email, password });
    
    if (response.data.token) {
      await setAuthToken(response.data.token);
      await AsyncStorage.setItem('user', JSON.stringify(response.data));
    }
    
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Logout user
export const logout = async (): Promise<void> => {
  try {
    await clearAuthToken();
  } catch (error) {
    throw error;
  }
};

// Get current user
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const user = await AsyncStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  } catch (error) {
    throw error;
  }
};

// Get user profile
export const getUserProfile = async (): Promise<User> => {
  try {
    const response = await api.get(ENDPOINTS.PROFILE);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Update user profile
export const updateUserProfile = async (userData: ProfileUpdateData): Promise<User> => {
  try {
    const response = await api.put(ENDPOINTS.PROFILE, userData);
    
    if (response.data) {
      const currentUser = await AsyncStorage.getItem('user');
      if (currentUser) {
        const parsedUser = JSON.parse(currentUser);
        const updatedUser = { ...parsedUser, ...response.data };
        await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      }
    }
    
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Change password
export const changePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
  try {
    await api.put(ENDPOINTS.PROFILE, { 
      currentPassword, 
      password: newPassword 
    });
  } catch (error) {
    throw error;
  }
};

export default {
  register,
  login,
  logout,
  getCurrentUser,
  getUserProfile,
  updateUserProfile,
  changePassword,
  signInWithApple,
}; 