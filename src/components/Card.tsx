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
  StyleProp,
} from 'react-native';
import { theme, r, haptics } from '../theme';
import { Surface } from './Surface'; // Updated import

export type CardPadding = 'none' | 'small' | 'medium' | 'large';

export interface CardProps {
  children: React.ReactNode;
  padding?: CardPadding;
  pressable?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  hapticFeedback?: boolean;
  // New props for Surface customization
  elevation?: Parameters<typeof Surface>[0]['elevation'] | 'primary' | 'secondary';
  backgroundColor?: string;
  borderRadius?: Parameters<typeof Surface>[0]['borderRadius'];
  align?: Parameters<typeof Surface>[0]['align'];
  justify?: Parameters<typeof Surface>[0]['justify'];
  flexDirection?: Parameters<typeof Surface>[0]['flexDirection'];
  selected?: boolean;
  borderColor?: string;
  borderWidth?: number;
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
  align,
  justify,
  flexDirection,
  selected = false,
  borderColor,
  borderWidth,
}) => {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (pressable) {
      Animated.spring(scaleAnim, {
        toValue: 0.96, // Slightly deeper for playfulness
        useNativeDriver: true,
        ...theme.animations.springConfig.default,
      }).start();
    }
  };

  const handlePressOut = () => {
    if (pressable) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        ...theme.animations.springConfig.bouncy, // Bouncy release
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
  
  // Handle custom elevation shadows
  const getShadowStyle = () => {
    if (elevation === 'primary') return theme.shadows.primary;
    if (elevation === 'secondary') return theme.shadows.secondary;
    return undefined; // Handled by Surface default
  };

  const flattenedStyle = StyleSheet.flatten(style);
  
  // Extract alignment from style to pass to Surface if not explicitly provided
  const finalAlign = align || flattenedStyle?.alignItems;
  const finalJustify = justify || flattenedStyle?.justifyContent;
  const finalFlexDirection = flexDirection || flattenedStyle?.flexDirection;

  const renderContent = (extraStyle?: ViewStyle) => {
    return (
      <Surface 
        style={[getShadowStyle(), { width: '100%' }, extraStyle]} 
        contentContainerStyle={paddingStyle}
        elevation={selected ? 'lg' : (elevation === 'primary' || elevation === 'secondary' ? 'none' : elevation as any)}
        backgroundColor={selected && backgroundColor === theme.colors.background.card ? theme.colors.brand.cream : backgroundColor}
        borderRadius={borderRadius}
        align={finalAlign}
        justify={finalJustify}
        flexDirection={finalFlexDirection}
        borderColor={selected ? (borderColor || theme.colors.brand.primary) : borderColor}
        borderWidth={selected ? (borderWidth || 2) : borderWidth}
      >
        {children}
      </Surface>
    );
  };

  
  if (pressable && onPress) {
    return (
      <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, style]}>
        <Pressable
          onPress={handlePress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={{ width: '100%', height: '100%', flex: flattenedStyle?.flex === 1 ? 1 : undefined }}
        >
          {renderContent({ flex: 1 })}
        </Pressable>
      </Animated.View>
    );
  }

  return renderContent(flattenedStyle);
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