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
        safe: { backgroundColor: 'rgba(90, 175, 123, 0.12)', borderColor: 'rgba(90, 175, 123, 0.35)' },
        caution: { backgroundColor: 'rgba(212, 169, 90, 0.12)', borderColor: 'rgba(212, 169, 90, 0.35)' },
        avoid: { backgroundColor: 'rgba(199, 80, 80, 0.12)', borderColor: 'rgba(199, 80, 80, 0.35)' },
      };
      return statusStyles[status];
    }
    if (variant === 'selectable' && selected) {
      return {
        backgroundColor: 'rgba(46, 189, 129, 0.12)',
        borderColor: theme.colors.primary,
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.18,
        shadowRadius: 8,
        elevation: 4,
      };
    }
    return {
      backgroundColor: 'rgba(255, 255, 255, 0.03)',
      borderColor: 'rgba(255, 255, 255, 0.08)',
    };
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
      return theme.colors.primary;
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
        style={{ fontFamily: selected ? theme.fonts.semibold : theme.fonts.medium }}
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
  },
  size_sm: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 3,
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
