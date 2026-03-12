import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import TextInput from '../components/common/TextInput';
import Button from '../components/common/Button';
import { useAuth } from '../hooks/useAuth';
import { useTranslation } from '../utils/i18n';
import { useDarkMode } from '../contexts/DarkModeContext';
import useThemeColors from '../utils/useThemeColors';
import authService from '../services/authService';

// Password validation state
type ValidationState = {
  minLength: boolean | null;
  hasLetter: boolean | null;
  hasNumber: boolean | null;
  passwordsMatch: boolean | null;
};

export default function ChangePassword() {
  const router = useRouter();
  const { t } = useTranslation();
  const { isDarkMode } = useDarkMode();
  const themeColors = useThemeColors();
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [passwordValidation, setPasswordValidation] = useState<ValidationState>({
    minLength: null,
    hasLetter: null,
    hasNumber: null,
    passwordsMatch: null
  });
  
  useEffect(() => {
    if (newPassword.length === 0) {
      setPasswordValidation({
        minLength: null,
        hasLetter: null,
        hasNumber: null,
        passwordsMatch: null
      });
    } else {
      // Sonst normale Validierung durchführen
      setPasswordValidation({
        minLength: newPassword.length >= 6,
        hasLetter: /[a-zA-Z]/.test(newPassword),
        hasNumber: /\d/.test(newPassword),
        passwordsMatch: newPassword === confirmPassword && newPassword !== ''
      });
    }
  }, [newPassword, confirmPassword]);
  
  const isPasswordValid = newPassword.length > 0 && Object.values(passwordValidation).every(value => value === true);

  const handleChangePassword = async () => {
    // Validate inputs
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError(t('profile.allFieldsRequired'));
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(t('profile.passwordsDoNotMatch'));
      return;
    }

    if (newPassword.length < 6) {
      setError(t('profile.passwordTooShort'));
      return;
    }
    
    if (!isPasswordValid) {
      setError(t('profile.passwordRequirements'));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await authService.changePassword(currentPassword, newPassword);
      Alert.alert(
        t('common.success'),
        t('profile.passwordChanged'),
        [{ text: t('common.ok'), onPress: () => router.back() }]
      );
    } catch (err: any) {
      console.error('Password change error:', err);
      // Zeige detailliertere Fehlermeldung an
      if (err.response) {
        // Der Server hat mit einem Fehlerstatuscode geantwortet
        setError(err.response.data?.message || t('profile.passwordChangeFailed'));
      } else if (err.request) {
        // Die Anfrage wurde gestellt, aber keine Antwort erhalten
        setError(t('common.error'));
      } else {
        // Etwas anderes ist beim Einrichten der Anfrage schief gelaufen
        setError(err.message || t('profile.passwordChangeFailed'));
      }
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
        <View style={[
          styles.header, 
          { borderBottomColor: isDarkMode ? 'rgba(0,0,0,0.05)' : 'transparent',
            borderBottomWidth: isDarkMode ? 1 : 0 }
        ]}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <MaterialIcons name="arrow-back" size={24} color={themeColors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: themeColors.text }]}>
            {t('profile.changePassword')}
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
              label={t('profile.currentPassword')}
              value={currentPassword}
              onChangeText={setCurrentPassword}
              secureTextEntry={!showCurrentPassword}
              style={[styles.input, { shadowColor: themeColors.primary }]}
              rightIcon={
                <TouchableOpacity onPress={() => setShowCurrentPassword(!showCurrentPassword)}>
                  <MaterialIcons 
                    name={showCurrentPassword ? "visibility-off" : "visibility"} 
                    size={24} 
                    color={themeColors.textSecondary} 
                  />
                </TouchableOpacity>
              }
            />
            
            <View style={styles.passwordContainer}>
              <TextInput
                label={t('profile.newPassword')}
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry={!showNewPassword}
                style={[styles.input, { shadowColor: themeColors.primary, marginBottom: 4 }]}
                rightIcon={
                  <TouchableOpacity onPress={() => setShowNewPassword(!showNewPassword)}>
                    <MaterialIcons 
                      name={showNewPassword ? "visibility-off" : "visibility"} 
                      size={24} 
                      color={themeColors.textSecondary} 
                    />
                  </TouchableOpacity>
                }
              />
              
              {/* Passwortvalidierungshinweise */}
              <View style={styles.passwordValidation}>
                <View style={styles.validationRow}>
                  <MaterialIcons 
                    name={passwordValidation.minLength === null ? "radio-button-unchecked" : (passwordValidation.minLength ? "check-circle" : "cancel")} 
                    size={16} 
                    color={passwordValidation.minLength === null ? themeColors.textSecondary : (passwordValidation.minLength ? themeColors.success : themeColors.error)} 
                  />
                  <Text style={[
                    styles.validationText, 
                    { color: passwordValidation.minLength === null ? themeColors.textSecondary : (passwordValidation.minLength ? themeColors.success : themeColors.error) }
                  ]}>
                    {t('profile.minLength')}
                  </Text>
                </View>
                
                <View style={styles.validationRow}>
                  <MaterialIcons 
                    name={passwordValidation.hasLetter === null ? "radio-button-unchecked" : (passwordValidation.hasLetter ? "check-circle" : "cancel")} 
                    size={16} 
                    color={passwordValidation.hasLetter === null ? themeColors.textSecondary : (passwordValidation.hasLetter ? themeColors.success : themeColors.error)} 
                  />
                  <Text style={[
                    styles.validationText, 
                    { color: passwordValidation.hasLetter === null ? themeColors.textSecondary : (passwordValidation.hasLetter ? themeColors.success : themeColors.error) }
                  ]}>
                    {t('profile.hasLetter')}
                  </Text>
                </View>
                
                <View style={styles.validationRow}>
                  <MaterialIcons 
                    name={passwordValidation.hasNumber === null ? "radio-button-unchecked" : (passwordValidation.hasNumber ? "check-circle" : "cancel")} 
                    size={16} 
                    color={passwordValidation.hasNumber === null ? themeColors.textSecondary : (passwordValidation.hasNumber ? themeColors.success : themeColors.error)} 
                  />
                  <Text style={[
                    styles.validationText, 
                    { color: passwordValidation.hasNumber === null ? themeColors.textSecondary : (passwordValidation.hasNumber ? themeColors.success : themeColors.error) }
                  ]}>
                    {t('profile.hasNumber')}
                  </Text>
                </View>
              </View>
            </View>
            
            <TextInput
              label={t('profile.confirmPassword')}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
              style={[styles.input, { shadowColor: themeColors.primary }]}
              rightIcon={
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                  <MaterialIcons 
                    name={showConfirmPassword ? "visibility-off" : "visibility"} 
                    size={24} 
                    color={themeColors.textSecondary} 
                  />
                </TouchableOpacity>
              }
            />
            
            {/* Passwörter stimmen überein */}
            <View style={styles.validationRow}>
              <MaterialIcons 
                name={passwordValidation.passwordsMatch === null ? "radio-button-unchecked" : (passwordValidation.passwordsMatch ? "check-circle" : "cancel")} 
                size={16} 
                color={passwordValidation.passwordsMatch === null ? themeColors.textSecondary : (passwordValidation.passwordsMatch ? themeColors.success : themeColors.error)} 
              />
              <Text style={[
                styles.validationText, 
                { color: passwordValidation.passwordsMatch === null ? themeColors.textSecondary : (passwordValidation.passwordsMatch ? themeColors.success : themeColors.error) }
              ]}>
                {t('profile.passwordsMatch')}
              </Text>
            </View>
            
            {error && (
              <Text style={[styles.errorText, { color: themeColors.error }]}>{error}</Text>
            )}
            
            <Button 
              onPress={handleChangePassword} 
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
  passwordContainer: {
    marginBottom: 8,
  },
  passwordValidation: {
    marginTop: 4,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  validationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  validationText: {
    fontSize: 12,
    marginLeft: 6,
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