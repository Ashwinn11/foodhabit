import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Animated,
  KeyboardAvoidingView,
  Platform,
  TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { GradientBackground } from '../../components/onboarding/GradientBackground';
import { BackButton } from '../../components/onboarding/BackButton';
import { AnimatedRing } from '../../components/onboarding/AnimatedRing';
import { ProgressIndicator } from '../../components/onboarding/ProgressIndicator';
import { IconSelector } from '../../components/onboarding/IconSelector';
import { Button, Text } from '../../components';
import { theme, haptics, r } from '../../theme';
import { OnboardingData } from '../../types/profile';

interface OnboardingBodyBasicsScreenProps {
  onNext: () => void;
  data: Partial<OnboardingData>;
  updateData: (data: Partial<OnboardingData>) => void;
  ringProgress: number;
  setRingProgress: (progress: number) => void;
}

/**
 * Onboarding Body Basics Screen
 * Third screen - Collect age, gender, height, weight
 *
 * Psychology:
 * - Easy questions first (build momentum)
 * - Real-time validation feedback
 * - Progressive ring fill as fields complete
 * - All fields required before continuing
 *
 * Animation:
 * - Ring progresses 35% → 50% as fields complete
 * - Input fields glow on focus
 * - Button slides up when ready
 */
export default function OnboardingBodyBasicsScreen({
  onNext,
  data,
  updateData,
  ringProgress,
  setRingProgress,
}: OnboardingBodyBasicsScreenProps) {
  const navigation = useNavigation();
  const [age, setAge] = useState(data.age?.toString() ?? '');
  const [gender, setGender] = useState<string | null>(data.gender ?? null);
  const [height, setHeight] = useState(data.height?.toString() ?? '');
  const [weight, setWeight] = useState(data.weight?.toString() ?? '');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const ringValue = useRef(new Animated.Value(ringProgress)).current;

  const genderOptions = [
    { id: 'male', label: 'Male', icon: 'male' as const },
    { id: 'female', label: 'Female', icon: 'female' as const },
    { id: 'other', label: 'Other', icon: 'sparkles' as const },
    { id: 'prefer_not_to_say', label: 'Prefer not', icon: 'help-circle' as const },
  ];

  // Validate fields and update ring progress
  const validateAndUpdateProgress = () => {
    const newErrors: Record<string, string> = {};
    const filledFields: string[] = [];

    if (!age) {
      newErrors.age = 'Age is required';
    } else {
      const ageNum = parseInt(age, 10);
      if (ageNum < 13 || ageNum > 120) {
        newErrors.age = 'Age must be between 13-120';
      } else {
        filledFields.push('age');
      }
    }

    if (!gender) {
      newErrors.gender = 'Gender is required';
    } else {
      filledFields.push('gender');
    }

    if (!height) {
      newErrors.height = 'Height is required';
    } else {
      const heightNum = parseFloat(height);
      if (heightNum < 50 || heightNum > 250) {
        newErrors.height = 'Height must be between 50-250 cm';
      } else {
        filledFields.push('height');
      }
    }

    if (!weight) {
      newErrors.weight = 'Weight is required';
    } else {
      const weightNum = parseFloat(weight);
      if (weightNum < 20 || weightNum > 500) {
        newErrors.weight = 'Weight must be between 20-500 kg';
      } else {
        filledFields.push('weight');
      }
    }

    setErrors(newErrors);

    // Update ring progress based on filled fields (35% → 50%)
    const progress = 35 + (filledFields.length / 4) * 15;
    Animated.timing(ringValue, {
      toValue: progress,
      duration: 300,
      useNativeDriver: false,
    }).start();
    setRingProgress(progress);

    return Object.keys(newErrors).length === 0;
  };

  const handleAgeChange = (value: string) => {
    setAge(value);
    haptics.light();
  };

  const handleHeightChange = (value: string) => {
    setHeight(value);
    haptics.light();
  };

  const handleWeightChange = (value: string) => {
    setWeight(value);
    haptics.light();
  };

  const handleGenderSelect = (selectedGender: string) => {
    setGender(selectedGender);
    haptics.light();
    validateAndUpdateProgress();
  };

  const handleNext = () => {
    if (validateAndUpdateProgress()) {
      updateData({
        age: parseInt(age, 10),
        gender: gender as 'male' | 'female' | 'other' | 'prefer_not_to_say',
        height: parseFloat(height),
        weight: parseFloat(weight),
      });
      haptics.medium();
      onNext();
    } else {
      haptics.light();
    }
  };

  const isFormValid =
    age &&
    gender &&
    height &&
    weight &&
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
              <ProgressIndicator currentStep={1} totalSteps={5} />

              {/* Title and Subtitle */}
              <View style={styles.titleContainer}>
                <Text variant="h2" align="center" style={styles.title}>
                  Let's start with the basics
                </Text>
                <Text variant="body" align="center" style={styles.subtitle}>
                  These help us understand your body's unique baseline
                </Text>
              </View>

              {/* Form Inputs */}
              <View style={styles.formContainer}>
                {/* Age Input */}
                <View>
                  <Text variant="label" style={styles.label}>
                    Age
                  </Text>
                  <TextInput
                    placeholder="Enter your age"
                    placeholderTextColor="rgba(255, 255, 255, 0.5)"
                    value={age}
                    onChangeText={handleAgeChange}
                    onBlur={validateAndUpdateProgress}
                    keyboardType="number-pad"
                    style={styles.textInput}
                  />
                  {errors.age && (
                    <Text variant="caption" style={styles.errorText}>
                      {errors.age}
                    </Text>
                  )}
                </View>

                {/* Gender Selector */}
                <View style={styles.fieldContainer}>
                  <Text variant="label" style={styles.label}>
                    Gender
                  </Text>
                  <IconSelector
                    options={genderOptions}
                    selected={gender}
                    onSelect={handleGenderSelect}
                    layout="row"
                    containerStyle={styles.iconSelector}
                  />
                  {errors.gender && (
                    <Text variant="caption" style={styles.errorText}>
                      {errors.gender}
                    </Text>
                  )}
                </View>

                {/* Height Input */}
                <View>
                  <Text variant="label" style={styles.label}>
                    Height (cm)
                  </Text>
                  <TextInput
                    placeholder="E.g., 170"
                    placeholderTextColor="rgba(255, 255, 255, 0.5)"
                    value={height}
                    onChangeText={handleHeightChange}
                    onBlur={validateAndUpdateProgress}
                    keyboardType="decimal-pad"
                    style={styles.textInput}
                  />
                  {errors.height && (
                    <Text variant="caption" style={styles.errorText}>
                      {errors.height}
                    </Text>
                  )}
                </View>

                {/* Weight Input */}
                <View>
                  <Text variant="label" style={styles.label}>
                    Weight (kg)
                  </Text>
                  <TextInput
                    placeholder="E.g., 70"
                    placeholderTextColor="rgba(255, 255, 255, 0.5)"
                    value={weight}
                    onChangeText={handleWeightChange}
                    onBlur={validateAndUpdateProgress}
                    keyboardType="decimal-pad"
                    style={styles.textInput}
                  />
                  {errors.weight && (
                    <Text variant="caption" style={styles.errorText}>
                      {errors.weight}
                    </Text>
                  )}
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
              title="Next"
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
  textInput: {
    ...theme.typography.body,
    color: theme.colors.brand.white,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: r.adaptiveSpacing.md,
    paddingVertical: r.adaptiveSpacing.sm,
    minHeight: r.scaleHeight(48),
    marginTop: theme.spacing.sm,
  },
  fieldContainer: {
    gap: theme.spacing.sm,
  },
  label: {
    color: theme.colors.brand.white,
    marginLeft: theme.spacing.sm,
  },
  iconSelector: {
    marginTop: theme.spacing.md,
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
