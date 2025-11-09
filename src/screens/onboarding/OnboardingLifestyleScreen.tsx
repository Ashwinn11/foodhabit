import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Animated,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { GradientBackground } from '../../components/onboarding/GradientBackground';
import { BackButton } from '../../components/onboarding/BackButton';
import { AnimatedRing } from '../../components/onboarding/AnimatedRing';
import { ProgressIndicator } from '../../components/onboarding/ProgressIndicator';
import { IconSelector } from '../../components/onboarding/IconSelector';
import { Button, Text, Input } from '../../components';
import { theme, haptics } from '../../theme';
import { OnboardingData } from '../../types/profile';

interface OnboardingLifestyleScreenProps {
  onNext: () => void;
  data: Partial<OnboardingData>;
  updateData: (data: Partial<OnboardingData>) => void;
  ringProgress: number;
  setRingProgress: (progress: number) => void;
}

/**
 * Onboarding Lifestyle Screen
 * Fourth screen - Collect activity level, sleep, diet, eating window
 *
 * Psychology:
 * - Combine multiple data points to show "deep analysis"
 * - Each selection = satisfying haptic feedback
 * - Progressive ring fill
 *
 * Animation:
 * - Ring progresses 50% → 70%
 * - Icons scale on select
 * - Haptic on each selection
 */
