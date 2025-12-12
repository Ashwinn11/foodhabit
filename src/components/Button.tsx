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
import { NeumorphicView } from './NeumorphicView';

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
  const [isPressed, setIsPressed] = React.useState(false);
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    setIsPressed(true);
    Animated.spring(scaleAnim, {
      toValue: 0.98, // Subtle scale
      useNativeDriver: true,
      ...theme.animations.springConfig.stiff,
    }).start();
  };

  const handlePressOut = () => {
    setIsPressed(false);
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

  // Determine text color based on variant for Neumorphic style
  let textColor: string = theme.colors.neumorphism.text;
  if (variant === 'primary') textColor = theme.colors.brand.primary;
  if (variant === 'secondary') textColor = theme.colors.brand.secondary;
  if (variant === 'tertiary') textColor = theme.colors.brand.tertiary;
  if (variant === 'ghost') textColor = theme.colors.neumorphism.secondaryText;
  if (variant === 'destructive') textColor = theme.colors.brand.primary; 

  const textStyleCombined: TextStyle[] = [
    styles.text,
    styles[`text_${size}`],
    { color: textColor },
    (disabled || loading) && styles.textDisabled,
    textStyle,
  ].filter(Boolean) as TextStyle[];

  const renderContent = () => {
    if (variant === 'ghost') {
      return (
        <View style={[
          styles.base, 
          styles[`size_${size}`], 
          styles[`padding_${size}`], // Apply padding here
          styles.variant_ghost,
          fullWidth && styles.fullWidth,
          (disabled || loading) && styles.disabled,
          style
        ]}>
          {loading ? (
            <ActivityIndicator color={textColor} size="small" />
          ) : (
            <View style={styles.content}>
              {icon && <View style={styles.icon}>{icon}</View>}
              <Text style={textStyleCombined}>{title}</Text>
            </View>
          )}
        </View>
      );
    }

    // Glow effect for primary buttons when pressed
    const glowStyle = (variant === 'primary' && isPressed) ? {
      shadowColor: theme.colors.brand.primary,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.6,
      shadowRadius: 10,
      elevation: 5,
    } : {};

    return (
      <NeumorphicView
        style={[
          styles.base,
          styles[`size_${size}`],
          fullWidth && styles.fullWidth,
          (disabled || loading) && styles.disabled,
          style,
          glowStyle, // Apply glow
        ]}
        contentContainerStyle={[
          styles.contentContainer,
          styles[`padding_${size}`], // Apply padding here
          fullWidth && styles.fullWidth,
        ]}
        size={size === 'small' ? 'sm' : 'md'}
        inset={isPressed} // Toggle concave state on press
      >
        {loading ? (
          <ActivityIndicator color={textColor} size="small" />
        ) : (
          <View style={styles.content}>
            {icon && <View style={styles.icon}>{icon}</View>}
            <Text style={textStyleCombined}>{title}</Text>
          </View>
        )}
      </NeumorphicView>
    );
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Pressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
      >
        {renderContent()}
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: theme.borderRadius.pill,
    // paddingHorizontal handled by size styles, but NeumorphicView needs explicit style
  },

  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
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

  // Ghost variant
  variant_ghost: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    justifyContent: 'center',
    alignItems: 'center',
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
    ...theme.typography.subheadline,
  },

  text_medium: {
    ...theme.typography.headline,
  },

  text_large: {
    ...theme.typography.headline,
  },

  textDisabled: {
    opacity: 1,
  },
});

export default Button;
