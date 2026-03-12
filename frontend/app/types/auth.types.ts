export interface User {
  _id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  profilePicture?: string;
  subscription?: {
    plan: 'free' | 'premium' | 'family' | 'business';
    billingCycle: 'none' | 'monthly' | 'yearly';
    trialStartDate?: string;
    trialEndDate?: string;
    isInTrial: boolean;
    lastBillingDate?: string;
    nextBillingDate?: string;
    documentLimitTotal: number;
    documentLimitUsed: number;
    documentLimitResetDate?: string;
    deviceCount?: number;
  };
  preferences?: {
    notifications: boolean;
    theme: string;
    language: string;
  };
  token?: string;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface ProfileUpdateData {
  email?: string;
  firstName?: string;
  lastName?: string;
  profilePicture?: string;
  password?: string;
  preferences?: {
    notifications?: boolean;
    theme?: string;
    language?: string;
  };
}

export interface SubscriptionDetails {
  plan: 'free' | 'premium' | 'family' | 'business';
  billingCycle: 'none' | 'monthly' | 'yearly';
  isInTrial: boolean;
  trialStartDate?: string;
  trialEndDate?: string;
  nextBillingDate?: string;
  documentLimitTotal: number;
  documentLimitUsed: number;
  documentLimitRemaining: number;
  resetDate?: string;
  deviceCount?: number;
  isCanceledButActive?: boolean;
  pricing: {
    premium: {
      monthly: number;
      yearly: number;
    };
    family: {
      monthly: number;
      yearly: number;
    };
    business: {
      monthly: number;
    };
  };
}

// Create a default export with a React component
import React from 'react';

const AuthTypesComponent: React.FC = () => {
  return null;
};

export default AuthTypesComponent; 