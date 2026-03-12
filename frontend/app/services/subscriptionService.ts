import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { API_URL } from '../constants/api';
import { SubscriptionDetails } from '../types/auth.types';
import Constants from 'expo-constants';

// Mock Purchases für Expo Go
let Purchases: any = {
  configure: async () => console.log('Mock: Purchases.configure called'),
  getOfferings: async () => ({ 
    current: { 
      availablePackages: [] 
    } 
  }),
  purchasePackage: async () => ({
    customerInfo: { originalAppUserId: 'mock-user', allPurchaseDates: {} },
    productIdentifier: 'mock-product'
  }),
  restorePurchases: async () => ({
    originalAppUserId: 'mock-user',
    allPurchaseDates: {}
  })
};

// PurchasesPackage Typ für TypeScript
interface PurchasesPackage {
  identifier: string;
  offeringIdentifier: string;
  packageType: string;
  product: {
    identifier: string;
    description: string;
    title: string;
    price: number;
    priceString: string;
  };
}

// RevenueCat SDK is only available in native builds, not Expo Go
try {
  if (!Constants.expoConfig?.extra?.isExpoGo) {
    Purchases = require('react-native-purchases').default;
  }
} catch (error) {
  // Falls back to mock when SDK is unavailable
}

// Get RevenueCat API keys from app.json extra
const revenueCatConfig = Constants.expoConfig?.extra?.revenueCat || {
  iosApiKey: '',
  androidApiKey: ''
};

// Product identifiers for Apple IAP
const IAP_IDENTIFIERS = {
  MONTHLY: 'com.snapocr.app.premium.monthly',
  YEARLY: 'com.snapocr.app.premium.yearly',
};

// Set up axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add interceptor to add auth token to requests
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Initialize RevenueCat with your API key
 */
const initializePurchases = async (userId: string) => {
  if (Platform.OS === 'ios' || Platform.OS === 'android') {
    try {
      if (Constants.expoConfig?.extra?.isExpoGo) {
        return;
      }
      
      const apiKey = Platform.OS === 'ios' 
        ? revenueCatConfig.iosApiKey
        : revenueCatConfig.androidApiKey;
      
      // Check if API key is available
      if (!apiKey) {
        console.warn('RevenueCat API key not found for platform:', Platform.OS);
        return;
      }
        
      await Purchases.configure({ apiKey, appUserID: userId });
      console.log('RevenueCat initialized for user:', userId);
    } catch (error) {
      console.error('Failed to initialize RevenueCat:', error);
    }
  }
};

/**
 * Get available packages from the store
 */
const getAvailablePackages = async (): Promise<PurchasesPackage[]> => {
  if (Platform.OS !== 'ios' && Platform.OS !== 'android') {
    // For web or other platforms, return empty array
    return [];
  }

  // In Expo Go, return mock packages
  if (Constants.expoConfig?.extra?.isExpoGo) {
    return [
      {
        identifier: 'monthly',
        offeringIdentifier: 'default',
        packageType: 'MONTHLY',
        product: {
          identifier: 'com.snapocr.app.premium.monthly',
          description: 'Premium monthly subscription',
          title: 'Premium Monthly',
          price: 9.99,
          priceString: '$9.99'
        }
      },
      {
        identifier: 'yearly',
        offeringIdentifier: 'default',
        packageType: 'YEARLY',
        product: {
          identifier: 'com.snapocr.app.premium.yearly',
          description: 'Premium yearly subscription (save 17%)',
          title: 'Premium Yearly',
          price: 99.99,
          priceString: '$99.99'
        }
      }
    ];
  }

  try {
    const offerings = await Purchases.getOfferings();
    
    if (offerings?.current?.availablePackages) {
      return offerings.current.availablePackages;
    } else {
      console.warn('No available packages found');
      return [];
    }
  } catch (error) {
    console.error('Error fetching packages:', error);
    throw error;
  }
};

/**
 * Get subscription details
 */
const getSubscriptionDetails = async (): Promise<SubscriptionDetails> => {
  try {
    const response = await api.get('/subscription');
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to get subscription details');
  }
};

/**
 * Start free trial
 */
const startFreeTrial = async (): Promise<{message: string; subscription: any}> => {
  try {
    const response = await api.post('/subscription/trial');
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to start free trial');
  }
};

/**
 * Subscribe to any plan (premium, family, business)
 */
