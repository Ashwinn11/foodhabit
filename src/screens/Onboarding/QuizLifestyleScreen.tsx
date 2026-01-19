import React from 'react';
import { OnboardingScreen, QuizOption } from '../../components/Onboarding';
import { useOnboardingStore } from '../../store/onboardingStore';
import { useNavigation } from '@react-navigation/native';

const STRESS_LEVELS = [
  { id: 'low', label: 'Low', icon: 'leaf-outline', description: 'Rarely feel stressed' },
  { id: 'moderate', label: 'Moderate', icon: 'ellipsis-horizontal-circle-outline', description: 'Stress comes and goes' },
  { id: 'high', label: 'High', icon: 'speedometer-outline', description: 'Often feel overwhelmed' },
];

export const QuizLifestyleScreen = () => {
  const navigation = useNavigation<any>();
  const { quizAnswers, setQuizAnswer, totalSteps, setCurrentStep } = useOnboardingStore();
  
  const handleSelect = (id: string) => {
    setQuizAnswer('stressLevel', id);
  };

  const handleNext = () => {
    setCurrentStep(3);
    navigation.navigate('OnboardingResults');
  };

  const handleBack = () => {
    navigation.goBack();
    setCurrentStep(1);
  };

  return (
    <OnboardingScreen
      currentStep={2}
      totalSteps={totalSteps}
      title="How's your stress level?"
      subtitle="Stress significantly impacts your gut health."
      onNext={handleNext}
      onBack={handleBack}
      nextDisabled={!quizAnswers.stressLevel}
    >
      {STRESS_LEVELS.map((level) => (
        <QuizOption
          key={level.id}
          label={level.label}
          icon={level.icon as any}
          description={level.description}
          selected={quizAnswers.stressLevel === level.id}
          onSelect={() => handleSelect(level.id)}
        />
      ))}
    </OnboardingScreen>
  );
};
