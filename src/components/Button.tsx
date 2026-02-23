import React from 'react';
import {
  TouchableOpacity,
  ActivityIndicator,
  ViewStyle,
  StyleSheet,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { theme } from '../theme/theme';
import { Text } from './Text';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  onPress?: () => void;
  children: React.ReactNode;
  style?: ViewStyle;
  fullWidth?: boolean;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  onPress,
  children,
  style,
  fullWidth = false,
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.97, { damping: 20, stiffness: 400 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 20, stiffness: 400 });
  };

  const handlePress = () => {
    if (disabled || loading) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.();
  };

  const containerStyle: ViewStyle[] = [
    styles.base,
    styles[`size_${size}`],
    styles[`variant_${variant}`],
    fullWidth ? { width: '100%' } : {},
    disabled || loading ? styles.disabled : {},
    style || {},
  ];

  const textColor = getTextColor(variant, disabled || loading);

  return (
    <AnimatedTouchable
      style={[animatedStyle, containerStyle]}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      activeOpacity={1}
    >
      {loading ? (
        <ActivityIndicator size="small" color={textColor} />
      ) : (
        <Text
          variant={size === 'sm' ? 'caption' : 'bodySmall'}
          color={textColor}
          style={styles.label}
        >
          {children}
        </Text>
      )}
    </AnimatedTouchable>
  );
};

function getTextColor(variant: ButtonVariant, disabled: boolean): string {
  // Primary (coral) buttons always need dark text for contrast, even in disabled/loading states
  if (variant === 'primary') return theme.colors.primaryForeground;
  
  if (disabled) return theme.colors.textTertiary;
  switch (variant) {
    case 'danger':
      return '#fff';
    default:
      return theme.colors.text;
  }
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radius.full,
    overflow: 'hidden',
  },
  label: {
    fontFamily: theme.fonts.semibold,
    letterSpacing: 0.2,
  },
  disabled: {
    opacity: 0.45,
  },

  // Sizes
  size_sm: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs + 2,
    minHeight: 34,
  },
  size_md: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm + 2,
    minHeight: 46,
  },
  size_lg: {
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    minHeight: 54,
  },

  // Variants
  variant_primary: {
    backgroundColor: theme.colors.primary,
    ...theme.shadows.glow,
  },
  variant_secondary: {
    backgroundColor: theme.colors.surfaceElevated,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  variant_ghost: {
    backgroundColor: 'transparent',
  },
  variant_danger: {
    backgroundColor: theme.colors.danger,
  },
  variant_outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
});
