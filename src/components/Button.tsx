/**
 * Apple Design System - Button Component
 * Implements Apple's signature pill-shaped buttons with haptic feedback
 */

import React from 'react';
import {
  Pressable,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  Animated,
  View,
  StyleProp,
} from 'react-native';
import { theme, r, haptics } from '../theme';

export type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'ghost' | 'destructive';
export type ButtonSize = 'small' | 'medium' | 'large';

export interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  textStyle?: TextStyle;
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
      toValue: 0.98, // Subtle scale
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

  // Determine button background and text color based on variant
  let backgroundColor: string;
  let textColor: string;
  let borderColor: string | undefined = undefined;
  let borderWidth: number | undefined = undefined;

  switch (variant) {
    case 'primary':
      backgroundColor = theme.colors.button.primary;
      textColor = theme.colors.button.primaryText;
      break;
    case 'secondary':
      backgroundColor = theme.colors.button.secondary;
      textColor = theme.colors.button.secondaryText;
      borderWidth = 1; // Example: Add a border for secondary
      borderColor = theme.colors.button.secondaryText;
      break;
    case 'tertiary':
      backgroundColor = 'transparent';
      textColor = theme.colors.brand.tertiary;
      break;
    case 'ghost':
      backgroundColor = 'transparent';
      textColor = theme.colors.text.secondary;
      break;
    case 'destructive':
      backgroundColor = theme.colors.feedback.error; // Assuming an error color exists
      textColor = theme.colors.button.primaryText;
      break;
    default:
      backgroundColor = theme.colors.button.primary;
      textColor = theme.colors.button.primaryText;
  }

  // Combine all button styles
  const buttonStyles: StyleProp<ViewStyle> = [
    styles.base,
    styles[`size_${size}`],
    styles[`padding_${size}`],
    { backgroundColor, borderColor, borderWidth },
    fullWidth && styles.fullWidth,
    (disabled || loading) && styles.disabled,
    style,
  ];

  const textStyleCombined: TextStyle[] = [
    styles.text,
    styles[`text_${size}`],
    { color: textColor },
    (disabled || loading) && styles.textDisabled,
    textStyle,
  ].filter(Boolean) as TextStyle[];

  const renderContent = () => (
    <View style={styles.content}>
      {loading ? (
        <ActivityIndicator color={textColor} size="small" />
      ) : (
        <>
          {icon && <View style={styles.icon}>{icon}</View>}
          <Text style={textStyleCombined}>{title}</Text>
        </>
      )}
    </View>
  );

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Pressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        style={buttonStyles}
      >
        {renderContent()}
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: theme.borderRadius.pill,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden', // Ensure content respects borderRadius
    // 2025 Modern: Subtle shadow for depth (neumorphism)
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
    // Subtle border for glassmorphism
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },

  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },

  icon: {
    marginRight: theme.spacing.sm,
  },

  // Sizes
  size_small: {
    height: r.scaleHeight(36),
  },

  size_medium: {
    height: r.scaleHeight(48),
  },

  size_large: {
    height: r.scaleHeight(56),
  },

  // Padding for content
  padding_small: {
    paddingHorizontal: r.adaptiveSpacing.lg,
  },

  padding_medium: {
    paddingHorizontal: r.adaptiveSpacing.xl,
  },

  padding_large: {
    paddingHorizontal: r.adaptiveSpacing['2xl'],
  },

  // States
  disabled: {
    opacity: 0.5,
  },

  fullWidth: {
    width: '100%',
  },

  // Text styles - Using Apple semantic typography
  text: {
    textAlign: 'center',
    fontWeight: '600',
  },

  text_small: {
    ...theme.typography.buttonSmall,
  },

  text_medium: {
    ...theme.typography.buttonMedium,
  },

  text_large: {
    ...theme.typography.buttonLarge,
  },

  textDisabled: {
    opacity: 1,
  },
});

export default Button;