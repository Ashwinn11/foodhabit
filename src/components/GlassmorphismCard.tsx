/**
 * Glassmorphism Card Component - 2025 Modern Design
 *
 * Features:
 * - Semi-transparent frosted glass effect
 * - Subtle neumorphism depth with refined shadows
 * - Gradient overlays for visual interest
 * - Smooth animations and interactions
 * - Accessible and performant
 */

import React, { useRef } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  Animated,
  ViewStyle,
  ColorValue,
  Platform,
} from 'react-native';
import { theme, r, haptics } from '../theme';

export type GlassCardSize = 'small' | 'medium' | 'large';
export type GlassCardGradient = 'coral' | 'mint' | 'purple' | 'none';

export interface GlassmorphismCardProps {
  children: React.ReactNode;
  size?: GlassCardSize;
  gradient?: GlassCardGradient;
  pressable?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
  hapticFeedback?: boolean;
  // Glassmorphism specific
  blurIntensity?: 'light' | 'medium' | 'strong';
  glassOpacity?: number; // 0-1, default 0.8
  glowColor?: ColorValue;
  showGlow?: boolean;
  // Content customization
  padding?: 'small' | 'medium' | 'large';
  borderColor?: ColorValue;
}

export const GlassmorphismCard: React.FC<GlassmorphismCardProps> = ({
  children,
  size = 'medium',
  gradient = 'none',
  pressable = false,
  onPress,
  style,
  hapticFeedback = true,
  // blurIntensity = 'medium',
  glassOpacity = 0.8,
  glowColor,
  showGlow = false,
  padding = 'medium',
  borderColor,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const shadowOpacityAnim = useRef(new Animated.Value(0.1)).current;

  const handlePressIn = () => {
    if (pressable) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 0.97,
          useNativeDriver: true,
          friction: 8,
          tension: 40,
        }),
        Animated.timing(shadowOpacityAnim, {
          toValue: 0.2,
          duration: 150,
          useNativeDriver: false,
        }),
      ]).start();
    }
  };

  const handlePressOut = () => {
    if (pressable) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          friction: 8,
          tension: 40,
        }),
        Animated.timing(shadowOpacityAnim, {
          toValue: 0.1,
          duration: 150,
          useNativeDriver: false,
        }),
      ]).start();
    }
  };

  const handlePress = () => {
    if (hapticFeedback && pressable && onPress) {
      haptics.patterns.buttonPress();
    }
    onPress?.();
  };

  // Animate glow on mount if enabled
  React.useEffect(() => {
    if (showGlow) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: false,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: false,
          }),
        ])
      ).start();
    }
  }, [showGlow, glowAnim]);

  const sizeStyles = sizeMap[size];
  const gradientStyles = gradientMap[gradient];
  // const blurRadius = blurIntensityMap[blurIntensity];
  const paddingStyle = paddingMap[padding];

  // Glow shadow interpolation
  const glowShadowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.3],
  });

  const glowColor2 = glowColor || theme.colors.brand.primary;

  const content = (
    <Animated.View
      style={[
        styles.container,
        { transform: [{ scale: scaleAnim }] },
        style,
      ]}
    >
      {/* Glow effect layer (if enabled) */}
      {showGlow && (
        <Animated.View
          style={[
            styles.glowLayer,
            {
              opacity: glowShadowOpacity,
              borderColor: glowColor2,
            },
          ]}
        />
      )}

      {/* Main glassmorphism surface */}
      <View
        style={[
          styles.glassBase,
          sizeStyles,
          {
            backgroundColor: `rgba(31, 31, 31, ${glassOpacity})`,
            borderColor: borderColor || `rgba(255, 255, 255, 0.15)`,
          },
          // Shadow for depth
          {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: shadowOpacityAnim,
            shadowRadius: 16,
            elevation: 8,
          },
        ]}
      >
        {/* Gradient overlay for visual interest */}
        {gradient !== 'none' && (
          <View style={[styles.gradientOverlay, gradientStyles]} />
        )}

        {/* Subtle top light (neumorphism detail) */}
        <View style={styles.lightEdge} />

        {/* Content */}
        <View style={[styles.content, paddingStyle]}>
          {children}
        </View>
      </View>
    </Animated.View>
  );

  if (pressable && onPress) {
    return (
      <Pressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        accessibilityRole="button"
      >
        {content}
      </Pressable>
    );
  }

  return content;
};

// Size mappings
const sizeMap: Record<GlassCardSize, ViewStyle> = {
  small: {
    minHeight: 100,
    borderRadius: theme.borderRadius.md,
  },
  medium: {
    minHeight: 140,
    borderRadius: theme.borderRadius.lg,
  },
  large: {
    minHeight: 200,
    borderRadius: theme.borderRadius.xl,
  },
};

// Gradient overlays (subtle, not overwhelming)
const gradientMap: Record<GlassCardGradient, ViewStyle> = {
  coral: {
    backgroundColor: `rgba(255, 118, 100, 0.1)`, // Subtle coral
  },
  mint: {
    backgroundColor: `rgba(155, 203, 171, 0.08)`, // Subtle mint
  },
  purple: {
    backgroundColor: `rgba(205, 164, 232, 0.08)`, // Subtle purple
  },
  none: {
    backgroundColor: 'transparent',
  },
};

// Blur intensity affects the glass appearance
// const blurIntensityMap: Record<'light' | 'medium' | 'strong', number> = {
//   light: 5,
//   medium: 10,
//   strong: 15,
// };

// Padding options
const paddingMap: Record<'small' | 'medium' | 'large', ViewStyle> = {
  small: {
    padding: r.adaptiveSpacing.md,
  },
  medium: {
    padding: r.adaptiveSpacing.lg,
  },
  large: {
    padding: r.adaptiveSpacing.xl,
  },
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  glassBase: {
    overflow: 'hidden',
    borderWidth: 1,
    backgroundColor: '#1f1f1f',
  },
  glowLayer: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 2,
    borderRadius: 'auto',
    pointerEvents: 'none',
    shadowColor: '#ff7664',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 12,
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    pointerEvents: 'none',
  },
  lightEdge: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  content: {
    flex: 1,
    ...Platform.select({
      android: {
        overflow: 'hidden',
      },
    }),
  },
});

export default GlassmorphismCard;
