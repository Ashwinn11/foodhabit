import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Animated,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { GradientBackground } from '../../components/onboarding/GradientBackground';
import { BackButton } from '../../components/onboarding/BackButton';
import { AnimatedRing } from '../../components/onboarding/AnimatedRing';
import { ProgressIndicator } from '../../components/onboarding/ProgressIndicator';
import { Button, Text, Input } from '../../components';
import { theme, haptics } from '../../theme';
import { OnboardingData } from '../../types/profile';

interface OnboardingGoalsScreenProps {
  onNext: () => void;
  data: Partial<OnboardingData>;
  updateData: (data: Partial<OnboardingData>) => void;
  ringProgress: number;
  setRingProgress: (progress: number) => void;
}

/**
 * Onboarding Goals Screen
 * Fifth screen - Goal selection and final inputs
 *
 * Psychology:
 * - Public commitment increases retention
 * - Make them feel heard with specific focus area
 * - Goal cards pulse to invite selection
 * - Heavy haptic on goal selection creates weight/importance
 *
 * Animation:
 * - Ring progresses 85% → 95%
 * - Goal cards pulse on appear
 * - Selected card grows with glow effect
 * - Sliders update ring progress smoothly
 */
export default function OnboardingGoalsScreen({
  onNext,
  data,
  updateData,
  ringProgress,
  setRingProgress,
}: OnboardingGoalsScreenProps) {
  const navigation = useNavigation();
  const [focusArea, setFocusArea] = useState<string | null>(data.focus_area ?? null);
  const [waterIntake, setWaterIntake] = useState(data.water_intake?.toString() ?? '8');
  const [cookingRatio, setCookingRatio] = useState(data.cooking_ratio?.toString() ?? '50');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const ringValue = useRef(new Animated.Value(ringProgress)).current;

  const goalOptions = [
    { id: 'sugar', label: 'Reduce Sugar Cravings', icon: 'ice-cream' as const },
    { id: 'energy', label: 'Boost Energy Levels', icon: 'flash' as const },
    { id: 'gut', label: 'Improve Gut Health', icon: 'fitness' as const },
    { id: 'weight', label: 'Manage Weight Better', icon: 'scale' as const },
  ];

  // Update ring progress
  const validateAndUpdateProgress = () => {
    let filledFields = 0;
    const newErrors: Record<string, string> = {};

    if (focusArea) filledFields++;

    // Validate water intake (1-16 cups)
    if (waterIntake) {
      const water = parseInt(waterIntake, 10);
      if (isNaN(water) || water < 1 || water > 16) {
        newErrors.waterIntake = 'Water intake must be 1-16 cups';
      } else {
        filledFields++;
      }
    }

    // Validate cooking ratio (0-100%)
    if (cookingRatio) {
      const cooking = parseInt(cookingRatio, 10);
      if (isNaN(cooking) || cooking < 0 || cooking > 100) {
        newErrors.cookingRatio = 'Cooking ratio must be 0-100%';
      } else {
        filledFields++;
      }
    }

    setErrors(newErrors);

    // Update ring: 85% → 95% (10% range)
    const progress = 85 + (filledFields / 3) * 10;
    Animated.timing(ringValue, {
      toValue: progress,
      duration: 300,
      useNativeDriver: false,
    }).start();
    setRingProgress(progress);

    return Object.keys(newErrors).length === 0;
  };

  // Update ring progress without validation (for immediate visual feedback while typing)
  const updateRingProgressOnly = () => {
    let filledFields = 0;
    if (focusArea) filledFields++;
    if (waterIntake) filledFields++;
    if (cookingRatio) filledFields++;

    // Update ring: 85% → 95% (10% range)
    const progress = 85 + (filledFields / 3) * 10;
    Animated.timing(ringValue, {
      toValue: progress,
      duration: 300,
      useNativeDriver: false,
    }).start();
    setRingProgress(progress);
  };

  const handleGoalSelect = (goal: string) => {
    setFocusArea(goal);
    haptics.heavy();
    updateRingProgressOnly();
  };

  const handleWaterChange = (value: string) => {
    // Only allow integers (1-16)
    const filtered = value.replace(/[^0-9]/g, '');
    // Limit to 2 digits (max 16)
    const limited = filtered.slice(0, 2);
    // Auto-clamp to max 16
    const num = parseInt(limited, 10);
    const final = !isNaN(num) && num > 16 ? '16' : limited;
    setWaterIntake(final);
    if (value !== final) {
      haptics.light();
    }
    updateRingProgressOnly();
  };

  const handleCookingChange = (value: string) => {
    // Only allow integers (0-100)
    const filtered = value.replace(/[^0-9]/g, '');
    // Limit to 3 digits (max 100)
    const limited = filtered.slice(0, 3);
    // Auto-clamp to max 100
    const num = parseInt(limited, 10);
    const final = !isNaN(num) && num > 100 ? '100' : limited;
    setCookingRatio(final);
    if (value !== final) {
      haptics.light();
    }
    updateRingProgressOnly();
  };

  const handleNext = () => {
    const isValid = validateAndUpdateProgress();

    if (isValid && focusArea && waterIntake && cookingRatio) {
      updateData({
        focus_area: focusArea as 'sugar' | 'energy' | 'gut' | 'weight',
        water_intake: parseInt(waterIntake, 10),
        cooking_ratio: parseInt(cookingRatio, 10),
      });
      haptics.medium();
      onNext();
    } else {
      haptics.light();
    }
  };

  const isFormValid = focusArea && waterIntake && cookingRatio && Object.keys(errors).length === 0;


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
              <ProgressIndicator currentStep={5} totalSteps={5} />

              {/* Title and Subtitle */}
              <View style={styles.titleContainer}>
                <Text variant="h2" align="center" style={styles.title}>
                  Almost there...
                </Text>
                <Text variant="body" align="center" style={styles.subtitle}>
                  What's the ONE thing you want FEEL to help you fix?
                </Text>
              </View>

              {/* Goal Cards */}
              <View style={styles.goalsContainer}>
                {goalOptions.map((goal) => (
                  <GoalCard
                    key={goal.id}
                    goal={goal}
                    isSelected={focusArea === goal.id}
                    onSelect={() => handleGoalSelect(goal.id)}
                  />
                ))}
              </View>

              {/* Final Inputs */}
              <View style={styles.inputsContainer}>
                {/* Water Intake */}
                <View style={styles.fieldContainer}>
                  <View style={styles.labelRow}>
                    <Text variant="label" style={styles.label}>
                      Water Intake
                    </Text>
                    <Text variant="caption" style={styles.valueLabel}>
                      {waterIntake} cups/day
                    </Text>
                  </View>
                  <View style={styles.sliderContainer}>
                    <TouchableOpacity
                      onPress={() => {
                        const newVal = Math.max(1, parseInt(waterIntake, 10) - 1);
                        handleWaterChange(newVal.toString());
                      }}
                      style={styles.sliderButton}
                    >
                      <Text style={styles.sliderButtonText}>−</Text>
                    </TouchableOpacity>

                    <Input
                      placeholder="8"
                      value={waterIntake}
                      onChangeText={handleWaterChange}
                      onBlur={validateAndUpdateProgress}
                      keyboardType="number-pad"
                    />

                    <TouchableOpacity
                      onPress={() => {
                        const newVal = Math.min(16, parseInt(waterIntake, 10) + 1);
                        handleWaterChange(newVal.toString());
                      }}
                      style={styles.sliderButton}
                    >
                      <Text style={styles.sliderButtonText}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Cooking Ratio */}
                <View style={styles.fieldContainer}>
                  <View style={styles.labelRow}>
                    <Text variant="label" style={styles.label}>
                      Cooking Ratio
                    </Text>
                    <Text variant="caption" style={styles.valueLabel}>
                      {cookingRatio}% cook
                    </Text>
                  </View>
                  <View style={styles.sliderContainer}>
                    <TouchableOpacity
                      onPress={() => {
                        const newVal = Math.max(0, parseInt(cookingRatio, 10) - 10);
                        handleCookingChange(newVal.toString());
                      }}
                      style={styles.sliderButton}
                    >
                      <Text style={styles.sliderButtonText}>−</Text>
                    </TouchableOpacity>

                    <Input
                      placeholder="50"
                      value={cookingRatio}
                      onChangeText={handleCookingChange}
                      onBlur={validateAndUpdateProgress}
                      keyboardType="number-pad"
                    />

                    <TouchableOpacity
                      onPress={() => {
                        const newVal = Math.min(100, parseInt(cookingRatio, 10) + 10);
                        handleCookingChange(newVal.toString());
                      }}
                      style={styles.sliderButton}
                    >
                      <Text style={styles.sliderButtonText}>+</Text>
                    </TouchableOpacity>
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
              title="Analyze My Body"
              onPress={handleNext}
              variant="ghost"
              size="large"
              fullWidth
              disabled={!isFormValid}
              style={[styles.blackButton, !isFormValid && { opacity: 0.5 }]}
              textStyle={styles.whiteButtonText}
            />
          </View>
        </View>
      </SafeAreaView>
    </GradientBackground>
  );
}

