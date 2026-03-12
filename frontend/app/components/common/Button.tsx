import React from 'react';
import { StyleSheet, StyleProp, ViewStyle, TextStyle, Platform, GestureResponderEvent } from 'react-native';
import { Button as PaperButton, ButtonProps as PaperButtonProps } from 'react-native-paper';
import * as Haptics from 'expo-haptics';
import colors from '../../constants/colors';

interface ButtonProps extends PaperButtonProps {
  style?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'outline' | 'text';
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  mode = 'contained',
  onPress,
  style,
  labelStyle,
  loading = false,
  disabled = false,
  variant = 'primary',
  children,
  ...props
}) => {
  // Determine the button style based on the variant
  const getButtonStyle = () => {
    switch (variant) {
      case 'primary':
        return styles.primary;
      case 'secondary':
        return styles.secondary;
      case 'outline':
        return styles.outline;
      case 'text':
        return styles.text;
      default:
        return styles.primary;
    }
  };

  // Determine the label style based on the variant
  const getLabelStyle = () => {
    switch (variant) {
      case 'primary':
      case 'secondary':
        return styles.lightLabel;
      case 'outline':
      case 'text':
        return styles.darkLabel;
      default:
        return styles.lightLabel;
    }
  };

  // Set the appropriate mode based on the variant
  const getMode = () => {
    if (variant === 'outline') return 'outlined';
    if (variant === 'text') return 'text';
    return 'contained';
  };

  const handlePress = (e: GestureResponderEvent) => {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    if (onPress) {
      onPress(e);
    }
  };

  return (
    <PaperButton
      mode={getMode()}
      onPress={handlePress}
      style={[styles.button, getButtonStyle(), style]}
      labelStyle={[styles.label, getLabelStyle(), labelStyle]}
      loading={loading}
      disabled={disabled}
      contentStyle={styles.contentStyle}
      {...props}
    >
      {children}
    </PaperButton>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    marginVertical: 8,
    elevation: 0,
    height: 50,
  },
  contentStyle: {
    height: 50,
    paddingVertical: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    backgroundColor: colors.primary,
  },
  secondary: {
    backgroundColor: colors.secondary,
  },
  outline: {
    borderColor: colors.primary,
    borderWidth: 1.5,
    backgroundColor: 'transparent',
  },
  text: {
    backgroundColor: 'transparent',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'none',
    height: 20,
    lineHeight: 20,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  lightLabel: {
    color: colors.white,
  },
  darkLabel: {
    color: colors.primary,
  },
});

export default Button; 