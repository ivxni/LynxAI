import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
  ScrollView,
  Alert,
  Dimensions
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTranslation } from '../../utils/i18n';
import { useSubscription } from '../../contexts/SubscriptionContext';
import useThemeColors from '../../utils/useThemeColors';
import {
  ProcessingType,
  ProcessingOptionDefinition,
  PROCESSING_OPTIONS
} from '../../types/document.types';

interface ProcessingOptionsModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectOption: (processingType: ProcessingType) => void;
}

const { width: screenWidth } = Dimensions.get('window');

export default function ProcessingOptionsModal({
  visible,
  onClose,
  onSelectOption
}: ProcessingOptionsModalProps) {
  const { t } = useTranslation();
  const { dashboardInfo } = useSubscription();
  const themeColors = useThemeColors();
  const router = useRouter();
  // Removed selectedOption state to avoid race conditions

  const isUserPremium = dashboardInfo?.plan !== 'free';

  const handleOptionSelect = (option: ProcessingOptionDefinition) => {
    // Check if user has premium access for premium features
    if (option.isPremium && !isUserPremium) {
      Alert.alert(
        t('subscription.premiumRequired'),
        t('subscription.upgradeForFeature'),
        [
          {
            text: t('common.cancel'),
            style: 'cancel'
          },
          {
            text: t('dashboard.upgrade'),
            onPress: () => {
              onClose();
              router.push('/(app)/subscription-plans');
            }
          }
        ]
      );
      return;
    }

    onSelectOption(option.id);
  };

  const renderProcessingOption = (option: ProcessingOptionDefinition) => {
    const isAvailable = !option.isPremium || isUserPremium;
    
    return (
      <TouchableOpacity
        key={option.id}
        style={[
          styles.optionCard,
          {
            backgroundColor: themeColors.surface,
            borderColor: themeColors.border,
            opacity: isAvailable ? 1 : 0.6
          }
        ]}
        onPress={() => handleOptionSelect(option)}
        disabled={!isAvailable}
      >
        <View style={styles.optionHeader}>
          <View style={[styles.optionIcon, { backgroundColor: themeColors.surfaceVariant }]}>
            <MaterialIcons
              name={option.icon as any}
              size={24}
              color={isAvailable ? themeColors.primary : themeColors.textSecondary}
            />
          </View>
          <View style={styles.optionInfo}>
            <View style={styles.optionTitleRow}>
              <Text style={[styles.optionTitle, { color: themeColors.text }]}>
                {option.title}
              </Text>
              {option.isPremium && (
                <View style={[styles.premiumBadge, { backgroundColor: themeColors.warning }]}>
                  <MaterialIcons name="star" size={12} color={themeColors.white} />
                  <Text style={[styles.premiumText, { color: themeColors.white }]}>
                    PRO
                  </Text>
                </View>
              )}
            </View>
            <Text style={[styles.optionDescription, { color: themeColors.textSecondary }]}>
              {option.description}
            </Text>
          </View>
        </View>
        
        <View style={styles.optionDetails}>
          <View style={styles.optionMeta}>
            <MaterialIcons name="schedule" size={16} color={themeColors.textSecondary} />
            <Text style={[styles.optionMetaText, { color: themeColors.textSecondary }]}>
              {option.estimatedTime}
            </Text>
          </View>
          
          <View style={styles.optionFeatures}>
            {option.features.slice(0, 2).map((feature, index) => (
              <View key={index} style={[styles.featureTag, { backgroundColor: themeColors.surfaceVariant }]}>
                <Text style={[styles.featureText, { color: themeColors.text }]}>
                  {feature}
                </Text>
              </View>
            ))}
            {option.features.length > 2 && (
              <Text style={[styles.moreFeatures, { color: themeColors.textSecondary }]}>
                +{option.features.length - 2} more
              </Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const freeOptions = PROCESSING_OPTIONS.filter(option => !option.isPremium);
  const premiumOptions = PROCESSING_OPTIONS.filter(option => option.isPremium);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: themeColors.background }]}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <MaterialIcons name="close" size={24} color={themeColors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: themeColors.text }]}>
            {t('upload.selectProcessingType')}
          </Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>

          {/* Free Options Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
              {t('upload.freeOptions')}
            </Text>
            <Text style={[styles.sectionDescription, { color: themeColors.textSecondary }]}>
              {t('upload.freeOptionsDescription')}
            </Text>
            {freeOptions.map(renderProcessingOption)}
          </View>

          {/* Premium Options Section */}
          <View style={styles.section}>
            <View style={styles.premiumSectionHeader}>
              <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
                {t('upload.premiumOptions')}
              </Text>
              <View style={[styles.premiumBadge, { backgroundColor: themeColors.warning }]}>
                <MaterialIcons name="star" size={14} color={themeColors.white} />
                <Text style={[styles.premiumText, { color: themeColors.white }]}>
                  PRO
                </Text>
              </View>
            </View>
            <Text style={[styles.sectionDescription, { color: themeColors.textSecondary }]}>
              {isUserPremium 
                ? t('upload.premiumOptionsDescription')
                : t('upload.upgradeForPremiumFeatures')
              }
            </Text>
            {premiumOptions.map(renderProcessingOption)}
          </View>

          {/* Upgrade CTA for free users */}
          {!isUserPremium && (
            <View style={styles.upgradeSection}>
              <TouchableOpacity
                style={[styles.upgradeButton, { backgroundColor: themeColors.primary }]}
                onPress={() => {
                  onClose();
                  router.push('/(app)/subscription-plans');
                }}
              >
                <MaterialIcons name="star" size={20} color={themeColors.white} />
                <Text style={[styles.upgradeButtonText, { color: themeColors.white }]}>
                  {t('dashboard.upgrade')}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  closeButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  placeholder: {
    width: 32,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  sectionDescription: {
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
  premiumSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  optionCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  optionHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  optionInfo: {
    flex: 1,
  },
  optionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  optionDescription: {
    fontSize: 14,
    lineHeight: 18,
  },
  optionDetails: {
    gap: 8,
  },
  optionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  optionMetaText: {
    fontSize: 12,
  },
  optionFeatures: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    alignItems: 'center',
  },
  featureTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  featureText: {
    fontSize: 11,
    fontWeight: '500',
  },
  moreFeatures: {
    fontSize: 11,
    fontStyle: 'italic',
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8,
    gap: 2,
  },
  premiumText: {
    fontSize: 10,
    fontWeight: '700',
  },
  upgradeSection: {
    marginVertical: 20,
    alignItems: 'center',
  },
  upgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    gap: 8,
  },
  upgradeButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  workflowInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  workflowText: {
    fontSize: 14,
    marginLeft: 8,
  },
}); 