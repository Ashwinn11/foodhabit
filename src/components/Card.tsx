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
import { NeumorphicView } from './NeumorphicView';

export type CardVariant = 'elevated' | 'outlined' | 'filled';
export type CardPadding = 'none' | 'small' | 'medium' | 'large';

export interface CardProps {
  children: React.ReactNode;
  variant?: CardVariant;
  padding?: CardPadding;
  pressable?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
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

  const paddingStyle = styles[`padding_${padding}`];
  
  // Extract layout styles (margin, width, flex) vs visual styles
  // For simplicity, we pass style to the container
  
  const renderContent = () => {
    if (variant === 'elevated') {
      return (
        <NeumorphicView 
          style={style} 
          contentContainerStyle={paddingStyle}
          size="md"
        >
          {children}
        </NeumorphicView>
      );
    }

    // Legacy/Other variants
    const cardStyle: ViewStyle[] = [
      styles.base,
      styles[`variant_${variant}`],
      paddingStyle,
      style,
    ].filter(Boolean) as ViewStyle[];

    return <View style={cardStyle}>{children}</View>;
  };

  if (pressable && onPress) {
    return (
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <Pressable
          onPress={handlePress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
        >
          {renderContent()}
        </Pressable>
      </Animated.View>
    );
  }

  return renderContent();
};

const styles = StyleSheet.create({
  base: {
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
  },

  // Variants
  variant_outlined: {
    backgroundColor: theme.colors.background.card,
    borderWidth: 1,
    borderColor: theme.colors.border.main, // Subtle white border for dark background
  },

  variant_filled: {
    backgroundColor: theme.colors.background.primary,
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
