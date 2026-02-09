import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { OnboardingScreen } from '../../components/Onboarding';
import { useOnboardingStore } from '../../store/onboardingStore';
import { useNavigation } from '@react-navigation/native';
import { Typography, IconContainer } from '../../components';
import { colors, spacing, radii } from '../../theme';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { analyticsService } from '../../analytics/analyticsService';

const GOALS = [
  { id: 'bloating', label: 'Stop Bloating', icon: 'cloud', color: colors.blue, desc: 'Reduce gas, discomfort & swelling' },
  { id: 'digestion', label: 'Better Digestion', icon: 'nutrition', color: colors.green, desc: 'Smoother, more regular digestion' },
  { id: 'energy', label: 'More Energy', icon: 'flash', color: colors.yellow, desc: 'Beat brain fog & fatigue' },
  { id: 'skin', label: 'Clearer Skin', icon: 'sparkles', color: colors.pink, desc: 'Fix gut-related acne & breakouts' },
  { id: 'weight', label: 'Weight Management', icon: 'trending-down', color: colors.blue, desc: 'Address stubborn gut weight' },
];

export const OnboardingGoalScreen = () => {
  const navigation = useNavigation<any>();
  const { totalSteps, setCurrentStep, setGutCheckAnswer } = useOnboardingStore();
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);

  useEffect(() => {
    analyticsService.trackOnboardingScreenView('goal', 1, totalSteps);
  }, [totalSteps]);

  const handleNext = () => {
    if (!selectedGoal) return;
    analyticsService.trackEvent('onboarding_goal_selected', { goal: selectedGoal });
    setGutCheckAnswer('selectedGoal' as any, selectedGoal);
    setCurrentStep(2);
    navigation.navigate('OnboardingSymptoms');
  };

  const handleBack = () => {
    navigation.goBack();
    setCurrentStep(0);
  };

  return (
    <OnboardingScreen
      currentStep={1}
      totalSteps={totalSteps}
      title="What's your #1 gut goal?"
      subtitle="We'll personalize everything around this"
      onNext={handleNext}
      onBack={handleBack}
      nextLabel="Continue"
      nextDisabled={!selectedGoal}
    >
      <View style={styles.container}>
        {GOALS.map((goal, index) => {
          const isSelected = selectedGoal === goal.id;
          return (
            <Animated.View key={goal.id} entering={FadeInDown.delay(100 + index * 80)}>
              <TouchableOpacity
                style={[styles.goalCard, isSelected && { borderColor: goal.color, backgroundColor: goal.color + '08' }]}
                onPress={() => setSelectedGoal(goal.id)}
                activeOpacity={0.7}
              >
                <IconContainer
                  name={goal.icon as any}
                  size={52}
                  iconSize={26}
                  color={isSelected ? goal.color : colors.iconInactive}
                  variant={isSelected ? 'solid' : 'transparent'}
                  shadow={false}
                />
                <View style={{ flex: 1, marginLeft: spacing.md }}>
                  <Typography variant="bodyBold" color={colors.black}>
                    {goal.label}
                  </Typography>
                  <Typography variant="caption" color={colors.textSecondary}>
                    {goal.desc}
                  </Typography>
                </View>
                {isSelected && (
                  <IconContainer name="checkmark-circle" size={24} color={goal.color} variant="transparent" />
                )}
              </TouchableOpacity>
            </Animated.View>
          );
        })}
      </View>
    </OnboardingScreen>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  goalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radii.xl,
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.border,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
});
