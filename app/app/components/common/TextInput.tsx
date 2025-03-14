import React from 'react';
import { StyleSheet, View, StyleProp, ViewStyle, Text, Platform } from 'react-native';
import { TextInput as PaperInput, HelperText, TextInputProps as PaperTextInputProps } from 'react-native-paper';
import colors from '../../constants/colors';
import { TextInput as PaperTextInput } from 'react-native-paper';
import { TextInputProps as RNTextInputProps } from 'react-native';

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
  ...props 
}: CustomTextInputProps) => {
  return (
    <View style={styles.container}>
      {!floatingLabel && label && (
        <Text style={styles.labelText}>{label}</Text>
      )}
      <PaperInput
        label={floatingLabel ? label : ''}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        style={[styles.input, style]}
        error={!!error}
        mode="outlined"
        outlineColor={colors.border}
        activeOutlineColor={colors.primary}
        outlineStyle={styles.outline}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        dense={false}
        underlineStyle={{ display: 'none' }}
        contentStyle={[
          styles.contentStyle,
          { height: 40, textAlignVertical: 'center' }
        ]}
        theme={{
          colors: {
            background: colors.white,
            text: colors.text,
            primary: colors.primary,
            onSurfaceVariant: colors.textSecondary,
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
      {error && <HelperText type="error" visible={!!error}>{error}</HelperText>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    width: '100%',
  },
  input: {
    backgroundColor: colors.white,
    minHeight: 56,
  },
  outline: {
    borderRadius: 12,
    borderWidth: 1.5,
  },
  contentStyle: {
    paddingVertical: 8,
    fontSize: 16,
    height: 40,
    textAlignVertical: 'center',
  },
  labelText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
    marginBottom: 8,
    marginLeft: 4,
  },
  errorText: {
    color: colors.error,
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  }
});

export default TextInput; 