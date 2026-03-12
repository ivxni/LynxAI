import axios from 'axios';
import { API_URL } from '../constants/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  async (config) => {
    try {
      // Get token from storage
      const token = await AsyncStorage.getItem('token');
      
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        // Make sure to delete the Authorization header if no token exists
        if (config.headers && config.headers.Authorization) {
          delete config.headers.Authorization;
        }
      }
      
      return config;
    } catch (error) {
      console.error('Error in request interceptor:', error);
      return Promise.reject(error);
    }
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Handle errors (e.g., unauthorized, server error)
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      
      // Handle 401 Unauthorized
      if (error.response.status === 401) {
        // Check if we're already on the login screen or if we're trying to access a protected route after logout
        const token = await AsyncStorage.getItem('token');
        if (token) {
          // Only log the error if we have a token (unexpected 401)
          console.error('API Error:', error.response.data);
          
          // Clear token and user data if unauthorized
          try {
            await AsyncStorage.removeItem('token');
            await AsyncStorage.removeItem('user');
            // You might want to redirect to login screen here
            // or dispatch an event to notify the app about the logout
          } catch (storageError) {
            console.error('Error clearing storage:', storageError);
          }
        } else {
          // If we don't have a token, this 401 is expected (e.g., after logout)
          // Just silently handle it without logging an error
          console.log('Expected 401 error (no token)');
        }
      } else {
        // Log other errors
        console.error('API Error:', error.response.data);
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Request error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// Helper function to set token after login/register
export const setAuthToken = async (token: string) => {
  try {
    await AsyncStorage.setItem('token', token);
  } catch (error) {
    console.error('Error setting auth token:', error);
  }
};

// Helper function to clear token after logout
export const clearAuthToken = async () => {
  try {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
  } catch (error) {
    console.error('Error clearing auth token:', error);
  }
};

export default api; 