import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radii, shadows } from '../../theme';
import { Typography } from '../Typography';

import { IconContainer } from '../IconContainer/IconContainer';

interface QuizOptionProps {
  icon: any;
  label: string;
  description?: string;
  selected: boolean;
  onSelect: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const QuizOption: React.FC<QuizOptionProps> = ({
  icon,
  label,
  description,
  selected,
  onSelect,
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.97);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
    onSelect();
  };

  return (
    <AnimatedPressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.container,
        animatedStyle,
        selected && styles.selected,
      ]}
    >
      <View style={styles.content}>
        <IconContainer
          name={icon}
          size={48}
          iconSize={24}
          color={colors.pink}
          variant={selected ? 'solid' : 'transparent'}
          shape="rounded"
          style={styles.iconMargin}
        />
        <View style={styles.textContainer}>
          <Typography
            variant="bodyBold"
            color={selected ? colors.pink : colors.black}
          >
            {label}
          </Typography>
          {description && (
            <Typography
              variant="bodySmall"
              color={colors.mediumGray}
              style={styles.description}
            >
              {description}
            </Typography>
          )}
        </View>
      </View>
      
      <View style={[styles.checkbox, selected && styles.checkboxSelected]}>
        {selected && (
          <Ionicons name="checkmark" size={16} color={colors.white} />
        )}
      </View>
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  checkbox: {
    alignItems: 'center',
    borderColor: colors.border,
    borderRadius: radii.full,
    borderWidth: 2,
    height: 24,
    justifyContent: 'center',
    marginLeft: spacing.md,
    width: 24,
  },
  checkboxSelected: {
    backgroundColor: colors.pink,
    borderColor: colors.pink,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white + 'CC', // Slightly translucent for gradient
    borderRadius: radii.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 2,
    borderColor: colors.border,
    ...shadows.sm,
  },
  content: {
    alignItems: 'center',
    flexDirection: 'row',
    flex: 1,
  },
  description: {
    marginTop: spacing.xs,
  },
  iconMargin: {
    marginRight: spacing.md,
  },
  selected: {
    backgroundColor: colors.pink + '08',
    borderColor: colors.pink,
  },
  textContainer: {
    flex: 1,
  },
});
