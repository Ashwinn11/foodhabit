import React from 'react';
import { OnboardingScreen, QuizOption } from '../../components/Onboarding';
import { useOnboardingStore } from '../../store/onboardingStore';
import { useNavigation } from '@react-navigation/native';

const ISSUES = [
  { id: 'bloating', label: 'Bloating', icon: 'medical-outline' },
  { id: 'irregularity', label: 'Irregularity', icon: 'timer-outline' },
  { id: 'heartburn', label: 'Heartburn', icon: 'flame-outline' },
  { id: 'cramps', label: 'Abdominal Cramps', icon: 'alert-circle-outline' },
  { id: 'none', label: 'None, just curious', icon: 'happy-outline' },
];

export const QuizGutIssuesScreen = () => {
  const navigation = useNavigation<any>();
  const { quizAnswers, setQuizAnswer, totalSteps, setCurrentStep } = useOnboardingStore();
  
  const selectedIssues = quizAnswers.gutIssues || [];

  const handleSelect = (id: string) => {
    if (id === 'none') {
      setQuizAnswer('gutIssues', ['none']);
      return;
    }
    
    let newIssues = selectedIssues.filter(i => i !== 'none');
    if (newIssues.includes(id)) {
      newIssues = newIssues.filter(i => i !== id);
    } else {
      newIssues.push(id);
    }
    setQuizAnswer('gutIssues', newIssues);
  };

  const handleNext = () => {
    setCurrentStep(2);
    navigation.navigate('QuizLifestyle');
  };

  const handleBack = () => {
    navigation.goBack();
    setCurrentStep(0);
  };

  return (
    <OnboardingScreen
      currentStep={1}
      totalSteps={totalSteps}
      title="Any symptoms you experience?"
      subtitle="Select all that apply to you."
      onNext={handleNext}
      onBack={handleBack}
      nextDisabled={selectedIssues.length === 0}
    >
      {ISSUES.map((issue) => (
        <QuizOption
          key={issue.id}
          label={issue.label}
          icon={issue.icon as any}
          selected={selectedIssues.includes(issue.id)}
          onSelect={() => handleSelect(issue.id)}
        />
      ))}
    </OnboardingScreen>
  );
};
