import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { colors, radii } from '../../theme';

interface ProgressBarProps {
  progress: number; // 0 to 1
  style?: any;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ progress, style }) => {
  const animatedStyle = useAnimatedStyle(() => {
    return {
      width: withSpring(`${Math.max(0, Math.min(100, progress * 100))}%`, {
        damping: 20,
        stiffness: 90,
      }),
    };
  });

  return (
    <View style={[styles.container, style]}>
      <Animated.View style={[styles.fill, animatedStyle]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 6,
    backgroundColor: colors.black + '10',
    borderRadius: radii.full,
    overflow: 'hidden',
    width: '100%',
  },
  fill: {
    height: '100%',
    backgroundColor: colors.pink,
    borderRadius: radii.full,
  },
});