export default function OnboardingLifestyleScreen({
  onNext,
  data,
  updateData,
  ringProgress,
  setRingProgress,
}: OnboardingLifestyleScreenProps) {
  const navigation = useNavigation();
  const [activityLevel, setActivityLevel] = useState<string | null>(
    data.activity_level ?? null
  );
  const [sleepHours, setSleepHours] = useState(data.sleep_hours?.toString() ?? '7');
  const [dietType, setDietType] = useState<string | null>(data.diet_type ?? null);
  const [eatingStart, setEatingStart] = useState(data.eating_window_start ?? '12:00');
  const [eatingEnd, setEatingEnd] = useState(data.eating_window_end ?? '20:00');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const ringValue = useRef(new Animated.Value(ringProgress)).current;

  const activityOptions = [
    { id: 'sedentary', label: 'Sedentary', icon: 'home' as const },
    { id: 'moderate', label: 'Moderate', icon: 'walk' as const },
    { id: 'active', label: 'Active', icon: 'bicycle' as const },
  ];

  const dietOptions = [
    { id: 'veg', label: 'Vegetarian', icon: 'leaf' as const },
    { id: 'non_veg', label: 'Non-Veg', icon: 'restaurant' as const },
    { id: 'vegan', label: 'Vegan', icon: 'flower' as const },
  ];

  // Validate and update ring progress
  const validateAndUpdateProgress = () => {
    const newErrors: Record<string, string> = {};
    let filledFields = 0;

    if (activityLevel) filledFields++;
    if (sleepHours) {
      const sleep = parseFloat(sleepHours);
      if (sleep < 1 || sleep > 24) {
        newErrors.sleepHours = 'Sleep must be 1-24 hours';
      } else {
        filledFields++;
      }
    } else {
      newErrors.sleepHours = 'Sleep hours required';
    }

    if (dietType) filledFields++;
    if (eatingStart && eatingEnd) filledFields++;

    setErrors(newErrors);

    // Update ring: 50% → 70% (20% range)
    const progress = 50 + (filledFields / 4) * 20;
    Animated.timing(ringValue, {
      toValue: progress,
      duration: 300,
      useNativeDriver: false,
    }).start();
    setRingProgress(progress);
  };

  // Update ring progress without validation (for immediate visual feedback while typing)
  const updateRingProgressOnly = () => {
    let filledFields = 0;
    if (activityLevel) filledFields++;
    if (sleepHours) filledFields++;
    if (dietType) filledFields++;
    if (eatingStart && eatingEnd) filledFields++;

    // Update ring: 50% → 70% (20% range)
    const progress = 50 + (filledFields / 4) * 20;
    Animated.timing(ringValue, {
      toValue: progress,
      duration: 300,
      useNativeDriver: false,
    }).start();
    setRingProgress(progress);
  };

  const handleActivitySelect = (selected: string) => {
    setActivityLevel(selected);
    haptics.light();
    updateRingProgressOnly();
  };

  const handleDietSelect = (selected: string) => {
    setDietType(selected);
    haptics.light();
    updateRingProgressOnly();
  };

  const handleSleepChange = (value: string) => {
    setSleepHours(value);
    haptics.light();
    updateRingProgressOnly();
  };

  const handleNext = () => {
    validateAndUpdateProgress();

    if (
      activityLevel &&
      sleepHours &&
      dietType &&
      eatingStart &&
      eatingEnd &&
      Object.keys(errors).length === 0
    ) {
      updateData({
        activity_level: activityLevel as 'sedentary' | 'moderate' | 'active',
        sleep_hours: parseFloat(sleepHours),
        diet_type: dietType as 'veg' | 'non_veg' | 'vegan',
        eating_window_start: eatingStart,
        eating_window_end: eatingEnd,
      });
      haptics.medium();
      onNext();
    } else {
      haptics.light();
    }
  };

  const isFormValid =
    activityLevel &&
    sleepHours &&
    dietType &&
    eatingStart &&
    eatingEnd &&
    Object.keys(errors).length === 0;


  return (
    <GradientBackground>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          {/* Back Button */}
          <BackButton onPress={() => navigation.goBack()} />

          {/* Scrollable Content */}
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardView}
          >
            <ScrollView
              style={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.contentContainer}
              keyboardShouldPersistTaps="handled"
            >
              {/* Progress Indicator */}
              <ProgressIndicator currentStep={2} totalSteps={5} />

              {/* Title and Subtitle */}
              <View style={styles.titleContainer}>
                <Text variant="h2" align="center" style={styles.title}>
                  Now we're getting somewhere...
                </Text>
                <Text variant="body" align="center" style={styles.subtitle}>
                  This tells us how your body actually responds to daily life
                </Text>
              </View>

              {/* Form Content */}
              <View style={styles.formContainer}>
                {/* Activity Level */}
                <View style={styles.fieldContainer}>
                  <Text variant="label" style={styles.label}>
                    Activity Level
                  </Text>
                  <IconSelector
                    options={activityOptions}
                    selected={activityLevel}
                    onSelect={handleActivitySelect}
                    layout="row"
                    containerStyle={styles.iconSelector}
                  />
                </View>

                {/* Sleep Hours */}
                <View style={styles.fieldContainer}>
                  <Text variant="label" style={styles.label}>
                    Sleep Hours
                  </Text>
                  <View style={styles.sleepInputContainer}>
                    <Input
                      placeholder="7"
                      value={sleepHours}
                      onChangeText={handleSleepChange}
                      onBlur={validateAndUpdateProgress}
                      keyboardType="decimal-pad"
                    />
                    <Text variant="body" style={styles.sleepLabel}>
                      hrs/night
                    </Text>
                  </View>
                  {errors.sleepHours && (
                    <Text variant="caption" style={styles.errorText}>
                      {errors.sleepHours}
                    </Text>
                  )}
                </View>

                {/* Diet Type */}
                <View style={styles.fieldContainer}>
                  <Text variant="label" style={styles.label}>
                    Diet Type
                  </Text>
                  <IconSelector
                    options={dietOptions}
                    selected={dietType}
                    onSelect={handleDietSelect}
                    layout="row"
                    containerStyle={styles.iconSelector}
                  />
                </View>

                {/* Eating Window */}
                <View style={styles.fieldContainer}>
                  <Text variant="label" style={styles.label}>
                    Eating Window
                  </Text>
                  <View style={styles.timeRangeContainer}>
                    <View style={styles.timeInputWrapper}>
                      <Input
                        placeholder="12:00"
                        value={eatingStart}
                        onChangeText={setEatingStart}
                        onBlur={validateAndUpdateProgress}
                      />
                      <Text variant="caption" style={styles.ampmLabel}>
                        Start
                      </Text>
                    </View>

                    <Text variant="body" style={styles.separator}>
                      —
                    </Text>

                    <View style={styles.timeInputWrapper}>
                      <Input
                        placeholder="20:00"
                        value={eatingEnd}
                        onChangeText={setEatingEnd}
                        onBlur={validateAndUpdateProgress}
                      />
                      <Text variant="caption" style={styles.ampmLabel}>
                        End
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Ring Animation - Fixed Position */}
              <View style={styles.ringContainer}>
                <Animated.View>
                  <AnimatedRing
                    progress={ringProgress}
                    size={120}
                    strokeWidth={7}
                    color={theme.colors.brand.primary}
                    glowing
                  />
                </Animated.View>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>

          {/* Fixed Footer Button */}
          <View style={styles.footer}>
            <Button
              title="Continue"
              onPress={handleNext}
              variant="ghost"
              size="large"
              fullWidth
              disabled={!isFormValid}
              style={styles.blackButton}
              textStyle={styles.whiteButtonText}
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
    flexDirection: 'column',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
  },
  contentContainer: {
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.lg,
    gap: theme.spacing.lg,
  },
  titleContainer: {
    gap: theme.spacing.lg,
    marginTop: theme.spacing.xl,
  },
  title: {
    color: theme.colors.brand.white,
  },
  subtitle: {
    color: theme.colors.brand.white,
  },
  formContainer: {
    gap: theme.spacing.xl,
    marginBottom: theme.spacing['2xl'],
  },
  fieldContainer: {
    gap: theme.spacing.md,
  },
  label: {
    color: theme.colors.brand.white,
    marginLeft: theme.spacing.sm,
  },
  iconSelector: {
    marginTop: theme.spacing.sm,
  },
  sleepInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  sleepLabel: {
    color: theme.colors.brand.white,
  },
  timeRangeContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
  },
  timeInputWrapper: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  ampmLabel: {
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
  },
  separator: {
    color: theme.colors.brand.white,
    marginTop: theme.spacing.md,
    fontWeight: '300',
  },
  errorText: {
    color: '#ff6b6b',
    marginLeft: theme.spacing.sm,
  },
  ringContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: theme.spacing['2xl'],
  },
  footer: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
    borderTopWidth: 0,
  },
  blackButton: {
    backgroundColor: theme.colors.brand.black,
    borderWidth: 0,
  },
  whiteButtonText: {
    color: theme.colors.brand.white,
  },
});
