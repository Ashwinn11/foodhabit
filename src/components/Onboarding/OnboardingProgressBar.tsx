/**
 * Onboarding Progress Bar Component
 * Shows progress through onboarding flow with smooth animations
 */
import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { colors, radii } from '../../theme';

interface OnboardingProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

export const OnboardingProgressBar: React.FC<OnboardingProgressBarProps> = ({
  currentStep,
  totalSteps,
}) => {
  const progress = (currentStep + 1) / totalSteps;

  const animatedStyle = useAnimatedStyle(() => ({
    width: withSpring(`${progress * 100}%`, {
      damping: 20,
      stiffness: 150,
    }),
  }));

  return (
    <View style={styles.container}>
      <View style={styles.track}>
        <Animated.View style={[styles.fill, animatedStyle]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
  },
  fill: {
    backgroundColor: colors.pink,
    borderRadius: radii.full,
    height: '100%',
  },
  track: {
    backgroundColor: colors.black + '08',
    borderColor: colors.black + '05',
    borderRadius: radii.full,
    borderWidth: 1,
    height: 8,
    overflow: 'hidden',
  },
});