/**
 * Goal Card Component
 */
interface GoalCardProps {
  goal: { id: string; label: string; icon: 'ice-cream' | 'flash' | 'fitness' | 'scale' };
  isSelected: boolean;
  onSelect: () => void;
}

const GoalCard: React.FC<GoalCardProps> = ({ goal, isSelected, onSelect }) => {
  const scaleAnim = useRef(new Animated.Value(isSelected ? 1 : 0.95)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: isSelected ? 1.05 : 0.95,
      tension: 20,
      friction: 8,
      useNativeDriver: true,
    }).start();
  }, [isSelected]);

  return (
    <Animated.View
      style={[
        styles.goalCardWrapper,
        {
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <TouchableOpacity
        onPress={onSelect}
        activeOpacity={0.8}
        style={[
          styles.goalCardButton,
          isSelected && styles.goalCardButtonSelected,
        ]}
      >
        <Ionicons
          name={goal.icon}
          size={28}
          color={isSelected ? theme.colors.brand.primary : theme.colors.brand.white}
        />
        <Text
          variant="button"
          style={{
            ...styles.goalLabel,
            ...(isSelected && styles.goalLabelSelected),
          }}
        >
          {goal.label}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

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
  goalsContainer: {
    gap: theme.spacing.md,
    marginBottom: theme.spacing['2xl'],
  },
  goalCardWrapper: {
    width: '100%',
  },
  goalCardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: theme.borderRadius.lg,
    gap: theme.spacing.lg,
  },
  goalCardButtonSelected: {
    backgroundColor: theme.colors.brand.white,
  },
  goalLabel: {
    color: theme.colors.brand.white,
    flex: 1,
  },
  goalLabelSelected: {
    color: theme.colors.brand.primary,
  },
  inputsContainer: {
    gap: theme.spacing.xl,
    marginBottom: theme.spacing['2xl'],
  },
  fieldContainer: {
    gap: theme.spacing.md,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.sm,
  },
  label: {
    color: theme.colors.brand.white,
  },
  valueLabel: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  sliderButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sliderButtonText: {
    color: theme.colors.brand.white,
    fontSize: 20,
    fontWeight: '300',
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
