import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GradientBackground } from '../../components/onboarding/GradientBackground';
import { ProgressIndicator } from '../../components/onboarding/ProgressIndicator';
import { LoadingSequence } from '../../components/onboarding/LoadingSequence';
import { theme } from '../../theme';

interface OnboardingLoadingScreenProps {
  onComplete: () => void;
}

/**
 * Onboarding Loading Screen
 * Sixth screen - Synthetic loading (8.5s duration)
 *
 * CRITICAL FOR CONVERSION:
 * This screen creates the illusion that results are being calculated specifically for the user.
 * It's the psychological bridge between "input" and "output" phases.
 *
 * Psychology:
 * - Anticipation building (dopamine builds over time)
 * - Personalization illusion ("Analyzing YOUR data")
 * - Sunk cost justification ("We're working hard on your behalf")
 * - Separation of phases (input vs. output)
 *
 * Duration: 8.5 seconds total
 * - 6 analysis steps (1.5s each)
 * - Final "ready" pause (0.8s)
 * - Auto-transition to summary
 *
 * Haptic Pattern:
 * - Each step: Medium haptic
 * - Completion: Medium → Heavy → Light (success pattern)
 */
export default function OnboardingLoadingScreen({
  onComplete,
}: OnboardingLoadingScreenProps) {
  return (
    <GradientBackground>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          {/* Progress Indicator (5/5 - completed) */}
          <ProgressIndicator currentStep={4} totalSteps={5} />

          {/* Loading Sequence Component */}
          <View style={styles.loadingContainer}>
            <LoadingSequence
              onComplete={onComplete}
            />
          </View>
        </View>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
