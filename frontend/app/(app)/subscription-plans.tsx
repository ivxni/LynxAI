import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator, ScrollView, Alert, Platform, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from '../utils/i18n';
import useThemeColors from '../utils/useThemeColors';
import subscriptionService from '../services/subscriptionService';
import { SubscriptionDetails } from '../types/auth.types';
import { PurchasesPackage } from 'react-native-purchases';
import { useAuth } from '../hooks/useAuth';
import { useSubscription } from '../contexts/SubscriptionContext';

const { width: screenWidth } = Dimensions.get('window');

export default function SubscriptionPlans() {
  const router = useRouter();
  const { t, format } = useTranslation();
  const { user } = useAuth();
  const themeColors = useThemeColors();
  
  // Use subscription context instead of local state
  const { subscriptionDetails, isRefreshing, isInitialized, refreshSubscription } = useSubscription();
  
  const [subscribing, setSubscribing] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [packages, setPackages] = useState<PurchasesPackage[]>([]);
  const [isYearly, setIsYearly] = useState(true); // Default to yearly for better savings
  const [showBusinessPlans, setShowBusinessPlans] = useState(false); // Toggle for business plans

  useEffect(() => {
    const initializeData = async () => {
      try {
        // Initialize purchases if on mobile
        if ((Platform.OS === 'ios' || Platform.OS === 'android') && user?._id) {
          await subscriptionService.initializePurchases(user._id);
          const availablePackages = await subscriptionService.getAvailablePackages();
          setPackages(availablePackages);
          console.log(`Found ${availablePackages.length} subscription packages`);
        }
      } catch (error) {
        console.error('Error initializing subscription data:', error);
        Alert.alert(t('common.error'), t('subscription.failedToLoadDetails'));
      }
    };

    initializeData();
  }, [user]);

  // Toggle between Monthly and Yearly for Personal/Family plans
  const BillingToggle = () => (
    <View style={[styles.toggleContainer, { backgroundColor: themeColors.surfaceVariant }]}>
      <TouchableOpacity
        style={[
          styles.toggleButton,
          !isYearly && { backgroundColor: themeColors.primary }
        ]}
        onPress={() => setIsYearly(false)}
      >
        <Text style={[
          styles.toggleText,
          { color: !isYearly ? themeColors.white : themeColors.textSecondary }
        ]}>
          {t('subscription.monthly')}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.toggleButton,
          isYearly && { backgroundColor: themeColors.primary }
        ]}
        onPress={() => setIsYearly(true)}
      >
        <Text style={[
          styles.toggleText,
          { color: isYearly ? themeColors.white : themeColors.textSecondary }
        ]}>
          {t('subscription.yearly')}
        </Text>
        {isYearly && (
          <View style={[styles.savingsBadge, { backgroundColor: themeColors.success }]}>
            <Text style={[styles.savingsText, { color: themeColors.white }]}>
              -33%
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );

  // Toggle between Personal/Family and Business plans
  const PlanTypeToggle = () => (
    <View style={[styles.planTypeToggleContainer, { backgroundColor: themeColors.surfaceVariant }]}>
      <TouchableOpacity
        style={[
          styles.planTypeToggleButton,
          !showBusinessPlans && { backgroundColor: themeColors.primary }
        ]}
        onPress={() => setShowBusinessPlans(false)}
      >
        <MaterialIcons 
          name="person" 
          size={16} 
          color={!showBusinessPlans ? themeColors.white : themeColors.textSecondary} 
        />
        <Text style={[
          styles.planTypeToggleText,
          { color: !showBusinessPlans ? themeColors.white : themeColors.textSecondary }
        ]}>
          Personal
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.planTypeToggleButton,
          showBusinessPlans && { backgroundColor: themeColors.error }
        ]}
        onPress={() => setShowBusinessPlans(true)}
      >
        <MaterialIcons 
          name="business" 
          size={16} 
          color={showBusinessPlans ? themeColors.white : themeColors.textSecondary} 
        />
        <Text style={[
          styles.planTypeToggleText,
          { color: showBusinessPlans ? themeColors.white : themeColors.textSecondary }
        ]}>
          Business
        </Text>
      </TouchableOpacity>
    </View>
  );

  const handleSubscribe = async (planType: 'monthly' | 'yearly' | 'family-monthly' | 'family-yearly' | 'business') => {
    try {
      setSubscribing(true);
      
      // Map plan types to API calls
      if (planType === 'monthly' || planType === 'yearly') {
        await subscriptionService.subscribeToPremium(planType);
      } else if (planType === 'family-monthly') {
        await subscriptionService.subscribeToPlan('family', 'monthly');
      } else if (planType === 'family-yearly') {
        await subscriptionService.subscribeToPlan('family', 'yearly');
      } else if (planType === 'business') {
        await subscriptionService.subscribeToPlan('business', 'monthly');
      }
      
      await refreshSubscription(true); // Force refresh after subscription change
      
      let successMessage = t('subscription.subscriptionSuccessful');
      if (planType.includes('family')) {
        successMessage = t('subscription.familyPlanSuccessful');
      } else if (planType === 'business') {
        successMessage = t('subscription.businessPlanSuccessful');
      }
      
      Alert.alert(
        t('common.success'),
        successMessage,
        [{ text: t('common.ok'), onPress: () => router.replace('/(app)/dashboard') }]
      );
    } catch (error: any) {
      if (error.message === 'Purchase cancelled') {
        console.log('User cancelled purchase');
      } else {
        Alert.alert(t('common.error'), error.message || t('subscription.subscriptionFailed'));
      }
    } finally {
      setSubscribing(false);
    }
  };

  const handleRestorePurchases = async () => {
    try {
      setRestoring(true);
      const result = await subscriptionService.restorePurchases();
      await refreshSubscription(true); // Force refresh after restore
      Alert.alert(
        t('common.success'),
        result.message,
        [{ text: t('common.ok'), onPress: () => router.replace('/(app)/dashboard') }]
      );
    } catch (error: any) {
      Alert.alert(t('common.error'), error.message || t('profile.updateFailed'));
    } finally {
      setRestoring(false);
    }
  };

  const handleReactivateSubscription = async () => {
    try {
      setSubscribing(true);
      await subscriptionService.reactivateSubscription();
      await refreshSubscription(true); // Force refresh after reactivation
                    Alert.alert(
                t('subscription.subscriptionReactivated'),
                t('subscription.subscriptionReactivatedMessage'),
                [{ text: t('common.ok'), onPress: () => router.replace('/(app)/dashboard') }]
              );
    } catch (error: any) {
      Alert.alert(t('common.error'), error.message || t('profile.updateFailed'));
    } finally {
      setSubscribing(false);
    }
  };

  const handleStartTrial = async () => {
    try {
      setSubscribing(true);
      await subscriptionService.startFreeTrial();
      await refreshSubscription(true); // Force refresh after trial start
      Alert.alert(
        t('subscription.freeTrialStarted'),
        t('subscription.freeTrialStartedMessage'),
        [{ text: t('common.ok'), onPress: () => router.replace('/(app)/dashboard') }]
      );
    } catch (error: any) {
      Alert.alert(t('common.error'), error.message || t('profile.updateFailed'));
    } finally {
      setSubscribing(false);
    }
  };

  const handleStayFree = async () => {
    // If user has an active subscription, cancel it
    if (subscriptionDetails?.plan === 'premium' && !subscriptionDetails.isCanceledButActive) {
      Alert.alert(
        t('subscription.cancelAndStayFree'),
        t('subscription.cancelSubscriptionConfirm'),
        [
          { text: t('common.cancel'), style: 'cancel' },
          { 
            text: t('subscription.cancel'), 
            style: 'destructive',
            onPress: async () => {
              try {
                setSubscribing(true);
                await subscriptionService.cancelSubscription();
                await refreshSubscription(true);
                Alert.alert(
                  t('common.success'),
                  t('subscription.subscriptionCancelledMessage'),
                  [{ text: t('common.ok'), onPress: () => router.replace('/(app)/dashboard') }]
                );
              } catch (error: any) {
                Alert.alert(t('common.error'), error.message || t('profile.updateFailed'));
              } finally {
                setSubscribing(false);
              }
            }
          }
        ]
      );
    } else {
      // Just go back if no active subscription
      router.back();
    }
  };

  const renderFeatureItem = (text: string, included: boolean, accentColor: string = themeColors.primary, isCompact: boolean = false) => (
    <View style={isCompact ? styles.compactFeatureItem : styles.featureItem}>
      <View style={[
        isCompact ? styles.compactFeatureIconContainer : styles.featureIconContainer,
        { backgroundColor: included ? accentColor + '20' : themeColors.error + '20' }
      ]}>
        <MaterialIcons 
          name={included ? "check" : "close"} 
          size={isCompact ? 12 : 16} 
          color={included ? accentColor : themeColors.error} 
        />
      </View>
      <Text style={[
        isCompact ? styles.compactFeatureText : styles.featureText, 
        { color: themeColors.text }
      ]}>
        {text}
      </Text>
    </View>
  );

  const PlanCard = ({ 
    title, 
    price, 
    period, 
    description, 
    features, 
    onPress, 
    loading, 
    buttonText, 
    isRecommended = false,
    isCurrentPlan = false,
    gradientColors = [themeColors.surface, themeColors.surface],
    borderColor = themeColors.border,
    accentColor = themeColors.primary,
    isCompact = false
  }: {
    title: string;
    price: string | number;
    period?: string;
    description?: string;
    features: Array<{ text: string; included: boolean }>;
    onPress?: () => void;
    loading?: boolean;
    buttonText?: string;
    isRecommended?: boolean;
    isCurrentPlan?: boolean;
    gradientColors?: [string, string];
    borderColor?: string;
    accentColor?: string;
    isCompact?: boolean;
  }) => (
    <View style={[
      isCompact ? styles.compactPlanCardContainer : styles.planCardContainer, 
      { borderColor }
    ]}>
      <LinearGradient
        colors={gradientColors}
        style={isCompact ? styles.compactPlanCard : styles.planCard}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {isRecommended && (
          <View style={[styles.recommendedBadge, { backgroundColor: themeColors.primary }]}>
            <MaterialIcons name="star" size={12} color={themeColors.white} />
            <Text style={[styles.recommendedText, { color: themeColors.white }]}>
              {t('subscription.recommended')}
            </Text>
          </View>
        )}
        
        {isCurrentPlan && (
          <View style={[styles.currentPlanBadge, { backgroundColor: themeColors.success }]}>
            <MaterialIcons name="check-circle" size={12} color={themeColors.white} />
            <Text style={[styles.currentPlanText, { color: themeColors.white }]}>
              {t('subscription.current')}
            </Text>
          </View>
        )}

        <View style={isCompact ? styles.compactPlanHeader : styles.planHeader}>
          <Text style={[
            isCompact ? styles.compactPlanTitle : styles.planTitle, 
            { color: themeColors.text }
          ]}>
            {title}
          </Text>
          <View style={styles.priceContainer}>
            <Text style={[
              isCompact ? styles.compactPlanPrice : styles.planPrice, 
              { color: accentColor }
            ]}>
              <Text style={isCompact ? styles.compactCurrencySymbol : styles.currencySymbol}>€</Text>
              <Text>{price}</Text>
            </Text>
            {period && (
              <Text style={[
                isCompact ? styles.compactPricePeriod : styles.pricePeriod, 
                { color: themeColors.textSecondary }
              ]}>
                <Text>/{period}</Text>
              </Text>
            )}
          </View>
          {description && (
            <Text style={[
              isCompact ? styles.compactPlanDescription : styles.planDescription, 
              { color: themeColors.textSecondary }
            ]}>
              {description}
            </Text>
          )}
        </View>

        <View style={isCompact ? styles.compactFeatureList : styles.featureList}>
          {features.slice(0, isCompact ? 3 : features.length).map((feature, index) => (
            <View key={index}>
              {renderFeatureItem(feature.text, feature.included, accentColor, isCompact)}
            </View>
          ))}
        </View>

        {onPress && buttonText && (
          <TouchableOpacity 
            style={[
              isCompact ? styles.compactPlanButton : styles.planButton,
              { backgroundColor: isRecommended 
                  ? accentColor 
                  : accentColor !== themeColors.primary 
                    ? accentColor + '20' 
                    : themeColors.surfaceVariant 
              }
            ]}
            onPress={onPress}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator 
                size="small" 
                color={isRecommended 
                  ? themeColors.white 
                  : accentColor !== themeColors.primary 
                    ? accentColor 
                    : accentColor
                } 
              />
            ) : (
              <Text style={[
                isCompact ? styles.compactPlanButtonText : styles.planButtonText, 
                { color: isRecommended 
                    ? themeColors.white 
                    : accentColor !== themeColors.primary 
                      ? accentColor 
                      : accentColor
                }
              ]}>
                {buttonText}
              </Text>
            )}
          </TouchableOpacity>
        )}
      </LinearGradient>
    </View>
  );

  const renderContent = () => {
    if (!subscriptionDetails) {
      return null;
    }

    // New pricing structure
    const pricing = {
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
    };

    const premiumSavingsPercent = Math.round(100 - (pricing.premium.yearly / 12 / pricing.premium.monthly * 100));
    const familySavingsPercent = Math.round(100 - (pricing.family.yearly / 12 / pricing.family.monthly * 100));
    
    // Trial user view
    if (subscriptionDetails.isInTrial) {
      return (
        <View style={styles.contentContainer}>
          <View style={styles.headerSection}>
            <LinearGradient
              colors={[themeColors.warning + '20', themeColors.warning + '05']}
              style={styles.headerGradient}
            >
              <MaterialIcons name="star" size={48} color={themeColors.warning} />
              <Text style={[styles.pageTitle, { color: themeColors.text }]}>
                {t('subscription.trial')} {t('subscription.active')}
              </Text>
              <Text style={[styles.pageSubtitle, { color: themeColors.textSecondary }]}>
                <Text>{t('subscription.trialEnds')}: </Text>
                <Text style={{ color: themeColors.warning, fontWeight: '600' }}>
                  {subscriptionDetails.trialEndDate 
                    ? new Date(subscriptionDetails.trialEndDate).toLocaleDateString() 
                    : t('subscription.unknown')}
                </Text>
              </Text>
            </LinearGradient>
          </View>

          {/* Current Trial Status */}
          <View style={[styles.trialStatusCard, { backgroundColor: themeColors.surfaceVariant }]}>
            <View style={styles.trialStatusHeader}>
              <MaterialIcons name="info" size={24} color={themeColors.primary} />
              <Text style={[styles.trialStatusTitle, { color: themeColors.text }]}>
                Your trial includes:
              </Text>
            </View>
            <View style={styles.trialFeatureList}>
              {renderFeatureItem(`100 ${t('subscription.documentsPerMonth')}`, true, themeColors.warning)}
              {renderFeatureItem(t('subscription.feature.priority'), true, themeColors.warning)}
              {renderFeatureItem(t('subscription.feature.premium'), true, themeColors.warning)}
            </View>
          </View>

          {/* Billing Toggle */}
          <BillingToggle />

          {/* PREMIUM PLAN - Upgrade from Trial */}
          <PlanCard
            title={t('subscription.premiumUser')}
            price={isYearly ? pricing.premium.yearly : pricing.premium.monthly}
            period={isYearly ? t('subscription.yearly') : t('subscription.monthly')}
            description={isYearly 
              ? `${format(t('subscription.savePercent'), { percent: premiumSavingsPercent })}` 
              : t('subscription.regularUse')
            }
            features={[
              { text: `100 ${t('subscription.documentsPerMonth')}`, included: true },
              { text: t('subscription.feature.priority'), included: true },
              { text: t('subscription.feature.cancel'), included: true }
            ]}
            onPress={() => handleSubscribe(isYearly ? 'yearly' : 'monthly')}
            loading={subscribing}
            buttonText={`€${isYearly ? pricing.premium.yearly : pricing.premium.monthly}/${isYearly ? t('subscription.yearly') : t('subscription.monthly')}`}
            isRecommended={true}
            borderColor={themeColors.primary}
            gradientColors={[themeColors.primary + '10', themeColors.surface]}
          />

          {/* Cancel Trial Option */}
          <TouchableOpacity 
            style={[styles.cancelTrialButton, { borderColor: themeColors.error }]}
            onPress={() => {
              Alert.alert(
                t('subscription.cancel') + ' ' + t('subscription.trial'),
                t('subscription.cancelSubscriptionConfirm'),
                [
                  { text: t('common.cancel'), style: 'cancel' },
                  { 
                    text: t('subscription.cancel'), 
                    style: 'destructive',
                    onPress: async () => {
                      try {
                        setSubscribing(true);
                        await subscriptionService.cancelSubscription();
                        await refreshSubscription(true);
                        Alert.alert(
                          t('common.success'),
                          t('subscription.subscriptionCancelledMessage'),
                          [{ text: t('common.ok'), onPress: () => router.replace('/(app)/dashboard') }]
                        );
                      } catch (error: any) {
                        Alert.alert(t('common.error'), error.message || t('profile.updateFailed'));
                      } finally {
                        setSubscribing(false);
                      }
                    }
                  }
                ]
              );
            }}
            disabled={subscribing}
          >
            <MaterialIcons name="cancel" size={20} color={themeColors.error} />
            <Text style={[styles.cancelTrialText, { color: themeColors.error }]}>
              {t('subscription.cancel')} {t('subscription.trial')}
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    // Cancelled subscription
    if (subscriptionDetails.isCanceledButActive) {
      return (
        <View style={styles.contentContainer}>
          <View style={styles.headerSection}>
            <LinearGradient
              colors={[themeColors.warning + '20', themeColors.warning + '05']}
              style={styles.headerGradient}
            >
              <MaterialIcons name="warning" size={48} color={themeColors.warning} />
              <Text style={[styles.pageTitle, { color: themeColors.text }]}>
                {t('subscription.subscriptionEnding')}
              </Text>
              <Text style={[styles.pageSubtitle, { color: themeColors.textSecondary }]}>
                <Text>{t('subscription.accessUntil')}: </Text>
                <Text style={{ color: themeColors.warning, fontWeight: '600' }}>
                  {subscriptionDetails.nextBillingDate 
                    ? new Date(subscriptionDetails.nextBillingDate).toLocaleDateString() 
                    : t('subscription.unknown')}
                </Text>
              </Text>
            </LinearGradient>
          </View>

          <PlanCard
            title={`${t('subscription.premium')} (${t('subscription.subscriptionEnding')})`}
                            price={t('subscription.active')}
            description={`${t('subscription.nextBilling')}: ${subscriptionDetails.nextBillingDate 
              ? new Date(subscriptionDetails.nextBillingDate).toLocaleDateString() 
                              : t('subscription.unknown')}`}
            features={[
              { text: t('subscription.feature.documents'), included: true },
              { text: t('subscription.feature.priority'), included: true }
            ]}
            onPress={handleReactivateSubscription}
            loading={subscribing}
            buttonText={t('subscription.reactivate')}
            isRecommended={true}
            borderColor={themeColors.warning}
            gradientColors={[themeColors.warning + '10', themeColors.surface]}
          />
        </View>
      );
    }

    // Default subscription plans view
    return (
      <View style={styles.contentContainer}>
        <View style={styles.headerSection}>
          <LinearGradient
            colors={[themeColors.primary + '15', themeColors.primaryLight + '05']}
            style={styles.compactHeaderGradient}
          >
            <MaterialIcons name="rocket-launch" size={32} color={themeColors.primary} />
            <Text style={[styles.compactPageTitle, { color: themeColors.text }]}>
              {t('subscription.chooseYourPlan')}
            </Text>
          </LinearGradient>
          
          {/* Plan Type Toggle */}
          <PlanTypeToggle />
          
          {/* Billing Toggle - Only for Personal/Family plans */}
          {!showBusinessPlans && <BillingToggle />}
        </View>

        {!showBusinessPlans ? (
          <>
            {/* FREE TRIAL - Only show if available */}
        {!subscriptionDetails?.trialStartDate && !subscriptionDetails?.trialEndDate && (
          <PlanCard
            title={t('subscription.freeTrial')}
            price="0"
            period={t('subscription.trialPeriod')}
            description={t('subscription.testPremiumFeatures')}
            features={[
              { text: `100 ${t('subscription.documentsPerMonth')}`, included: true },
              { text: t('subscription.feature.priority'), included: true },
              { text: t('subscription.feature.cancel'), included: true }
            ]}
            onPress={handleStartTrial}
            loading={subscribing}
            buttonText={t('subscription.startFreeTrial7Days')}
            isRecommended={true}
            borderColor={themeColors.success}
            gradientColors={[themeColors.success + '15', themeColors.surface]}
                isCompact={true}
          />
        )}

            {/* FREE PLAN */}
        <PlanCard
          title={t('subscription.freeUser')}
          price="0"
          period={t('subscription.freeForever')}
          description={t('subscription.casualUse')}
          features={[
            { text: `3 ${t('subscription.documentsPerDay')}`, included: true },
            { text: t('subscription.feature.standard'), included: true },
            { text: t('subscription.feature.premium'), included: false }
          ]}
          onPress={handleStayFree}
          buttonText={t('subscription.stayFree')}
          borderColor={themeColors.border}
          gradientColors={[themeColors.surfaceVariant, themeColors.surface]}
              isCompact={true}
        />

            {/* PREMIUM PLAN */}
        <PlanCard
          title={t('subscription.premiumUser')}
              price={isYearly ? pricing.premium.yearly : pricing.premium.monthly}
              period={isYearly ? t('subscription.yearly') : t('subscription.monthly')}
              description={isYearly 
                ? `${format(t('subscription.savePercent'), { percent: premiumSavingsPercent })}! ${format(t('subscription.onlyEuroPerMonth'), { price: '3.33' })}` 
                : t('subscription.regularUse')
              }
          features={[
            { text: `100 ${t('subscription.documentsPerMonth')}`, included: true },
            { text: t('subscription.feature.priority'), included: true },
            { text: t('subscription.feature.cancel'), included: true }
          ]}
              onPress={() => handleSubscribe(isYearly ? 'yearly' : 'monthly')}
          loading={subscribing}
              buttonText={subscriptionDetails.plan === 'premium' && subscriptionDetails.billingCycle === (isYearly ? 'yearly' : 'monthly') 
                ? t('subscription.currentPlan') 
                : `€${isYearly ? pricing.premium.yearly : pricing.premium.monthly} ${isYearly ? t('subscription.perYear') : t('subscription.perMonth')}`
              }
              isCurrentPlan={subscriptionDetails.plan === 'premium' && subscriptionDetails.billingCycle === (isYearly ? 'yearly' : 'monthly')}
              isRecommended={isYearly && subscriptionDetails.plan !== 'premium'}
              borderColor={subscriptionDetails.plan === 'premium' && subscriptionDetails.billingCycle === (isYearly ? 'yearly' : 'monthly') 
                ? themeColors.success 
                : themeColors.primary
              }
          gradientColors={[themeColors.primary + '10', themeColors.surface]}
              isCompact={true}
        />

            {/* FAMILY PLAN */}
        <PlanCard
          title={t('subscription.premiumFamily')}
              price={isYearly ? pricing.family.yearly : pricing.family.monthly}
              period={isYearly ? t('subscription.yearly') : t('subscription.monthly')}
              description={isYearly 
                ? `${format(t('subscription.savePercent'), { percent: familySavingsPercent })}! ${format(t('subscription.onlyEuroPerMonth'), { price: '16.58' })}` 
                : t('subscription.idealForFamilies')
              }
          features={[
            { text: t('subscription.fourDevices'), included: true },
            { text: `150 ${t('subscription.documentsPerMonth')}`, included: true },
            { text: t('subscription.familyDashboard'), included: true }
          ]}
              onPress={() => handleSubscribe(isYearly ? 'family-yearly' : 'family-monthly')}
          loading={subscribing}
              buttonText={`€${isYearly ? pricing.family.yearly : pricing.family.monthly} ${isYearly ? t('subscription.perYear') : t('subscription.perMonth')}`}
          borderColor={themeColors.warning}
          gradientColors={[themeColors.warning + '10', themeColors.surface]}
          accentColor={themeColors.warning}
              isCompact={true}
            />
          </>
        ) : (
          <>
            {/* BUSINESS PLAN */}
        <PlanCard
          title={t('subscription.businessUser')}
              price={pricing.business.monthly}
          period={t('subscription.monthly')}
          description={t('subscription.unlimitedUsage')}
          features={[
            { text: t('subscription.unlimitedDevices'), included: true },
            { text: t('subscription.unlimitedDocuments'), included: true },
            { text: t('subscription.prioritySupport'), included: true },
            { text: t('subscription.teamManagement'), included: true },
            { text: t('subscription.apiAccess'), included: true }
          ]}
          onPress={() => handleSubscribe('business')}
          loading={subscribing}
              buttonText={`€${pricing.business.monthly} ${t('subscription.perMonth')}`}
          borderColor={themeColors.error}
          gradientColors={[themeColors.error + '15', themeColors.surface]}
          accentColor={themeColors.error}
              isRecommended={true}
            />

            {/* Business Info Section */}
            <View style={[styles.businessInfoSection, { backgroundColor: themeColors.surfaceVariant }]}>
              <MaterialIcons name="info" size={24} color={themeColors.primary} />
              <Text style={[styles.businessInfoText, { color: themeColors.textSecondary }]}>
                Business plans include advanced features like team management, API access, and priority support. 
                Contact us for enterprise solutions and volume discounts.
              </Text>
            </View>
          </>
        )}
      </View>
    );
  };

  if (!isInitialized || !subscriptionDetails) {
    return (
      <SafeAreaView style={[styles.container, styles.centerContent, { backgroundColor: themeColors.background }]} edges={['top']}>
        <LinearGradient
          colors={[themeColors.primary + '20', themeColors.background]}
          style={styles.loadingContainer}
        >
          <ActivityIndicator size="large" color={themeColors.primary} />
          <Text style={[styles.loadingText, { color: themeColors.textSecondary }]}>
            {t('common.loading')}
          </Text>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <MaterialIcons name="arrow-back" size={24} color={themeColors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: themeColors.text }]}>
          {t('subscription.title')}
        </Text>
        <View style={styles.placeholderButton} />
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {renderContent()}
        
        {(Platform.OS === 'ios' || Platform.OS === 'android') && (
          <View style={styles.restoreSection}>
            <TouchableOpacity 
              style={[styles.restoreButton, { borderColor: themeColors.border }]}
              onPress={handleRestorePurchases}
              disabled={restoring}
            >
              {restoring ? (
                <ActivityIndicator size="small" color={themeColors.primary} />
              ) : (
                <>
                  <MaterialIcons name="restore" size={20} color={themeColors.primary} />
                  <Text style={[styles.restoreButtonText, { color: themeColors.primary }]}>
                    {t('subscription.restore')}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}
        
        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    borderRadius: 20,
    margin: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '500',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
    zIndex: 1,
  },
  backButton: {
    padding: 8,
    zIndex: 2,
  },
  placeholderButton: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  contentContainer: {
    padding: 20,
  },
  headerSection: {
    marginBottom: 24,
  },
  headerGradient: {
    alignItems: 'center',
    padding: 24,
    borderRadius: 20,
    marginBottom: 8,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '800',
    marginTop: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  pageSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  planCardContainer: {
    marginBottom: 16,
    borderRadius: 20,
    borderWidth: 2,
    overflow: 'hidden',
  },
  planCard: {
    padding: 24,
    position: 'relative',
  },
  recommendedBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  recommendedText: {
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 4,
    textTransform: 'uppercase',
  },
  currentPlanBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    zIndex: 11, // Higher than recommended badge
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  currentPlanText: {
    fontSize: 11,
    fontWeight: '700',
    marginLeft: 3,
    textTransform: 'uppercase',
  },
  planHeader: {
    marginBottom: 20,
    marginTop: 16,
    paddingRight: 120, // Space for badges
  },
  planTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 12,
    lineHeight: 26,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  planPrice: {
    fontSize: 36,
    fontWeight: '800',
  },
  currencySymbol: {
    fontSize: 24,
  },
  pricePeriod: {
    fontSize: 18,
    marginLeft: 4,
  },
  planDescription: {
    fontSize: 15,
    lineHeight: 20,
    marginTop: 8,
  },
  featureList: {
    marginBottom: 24,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  featureIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  featureText: {
    fontSize: 15,
    fontWeight: '500',
    flex: 1,
  },
  planButton: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  planButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
  restoreSection: {
    paddingHorizontal: 20,
    marginTop: 16,
  },
  restoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderStyle: 'dashed',
  },
  restoreButtonText: {
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 8,
  },
  bottomPadding: {
    height: 40,
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
    borderRadius: 16,
    marginTop: 16,
    alignSelf: 'center',
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginHorizontal: 2,
    position: 'relative',
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '700',
  },
  savingsBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  savingsText: {
    fontSize: 10,
    fontWeight: '700',
  },
  compactPlanCardContainer: {
    marginBottom: 16,
    borderRadius: 20,
    borderWidth: 2,
    overflow: 'hidden',
  },
  compactPlanCard: {
    padding: 24,
    position: 'relative',
  },
  compactPlanHeader: {
    marginBottom: 20,
    marginTop: 16,
    paddingRight: 120, // Space for badges
  },
  compactPlanTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 12,
    lineHeight: 26,
  },
  compactPlanPrice: {
    fontSize: 36,
    fontWeight: '800',
  },
  compactCurrencySymbol: {
    fontSize: 24,
  },
  compactPricePeriod: {
    fontSize: 18,
    marginLeft: 4,
  },
  compactPlanDescription: {
    fontSize: 15,
    lineHeight: 20,
    marginTop: 8,
  },
  compactFeatureList: {
    marginBottom: 24,
  },
  compactFeatureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  compactFeatureIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  compactFeatureText: {
    fontSize: 15,
    fontWeight: '500',
    flex: 1,
  },
  compactPlanButton: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  compactPlanButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
  compactHeaderGradient: {
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    marginBottom: 8,
  },
  compactPageTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginTop: 8,
    textAlign: 'center',
  },
  planTypeToggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
    borderRadius: 16,
    marginTop: 16,
    alignSelf: 'center',
  },
  planTypeToggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginHorizontal: 2,
    position: 'relative',
  },
  planTypeToggleText: {
    fontSize: 14,
    fontWeight: '700',
  },
  businessInfoSection: {
    padding: 20,
    borderRadius: 20,
    marginTop: 20,
    marginBottom: 20,
  },
  businessInfoText: {
    fontSize: 15,
    lineHeight: 20,
    marginTop: 12,
  },
  trialStatusCard: {
    padding: 20,
    borderRadius: 20,
    marginBottom: 20,
  },
  trialStatusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  trialStatusTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 8,
  },
  trialFeatureList: {
    marginBottom: 20,
  },
  cancelTrialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderStyle: 'dashed',
  },
  cancelTrialText: {
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 8,
  },
}); 