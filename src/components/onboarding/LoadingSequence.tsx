import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { withTiming, useSharedValue, useAnimatedStyle } from 'react-native-reanimated';
import { theme, haptics } from '../../theme';
import { Text } from '../Text';
import { AnimatedRing } from './AnimatedRing';

interface LoadingStep {
  text: string;
  progress: number; // 0-100
  haptic?: boolean;
}

interface LoadingSequenceProps {
  onComplete: () => void;
}

/**
 * Loading Sequence Component
 * Synthetic loading screen with 6-step text sequence
 * Creates anticipation and perceived personalization
 *
 * Psychological Purpose:
 * - Builds anticipation (dopamine builds over time)
 * - Makes results feel "calculated just for them"
 * - Justifies the time spent (sunk cost)
 * - Separates "input" from "output" psychologically
 */
export const LoadingSequence: React.FC<LoadingSequenceProps> = ({
  onComplete,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const ringProgress = useSharedValue(0);
  const textOpacity = useSharedValue(1);

  const loadingSteps = React.useMemo<LoadingStep[]>(() => [
    {
      text: 'Analyzing your metabolic profile...',
      progress: 91,
      haptic: true,
    },
    {
      text: 'Calculating your body age...',
      progress: 93,
      haptic: true,
    },
    {
      text: 'Evaluating digestive patterns...',
      progress: 95,
      haptic: true,
    },
    {
      text: 'Balancing your nutrition score...',
      progress: 97,
      haptic: true,
    },
    {
      text: 'Building your personalized dashboard...',
      progress: 99,
      haptic: true,
    },
    {
      text: 'Your results are ready.',
      progress: 100,
      haptic: true,
    },
  ], []);

  // Time allocations for each step (ms)
  const stepDuration = 1500; // Each step takes 1.5s
  const stepTransitionDuration = 200; // Fade in/out transition

  useEffect(() => {
    let currentStep = 0;
    const totalSteps = loadingSteps.length;

    // Start loading sequence
    const interval = setInterval(() => {
      if (currentStep >= totalSteps) {
        clearInterval(interval);
        // Complete loading with success haptic pattern
        haptics.heavy();
        setTimeout(() => {
          haptics.medium();
        }, 100);
        setTimeout(() => {
          haptics.light();
        }, 200);

        // Delay transition to allow user to see "ready" text
        setTimeout(() => {
          onComplete();
        }, 800);
        return;
      }

      const step = loadingSteps[currentStep];

      // Update ring progress
      ringProgress.value = withTiming(step.progress, {
        duration: stepDuration - stepTransitionDuration,
      });

      // Haptic feedback
      if (step.haptic) {
        haptics.medium();
      }

      setCurrentStepIndex(currentStep);
      currentStep++;
    }, stepDuration);

    return () => clearInterval(interval);
  }, [onComplete]);

  const currentStep = loadingSteps[currentStepIndex];

  const textAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: textOpacity.value,
    };
  });

  return (
    <View style={styles.container}>
      {/* Ring */}
      <View style={styles.ringContainer}>
        <AnimatedRing
          progress={currentStep?.progress || 0}
          size={140}
          strokeWidth={8}
          color={theme.colors.brand.primary}
          glowing
          pulsing={false}
        />
      </View>

      {/* Loading text */}
      <Animated.View style={[styles.textContainer, textAnimatedStyle]}>
        <Text
          variant="body"
          align="center"
          style={styles.loadingText}
        >
          {currentStep?.text || 'Loading...'}
        </Text>
      </Animated.View>

      {/* Step indicator */}
      <View style={styles.stepIndicator}>
        <Text variant="caption" style={styles.stepText}>
          {currentStepIndex + 1}/{loadingSteps.length}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  ringContainer: {
    marginBottom: theme.spacing['3xl'],
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    minHeight: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing['2xl'],
  },
  loadingText: {
    color: theme.colors.brand.white,
    fontSize: 17,
    fontWeight: '500',
    lineHeight: 24,
  },
  stepIndicator: {
    position: 'absolute',
    bottom: theme.spacing['3xl'],
  },
  stepText: {
    color: 'rgba(255, 255, 255, 0.6)',
  },
});
