import React from 'react';
import { OnboardingScreen, QuizOption } from '../../components/Onboarding';
import { useOnboardingStore } from '../../store/onboardingStore';
import { useNavigation } from '@react-navigation/native';

const GOALS = [
  { id: 'skin_health', label: 'Clearer Skin', icon: 'sparkles-outline', description: 'Glow from within by fixing your gut' },
  { id: 'better_digestion', label: 'End Bloating', icon: 'leaf-outline', description: 'Stop the daily discomfort for good' },
  { id: 'weight_loss', label: 'Manage Weight', icon: 'barbell-outline', description: 'Optimize metabolism naturally' },
  { id: 'energy_boost', label: 'Stop Fatigue', icon: 'flash-outline', description: 'Unleash natural all-day energy' },
];

export const QuizHealthGoalScreen = () => {
  const navigation = useNavigation<any>();
  const { quizAnswers, setQuizAnswer, totalSteps, setCurrentStep } = useOnboardingStore();
  
  const handleSelect = (id: string) => {
    setQuizAnswer('healthGoal', id);
  };

  const handleNext = () => {
    setCurrentStep(1);
    navigation.navigate('QuizGutIssues');
  };

  return (
    <OnboardingScreen
      currentStep={0}
      totalSteps={totalSteps}
      title="What's holding you back?"
      subtitle="The gut is the center of your health, skin, and confidence."
      onNext={handleNext}
      nextDisabled={!quizAnswers.healthGoal}
      showBackButton={false}
    >
      {GOALS.map((goal) => (
        <QuizOption
          key={goal.id}
          label={goal.label}
          icon={goal.icon as any}
          description={goal.description}
          selected={quizAnswers.healthGoal === goal.id}
          onSelect={() => handleSelect(goal.id)}
        />
      ))}
    </OnboardingScreen>
  );
};
