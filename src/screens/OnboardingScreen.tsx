import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';
import { ProgressBar, Container } from '../components';
import {
  QuizStep,
  ResultsStep,
  InsightStep,
  PlanStep,
  RulesStep,
  PaywallStep
} from './onboarding';

interface OnboardingScreenProps {
  onComplete: () => void;
}

type Step =
  | 'quiz'
  | 'results'
  | 'insight_symptom'
  | 'insight_solution'
  | 'insight_features'
  | 'plan'
  | 'rules'
  | 'paywall';

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
        setCurrentStep('insight_features');
        setProgress(0.6);
        break;
      case 'insight_features':
        setCurrentStep('plan');
        setProgress(0.75);
        break;
      case 'plan':
        setCurrentStep('rules');
        setProgress(0.9);
        break;
       case 'rules':
         setCurrentStep('paywall');
         setProgress(1.0);
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
      case 'insight_features':
        setCurrentStep('insight_solution');
        setProgress(0.5);
        break;
      case 'plan':
        setCurrentStep('insight_features');
        setProgress(0.6);
        break;
       case 'rules':
         setCurrentStep('plan');
         setProgress(0.75);
         break;
       case 'paywall':
         setCurrentStep('rules');
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
      case 'insight_features':
        return <InsightStep type="features" onComplete={nextStep} />;
      case 'plan':
        return <PlanStep onComplete={nextStep} />;
       case 'rules':
         return <RulesStep onComplete={nextStep} />;
       case 'paywall':
         return <PaywallStep onComplete={onComplete} />;
       default:
         return null; // Should not happen
     }
  };

  const showBack = currentStep !== 'quiz' && currentStep !== 'results' && currentStep !== 'paywall';

  return (
    <Container style={styles.container} safeArea={currentStep !== 'paywall'}>
      {/* Header / Progress */}
      {currentStep !== 'paywall' && (
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {showBack && (
              <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                <Ionicons name="arrow-back" size={24} color={theme.colors.text.white} />
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.progressBarContainer}>
            <ProgressBar progress={progress} />
          </View>

          <View style={styles.headerRight} />
        </View>
      )}

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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
    height: 60,
  },
  headerLeft: {
    width: 40,
    alignItems: 'flex-start',
  },
  headerRight: {
    width: 40,
  },
  progressBarContainer: {
    flex: 1,
    paddingHorizontal: theme.spacing.sm,
  },
  backButton: {
    padding: theme.spacing.sm,
    marginLeft: -theme.spacing.sm, // Negate padding to visually align with left edge
  },
  content: {
    flex: 1,
  },
});
