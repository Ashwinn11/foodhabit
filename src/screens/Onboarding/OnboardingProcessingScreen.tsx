import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useOnboardingStore } from '../../store/onboardingStore';
import { useNavigation } from '@react-navigation/native';
import { Typography, ScreenWrapper } from '../../components';
import { colors, spacing } from '../../theme';
import Animated, { FadeIn, FadeInDown, useSharedValue, useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { analyticsService } from '../../analytics/analyticsService';

const PROCESSING_STEPS = [
  { icon: 'analytics', text: 'Analyzing your symptom patterns...', color: colors.pink },
  { icon: 'git-compare', text: 'Comparing against 50,000+ gut profiles...', color: colors.blue },
  { icon: 'nutrition', text: 'Identifying potential trigger foods...', color: colors.yellow },
  { icon: 'calendar', text: 'Building your personalized protocol...', color: colors.green },
  { icon: 'checkmark-done', text: 'Finalizing your Gut Health Score...', color: colors.pink },
];

export const OnboardingProcessingScreen = () => {
  const navigation = useNavigation<any>();
  const { setCurrentStep, totalSteps } = useOnboardingStore();
  const [currentStep, setStep] = useState(0);
  const progress = useSharedValue(0);

  useEffect(() => {
    analyticsService.trackOnboardingScreenView('processing', 7, totalSteps);

    // Animate through steps
    const stepInterval = setInterval(() => {
      setStep(prev => {
        if (prev < PROCESSING_STEPS.length - 1) return prev + 1;
        return prev;
      });
    }, 800);

    // Animate progress bar
    progress.value = withTiming(1, {
      duration: 4500,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });

    // Navigate after processing
    const navigateTimer = setTimeout(() => {
      setCurrentStep(8);
      navigation.navigate('OnboardingResults');
    }, 4500);

    return () => {
      clearInterval(stepInterval);
      clearTimeout(navigateTimer);
    };
  }, [navigation, setCurrentStep, totalSteps, progress]);

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  return (
    <ScreenWrapper useGradient={true}>
      <View style={styles.container}>

        <Animated.View entering={FadeIn} style={styles.content}>
          {/* Pulsing icon */}
          <View style={styles.iconContainer}>
            <Ionicons name="pulse" size={48} color={colors.pink} />
          </View>

          <Typography variant="h2" align="center" style={{ marginBottom: spacing.sm }}>
            Building Your Plan
          </Typography>
          <Typography variant="bodySmall" color={colors.textSecondary} align="center" style={{ marginBottom: spacing['2xl'] }}>
            Hang tight — we're creating something personalized just for you
          </Typography>

          {/* Progress Bar */}
          <View style={styles.progressTrack}>
            <Animated.View style={[styles.progressFill, progressStyle]} />
          </View>

          {/* Step Messages */}
          <View style={styles.stepsContainer}>
            {PROCESSING_STEPS.map((step, index) => (
              <Animated.View
                key={index}
                entering={index <= currentStep ? FadeInDown.delay(index * 200).duration(300) : undefined}
                style={[styles.stepRow, index > currentStep && { opacity: 0.3 }]}
              >
                <Ionicons
                  name={index <= currentStep ? 'checkmark-circle' : ('ellipse-outline' as any)}
                  size={18}
                  color={index <= currentStep ? step.color : colors.textTertiary}
                />
                <Typography
                  variant="bodySmall"
                  color={index <= currentStep ? colors.textPrimary : colors.textTertiary}
                  style={{ marginLeft: spacing.sm, flex: 1 }}
                >
                  {step.text}
                </Typography>
              </Animated.View>
            ))}
          </View>
        </Animated.View>

        <Typography variant="caption" color={colors.textTertiary} align="center">
          Based on clinical research & Bristol Scale protocols
        </Typography>
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.xl,
  },
  content: {
    alignItems: 'center',
  },
  iconContainer: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.pink + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  progressTrack: {
    width: '100%',
    height: 8,
    backgroundColor: colors.black + '08',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: spacing['2xl'],
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.pink,
    borderRadius: 4,
  },
  stepsContainer: {
    width: '100%',
    gap: spacing.md,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
