import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
  Extrapolate,
  withRepeat,
  withSequence,
} from 'react-native-reanimated';
import { theme } from '../../theme';

interface AnimatedRingProps {
  progress: number; // 0-100
  size?: number;
  strokeWidth?: number;
  color?: string;
  glowing?: boolean;
  pulsing?: boolean;
}

/**
 * Animated Ring Component
 * Displays a circular progress ring with smooth animations
 * Features: smooth progress, glow effect, pulse animation
 */
export const AnimatedRing: React.FC<AnimatedRingProps> = ({
  progress,
  size = 120,
  strokeWidth = 8,
  color = theme.colors.brand.primary,
  glowing = true,
  pulsing = false,
}) => {
  const animatedProgress = useSharedValue(0);
  const pulseScale = useSharedValue(1);

  // Update ring progress
  useEffect(() => {
    animatedProgress.value = withTiming(progress / 100, {
      duration: 800,
    });
  }, [progress, animatedProgress]);

  // Pulse animation
  useEffect(() => {
    if (pulsing) {
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.1, { duration: 500 }),
          withTiming(1, { duration: 500 })
        ),
        -1,
        true
      );
    }
  }, [pulsing, pulseScale]);

  // Rotate the progress stroke around the circle
  const ringAnimatedStyle = useAnimatedStyle(() => {
    const rotation = interpolate(animatedProgress.value, [0, 1], [0, 360], Extrapolate.CLAMP);

    return {
      transform: [{ rotate: `${rotation}deg` }, { scale: pulseScale.value }],
    };
  });

  // Glow opacity based on progress
  const glowAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(animatedProgress.value, [0, 1], [0.3, 0.8], Extrapolate.CLAMP);

    return {
      opacity,
    };
  });

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Background ring */}
      <Animated.View
        style={[
          styles.ringWrapper,
          {
            width: size,
            height: size,
          },
        ]}
      >
        <View
          style={[
            styles.ring,
            {
              width: size,
              height: size,
              borderWidth: strokeWidth,
              borderColor: 'rgba(255, 255, 255, 0.2)',
              borderRadius: size / 2,
            },
          ]}
        />
      </Animated.View>

      {/* Animated progress ring */}
      <Animated.View
        style={[
          styles.ringWrapper,
          ringAnimatedStyle,
          {
            width: size,
            height: size,
          },
        ]}
      >
        <View
          style={[
            styles.ring,
            {
              width: size,
              height: size,
              borderWidth: strokeWidth,
              borderColor: color,
              borderRadius: size / 2,
              borderTopColor: 'transparent',
              borderRightColor: 'transparent',
              borderBottomColor: 'transparent',
            },
          ]}
        />
      </Animated.View>

      {/* Glow effect */}
      {glowing && (
        <Animated.View
          style={[
            styles.glowWrapper,
            glowAnimatedStyle,
            {
              width: size + 20,
              height: size + 20,
              top: -10,
              left: -10,
            },
          ]}
        >
          <View
            style={[
              styles.glow,
              {
                width: size + 20,
                height: size + 20,
                borderRadius: (size + 20) / 2,
                borderWidth: strokeWidth / 2,
                borderColor: color,
              },
            ]}
          />
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  ringWrapper: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ring: {
    borderStyle: 'solid',
  },
  glowWrapper: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: 'rgba(255, 118, 100, 0.4)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 15,
    elevation: 10,
  },
  glow: {
    opacity: 0.5,
  },
});
