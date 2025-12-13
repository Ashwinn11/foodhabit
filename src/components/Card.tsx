/**
 * Apple Design System - Card Component
 * Refined card with Apple-style rounded corners and subtle shadows
 */

import React from 'react';
import {
  StyleSheet,
  ViewStyle,
  Pressable,
  Animated,
} from 'react-native';
import { theme, r, haptics } from '../theme';
import { Surface } from './Surface'; // Updated import

export type CardPadding = 'none' | 'small' | 'medium' | 'large';

export interface CardProps {
  children: React.ReactNode;
  padding?: CardPadding;
  pressable?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
  hapticFeedback?: boolean;
  // New props for Surface customization
  elevation?: Parameters<typeof Surface>[0]['elevation'];
  backgroundColor?: string;
  borderRadius?: Parameters<typeof Surface>[0]['borderRadius'];
}

export const Card: React.FC<CardProps> = ({
  children,
  padding = 'medium',
  pressable = false,
  onPress,
  style,
  hapticFeedback = true,
  elevation = 'md',
  backgroundColor = theme.colors.background.card,
  borderRadius = 'lg',
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
  
  const renderContent = () => {
    return (
      <Surface 
        style={style} 
        contentContainerStyle={paddingStyle}
        elevation={elevation}
        backgroundColor={backgroundColor}
        borderRadius={borderRadius}
      >
        {children}
      </Surface>
    );
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
  // Removed base and variant styles, as Surface handles them now.
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