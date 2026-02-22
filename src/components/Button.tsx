import React from 'react';
import { StyleSheet, ActivityIndicator, Pressable, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { theme } from '../theme/theme';
import { Text } from './Text';

export interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'ghost';
  disabled?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const Button: React.FC<ButtonProps> = ({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  leftIcon,
}) => {
  const isPressed = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: withSpring(isPressed.value ? 0.96 : 1, { damping: 15, stiffness: 200 }) },
    ],
    opacity: disabled ? 0.5 : 1,
  }));

  const bgColor = variant === 'primary' ? theme.colors.coral : 'transparent';
  const textColor = variant === 'primary' ? theme.colors.bg : theme.colors.textPrimary;
  const borderColor = variant === 'ghost' ? theme.colors.border : 'transparent';

  return (
    <AnimatedPressable
      onPress={onPress}
      disabled={disabled || loading}
      onPressIn={() => (isPressed.value = 1)}
      onPressOut={() => (isPressed.value = 0)}
      style={[
        styles.button,
        animatedStyle,
        {
          backgroundColor: bgColor,
          borderColor,
          borderWidth: variant === 'ghost' ? 1 : 0,
        },
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <>
          {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
          <Text
            variant="label"
            style={{ color: textColor, textAlign: 'center', fontSize: 16, flex: leftIcon ? 1 : undefined }}
          >
            {label}
          </Text>
          {leftIcon && <View style={styles.rightSpacer} />}
        </>
      )}
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.xxxl,
    borderRadius: theme.radii.full,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  leftIcon: {
    marginRight: theme.spacing.md,
  },
  rightSpacer: {
    width: 24, // mirrors leftIcon width to keep label optically centered
  },
});
