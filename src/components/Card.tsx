/**
 * Apple Design System - Card Component
 * Refined card with Apple-style rounded corners and subtle shadows
 */

import React from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  Pressable,
  Animated,
} from 'react-native';
import { theme, r, haptics } from '../theme';

export type CardVariant = 'elevated' | 'outlined' | 'filled';
export type CardPadding = 'none' | 'small' | 'medium' | 'large';

export interface CardProps {
  /**
   * Card content
   */
  children: React.ReactNode;

  /**
   * Visual style variant
   * @default 'elevated'
   */
  variant?: CardVariant;

  /**
   * Internal padding
   * @default 'medium'
   */
  padding?: CardPadding;

  /**
   * Make card pressable/tappable
   * @default false
   */
  pressable?: boolean;

  /**
   * onPress handler (only works if pressable is true)
   */
  onPress?: () => void;

  /**
   * Custom card style override
   */
  style?: ViewStyle;

  /**
   * Enable haptic feedback on press
   * @default true
   */
  hapticFeedback?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'elevated',
  padding = 'medium',
  pressable = false,
  onPress,
  style,
  hapticFeedback = true,
}) => {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (pressable) {
      Animated.spring(scaleAnim, {
        toValue: 0.98,
        useNativeDriver: true,
        ...theme.animations.springConfig.stiff,
      }).start();
    }
  };

  const handlePressOut = () => {
    if (pressable) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        ...theme.animations.springConfig.default,
      }).start();
    }
  };

  const handlePress = () => {
    if (hapticFeedback && pressable && onPress) {
      haptics.patterns.cardTap();
    }
    onPress?.();
  };

  const cardStyle: ViewStyle[] = [
    styles.base,
    styles[`variant_${variant}`],
    styles[`padding_${padding}`],
    style,
  ].filter(Boolean) as ViewStyle[];

  if (pressable && onPress) {
    return (
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <Pressable
          style={cardStyle}
          onPress={handlePress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
        >
          {children}
        </Pressable>
      </Animated.View>
    );
  }

  return <View style={cardStyle}>{children}</View>;
};

const styles = StyleSheet.create({
  base: {
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
  },

  // Variants
  variant_elevated: {
    backgroundColor: theme.colors.background.card,
    ...theme.shadows.md,
  },

  variant_outlined: {
    backgroundColor: theme.colors.background.card,
    borderWidth: 1,
    borderColor: theme.colors.border.main,
  },

  variant_filled: {
    backgroundColor: theme.colors.background.secondary,
  },

  // Padding
  padding_none: {
    padding: 0,
  },

  padding_small: {
    padding: r.adaptiveSpacing.md,
  },

  padding_medium: {
    padding: r.adaptiveSpacing.lg,
  },

  padding_large: {
    padding: r.adaptiveSpacing.xl,
  },
});

export default Card;
