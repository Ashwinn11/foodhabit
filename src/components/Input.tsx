import React, { useState } from 'react';
import {
  TextInput,
  TextInputProps,
  StyleSheet,
  View,
  Text,
  StyleProp,
  ViewStyle,
  Animated,
} from 'react-native';
import { theme } from '../theme';

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
  fullWidth?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  leftIcon,
  rightIcon,
  containerStyle,
  fullWidth = true,
  style,
  onFocus,
  onBlur,
  placeholderTextColor = theme.colors.text.placeholder,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const focusAnim = React.useRef(new Animated.Value(0)).current;

  const handleFocus = (e: any) => {
    setIsFocused(true);
    Animated.timing(focusAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
    onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    Animated.timing(focusAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
    onBlur?.(e);
  };

  const borderColor = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [theme.colors.border.light, theme.colors.brand.primary],
  });

  const inputWrapperStyle: StyleProp<ViewStyle> = [
    styles.inputContainer,
    { backgroundColor: theme.colors.background.field, borderRadius: theme.borderRadius.md },
    // Apply a border for the default state to distinguish it
    { borderWidth: 1, borderColor: theme.colors.border.light },
    // Override default border color when focused
    isFocused && { borderColor: theme.colors.brand.primary },
  ];

  return (
    <View
      style={[
        { marginBottom: theme.spacing.md, width: fullWidth ? '100%' : 'auto' },
        containerStyle,
      ]}
    >
      {label && (
        <Text style={styles.label}>{label}</Text>
      )}

      <View style={inputWrapperStyle}>
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}

        <TextInput
          style={[styles.input, style]}
          placeholderTextColor={placeholderTextColor}
          onFocus={handleFocus}
          onBlur={handleBlur}
          selectionColor={theme.colors.brand.primary}
          {...props}
        />

        {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
      </View>

      {error && (
        <Text style={styles.error}>{error}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  label: {
    ...theme.typography.callout,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
    marginLeft: theme.spacing.xs,
  },
  inputContainer: {
    height: 56, // Standard touch target
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    overflow: 'hidden', // Ensure content respects borderRadius
  },
  input: {
    flex: 1,
    height: '100%',
    color: theme.colors.text.primary,
    ...theme.typography.body,
  },
  leftIcon: {
    marginRight: theme.spacing.sm,
  },
  rightIcon: {
    marginLeft: theme.spacing.sm,
  },
  error: {
    ...theme.typography.caption1,
    color: theme.colors.brand.primary,
    marginTop: theme.spacing.xs,
    marginLeft: theme.spacing.xs,
  },
});
