import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { theme } from '../theme';
import { ProgressBar, Container } from '../components';
import { 
  QuizStep, 
  ResultsStep, 
  InsightStep, 
  PlanStep, 
  PaywallStep,
  RulesStep,
  ReviewsStep
} from './onboarding';

interface OnboardingScreenProps {
  onComplete: () => void;
}

type Step = 
  | 'quiz' 
  | 'results' 
  | 'insight_symptom' 
  | 'insight_solution' 
  | 'reviews'
  | 'insight_features'
  | 'plan' 
  | 'paywall' 
  | 'rules';

export default function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const [currentStep, setCurrentStep] = useState<Step>('quiz');
  const [progress, setProgress] = useState(0.1);

  // Simple state machine for navigation
  const nextStep = () => {
    switch (currentStep) {
      case 'quiz':
        setCurrentStep('results');
        setProgress(0.3);
        break;
      case 'results':
        setCurrentStep('insight_symptom');
        setProgress(0.4);
        break;
      case 'insight_symptom':
        setCurrentStep('insight_solution');
        setProgress(0.5);
        break;
      case 'insight_solution':
        setCurrentStep('reviews');
        setProgress(0.6);
        break;
      case 'reviews':
        setCurrentStep('insight_features');
        setProgress(0.7);
        break;
      case 'insight_features':
        setCurrentStep('plan');
        setProgress(0.8);
        break;
      case 'plan':
        setCurrentStep('paywall');
        setProgress(0.8);
        break;
      case 'paywall':
        setCurrentStep('rules');
        setProgress(1.0);
        break;
      case 'paywall':
        setCurrentStep('rules');
        setProgress(1.0);
        break;
      case 'rules':
        onComplete();
        break;
    }
  };

  const handleBack = () => {
    switch (currentStep) {
      case 'results':
        setCurrentStep('quiz');
        setProgress(0.1);
        break;
      case 'insight_symptom':
        setCurrentStep('results');
        setProgress(0.3);
        break;
      case 'insight_solution':
        setCurrentStep('insight_symptom');
        setProgress(0.4);
        break;
      case 'reviews':
        setCurrentStep('insight_solution');
        setProgress(0.5);
        break;
      case 'insight_features':
        setCurrentStep('reviews');
        setProgress(0.6);
        break;
      case 'plan':
        setCurrentStep('insight_features');
        setProgress(0.7);
        break;
      case 'paywall':
        setCurrentStep('plan');
        setProgress(0.8);
        break;
      case 'rules':
        setCurrentStep('paywall');
        setProgress(0.9);
        break;
      default:
        // No back action for quiz start
        break;
    }
  };

  const handleQuizUpdate = (val: number) => {
    // Minor progress updates during quiz
    setProgress(Math.min(val, 0.25)); 
  };

  const renderStep = () => {
    switch (currentStep) {
      case 'quiz':
        return (
          <QuizStep 
            onComplete={nextStep} 
            onBack={handleBack} 
            updateProgress={handleQuizUpdate} 
          />
        );
      case 'results':
        return <ResultsStep onComplete={nextStep} />;
      case 'insight_symptom':
        return <InsightStep type="symptoms" onComplete={nextStep} />;
      case 'insight_solution':
        return <InsightStep type="solution" onComplete={nextStep} />;
      case 'reviews':
        return <ReviewsStep onComplete={nextStep} />;
      case 'insight_features':
        return <InsightStep type="features" onComplete={nextStep} />;
      case 'plan':
        return <PlanStep onComplete={nextStep} />;
      case 'paywall':
        return <PaywallStep onComplete={nextStep} />;
      case 'rules':
        return <RulesStep onComplete={nextStep} />;
      default:
        return null; // Should not happen
    }
  };

  return (
    <Container style={styles.container}>
      {/* Header / Progress */}
      <View style={styles.header}>
        <View style={styles.progressBarContainer}>
          <ProgressBar progress={progress} />
        </View>
        
        {currentStep !== 'quiz' && currentStep !== 'results' && (
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Main Content Area */}
      <View style={styles.content}>
        {renderStep()}
      </View>
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
    height: 60,
    justifyContent: 'center',
  },
  progressBarContainer: {
    width: '100%',
    paddingHorizontal: theme.spacing.xl, // Center it visually a bit more
  },
  backButton: {
    position: 'absolute',
    left: theme.spacing.lg,
    padding: theme.spacing.sm,
  },
  backIcon: {
    fontSize: 28,
    color: theme.colors.text.white,
    fontWeight: '300',
  },
  content: {
    flex: 1,
  },
});
