import React from 'react';
import { StyleSheet, ActivityIndicator, Pressable, View, ViewStyle, TextStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { theme } from '../theme/theme';
import { Text } from './Text';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'soft' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  style?: ViewStyle;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const Button: React.FC<ButtonProps> = ({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  leftIcon,
  rightIcon,
  style,
}) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const handlePressIn = () => {
    if (disabled || loading) return;
    scale.value = withSpring(0.97, { damping: 15, stiffness: 300 });
    opacity.value = withTiming(0.8, { duration: 100 });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handlePressOut = () => {
    if (disabled || loading) return;
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
    opacity.value = withTiming(1, { duration: 100 });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: disabled ? 0.5 : opacity.value,
  }));

  const getVariantStyles = (): { button: ViewStyle; text: TextStyle; iconColor: string } => {
    switch (variant) {
      case 'primary':
        return {
          button: { backgroundColor: theme.colors.primary },
          text: { color: theme.colors.text.inverse },
          iconColor: theme.colors.text.inverse,
        };
      case 'secondary':
        return {
          button: { backgroundColor: theme.colors.secondary },
          text: { color: theme.colors.text.primary },
          iconColor: theme.colors.text.primary,
        };
      case 'soft':
        return {
          button: { backgroundColor: theme.colors.primaryMuted },
          text: { color: theme.colors.primary },
          iconColor: theme.colors.primary,
        };
      case 'ghost':
        return {
          button: { 
            backgroundColor: 'transparent', 
            borderWidth: 1, 
            borderColor: theme.colors.border 
          },
          text: { color: theme.colors.text.primary },
          iconColor: theme.colors.text.primary,
        };
      case 'danger':
        return {
          button: { backgroundColor: theme.colors.error + '20', borderWidth: 1, borderColor: theme.colors.error },
          text: { color: theme.colors.error },
          iconColor: theme.colors.error,
        };
      default:
        return {
          button: { backgroundColor: theme.colors.primary },
          text: { color: theme.colors.text.inverse },
          iconColor: theme.colors.text.inverse,
        };
    }
  };

  const getSizeStyles = (): ViewStyle => {
    switch (size) {
      case 'sm':
        return { paddingVertical: theme.spacing.sm, paddingHorizontal: theme.spacing.md };
      case 'lg':
        return { paddingVertical: theme.spacing.xl, paddingHorizontal: theme.spacing.xxxl };
      default:
        return { paddingVertical: theme.spacing.lg, paddingHorizontal: theme.spacing.xxl };
    }
  };

  const { button: variantButtonStyle, text: variantTextStyle } = getVariantStyles();

  return (
    <AnimatedPressable
      onPress={() => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        onPress();
      }}
      disabled={disabled || loading}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.button,
        getSizeStyles(),
        variantButtonStyle,
        animatedStyle,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variantTextStyle.color} />
      ) : (
        <View style={styles.contentRow}>
          {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
          <Text 
            style={[
              styles.label, 
              variantTextStyle,
              { fontSize: size === 'sm' ? 14 : 16 }
            ]}
          >
            {label}
          </Text>
          {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
        </View>
      )}
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: theme.radii.full, // Pill shape
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    height: 52, // Slightly sleeker height
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  leftIcon: {
    marginRight: theme.spacing.md,
  },
  rightIcon: {
    marginLeft: theme.spacing.md,
  },
  label: {
    fontFamily: theme.typography.fonts.bold,
    textAlign: 'center',
  }
});
