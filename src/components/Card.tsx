import React from 'react';
import { View, TouchableOpacity, ViewStyle, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { theme } from '../theme/theme';

export type CardVariant = 'default' | 'elevated' | 'bordered' | 'glow' | 'glass';

interface CardProps {
  variant?: CardVariant;
  pressable?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
  children: React.ReactNode;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export const Card: React.FC<CardProps> = ({
  variant = 'default',
  pressable = false,
  onPress,
  style,
  children,
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98, { damping: 20, stiffness: 400 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 20, stiffness: 400 });
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.();
  };

  const cardStyle = [styles.base, styles[`variant_${variant}`], style];

  if (pressable || onPress) {
    return (
      <AnimatedTouchable
        style={[animatedStyle, cardStyle]}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        {children}
      </AnimatedTouchable>
    );
  }

  return <View style={cardStyle}>{children}</View>;
};

const styles = StyleSheet.create({
  base: {
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    overflow: 'hidden',
  },
  variant_default: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
  },
  variant_elevated: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    ...theme.shadows.medium,
  },
  variant_bordered: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  variant_glow: {
    backgroundColor: 'rgba(46, 189, 129, 0.06)',
    borderWidth: 1,
    borderColor: theme.colors.primary,
    ...theme.shadows.glow,
  },
  variant_glass: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    // Backing blur is handled by the wrapper if needed, but styling provides the visual
  },
});
