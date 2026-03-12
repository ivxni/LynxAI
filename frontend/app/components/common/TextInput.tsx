import React from 'react';
import { StyleSheet, View, StyleProp, ViewStyle, Text, Platform } from 'react-native';
import { TextInput as PaperInput, HelperText, TextInputProps as PaperTextInputProps } from 'react-native-paper';
import colors from '../../constants/colors';
import { TextInput as PaperTextInput } from 'react-native-paper';
import { TextInputProps as RNTextInputProps } from 'react-native';
import { useDarkMode } from '../../contexts/DarkModeContext';
import useThemeColors from '../../utils/useThemeColors';

interface CustomTextInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  secureTextEntry?: boolean;
  style?: StyleProp<ViewStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  floatingLabel?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad' | 'number-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  rightIcon?: React.ReactNode;
}

type TextInputProps = CustomTextInputProps & Omit<PaperTextInputProps, 'label' | 'value' | 'onChangeText' | 'error'>;

const TextInput = ({ 
  label, 
  value, 
  onChangeText, 
  error, 
  secureTextEntry, 
  style, 
  floatingLabel = false,
  keyboardType,
  autoCapitalize,
  rightIcon,
  ...props 
}: CustomTextInputProps) => {
  const { isDarkMode } = useDarkMode();
  const themeColors = useThemeColors();
  
  return (
    <View style={styles.container}>
      {!floatingLabel && label && (
        <Text style={[styles.labelText, { color: themeColors.textSecondary }]}>{label}</Text>
      )}
      <PaperInput
        label={floatingLabel ? label : ''}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        style={[styles.input, { backgroundColor: themeColors.surface }, style]}
        error={!!error}
        mode="outlined"
        outlineColor={themeColors.border}
        activeOutlineColor={themeColors.primary}
        outlineStyle={styles.outline}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        dense={false}
        underlineStyle={{ display: 'none' }}
        contentStyle={[
          styles.contentStyle,
          { height: 40, textAlignVertical: 'center' }
        ]}
        right={rightIcon ? <PaperInput.Icon icon={() => rightIcon} /> : undefined}
        theme={{
          colors: {
            background: themeColors.surface,
            text: themeColors.text,
            primary: themeColors.primary,
            onSurfaceVariant: themeColors.textSecondary,
            error: themeColors.error,
          },
          fonts: {
            bodyLarge: {
              fontSize: 16,
              lineHeight: 24,
            }
          }
        }}
        {...props}
      />
      {error && <HelperText type="error" visible={!!error} style={{ color: themeColors.error }}>{error}</HelperText>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
    width: '100%',
  },
  input: {
    minHeight: 50,
    height: 50,
  },
  outline: {
    borderRadius: 12,
    borderWidth: 1.5,
  },
  contentStyle: {
    paddingVertical: 6,
    fontSize: 16,
    height: 36,
    textAlignVertical: 'center',
  },
  labelText: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    marginLeft: 4,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  }
});

export default TextInput; 