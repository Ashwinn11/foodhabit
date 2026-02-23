import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { theme } from '../theme/theme';
import { Text } from './Text';
import { Icon } from './Icon';

export type ChipVariant = 'selectable' | 'dismissible' | 'status';
export type ChipStatus = 'safe' | 'caution' | 'avoid';
export type ChipSize = 'sm' | 'md';

interface ChipProps {
  label: string;
  variant?: ChipVariant;
  status?: ChipStatus;
  size?: ChipSize;
  selected?: boolean;
  onPress?: () => void;
  onDismiss?: () => void;
  style?: ViewStyle;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export const Chip: React.FC<ChipProps> = ({
  label,
  variant = 'selectable',
  status,
  size = 'md',
  selected = false,
  onPress,
  onDismiss,
  style,
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 20, stiffness: 400 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 20, stiffness: 400 });
  };

  const handlePress = () => {
    Haptics.selectionAsync();
    onPress?.();
  };

  const getChipStyle = (): ViewStyle => {
    if (variant === 'status' && status) {
      const statusStyles: Record<ChipStatus, ViewStyle> = {
        safe: { backgroundColor: theme.colors.safeMuted, borderColor: theme.colors.safe },
        caution: { backgroundColor: theme.colors.cautionMuted, borderColor: theme.colors.caution },
        avoid: { backgroundColor: theme.colors.dangerMuted, borderColor: theme.colors.danger },
      };
      return statusStyles[status];
    }
    if (variant === 'selectable' && selected) {
      return { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary };
    }
    return {};
  };

  const getTextColor = (): string => {
    if (variant === 'status' && status) {
      const colors: Record<ChipStatus, string> = {
        safe: theme.colors.safe,
        caution: theme.colors.caution,
        avoid: theme.colors.danger,
      };
      return colors[status];
    }
    if (variant === 'selectable' && selected) {
      return theme.colors.primaryForeground;
    }
    return theme.colors.textSecondary;
  };

  return (
    <AnimatedTouchable
      style={[
        styles.base,
        styles[`size_${size}`],
        getChipStyle(),
        animatedStyle,
        style,
      ]}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
    >
      <Text
        variant={size === 'sm' ? 'caption' : 'bodySmall'}
        color={getTextColor()}
        style={{ fontFamily: theme.fonts.medium }}
      >
        {label}
      </Text>
      {variant === 'dismissible' && (
        <TouchableOpacity onPress={onDismiss} style={styles.dismissBtn} hitSlop={8}>
          <Icon name="X" size={12} color={theme.colors.textSecondary} />
        </TouchableOpacity>
      )}
    </AnimatedTouchable>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: theme.radius.full,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  size_sm: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xxs + 2,
    gap: 4,
  },
  size_md: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs + 2,
    gap: 6,
  },
  dismissBtn: {
    marginLeft: 2,
  },
});
