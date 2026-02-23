import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { theme } from '../theme/theme';
import { Text } from './Text';

export type ChipStatus = 'safe' | 'caution' | 'risky' | 'neutral';

export interface ChipProps {
  label: string;
  status?: ChipStatus;
  selected?: boolean;
  onPress?: () => void;
  icon?: React.ReactNode;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const Chip: React.FC<ChipProps> = ({ 
  label, 
  status = 'neutral',
  selected = false,
  onPress,
  icon
}) => {
  const isPressed = useSharedValue(0);

  const getStatusColors = () => {
    switch (status) {
      case 'safe': return { 
        bg: theme.colors.success + '20', 
        border: theme.colors.success + '40', 
        text: theme.colors.success 
      };
      case 'caution': return { 
        bg: theme.colors.warning + '20', 
        border: theme.colors.warning + '40', 
        text: theme.colors.warning 
      };
      case 'risky': return { 
        bg: theme.colors.error + '20', 
        border: theme.colors.error + '40', 
        text: theme.colors.error 
      };
      default: return { 
        bg: 'transparent', 
        border: theme.colors.border, 
        text: theme.colors.text.secondary 
      };
    }
  };

  const colors = getStatusColors();

  const animatedStyle = useAnimatedStyle(() => {
    const scale = withSpring(isPressed.value ? 0.95 : 1);
    return {
      transform: [{ scale }],
      backgroundColor: selected ? (status === 'neutral' ? theme.colors.primaryMuted : colors.bg) : 'transparent',
      borderColor: selected ? (status === 'neutral' ? theme.colors.primary : colors.text) : colors.border,
    };
  });

  const handlePress = () => {
    if (onPress) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress();
    }
  };

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={() => (isPressed.value = 1)}
      onPressOut={() => (isPressed.value = 0)}
      style={[styles.chip, animatedStyle]}
    >
      {icon && <View style={styles.iconContainer}>{icon}</View>}
      <Text 
        variant="label" 
        style={{ 
          color: selected ? (status === 'neutral' ? theme.colors.primary : colors.text) : colors.text,
          fontSize: 13,
        }}
      >
        {label}
      </Text>
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.radii.full,
    alignSelf: 'flex-start',
    borderWidth: 1,
  },
  iconContainer: {
    marginRight: theme.spacing.xs,
  }
});
