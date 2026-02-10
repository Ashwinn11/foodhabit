/**
 * OnboardingConditionScreen
 * Asks user their main gut condition (IBS-D, IBS-C, bloating, etc.)
 *
 * Presentation Layer - No business logic
 * Uses: useOnboardingStore (state), SetUserConditionApplicationService (persistence)
 */

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { OnboardingScreen } from '../../components/Onboarding';
import { useOnboardingStore } from '../../store/onboardingStore';
import { useNavigation } from '@react-navigation/native';
import { Typography, IconContainer } from '../../components';
import { colors, spacing, radii } from '../../theme';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { analyticsService } from '../../analytics/analyticsService';
import { useUserCondition } from '../../presentation/hooks/useUserCondition';

const CONDITIONS = [
  {
    id: 'ibs-d',
    label: 'IBS-D (Diarrhea)',
    icon: 'flash',
    color: colors.pink,
    desc: 'Frequent loose or watery stools'
  },
  {
    id: 'ibs-c',
    label: 'IBS-C (Constipation)',
    icon: 'pause-circle',
    color: colors.blue,
    desc: 'Hard to go or infrequent'
  },
  {
    id: 'ibs-m',
    label: 'IBS-M (Mixed)',
    icon: 'swap-horizontal',
    color: '#9333ea',
    desc: 'Both constipation & diarrhea'
  },
  {
    id: 'bloating',
    label: 'Bloating',
    icon: 'cloud',
    color: colors.yellow,
    desc: 'Swollen belly & gas discomfort'
  },
  {
    id: 'ibs-u',
    label: 'IBS-U (Unsure)',
    icon: 'help-circle',
    color: colors.mediumGray,
    desc: 'Not sure about my type'
  },
];

export const OnboardingConditionScreen = () => {
  const navigation = useNavigation<any>();
  const { totalSteps, setCurrentStep, setGutCheckAnswer } = useOnboardingStore();
  const { setCondition, loading: savingCondition } = useUserCondition();
  const [selectedCondition, setSelectedCondition] = useState<string | null>(null);

  useEffect(() => {
    // Step 8 of 11 (after results, before value screen)
    analyticsService.trackOnboardingScreenView('condition', 8, totalSteps);
  }, [totalSteps]);

  const handleNext = async () => {
    if (!selectedCondition) return;

    analyticsService.trackEvent('onboarding_condition_selected', {
      condition: selectedCondition
    });

    // Store condition in onboarding answers
    setGutCheckAnswer('userCondition' as any, selectedCondition);

    // Save condition to database using domain service
    const saved = await setCondition(selectedCondition);

    if (saved) {
      setCurrentStep(9);
      navigation.navigate('OnboardingValue');
    } else {
      // Error will be shown in hook's error state
      console.warn('Failed to save condition');
    }
  };

  const handleBack = () => {
    navigation.goBack();
    setCurrentStep(7);
  };

  return (
    <OnboardingScreen
      currentStep={8}
      totalSteps={totalSteps}
      title="What's your main gut issue?"
      subtitle="This helps us personalize food recommendations (can change later)"
      onNext={handleNext}
      onBack={handleBack}
      nextLabel={savingCondition ? "Saving..." : "Continue"}
      nextDisabled={!selectedCondition || savingCondition}
    >
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        scrollEnabled={CONDITIONS.length > 4}
      >
        {CONDITIONS.map((condition, index) => {
          const isSelected = selectedCondition === condition.id;
          return (
            <Animated.View
              key={condition.id}
              entering={FadeInDown.delay(100 + index * 80)}
            >
              <TouchableOpacity
                style={[
                  styles.conditionCard,
                  isSelected && {
                    borderColor: condition.color,
                    backgroundColor: condition.color + '08',
                    borderWidth: 2
                  }
                ]}
                onPress={() => setSelectedCondition(condition.id)}
                activeOpacity={0.7}
              >
                <IconContainer
                  name={condition.icon as any}
                  size={52}
                  iconSize={26}
                  color={
                    isSelected ? condition.color : colors.iconInactive
                  }
                  variant={isSelected ? 'solid' : 'transparent'}
                  shadow={false}
                />
                <View style={{ flex: 1, marginLeft: spacing.md }}>
                  <Typography variant="bodyBold" color={colors.black}>
                    {condition.label}
                  </Typography>
                  <Typography
                    variant="caption"
                    color={colors.textSecondary}
                  >
                    {condition.desc}
                  </Typography>
                </View>
                {isSelected && (
                  <IconContainer
                    name="checkmark-circle"
                    size={24}
                    color={condition.color}
                    variant="transparent"
                  />
                )}
              </TouchableOpacity>
            </Animated.View>
          );
        })}
      </ScrollView>
    </OnboardingScreen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: spacing.md,
  },
  conditionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginBottom: spacing.md,
    backgroundColor: colors.white,
  },
});
