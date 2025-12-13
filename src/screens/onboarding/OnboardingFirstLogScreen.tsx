import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text, Button, Input, Container } from '../../components';
import { theme, haptics } from '../../theme';
import { APP_TEXTS } from '../../constants/appText';

interface OnboardingFirstLogScreenProps {
  onContinue: (data: {
    stool_type: number;
    energy_level: number;
    symptoms: Record<string, boolean>;
    meals: string[];
  }) => Promise<void>;
  onBack: () => void;
}

// Use constants from APP_TEXTS instead of hardcoding
const STOOL_TYPES = APP_TEXTS.stoolTypes;
const SYMPTOMS = APP_TEXTS.symptoms;
const ENERGY_LEVELS = APP_TEXTS.energyLevels;

export default function OnboardingFirstLogScreen({
  onContinue,
  onBack,
}: OnboardingFirstLogScreenProps) {
  const [step, setStep] = useState<'type' | 'energy' | 'symptoms' | 'meals'>(
    'type'
  );
  const [selectedStoolType, setSelectedStoolType] = useState<number | null>(3);
  const [selectedEnergy, setSelectedEnergy] = useState<number>(8);
  const [selectedSymptoms, setSelectedSymptoms] = useState<
    Record<string, boolean>
  >({});
  const [mealInput, setMealInput] = useState('');
  const [meals, setMeals] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const toggleSymptom = (symptom: string) => {
    setSelectedSymptoms((prev) => ({
      ...prev,
      [symptom]: !prev[symptom],
    }));
  };

  const addMeal = () => {
    if (mealInput.trim()) {
      setMeals([...meals, mealInput.trim()]);
      setMealInput('');
    }
  };

  const removeMeal = (index: number) => {
    setMeals(meals.filter((_, i) => i !== index));
  };

  const handleNext = () => {
    haptics.patterns.buttonPress();
    if (step === 'type') setStep('energy');
    else if (step === 'energy') setStep('symptoms');
    else if (step === 'symptoms') setStep('meals');
  };

  const handleBack = () => {
    haptics.patterns.buttonPress();
    if (step === 'type') onBack();
    else if (step === 'energy') setStep('type');
    else if (step === 'symptoms') setStep('energy');
    else setStep('symptoms');
  };

  const handleContinue = async () => {
    setLoading(true);
    try {
      haptics.patterns.success();
      await onContinue({
        stool_type: selectedStoolType || 3,
        energy_level: selectedEnergy,
        symptoms: selectedSymptoms,
        meals,
      });
    } catch (error) {
      alert('Error: ' + (error instanceof Error ? error.message : 'Unknown error'));
      setLoading(false);
    }
  };

  const progress = ['type', 'energy', 'symptoms', 'meals'].indexOf(step) + 1;
  const totalSteps = 4;

  return (
    <View style={styles.container}>
      <Container
        scrollable
        variant="default"
        keyboardAvoiding
        edges={['top', 'left', 'right']}
        padding={false}
      >
        {/* Header with back and progress */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={handleBack}
            disabled={loading}
          >
            <Ionicons
              name="chevron-back"
              size={32}
              color={theme.colors.brand.primary}
            />
          </TouchableOpacity>
          <Text variant="body" color="secondary">
            {progress}/{totalSteps}
          </Text>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressBarContainer}>
          <View
            style={[
              styles.progressBar,
              { width: `${(progress / totalSteps) * 100}%` },
            ]}
          />
        </View>

        {/* Content */}
        {step === 'type' && (
          <View style={styles.section}>
            <Text variant="largeTitle" style={styles.title}>
              {APP_TEXTS.onboardingFirstLog.stoolStep.title}
            </Text>
            <Text variant="body" style={styles.subtitle} color="secondary">
              {APP_TEXTS.onboardingFirstLog.stoolStep.subtitle}
            </Text>

            <View style={styles.stoolTypesGrid}>
              {STOOL_TYPES.map((item) => (
                <TouchableOpacity
                  key={item.type}
                  style={[
                    styles.stoolTypeButton,
                    selectedStoolType === item.type &&
                      styles.stoolTypeButtonSelected,
                  ]}
                  onPress={() => {
                    haptics.patterns.buttonPress();
                    setSelectedStoolType(item.type);
                  }}
                  disabled={loading}
                >
                  <Text variant="headline">{item.type}</Text>
                  <Text variant="caption" color="secondary">
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {step === 'energy' && (
          <View style={styles.section}>
            <Text variant="largeTitle" style={styles.title}>
              {APP_TEXTS.onboardingFirstLog.energyStep.title}
            </Text>
            <Text variant="body" style={styles.subtitle} color="secondary">
              {APP_TEXTS.onboardingFirstLog.energyStep.subtitle}
            </Text>

            <View style={styles.energyGrid}>
              {ENERGY_LEVELS.map((level) => (
                <TouchableOpacity
                  key={level.value}
                  style={[
                    styles.energyButton,
                    selectedEnergy === level.value &&
                      styles.energyButtonSelected,
                  ]}
                  onPress={() => {
                    haptics.patterns.buttonPress();
                    setSelectedEnergy(level.value);
                  }}
                  disabled={loading}
                >
                  <Ionicons
                    name={level.icon as any}
                    size={32}
                    color={
                      selectedEnergy === level.value
                        ? theme.colors.brand.primary
                        : theme.colors.text.secondary
                    }
                  />
                  <Text
                    variant="body"
                    style={{
                      marginTop: theme.spacing.sm,
                      color:
                        selectedEnergy === level.value
                          ? theme.colors.brand.primary
                          : theme.colors.text.secondary,
                    }}
                  >
                    {level.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {step === 'symptoms' && (
          <View style={styles.section}>
            <Text variant="largeTitle" style={styles.title}>
              {APP_TEXTS.onboardingFirstLog.symptomsStep.title}
            </Text>
            <Text variant="body" style={styles.subtitle} color="secondary">
              {APP_TEXTS.onboardingFirstLog.symptomsStep.subtitle}
            </Text>

            <View style={styles.symptomsGrid}>
              {SYMPTOMS.map((symptom) => (
                <TouchableOpacity
                  key={symptom.id}
                  style={[
                    styles.symptomButton,
                    selectedSymptoms[symptom.id] &&
                      styles.symptomButtonSelected,
                  ]}
                  onPress={() => {
                    haptics.patterns.buttonPress();
                    toggleSymptom(symptom.id);
                  }}
                  disabled={loading}
                >
                  {selectedSymptoms[symptom.id] && (
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color={theme.colors.brand.primary}
                      style={{ marginRight: theme.spacing.sm }}
                    />
                  )}
                  <Text
                    variant="body"
                    style={{
                      color: selectedSymptoms[symptom.id]
                        ? theme.colors.brand.primary
                        : theme.colors.text.primary,
                    }}
                  >
                    {symptom.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {step === 'meals' && (
          <View style={styles.section}>
            <Text variant="largeTitle" style={styles.title}>
              {APP_TEXTS.onboardingFirstLog.mealsStep.title}
            </Text>
            <Text variant="body" style={styles.subtitle} color="secondary">
              {APP_TEXTS.onboardingFirstLog.mealsStep.subtitle}
            </Text>

            <View style={styles.mealInputContainer}>
              <Input
                placeholder={APP_TEXTS.onboardingFirstLog.mealsStep.mealPlaceholder}
                value={mealInput}
                onChangeText={setMealInput}
                editable={!loading}
              />
              <Button
                title={APP_TEXTS.onboardingFirstLog.mealsStep.addButton}
                onPress={addMeal}
                variant="secondary"
                size="small"
                disabled={!mealInput.trim() || loading}
                style={{ marginLeft: theme.spacing.sm }}
              />
            </View>

            {meals.length > 0 && (
              <View style={styles.mealsContainer}>
                {meals.map((meal, index) => (
                  <View key={index} style={styles.mealTag}>
                    <Text variant="body">{meal}</Text>
                    <TouchableOpacity
                      onPress={() => removeMeal(index)}
                      disabled={loading}
                    >
                      <Ionicons
                        name="close-circle"
                        size={20}
                        color={theme.colors.brand.primary}
                      />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

      </Container>

      {/* Navigation Buttons - Fixed Footer */}
      <View style={styles.footer}>
        <Button
          title={
            step === 'meals'
              ? loading
                ? APP_TEXTS.onboardingFirstLog.savingButton
                : APP_TEXTS.onboardingFirstLog.completeButton
              : APP_TEXTS.onboardingFirstLog.nextButton
          }
          onPress={step === 'meals' ? handleContinue : handleNext}
          variant="primary"
          size="large"
          fullWidth
          disabled={loading}
        />

        {loading && (
          <ActivityIndicator
            size="large"
            color={theme.colors.brand.primary}
            style={{ marginTop: theme.spacing.lg }}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
    paddingHorizontal: theme.spacing['2xl'],
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: `${theme.colors.text.primary}20`,
    borderRadius: 2,
    marginBottom: theme.spacing['2xl'],
    marginHorizontal: theme.spacing['2xl'],
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: theme.colors.brand.primary,
  },
  section: {
    marginBottom: theme.spacing['4xl'],
    paddingHorizontal: theme.spacing['2xl'],
  },
  title: {
    marginBottom: theme.spacing.md,
    color: theme.colors.text.primary,
  },
  subtitle: {
    marginBottom: theme.spacing['2xl'],
  },
  stoolTypesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
  stoolTypeButton: {
    flex: 1,
    minWidth: '22%',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.spacing.md,
    borderWidth: 2,
    borderColor: `${theme.colors.text.primary}20`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stoolTypeButtonSelected: {
    backgroundColor: `${theme.colors.brand.primary}15`,
    borderColor: theme.colors.brand.primary,
  },
  energyGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  energyButton: {
    flex: 1,
    marginHorizontal: theme.spacing.xs,
    paddingVertical: theme.spacing.lg,
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.spacing.md,
    borderWidth: 2,
    borderColor: `${theme.colors.text.primary}20`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  energyButtonSelected: {
    backgroundColor: `${theme.colors.brand.primary}15`,
    borderColor: theme.colors.brand.primary,
  },
  symptomsGrid: {
    gap: theme.spacing.md,
  },
  symptomButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.spacing.md,
    borderWidth: 2,
    borderColor: `${theme.colors.text.primary}20`,
  },
  symptomButtonSelected: {
    backgroundColor: `${theme.colors.brand.primary}15`,
    borderColor: theme.colors.brand.primary,
  },
  mealInputContainer: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  mealsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  mealTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: `${theme.colors.brand.primary}15`,
    borderRadius: theme.spacing.md,
  },
  footer: {
    paddingHorizontal: theme.spacing['2xl'],
    paddingVertical: theme.spacing.lg,
    paddingBottom: theme.spacing['2xl'],
    backgroundColor: theme.colors.background.primary,
  },
});