const subscribeToPlan = async (planType: 'premium' | 'family' | 'business', billingCycle: 'monthly' | 'yearly'): Promise<{message: string; subscription: any}> => {
  // On web/development, use API endpoint directly
  if (Platform.OS !== 'ios' && Platform.OS !== 'android' || Constants.expoConfig?.extra?.isExpoGo) {
    try {
      const response = await api.post('/subscription/subscribe', {
        planType,
        billingCycle: planType === 'business' ? 'monthly' : billingCycle
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to subscribe to plan');
    }
  }

  // On mobile, use RevenueCat for payment processing
  try {
    const packages = await getAvailablePackages();
    const targetPackage = packages.find(pkg => 
      (billingCycle === 'monthly' && pkg.packageType === 'MONTHLY') ||
      (billingCycle === 'yearly' && pkg.packageType === 'YEARLY')
    );

    if (!targetPackage) {
      throw new Error(`No ${billingCycle} package found`);
    }

    const purchaseResult = await Purchases.purchasePackage(targetPackage);
    
    if (purchaseResult?.customerInfo) {
      // Verify the purchase with our backend
      const response = await api.post('/subscription/verify-purchase', {
        platform: Platform.OS,
        productIdentifier: targetPackage.product.identifier,
        planType,
        billingCycle: planType === 'business' ? 'monthly' : billingCycle,
        transactionId: purchaseResult.productIdentifier
      });
      
      return response.data;
    } else {
      throw new Error('Purchase failed');
    }
  } catch (error: any) {
    if (error.userCancelled) {
      throw new Error('Purchase cancelled');
    }
    throw new Error(error.message || 'Failed to subscribe to plan');
  }
};

/**
 * Subscribe to premium plan using Apple IAP
 */
const subscribeToPremium = async (billingCycle: 'monthly' | 'yearly'): Promise<{message: string; subscription: any}> => {
  // Use the new subscribeToPlan function
  return subscribeToPlan('premium', billingCycle);
};

/**
 * Restore purchases from Apple/Google
 */
const restorePurchases = async (): Promise<{message: string; subscription: any}> => {
  if (Platform.OS !== 'ios' && Platform.OS !== 'android') {
    throw new Error('Restore purchases is only available on mobile platforms');
  }

  // In Expo Go, use mock response
  if (Constants.expoConfig?.extra?.isExpoGo) {
    return {
      message: 'Purchases restored (mock in Expo Go)',
      subscription: { plan: 'premium', billingCycle: 'monthly' }
    };
  }

  try {
    // Restore purchases
    const customerInfo = await Purchases.restorePurchases();
    
    // Verify with our backend
    const response = await api.post('/subscription/restore-purchases', {
      platform: Platform.OS,
      purchases: customerInfo.allPurchaseDates
    });

    return response.data;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to restore purchases');
  }
};

/**
 * Cancel subscription
 */
const cancelSubscription = async (): Promise<{message: string; subscription: any}> => {
  try {
    const response = await api.post('/subscription/cancel');
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to cancel subscription');
  }
};

/**
 * Check if user can process document
 */
const canProcessDocument = async (): Promise<{
  canProcess: boolean;
  remainingDocuments: number;
  plan: 'free' | 'premium';
  usedDocuments: number;
  totalDocuments: number;
}> => {
  try {
    const response = await api.get('/subscription/can-process');
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to check document processing capability');
  }
};

/**
 * Get subscription details optimized for Dashboard refreshes
 * with more verbose logging to help debug refresh issues
 */
const getDashboardSubscriptionInfo = async (): Promise<{
  plan: 'free' | 'premium' | 'family' | 'business';
  billingCycle?: string;
  isInTrial: boolean;
  isCanceledButActive?: boolean;
  remainingDocuments: number;
  totalDocuments: number;
}> => {
  try {
    const response = await api.get('/subscription');
    
    const data = response.data;
    
    return {
      plan: data.plan,
      billingCycle: data.billingCycle,
      isInTrial: data.isInTrial,
      isCanceledButActive: data.isCanceledButActive,
      remainingDocuments: data.documentLimitRemaining,
      totalDocuments: data.documentLimitTotal
    };
  } catch (error: any) {
    console.error('Error fetching dashboard subscription info:', error);
    throw new Error(error.response?.data?.message || 'Failed to get subscription details');
  }
};

/**
 * Reactivate a cancelled subscription
 */
const reactivateSubscription = async (): Promise<{message: string; subscription: any}> => {
  try {
    const response = await api.post('/subscription/reactivate');
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to reactivate subscription');
  }
};

const subscriptionService = {
  initializePurchases,
  getAvailablePackages,
  startFreeTrial,
  subscribeToPremium,
  subscribeToPlan,
  cancelSubscription,
  canProcessDocument,
  getDashboardSubscriptionInfo,
  reactivateSubscription,
  getSubscriptionDetails,
  restorePurchases,
};

export default subscriptionService; 