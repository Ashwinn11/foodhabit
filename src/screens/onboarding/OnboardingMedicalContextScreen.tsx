import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Animated,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { GradientBackground } from '../../components/onboarding/GradientBackground';
import { BackButton } from '../../components/onboarding/BackButton';
import { AnimatedRing } from '../../components/onboarding/AnimatedRing';
import { ProgressIndicator } from '../../components/onboarding/ProgressIndicator';
import { IconSelector } from '../../components/onboarding/IconSelector';
import { Button, Text } from '../../components';
import { theme, haptics } from '../../theme';
import { OnboardingData } from '../../types/profile';

interface OnboardingMedicalContextScreenProps {
  onNext: () => void;
  data: Partial<OnboardingData>;
  updateData: (data: Partial<OnboardingData>) => void;
  ringProgress: number;
  setRingProgress: (progress: number) => void;
}

/**
 * Onboarding Medical Context Screen
 * Sixth screen - Collect medical history and eating patterns
 *
 * Psychology:
 * - Empathetic framing for sensitive questions
 * - Optional selections (user can skip conditions/allergies)
 * - Privacy-conscious messaging
 *
 * Animation:
 * - Ring progresses 75% → 85%
 * - Haptic feedback on selections
 */
export default function OnboardingMedicalContextScreen({
  onNext,
  data,
  updateData,
  ringProgress,
  setRingProgress,
}: OnboardingMedicalContextScreenProps) {
  const navigation = useNavigation();

  const [diagnosedConditions, setDiagnosedConditions] = useState<string[]>(
    data.diagnosed_conditions ?? []
  );
  const [foodAllergies, setFoodAllergies] = useState<string[]>(
    data.food_allergies ?? []
  );
  const [restrictsFoodSeverely, setRestrictsFoodSeverely] = useState<boolean>(
    data.restricts_food_severely ?? false
  );
  const [bingesRegularly, setBingesRegularly] = useState<boolean>(
    data.binges_regularly ?? false
  );

  const ringValue = useRef(new Animated.Value(ringProgress)).current;

  const conditionOptions = [
    { id: 'ibs', label: 'IBS' },
    { id: 'gerd', label: 'GERD' },
    { id: 'celiac', label: 'Celiac' },
    { id: 'crohns', label: "Crohn's" },
    { id: 'colitis', label: 'Colitis' },
    { id: 'diabetes', label: 'Diabetes' },
    { id: 'none', label: 'None' },
  ];

  const allergyOptions = [
    { id: 'dairy', label: 'Dairy' },
    { id: 'gluten', label: 'Gluten' },
    { id: 'nuts', label: 'Nuts' },
    { id: 'shellfish', label: 'Shellfish' },
    { id: 'soy', label: 'Soy' },
    { id: 'eggs', label: 'Eggs' },
    { id: 'none', label: 'None' },
  ];

  const yesNoOptions = [
    { id: 'yes', label: 'Yes', icon: 'checkmark' as const },
    { id: 'no', label: 'No', icon: 'close' as const },
  ];

  // Update ring progress based on filled fields
  const updateRingProgressOnly = () => {
    let filledFields = 0;
    const totalFields = 4;

    filledFields++; // diagnosed_conditions (default [])
    filledFields++; // food_allergies (default [])
    filledFields++; // restricts_food_severely (default false)
    filledFields++; // binges_regularly (default false)

    // Update ring: 75% → 85% (10% range)
    const progress = 75 + (filledFields / totalFields) * 10;
    Animated.timing(ringValue, {
      toValue: progress,
      duration: 300,
      useNativeDriver: false,
    }).start();
    setRingProgress(progress);
  };

  const toggleCondition = (conditionId: string) => {
    setDiagnosedConditions(prev => {
      let updated: string[];
      if (conditionId === 'none') {
        // Clear all if "None" is selected
        updated = prev.includes('none') ? [] : ['none'];
      } else {
        // Remove "none" if selecting a specific condition
        const withoutNone = prev.filter(id => id !== 'none');
        if (withoutNone.includes(conditionId)) {
          updated = withoutNone.filter(id => id !== conditionId);
        } else {
          updated = [...withoutNone, conditionId];
        }
      }
      haptics.light();
      updateRingProgressOnly();
      return updated;
    });
  };

  const toggleAllergy = (allergyId: string) => {
    setFoodAllergies(prev => {
      let updated: string[];
      if (allergyId === 'none') {
        // Clear all if "None" is selected
        updated = prev.includes('none') ? [] : ['none'];
      } else {
        // Remove "none" if selecting a specific allergy
        const withoutNone = prev.filter(id => id !== 'none');
        if (withoutNone.includes(allergyId)) {
          updated = withoutNone.filter(id => id !== allergyId);
        } else {
          updated = [...withoutNone, allergyId];
        }
      }
      haptics.light();
      updateRingProgressOnly();
      return updated;
    });
  };

  const handleRestrictsFoodSelect = (selected: string) => {
    setRestrictsFoodSeverely(selected === 'yes');
    haptics.light();
    updateRingProgressOnly();
  };

  const handleBingesSelect = (selected: string) => {
    setBingesRegularly(selected === 'yes');
    haptics.light();
    updateRingProgressOnly();
  };

  const handleNext = () => {
    // Filter out 'none' before saving
    const finalConditions = diagnosedConditions.filter(c => c !== 'none');
    const finalAllergies = foodAllergies.filter(a => a !== 'none');

    updateData({
      diagnosed_conditions: finalConditions,
      food_allergies: finalAllergies,
      restricts_food_severely: restrictsFoodSeverely,
      binges_regularly: bingesRegularly,
    });
    haptics.medium();
    onNext();
  };

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
              <ProgressIndicator currentStep={4} totalSteps={5} />

              <View style={styles.titleContainer}>
                <Text variant="h2" align="center" style={styles.title}>
                  A few more things
                </Text>
                <Text variant="body" align="center" style={styles.subtitle}>
                  Help us personalize your experience safely
                </Text>
              </View>

              <View style={styles.formContainer}>
                {/* Diagnosed Conditions */}
                <View style={styles.sectionContainer}>
                  <Text variant="h5" style={styles.sectionTitle}>
                    Diagnosed Conditions
                  </Text>
                  <Text variant="caption" style={styles.sectionSubtitle}>
                    Select all that apply
                  </Text>

                  <View style={styles.checkboxGrid}>
                    {conditionOptions.map(option => (
                      <TouchableOpacity
                        key={option.id}
                        style={[
                          styles.checkboxItem,
                          diagnosedConditions.includes(option.id) && styles.checkboxItemSelected,
                        ]}
                        onPress={() => toggleCondition(option.id)}
                      >
                        <View style={styles.checkboxContent}>
                          <Ionicons
                            name={diagnosedConditions.includes(option.id) ? 'checkmark-circle' : 'ellipse-outline'}
                            size={24}
                            color={diagnosedConditions.includes(option.id) ? theme.colors.brand.primary : theme.colors.brand.white}
                          />
                          <Text
                            variant="body"
                            style={diagnosedConditions.includes(option.id) ? styles.checkboxLabelSelected : styles.checkboxLabel}
                          >
                            {option.label}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Food Allergies */}
                <View style={styles.sectionContainer}>
                  <Text variant="h5" style={styles.sectionTitle}>
                    Food Allergies & Intolerances
                  </Text>
                  <Text variant="caption" style={styles.sectionSubtitle}>
                    Select all that apply
                  </Text>

                  <View style={styles.checkboxGrid}>
                    {allergyOptions.map(option => (
                      <TouchableOpacity
                        key={option.id}
                        style={[
                          styles.checkboxItem,
                          foodAllergies.includes(option.id) && styles.checkboxItemSelected,
                        ]}
                        onPress={() => toggleAllergy(option.id)}
                      >
                        <View style={styles.checkboxContent}>
                          <Ionicons
                            name={foodAllergies.includes(option.id) ? 'checkmark-circle' : 'ellipse-outline'}
                            size={24}
                            color={foodAllergies.includes(option.id) ? theme.colors.brand.primary : theme.colors.brand.white}
                          />
                          <Text
                            variant="body"
                            style={foodAllergies.includes(option.id) ? styles.checkboxLabelSelected : styles.checkboxLabel}
                          >
                            {option.label}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Eating Patterns (Sensitive) */}
                <View style={styles.sectionContainer}>
                  <Text variant="h5" style={styles.sectionTitle}>
                    Eating Patterns
                  </Text>
                  <Text variant="caption" style={styles.sectionSubtitle}>
                    Your privacy is important to us
                  </Text>

                  <View style={styles.fieldContainer}>
                    <Text variant="label" style={styles.label}>
                      Do you severely restrict food intake?
                    </Text>
                    <IconSelector
                      options={yesNoOptions}
                      selected={restrictsFoodSeverely ? 'yes' : 'no'}
                      onSelect={handleRestrictsFoodSelect}
                      layout="row"
                      containerStyle={styles.iconSelector}
                    />
                  </View>

                  <View style={styles.fieldContainer}>
                    <Text variant="label" style={styles.label}>
                      Do you regularly binge eat?
                    </Text>
                    <IconSelector
                      options={yesNoOptions}
                      selected={bingesRegularly ? 'yes' : 'no'}
                      onSelect={handleBingesSelect}
                      layout="row"
                      containerStyle={styles.iconSelector}
                    />
                  </View>

                  <View style={styles.disclaimerContainer}>
                    <Ionicons name="shield-checkmark" size={20} color={theme.colors.brand.white} />
                    <Text variant="caption" style={styles.disclaimerText}>
                      This information helps us provide safer recommendations. It's kept confidential.
                    </Text>
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
  sectionSubtitle: {
    color: theme.colors.brand.white,
    marginTop: -theme.spacing.sm,
  },
  checkboxGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
  checkboxItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: theme.borderRadius.md,
    borderWidth: 2,
    borderColor: 'transparent',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    minWidth: '45%',
  },
  checkboxItemSelected: {
    backgroundColor: 'rgba(255, 118, 100, 0.2)',
    borderColor: theme.colors.brand.primary,
  },
  checkboxContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  checkboxLabel: {
    color: theme.colors.brand.white,
  },
  checkboxLabelSelected: {
    color: theme.colors.brand.white,
    fontWeight: '600',
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
  disclaimerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
  disclaimerText: {
    color: theme.colors.brand.white,
    flex: 1,
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
