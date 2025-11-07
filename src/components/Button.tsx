/**
 * Apple Design System - Button Component
 * Implements Apple's signature pill-shaped buttons with haptic feedback
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  Animated,
  View,
} from 'react-native';
import { theme, r, haptics } from '../theme';

export type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'ghost' | 'destructive';
export type ButtonSize = 'small' | 'medium' | 'large';

export interface ButtonProps {
  /**
   * Button text content
   */
  title: string;

  /**
   * onPress handler
   */
  onPress: () => void;

  /**
   * Visual style variant
   * @default 'primary'
   */
  variant?: ButtonVariant;

  /**
   * Button size
   * @default 'medium'
   */
  size?: ButtonSize;

  /**
   * Disabled state
   * @default false
   */
  disabled?: boolean;

  /**
   * Loading state with spinner
   * @default false
   */
  loading?: boolean;

  /**
   * Full width button
   * @default false
   */
  fullWidth?: boolean;

  /**
   * Custom icon component (renders before text)
   */
  icon?: React.ReactNode;

  /**
   * Custom button style override
   */
  style?: ViewStyle;

  /**
   * Custom text style override
   */
  textStyle?: TextStyle;

  /**
   * Enable haptic feedback
   * @default true
   */
  hapticFeedback?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  fullWidth = false,
  icon,
  style,
  textStyle,
  hapticFeedback = true,
}) => {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
      ...theme.animations.springConfig.stiff,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      ...theme.animations.springConfig.default,
    }).start();
  };

  const handlePress = () => {
    if (hapticFeedback && !disabled && !loading) {
      haptics.patterns.buttonPress();
    }
    onPress();
  };

  const containerStyle: ViewStyle[] = [
    styles.base,
    styles[`size_${size}`],
    styles[`variant_${variant}`],
    fullWidth && styles.fullWidth,
    (disabled || loading) && styles.disabled,
    style,
  ];

  const textStyleCombined: TextStyle[] = [
    styles.text,
    styles[`text_${size}`],
    styles[`text_${variant}`],
    (disabled || loading) && styles.textDisabled,
    textStyle,
  ];

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={containerStyle}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        activeOpacity={0.8}
      >
        {loading ? (
          <ActivityIndicator
            color={variant === 'primary' || variant === 'destructive' ? '#FFFFFF' : theme.colors.primary[500]}
            size="small"
          />
        ) : (
          <View style={styles.content}>
            {icon && <View style={styles.icon}>{icon}</View>}
            <Text style={textStyleCombined}>{title}</Text>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.borderRadius.pill,
    paddingHorizontal: r.adaptiveSpacing.xl,
    ...theme.shadows.sm,
  },

  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  icon: {
    marginRight: theme.spacing.sm,
  },

  // Sizes
  size_small: {
    height: r.scaleHeight(36),
    paddingHorizontal: r.adaptiveSpacing.lg,
  },

  size_medium: {
    height: r.scaleHeight(48),
    paddingHorizontal: r.adaptiveSpacing.xl,
  },

  size_large: {
    height: r.scaleHeight(56),
    paddingHorizontal: r.adaptiveSpacing['2xl'],
  },

  // Variants
  variant_primary: {
    backgroundColor: theme.colors.primary[500],
  },

  variant_secondary: {
    backgroundColor: theme.colors.secondary[500],
  },

  variant_tertiary: {
    backgroundColor: theme.colors.fill.primary,
  },

  variant_ghost: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: theme.colors.border.main,
    shadowOpacity: 0,
    elevation: 0,
  },

  variant_destructive: {
    backgroundColor: theme.colors.error.main,
  },

  // States
  disabled: {
    opacity: 0.5,
  },

  fullWidth: {
    width: '100%',
  },

  // Text styles
  text: {
    textAlign: 'center',
  },

  text_small: {
    ...theme.typography.buttonSmall,
    color: theme.colors.text.inverse,
  },

  text_medium: {
    ...theme.typography.button,
    color: theme.colors.text.inverse,
  },

  text_large: {
    ...theme.typography.buttonLarge,
    color: theme.colors.text.inverse,
  },

  text_primary: {
    color: theme.colors.text.inverse,
  },

  text_secondary: {
    color: theme.colors.text.inverse,
  },

  text_tertiary: {
    color: theme.colors.text.primary,
  },

  text_ghost: {
    color: theme.colors.text.primary,
  },

  text_destructive: {
    color: theme.colors.text.inverse,
  },

  textDisabled: {
    opacity: 1,
  },
});

export default Button;
