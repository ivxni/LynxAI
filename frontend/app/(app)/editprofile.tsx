import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import TextInput from '../components/common/TextInput';
import Button from '../components/common/Button';
import { useAuth } from '../hooks/useAuth';
import { useTranslation } from '../utils/i18n';
import { useDarkMode } from '../contexts/DarkModeContext';
import useThemeColors from '../utils/useThemeColors';

export default function EditProfile() {
  const router = useRouter();
  const { user, updateProfile } = useAuth();
  const { t } = useTranslation();
  const { isDarkMode } = useDarkMode();
  const themeColors = useThemeColors();
  
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    // Only validate first name and last name - email is not editable
    if (!firstName || !lastName) {
      setError(t('profile.nameFieldsRequired'));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Only send firstName and lastName - don't include email
      await updateProfile({ firstName, lastName });
      Alert.alert(
        t('common.success'),
        t('profile.profileUpdated'),
        [{ text: t('common.ok'), onPress: () => router.back() }]
      );
    } catch (err: any) {
      setError(err.message || t('profile.updateFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]} edges={['top']}>
      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={100}
      >
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <MaterialIcons name="arrow-back" size={24} color={themeColors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: themeColors.text }]}>
            {t('profile.editProfile')}
          </Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.formContainer}>
            <TextInput
              label={t('profile.firstName')}
              value={firstName}
              onChangeText={setFirstName}
              style={[styles.input, { shadowColor: themeColors.primary }]}
            />
            
            <TextInput
              label={t('profile.lastName')}
              value={lastName}
              onChangeText={setLastName}
              style={[styles.input, { shadowColor: themeColors.primary }]}
            />
            
            {/* Email field - read-only */}
            <View style={styles.readOnlyContainer}>
              <Text style={[styles.readOnlyLabel, { color: themeColors.textSecondary }]}>
                {t('profile.email')}
              </Text>
              <View style={[
                styles.readOnlyField, 
                { 
                  backgroundColor: themeColors.surfaceVariant,
                  borderColor: themeColors.border
                }
              ]}>
                <Text style={[styles.readOnlyText, { color: themeColors.textSecondary }]}>
                  {user?.email}
                </Text>
                <MaterialIcons 
                  name="lock" 
                  size={16} 
                  color={themeColors.textSecondary} 
                  style={styles.lockIcon}
                />
              </View>
              <Text style={[styles.readOnlyNote, { color: themeColors.textSecondary }]}>
                {t('profile.emailCannotBeChanged')}
              </Text>
            </View>
            
            {error && (
              <Text style={[styles.errorText, { color: themeColors.error }]}>{error}</Text>
            )}
            
            <Button 
              onPress={handleSave} 
              loading={loading}
              style={styles.button}
            >
              {t('common.save')}
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 60,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  formContainer: {
    width: '100%',
  },
  input: {
    marginBottom: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  readOnlyContainer: {
    marginBottom: 16,
  },
  readOnlyLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  readOnlyField: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  readOnlyText: {
    fontSize: 16,
    flex: 1,
  },
  lockIcon: {
    marginLeft: 8,
  },
  readOnlyNote: {
    fontSize: 12,
    marginTop: 4,
    fontStyle: 'italic',
  },
  errorText: {
    marginBottom: 16,
    fontSize: 14,
    textAlign: 'center',
  },
  button: {
    marginTop: 8,
    height: 50,
    borderRadius: 12,
  },
}); 