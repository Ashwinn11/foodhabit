import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { theme, r } from '../../theme';
import { Text } from '../Text';

interface HealthRingProps {
  score: number; // 0-100
  label: string;
  color: string;
  size?: number;
  strokeWidth?: number;
  delay?: number; // Animation delay for stagger effect
}

/**
 * HealthRing Component
 * Small circular ring for displaying health metrics (Gut, Nutrition, Metabolism)
 * Whoop-style compact visualization with score inside
 */
export const HealthRing: React.FC<HealthRingProps> = ({
  score,
  label,
  color,
  size = 120,
  strokeWidth = 8,
  delay = 0,
}) => {
  const animatedProgress = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    // Fade in with delay
    opacity.value = withDelay(delay, withTiming(1, { duration: 400 }));

    // Animate progress with delay
    animatedProgress.value = withDelay(
      delay + 200,
      withTiming(score / 100, { duration: 800 })
    );
  }, [score, delay, animatedProgress, opacity]);

  // Ring rotation animation
  const ringAnimatedStyle = useAnimatedStyle(() => {
    const rotation = interpolate(
      animatedProgress.value,
      [0, 1],
      [0, 360],
      Extrapolate.CLAMP
    );

    return {
      transform: [{ rotate: `${rotation}deg` }],
      opacity: opacity.value,
    };
  });

  // Container fade in
  const containerAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });

  return (
    <Animated.View style={[styles.container, containerAnimatedStyle]}>
      {/* Ring visualization */}
      <View style={[styles.ringWrapper, { width: size, height: size }]}>
        {/* Background ring */}
        <View
          style={[
            styles.backgroundRing,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              borderWidth: strokeWidth,
              borderColor: `${color}20`, // 20% opacity
            },
          ]}
        />

        {/* Animated progress ring */}
        <Animated.View
          style={[
            styles.progressRingWrapper,
            ringAnimatedStyle,
            {
              width: size,
              height: size,
            },
          ]}
        >
          <View
            style={[
              styles.progressRing,
              {
                width: size,
                height: size,
                borderRadius: size / 2,
                borderWidth: strokeWidth,
                borderColor: color,
                borderTopColor: 'transparent',
                borderRightColor: 'transparent',
                borderBottomColor: 'transparent',
              },
            ]}
          />
        </Animated.View>

        {/* Score in center */}
        <View style={styles.scoreContainer}>
          <Text variant="h3" style={StyleSheet.flatten([styles.score, { color }])}>
            {Math.round(score)}
          </Text>
        </View>
      </View>

      {/* Label below ring */}
      <Text variant="label" color="secondary" style={styles.label}>
        {label}
      </Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.sm,
  },
  backgroundRing: {
    position: 'absolute',
  },
  progressRingWrapper: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressRing: {
    borderStyle: 'solid',
  },
  scoreContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  score: {
    fontWeight: '700',
  },
  label: {
    textAlign: 'center',
    fontSize: r.adaptiveFontSize.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
