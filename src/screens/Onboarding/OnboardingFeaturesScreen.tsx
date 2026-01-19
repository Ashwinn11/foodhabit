import React from 'react';
import { OnboardingScreen, FeatureCard } from '../../components/Onboarding';
import { useOnboardingStore } from '../../store/onboardingStore';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../../theme';

const FEATURES = [
  { icon: 'calendar-outline', title: 'Daily Gut Tracker', description: 'Log your meals and symptoms in seconds.', color: colors.blue },
  { icon: 'stats-chart-outline', title: 'Advanced Analytics', description: 'See patterns and triggers you might have missed.', color: colors.yellow },
  { icon: 'notifications-outline', title: 'Smart Reminders', description: 'Never forget to hydrate or log a meal.', color: colors.pink },
  { icon: 'shield-checkmark-outline', title: 'Expert Guidance', description: 'Science-backed tips tailored to your goal.', color: colors.blue },
];

export const OnboardingFeaturesScreen = () => {
  const navigation = useNavigation<any>();
  const { totalSteps, setCurrentStep } = useOnboardingStore();
  
  const handleNext = () => {
    setCurrentStep(6);
    navigation.navigate('OnboardingCustomPlan');
  };

  const handleBack = () => {
    navigation.goBack();
    setCurrentStep(4);
  };

  return (
    <OnboardingScreen
      currentStep={5}
      totalSteps={totalSteps}
      title="Everything you need"
      subtitle="The all-in-one companion for your journey."
      onNext={handleNext}
      onBack={handleBack}
    >
      {FEATURES.map((feature, index) => (
        <FeatureCard
          key={index}
          icon={feature.icon as any}
          title={feature.title}
          description={feature.description}
          color={feature.color}
        />
      ))}
    </OnboardingScreen>
  );
};
