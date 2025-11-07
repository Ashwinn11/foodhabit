/**
 * Apple Design System - Input Component
 * Text input with Apple-style design and validation
 */

import React, { useState } from 'react';
import {
  TextInput,
  View,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TextInputProps as RNTextInputProps,
} from 'react-native';
import { theme, r, haptics } from '../theme';
import Text from './Text';

export interface InputProps extends Omit<RNTextInputProps, 'style'> {
  /**
   * Input label
   */
  label?: string;

  /**
   * Error message
   */
  error?: string;

  /**
   * Helper text
   */
  helperText?: string;

  /**
   * Left icon component
   */
  leftIcon?: React.ReactNode;

  /**
   * Right icon component
   */
  rightIcon?: React.ReactNode;

  /**
   * Disabled state
   * @default false
   */
  disabled?: boolean;

  /**
   * Custom container style
   */
  containerStyle?: ViewStyle;

  /**
   * Custom input style
   */
  inputStyle?: TextStyle;

  /**
   * Enable haptic feedback on focus
   * @default true
   */
  hapticFeedback?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  disabled = false,
  containerStyle,
  inputStyle,
  hapticFeedback = true,
  onFocus,
  onBlur,
  ...textInputProps
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = (e: any) => {
    if (hapticFeedback && !disabled) {
      haptics.patterns.inputFocus();
    }
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  const inputContainerStyle: ViewStyle[] = [
    styles.inputContainer,
    isFocused && styles.inputContainerFocused,
    error && styles.inputContainerError,
    disabled && styles.inputContainerDisabled,
  ].filter(Boolean) as ViewStyle[];

  const textInputStyle: TextStyle[] = [
    styles.input,
    leftIcon && styles.inputWithLeftIcon,
    rightIcon && styles.inputWithRightIcon,
    inputStyle,
  ].filter(Boolean) as TextStyle[];

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text variant="labelSmall" color="secondary" style={styles.label}>
          {label}
        </Text>
      )}

      <View style={inputContainerStyle}>
        {leftIcon && <View style={styles.leftIconContainer}>{leftIcon}</View>}

        <TextInput
          {...textInputProps}
          style={textInputStyle}
          placeholderTextColor={theme.colors.text.placeholder}
          onFocus={handleFocus}
          onBlur={handleBlur}
          editable={!disabled}
        />

        {rightIcon && <View style={styles.rightIconContainer}>{rightIcon}</View>}
      </View>

      {error && (
        <Text variant="caption" color="primary" style={styles.errorText}>
          {error}
        </Text>
      )}

      {!error && helperText && (
        <Text variant="caption" color="tertiary" style={styles.helperText}>
          {helperText}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: r.adaptiveSpacing.md,
  },

  label: {
    marginBottom: theme.spacing.xs,
  },

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border.main,
    paddingHorizontal: r.adaptiveSpacing.md,
    minHeight: r.scaleHeight(48),
  },

  inputContainerFocused: {
    borderColor: theme.colors.primary[500],
    borderWidth: 2,
    ...theme.shadows.sm,
  },

  inputContainerError: {
    borderColor: theme.colors.brand.primary,
  },

  inputContainerDisabled: {
    backgroundColor: theme.colors.background.secondary,
    opacity: 0.6,
  },

  input: {
    flex: 1,
    ...theme.typography.body,
    color: theme.colors.text.primary,
    paddingVertical: r.adaptiveSpacing.sm,
  },

  inputWithLeftIcon: {
    marginLeft: theme.spacing.sm,
  },

  inputWithRightIcon: {
    marginRight: theme.spacing.sm,
  },

  leftIconContainer: {
    marginRight: theme.spacing.xs,
  },

  rightIconContainer: {
    marginLeft: theme.spacing.xs,
  },

  errorText: {
    color: theme.colors.brand.primary,
    marginTop: theme.spacing.xs,
  },

  helperText: {
    marginTop: theme.spacing.xs,
  },
});

export default Input;
