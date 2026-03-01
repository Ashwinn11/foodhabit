import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { theme } from '../theme/theme';

interface ProgressBarProps {
  step: number;
  total: number;
  height?: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  step,
  total,
  height = 3,
}) => {
  const width = useSharedValue(0);

  useEffect(() => {
    width.value = withTiming((step / total) * 100, {
      duration: 400,
      easing: Easing.out(Easing.quad),
    });
  }, [step, total]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${width.value}%`,
  }));

  return (
    <View style={[styles.track, { height }]}>
      <Animated.View style={[styles.fill, animatedStyle, { height }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  track: {
    width: '100%',
    backgroundColor: theme.colors.border,
    borderRadius: theme.radius.full,
    overflow: 'hidden',
  },
  fill: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.full,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 2,
  },
});
