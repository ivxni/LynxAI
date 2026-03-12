import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import subscriptionService from '../services/subscriptionService';
import { SubscriptionDetails } from '../types/auth.types';

interface SubscriptionContextType {
  subscriptionDetails: SubscriptionDetails | null;
  isLoading: boolean;
  isRefreshing: boolean;
  isInitialized: boolean;
  error: string | null;
  refreshSubscription: (force?: boolean) => Promise<void>;
  dashboardInfo: {
    plan: string;
    billingCycle?: string;
    remainingDocuments: number;
    totalDocuments: number;
    isInTrial: boolean;
    isCanceledButActive?: boolean;
  } | null;
}

const SubscriptionContext = createContext<SubscriptionContextType | null>(null);

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};

interface SubscriptionProviderProps {
  children: React.ReactNode;
}

export const SubscriptionProvider: React.FC<SubscriptionProviderProps> = ({ children }) => {
  const [subscriptionDetails, setSubscriptionDetails] = useState<SubscriptionDetails | null>({
    plan: 'free',
    isInTrial: false,
    trialEndDate: undefined,
    billingCycle: 'none',
    nextBillingDate: undefined,
    isCanceledButActive: false,
    documentLimitTotal: 3, // 3 documents per day for free users
    documentLimitRemaining: 3,
    documentLimitUsed: 0,
    resetDate: undefined,
    deviceCount: 1,
    pricing: {
      premium: {
        monthly: 4.99,
        yearly: 39.99
      },
      family: {
        monthly: 19.99,
        yearly: 199.00
      },
      business: {
        monthly: 199.99
      }
    }
  });
  const [dashboardInfo, setDashboardInfo] = useState<{
    plan: string;
    billingCycle?: string;
    remainingDocuments: number;
    totalDocuments: number;
    isInTrial: boolean;
    isCanceledButActive?: boolean;
  } | null>({
    plan: 'free',
    billingCycle: undefined,
    remainingDocuments: 3,
    totalDocuments: 3, // 3 documents per day for free users
    isInTrial: false,
    isCanceledButActive: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isInitialized, setIsInitialized] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const lastFetchTime = useRef<number>(0);
  const cacheTime = 30000; // 30 seconds cache

  const refreshSubscription = useCallback(async (force = false) => {
    const now = Date.now();
    
    // If not forced and we have recent data, skip refresh
    if (!force && now - lastFetchTime.current < cacheTime && isInitialized) {
      console.log('Subscription data is fresh, skipping refresh');
      return;
    }

    const isBackgroundRefresh = isInitialized && !force;
    
    try {
      if (!isBackgroundRefresh) {
        setIsLoading(true);
      } else {
        setIsRefreshing(true);
      }
      
      setError(null);

      // Fetch both subscription details and dashboard info in parallel
      const [details, dashInfo] = await Promise.all([
        subscriptionService.getSubscriptionDetails(),
        subscriptionService.getDashboardSubscriptionInfo()
      ]);



      setSubscriptionDetails(details);
      setDashboardInfo({
        plan: dashInfo.plan,
        billingCycle: dashInfo.billingCycle,
        remainingDocuments: dashInfo.remainingDocuments,
        totalDocuments: dashInfo.totalDocuments,
        isInTrial: dashInfo.isInTrial,
        isCanceledButActive: dashInfo.isCanceledButActive,
      });
      
      lastFetchTime.current = now;
      setIsInitialized(true);
      
      console.log('Subscription context updated:', details.plan, details.isInTrial ? '(TRIAL)' : '');
    } catch (err: any) {
      console.error('Failed to fetch subscription data:', err);
      setError(err.message || 'Failed to fetch subscription data');
    } finally {
      if (!isBackgroundRefresh) {
        setIsLoading(false);
      } else {
        setIsRefreshing(false);
      }
    }
  }, [isInitialized, cacheTime]);

  // Initial load
  useEffect(() => {
    refreshSubscription(true);
  }, []);

  const value: SubscriptionContextType = {
    subscriptionDetails,
    dashboardInfo,
    isLoading,
    isRefreshing,
    isInitialized,
    error,
    refreshSubscription,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
}; 