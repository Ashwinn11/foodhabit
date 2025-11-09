import React, { useState, useRef } from 'react';
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

interface OnboardingSymptomBaselineScreenProps {
  onNext: () => void;
  data: Partial<OnboardingData>;
  updateData: (data: Partial<OnboardingData>) => void;
  ringProgress: number;
  setRingProgress: (progress: number) => void;
}

/**
 * Onboarding Symptom Baseline Screen
 * Fifth screen - Collect digestive symptom baselines
 *
 * Psychology:
 * - Empathetic framing ("Help us understand your baseline")
 * - Progressive disclosure (grouped by symptom type)
 * - Optional skip for asymptomatic users
 *
 * Animation:
 * - Ring progresses 65% → 75%
 * - Haptic feedback on selections
 */
export default function OnboardingSymptomBaselineScreen({
  onNext,
  data,
  updateData,
  ringProgress,
  setRingProgress,
}: OnboardingSymptomBaselineScreenProps) {
  const navigation = useNavigation();

  // Bloating
  const [bloatingSeverity, setBloatingSeverity] = useState(
    data.bloating_severity?.toString() ?? '0'
  );
  const [bloatingFrequency, setBloatingFrequency] = useState<string | null>(
    data.bloating_frequency ?? null
  );

  // Pain
  const [abdominalPainSeverity, setAbdominalPainSeverity] = useState(
    data.abdominal_pain_severity?.toString() ?? '0'
  );

  // Bowel Movements
  const [bowelMovementFrequency, setBowelMovementFrequency] = useState(
    data.bowel_movement_frequency?.toString() ?? '1'
  );
  const [bowelMovementQuality, setBowelMovementQuality] = useState<number | null>(
    data.bowel_movement_quality ?? null
  );
  const [hasConstipation, setHasConstipation] = useState<boolean>(
    data.has_constipation ?? false
  );
  const [hasDiarrhea, setHasDiarrhea] = useState<boolean>(
    data.has_diarrhea ?? false
  );

  // Other Symptoms
  const [gasSeverity, setGasSeverity] = useState(
    data.gas_severity?.toString() ?? '0'
  );
  const [energyLevel, setEnergyLevel] = useState(
    data.baseline_energy_level?.toString() ?? '5'
  );
  const [moodQuality, setMoodQuality] = useState(
    data.baseline_mood_quality?.toString() ?? '5'
  );
  const [hasBrainFog, setHasBrainFog] = useState<boolean>(
    data.has_brain_fog ?? false
  );
  const [digestiveImpact, setDigestiveImpact] = useState(
    data.digestive_impact_on_life?.toString() ?? '0'
  );

  const [errors, setErrors] = useState<Record<string, string>>({});
  const ringValue = useRef(new Animated.Value(ringProgress)).current;

  const frequencyOptions = [
    { id: 'never', label: 'Never', icon: 'checkmark-circle' as const },
    { id: 'rarely', label: 'Rarely', icon: 'remove-circle' as const },
    { id: 'sometimes', label: 'Sometimes', icon: 'time' as const },
    { id: 'often', label: 'Often', icon: 'alert-circle' as const },
    { id: 'daily', label: 'Daily', icon: 'warning' as const },
  ];

  const bristolScaleOptions = [
    { id: '1', label: 'Type 1', icon: 'ellipse' as const },
    { id: '2', label: 'Type 2', icon: 'ellipse' as const },
    { id: '3', label: 'Type 3', icon: 'ellipse' as const },
    { id: '4', label: 'Type 4', icon: 'ellipse' as const },
    { id: '5', label: 'Type 5', icon: 'ellipse' as const },
    { id: '6', label: 'Type 6', icon: 'ellipse' as const },
    { id: '7', label: 'Type 7', icon: 'ellipse' as const },
  ];

  const yesNoOptions = [
    { id: 'yes', label: 'Yes', icon: 'checkmark' as const },
    { id: 'no', label: 'No', icon: 'close' as const },
  ];

  // Validate numeric input (0-10 scale)
  const validateSeverity = (value: string, fieldName: string): boolean => {
    const num = parseFloat(value);
    if (isNaN(num) || num < 0 || num > 10) {
      setErrors(prev => ({ ...prev, [fieldName]: 'Must be 0-10' }));
      return false;
    }
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
    return true;
  };

  // Validate bowel movement frequency
  const validateBowelFrequency = (value: string): boolean => {
    const num = parseFloat(value);
    if (isNaN(num) || num < 0 || num > 20) {
      setErrors(prev => ({ ...prev, bowelMovementFrequency: 'Must be 0-20' }));
      return false;
    }
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.bowelMovementFrequency;
      return newErrors;
    });
    return true;
  };

  // Update ring progress based on filled fields
  const updateRingProgressOnly = () => {
    let filledFields = 0;
    const totalFields = 12;

    if (bloatingSeverity) filledFields++;
    if (bloatingFrequency) filledFields++;
    if (abdominalPainSeverity) filledFields++;
    if (bowelMovementFrequency) filledFields++;
    if (bowelMovementQuality) filledFields++;
    filledFields++; // has_constipation (default false)
    filledFields++; // has_diarrhea (default false)
    if (gasSeverity) filledFields++;
    if (energyLevel) filledFields++;
    if (moodQuality) filledFields++;
    filledFields++; // has_brain_fog (default false)
    if (digestiveImpact) filledFields++;

    // Update ring: 65% → 75% (10% range)
    const progress = 65 + (filledFields / totalFields) * 10;
    Animated.timing(ringValue, {
      toValue: progress,
      duration: 300,
      useNativeDriver: false,
    }).start();
    setRingProgress(progress);
  };

  // Handle numeric input with validation
  const handleNumericChange = (
    value: string,
    setter: (val: string) => void,
    max: number = 10
  ) => {
    const filtered = value.replace(/[^0-9.]/g, '');
    const parts = filtered.split('.');
    const limited = parts.length > 2
      ? parts[0] + '.' + parts.slice(1).join('')
      : filtered;
    const maxDigits = max >= 10 ? 4 : 3;
    const final = limited.slice(0, maxDigits);
    setter(final);
    if (value !== final) {
      haptics.light();
    }
    updateRingProgressOnly();
  };

  const handleBloatingFrequencySelect = (selected: string) => {
    setBloatingFrequency(selected);
    haptics.light();
    updateRingProgressOnly();
  };

  const handleBristolScaleSelect = (selected: string) => {
    setBowelMovementQuality(parseInt(selected, 10) as 1 | 2 | 3 | 4 | 5 | 6 | 7);
    haptics.light();
    updateRingProgressOnly();
  };

  const handleConstipationSelect = (selected: string) => {
    setHasConstipation(selected === 'yes');
    haptics.light();
    updateRingProgressOnly();
  };

  const handleDiarrheaSelect = (selected: string) => {
    setHasDiarrhea(selected === 'yes');
    haptics.light();
    updateRingProgressOnly();
  };

  const handleBrainFogSelect = (selected: string) => {
    setHasBrainFog(selected === 'yes');
    haptics.light();
    updateRingProgressOnly();
  };

  const handleNext = () => {
    // Validate all fields
    let isValid = true;
    isValid = validateSeverity(bloatingSeverity, 'bloatingSeverity') && isValid;
    isValid = validateSeverity(abdominalPainSeverity, 'abdominalPainSeverity') && isValid;
    isValid = validateBowelFrequency(bowelMovementFrequency) && isValid;
    isValid = validateSeverity(gasSeverity, 'gasSeverity') && isValid;
    isValid = validateSeverity(energyLevel, 'energyLevel') && isValid;
    isValid = validateSeverity(moodQuality, 'moodQuality') && isValid;
    isValid = validateSeverity(digestiveImpact, 'digestiveImpact') && isValid;

    if (!bloatingFrequency || !bowelMovementQuality) {
      isValid = false;
      haptics.light();
    }

    if (isValid && Object.keys(errors).length === 0) {
      updateData({
        bloating_severity: parseFloat(bloatingSeverity),
        bloating_frequency: bloatingFrequency as 'never' | 'rarely' | 'sometimes' | 'often' | 'daily',
        abdominal_pain_severity: parseFloat(abdominalPainSeverity),
        bowel_movement_frequency: parseFloat(bowelMovementFrequency),
        bowel_movement_quality: bowelMovementQuality as 1 | 2 | 3 | 4 | 5 | 6 | 7,
        has_constipation: hasConstipation,
        has_diarrhea: hasDiarrhea,
        gas_severity: parseFloat(gasSeverity),
        baseline_energy_level: parseFloat(energyLevel),
        baseline_mood_quality: parseFloat(moodQuality),
        has_brain_fog: hasBrainFog,
        digestive_impact_on_life: parseFloat(digestiveImpact),
      });
      haptics.medium();
      onNext();
    } else {
      haptics.light();
    }
  };

  const isFormValid =
    bloatingFrequency &&
    bowelMovementQuality &&
    Object.keys(errors).length === 0;

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <BackButton onPress={() => navigation.goBack()} />

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
              <ProgressIndicator currentStep={3} totalSteps={5} />

              <View style={styles.titleContainer}>
                <Text variant="h2" align="center" style={styles.title}>
                  Let's understand your baseline
                </Text>
                <Text variant="body" align="center" style={styles.subtitle}>
                  This helps us track improvements over time
                </Text>
              </View>

              <View style={styles.formContainer}>
                {/* Bloating */}
                <View style={styles.sectionContainer}>
                  <Text variant="h5" style={styles.sectionTitle}>
                    Bloating
                  </Text>

                  <View style={styles.fieldContainer}>
                    <Text variant="label" style={styles.label}>
                      How often do you experience bloating?
                    </Text>
                    <IconSelector
                      options={frequencyOptions}
                      selected={bloatingFrequency}
                      onSelect={handleBloatingFrequencySelect}
                      layout="column"
                      containerStyle={styles.iconSelector}
                    />
                  </View>

                  <View style={styles.fieldContainer}>
                    <Text variant="label" style={styles.label}>
                      Severity (0 = none, 10 = severe)
                    </Text>
                    <Input
                      placeholder="0"
                      value={bloatingSeverity}
                      onChangeText={(val) => handleNumericChange(val, setBloatingSeverity)}
                      onBlur={() => validateSeverity(bloatingSeverity, 'bloatingSeverity')}
                      keyboardType="decimal-pad"
                    />
                    {errors.bloatingSeverity && (
                      <Text variant="caption" style={styles.errorText}>
                        {errors.bloatingSeverity}
                      </Text>
                    )}
                  </View>
                </View>

                {/* Abdominal Pain */}
                <View style={styles.sectionContainer}>
                  <Text variant="h5" style={styles.sectionTitle}>
                    Abdominal Pain
                  </Text>

                  <View style={styles.fieldContainer}>
                    <Text variant="label" style={styles.label}>
                      Severity (0 = none, 10 = severe)
                    </Text>
                    <Input
                      placeholder="0"
                      value={abdominalPainSeverity}
                      onChangeText={(val) => handleNumericChange(val, setAbdominalPainSeverity)}
                      onBlur={() => validateSeverity(abdominalPainSeverity, 'abdominalPainSeverity')}
                      keyboardType="decimal-pad"
                    />
                    {errors.abdominalPainSeverity && (
                      <Text variant="caption" style={styles.errorText}>
                        {errors.abdominalPainSeverity}
                      </Text>
                    )}
                  </View>
                </View>

                {/* Bowel Movements */}
                <View style={styles.sectionContainer}>
                  <Text variant="h5" style={styles.sectionTitle}>
                    Bowel Movements
                  </Text>

                  <View style={styles.fieldContainer}>
                    <Text variant="label" style={styles.label}>
                      Frequency (times per day)
                    </Text>
                    <Input
                      placeholder="1"
                      value={bowelMovementFrequency}
                      onChangeText={(val) => handleNumericChange(val, setBowelMovementFrequency, 20)}
                      onBlur={() => validateBowelFrequency(bowelMovementFrequency)}
                      keyboardType="decimal-pad"
                    />
                    {errors.bowelMovementFrequency && (
                      <Text variant="caption" style={styles.errorText}>
                        {errors.bowelMovementFrequency}
                      </Text>
                    )}
                  </View>

                  <View style={styles.fieldContainer}>
                    <Text variant="label" style={styles.label}>
                      Bristol Stool Scale (1-7)
                    </Text>
                    <IconSelector
                      options={bristolScaleOptions}
                      selected={bowelMovementQuality?.toString() ?? null}
                      onSelect={handleBristolScaleSelect}
                      layout="row"
                      containerStyle={styles.iconSelector}
                    />
                  </View>

                  <View style={styles.fieldContainer}>
                    <Text variant="label" style={styles.label}>
                      Do you experience constipation?
                    </Text>
                    <IconSelector
                      options={yesNoOptions}
                      selected={hasConstipation ? 'yes' : 'no'}
                      onSelect={handleConstipationSelect}
                      layout="row"
                      containerStyle={styles.iconSelector}
                    />
                  </View>

                  <View style={styles.fieldContainer}>
                    <Text variant="label" style={styles.label}>
                      Do you experience diarrhea?
                    </Text>
                    <IconSelector
                      options={yesNoOptions}
                      selected={hasDiarrhea ? 'yes' : 'no'}
                      onSelect={handleDiarrheaSelect}
                      layout="row"
                      containerStyle={styles.iconSelector}
                    />
                  </View>
                </View>

                {/* Other Symptoms */}
                <View style={styles.sectionContainer}>
                  <Text variant="h5" style={styles.sectionTitle}>
                    Other Symptoms
                  </Text>

                  <View style={styles.fieldContainer}>
                    <Text variant="label" style={styles.label}>
                      Gas Severity (0-10)
                    </Text>
                    <Input
                      placeholder="0"
                      value={gasSeverity}
                      onChangeText={(val) => handleNumericChange(val, setGasSeverity)}
                      onBlur={() => validateSeverity(gasSeverity, 'gasSeverity')}
                      keyboardType="decimal-pad"
                    />
                    {errors.gasSeverity && (
                      <Text variant="caption" style={styles.errorText}>
                        {errors.gasSeverity}
                      </Text>
                    )}
                  </View>

                  <View style={styles.fieldContainer}>
                    <Text variant="label" style={styles.label}>
                      Energy Level (0 = exhausted, 10 = energized)
                    </Text>
                    <Input
                      placeholder="5"
                      value={energyLevel}
                      onChangeText={(val) => handleNumericChange(val, setEnergyLevel)}
                      onBlur={() => validateSeverity(energyLevel, 'energyLevel')}
                      keyboardType="decimal-pad"
                    />
                    {errors.energyLevel && (
                      <Text variant="caption" style={styles.errorText}>
                        {errors.energyLevel}
                      </Text>
                    )}
                  </View>

                  <View style={styles.fieldContainer}>
                    <Text variant="label" style={styles.label}>
                      Mood Quality (0 = poor, 10 = excellent)
                    </Text>
                    <Input
                      placeholder="5"
                      value={moodQuality}
                      onChangeText={(val) => handleNumericChange(val, setMoodQuality)}
                      onBlur={() => validateSeverity(moodQuality, 'moodQuality')}
                      keyboardType="decimal-pad"
                    />
                    {errors.moodQuality && (
                      <Text variant="caption" style={styles.errorText}>
                        {errors.moodQuality}
                      </Text>
                    )}
                  </View>

                  <View style={styles.fieldContainer}>
                    <Text variant="label" style={styles.label}>
                      Do you experience brain fog?
                    </Text>
                    <IconSelector
                      options={yesNoOptions}
                      selected={hasBrainFog ? 'yes' : 'no'}
                      onSelect={handleBrainFogSelect}
                      layout="row"
                      containerStyle={styles.iconSelector}
                    />
                  </View>

                  <View style={styles.fieldContainer}>
                    <Text variant="label" style={styles.label}>
                      Impact on Daily Life (0 = none, 10 = severe)
                    </Text>
                    <Input
                      placeholder="0"
                      value={digestiveImpact}
                      onChangeText={(val) => handleNumericChange(val, setDigestiveImpact)}
                      onBlur={() => validateSeverity(digestiveImpact, 'digestiveImpact')}
                      keyboardType="decimal-pad"
                    />
                    {errors.digestiveImpact && (
                      <Text variant="caption" style={styles.errorText}>
                        {errors.digestiveImpact}
                      </Text>
                    )}
                  </View>
                </View>
              </View>

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
    gap: theme.spacing['2xl'],
    marginBottom: theme.spacing['2xl'],
  },
  sectionContainer: {
    gap: theme.spacing.lg,
  },
  sectionTitle: {
    color: theme.colors.brand.white,
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
