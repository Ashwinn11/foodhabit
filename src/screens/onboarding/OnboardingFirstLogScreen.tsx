import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text, Button, Input, Container, AnimatedSelectionCard } from '../../components';
import LifestyleTracker from '../../components/LifestyleTracker';
import { theme, haptics } from '../../theme';
import { APP_TEXTS } from '../../constants/appText';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface OnboardingFirstLogScreenProps {
  onContinue: (data: {
    stool_type: number;
    energy_level: number;
    symptoms: Record<string, boolean>;
    meals: string[];
    main_issue: string;
    // Lifestyle data
    stress_level: number;
    sleep_quality: number;
    sleep_hours: number;
    water_intake: number;
    exercise_minutes: number;
    exercise_type?: string;
    medications?: string[];
  }) => Promise<void>;
  onBack: () => void;
}

const STOOL_TYPES = APP_TEXTS.stoolTypes;
const SYMPTOMS = APP_TEXTS.symptoms;
const ENERGY_LEVELS = APP_TEXTS.energyLevels;
const MAIN_ISSUES = APP_TEXTS.mainIssues;

export default function OnboardingFirstLogScreen({
  onContinue,
  onBack,
}: OnboardingFirstLogScreenProps) {
  const [step, setStep] = useState<'type' | 'energy' | 'symptoms' | 'meals'>('type');
  const [selectedStoolType, setSelectedStoolType] = useState<number | null>(3);
  const [selectedEnergy, setSelectedEnergy] = useState<number>(8);
  const [selectedIssue, setSelectedIssue] = useState<string | null>(null);
  const [selectedSymptoms, setSelectedSymptoms] = useState<Record<string, boolean>>({});
  const [mealInput, setMealInput] = useState('');
  const [meals, setMeals] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Lifestyle tracking state
  const [stressLevel, setStressLevel] = useState(5);
  const [sleepQuality, setSleepQuality] = useState(7);
  const [sleepHours, setSleepHours] = useState(7.5);
  const [waterIntake, setWaterIntake] = useState(2000);
  const [exerciseMinutes, setExerciseMinutes] = useState(0);
  const [exerciseType, setExerciseType] = useState<string>('');
  const [medications, setMedications] = useState<string[]>([]);

  useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, [step]);

  const toggleSymptom = (symptom: string) => {
    haptics.selection();
    setSelectedSymptoms((prev) => ({
      ...prev,
      [symptom]: !prev[symptom],
    }));
  };

  const addMeal = () => {
    if (mealInput.trim()) {
      LayoutAnimation.configureNext(theme.animations.layoutAnimations.spring);
      setMeals([...meals, mealInput.trim()]);
      setMealInput('');
      haptics.selection();
    }
  };

  const removeMeal = (index: number) => {
    LayoutAnimation.configureNext(theme.animations.layoutAnimations.spring);
    setMeals(meals.filter((_, i) => i !== index));
    haptics.selection();
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
    if (!selectedIssue) {
      alert('Please select your main concern');
      return;
    }

    setLoading(true);
    try {
      haptics.patterns.success();
      await onContinue({
        stool_type: selectedStoolType || 3,
        energy_level: selectedEnergy,
        symptoms: selectedSymptoms,
        meals,
        main_issue: selectedIssue,
        // Lifestyle data
        stress_level: stressLevel,
        sleep_quality: sleepQuality,
        sleep_hours: sleepHours,
        water_intake: waterIntake,
        exercise_minutes: exerciseMinutes,
        exercise_type: exerciseType,
        medications: medications.length > 0 ? medications : undefined,
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
        variant="plain"
        keyboardAvoiding
        edges={['top', 'left', 'right']}
        padding={false}
      >
        {/* Header with back and progress */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={handleBack}
            disabled={loading}
            style={styles.backButton}
          >
            <Ionicons
              name="arrow-back"
              size={24}
              color={theme.colors.text.primary}
            />
          </TouchableOpacity>
          <Text variant="callout" style={styles.progressText}>
            Step {progress} of {totalSteps}
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
            <Text variant="title1" style={styles.title}>
              {APP_TEXTS.onboardingFirstLog.stoolStep.title}
            </Text>
            <Text variant="body" style={styles.subtitle} color="secondary">
              {APP_TEXTS.onboardingFirstLog.stoolStep.subtitle}
            </Text>

            <View style={styles.gridContainer}>
              {STOOL_TYPES.map((item) => (
                <View key={item.type} style={styles.gridItemHalf}>
                  <AnimatedSelectionCard
                    selected={selectedStoolType === item.type}
                    onPress={() => {
                        setSelectedStoolType(item.type);
                        haptics.selection();
                    }}
                    disabled={loading}
                    isCreamBg={selectedStoolType === item.type}
                    style={[
                      styles.cardContentVertical,
                      selectedStoolType === item.type && styles.selectedCardBackground,
                    ]}
                  >
                    <Text variant="title2" style={{ color: selectedStoolType === item.type ? theme.colors.brand.black : theme.colors.text.primary, marginBottom: 4 }}>
                      {item.type}
                    </Text>
                    <Text variant="caption1" style={{ color: selectedStoolType === item.type ? theme.colors.brand.black : theme.colors.text.secondary }} align="center">
                      {item.label}
                    </Text>
                  </AnimatedSelectionCard>
                </View>
              ))}
            </View>
          </View>
        )}

        {step === 'energy' && (
          <View style={styles.section}>
            <Text variant="title1" style={styles.title}>
              {APP_TEXTS.onboardingFirstLog.energyStep.title}
            </Text>
            <Text variant="body" style={styles.subtitle} color="secondary">
              {APP_TEXTS.onboardingFirstLog.energyStep.subtitle}
            </Text>

            <View style={styles.gridContainer}>
              {ENERGY_LEVELS.map((level) => (
                <View key={level.value} style={styles.gridItemHalf}>
                  <AnimatedSelectionCard
                    selected={selectedEnergy === level.value}
                    onPress={() => {
                        setSelectedEnergy(level.value);
                        haptics.selection();
                    }}
                    disabled={loading}
                    isCreamBg={selectedEnergy === level.value}
                    style={[
                      styles.cardContentVertical,
                      selectedEnergy === level.value && styles.selectedCardBackground,
                    ]}
                  >
                    <Ionicons
                        name={level.icon as any}
                        size={32}
                        color={selectedEnergy === level.value ? theme.colors.brand.black : theme.colors.text.secondary}
                        style={{ marginBottom: 8 }}
                    />
                    <Text variant="body" style={{ color: selectedEnergy === level.value ? theme.colors.brand.black : theme.colors.text.secondary }}>
                      {level.label}
                    </Text>
                  </AnimatedSelectionCard>
                </View>
              ))}
            </View>

            {/* Main Issue Selection */}
            <View style={{ marginTop: theme.spacing['2xl'] }}>
              <Text variant="headline" style={{ color: theme.colors.text.primary, marginBottom: theme.spacing.md }}>
                {APP_TEXTS.onboardingProfile.issueLabel}
              </Text>
              <View style={styles.gridContainer}>
                {MAIN_ISSUES.map((issue) => (
                  <View key={issue.id} style={styles.gridItemHalf}>
                    <AnimatedSelectionCard
                      selected={selectedIssue === issue.id}
                      onPress={() => {
                        setSelectedIssue(issue.id);
                        haptics.selection();
                      }}
                      disabled={loading}
                      isCreamBg={selectedIssue === issue.id}
                      style={[
                        styles.cardContentVertical,
                        selectedIssue === issue.id && styles.selectedCardBackground,
                      ]}
                    >
                      <Text
                        variant="body"
                        style={{
                          color:
                            selectedIssue === issue.id
                              ? theme.colors.brand.black
                              : theme.colors.text.primary,
                          textAlign: 'center',
                        }}
                      >
                        {issue.label}
                      </Text>
                    </AnimatedSelectionCard>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}

        {step === 'symptoms' && (
          <View style={styles.section}>
            <Text variant="title1" style={styles.title}>
              {APP_TEXTS.onboardingFirstLog.symptomsStep.title}
            </Text>
            <Text variant="body" style={styles.subtitle} color="secondary">
              {APP_TEXTS.onboardingFirstLog.symptomsStep.subtitle}
            </Text>

            <View style={styles.listContainer}>
              {SYMPTOMS.map((symptom) => (
                <AnimatedSelectionCard
                  key={symptom.id}
                  selected={!!selectedSymptoms[symptom.id]}
                  onPress={() => toggleSymptom(symptom.id)}
                  disabled={loading}
                  isCreamBg={!!selectedSymptoms[symptom.id]}
                  containerStyle={{ marginBottom: theme.spacing.md }}
                  style={[
                    styles.cardContentHorizontal,
                    selectedSymptoms[symptom.id] && styles.selectedCardBackground,
                  ]}
                >
                  <Text variant="body" style={{ flex: 1, color: selectedSymptoms[symptom.id] ? theme.colors.brand.black : theme.colors.text.primary }}>
                    {symptom.label}
                  </Text>
                  {selectedSymptoms[symptom.id] && (
                    <Ionicons
                      name="checkmark-circle"
                      size={24}
                      color={theme.colors.brand.black}
                    />
                  )}
                </AnimatedSelectionCard>
              ))}
            </View>
          </View>
        )}

        {step === 'meals' && (
          <View style={styles.section}>
            <Text variant="title1" style={styles.title}>
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
                containerStyle={{ flex: 1 }}
              />
              <Button
                title="Add"
                onPress={addMeal}
                variant="secondary"
                size="medium"
                disabled={!mealInput.trim() || loading}
                style={{ marginLeft: theme.spacing.sm, height: 56 }}
              />
            </View>

            <View style={styles.mealsContainer}>
                {meals.map((meal, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.mealTag}
                    onPress={() => removeMeal(index)}
                    disabled={loading}
                  >
                    <Text variant="body" style={{ color: theme.colors.text.primary, marginRight: 6 }}>{meal}</Text>
                    <Ionicons
                      name="close-circle"
                      size={18}
                      color={theme.colors.brand.primary}
                    />
                  </TouchableOpacity>
                ))}
            </View>
            
            {/* Lifestyle Tracking */}
            <LifestyleTracker
              stressLevel={stressLevel}
              onStressChange={setStressLevel}
              sleepQuality={sleepQuality}
              onSleepQualityChange={setSleepQuality}
              sleepHours={sleepHours}
              onSleepHoursChange={setSleepHours}
              waterIntake={waterIntake}
              onWaterIntakeChange={setWaterIntake}
              exerciseMinutes={exerciseMinutes}
              onExerciseMinutesChange={setExerciseMinutes}
              exerciseType={exerciseType}
              onExerciseTypeChange={setExerciseType}
              medications={medications}
              onMedicationsChange={setMedications}
            />
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
    marginBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing['2xl'],
    marginTop: theme.spacing.lg,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.background.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressText: {
    color: theme.colors.text.secondary,
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: theme.colors.background.card,
    borderRadius: 3,
    marginBottom: theme.spacing['2xl'],
    marginHorizontal: theme.spacing['2xl'],
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: theme.colors.brand.primary,
    borderRadius: 3,
  },
  section: {
    marginBottom: theme.spacing['4xl'],
    paddingHorizontal: theme.spacing['2xl'],
    width: '100%',
  },
  title: {
    marginBottom: theme.spacing.sm,
    color: theme.colors.text.primary,
  },
  subtitle: {
    marginBottom: theme.spacing['2xl'],
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
    alignContent: 'flex-start',
  },
  gridItemHalf: {
    width: '47%',
    minHeight: 70,
    maxHeight: 100,
  },
  listContainer: {
    flexDirection: 'column',
    width: '100%',
  },
  cardContentVertical: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xl,
  },
  cardContentHorizontal: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.lg,
  },
  selectedCardBackground: {
    backgroundColor: theme.colors.brand.cream,
  },
  mealInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.lg,
  },
  mealsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  mealTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.borderRadius.pill,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
  },
  footer: {
    paddingHorizontal: theme.spacing['2xl'],
    paddingVertical: theme.spacing.lg,
    paddingBottom: theme.spacing['3xl'],
    backgroundColor: theme.colors.background.primary,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.light,
  },
});