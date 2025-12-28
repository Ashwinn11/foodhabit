import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Button, SelectableCard, Gigi } from '../../components';
import { HappyBalloon, SadCry } from '../../components/mascots';
import { theme } from '../../theme';
import Animated, { FadeInRight, FadeOutLeft } from 'react-native-reanimated';

interface Question {
  id: string;
  question: string;
  options: { label: string; value: string; icon?: string }[];
  multiSelect?: boolean;
}

const QUESTIONS: Question[] = [
  {
    id: 'goal',
    question: "What's your main goal?",
    options: [
      { label: 'Improve Digestion', value: 'digestion', icon: 'leaf' },
      { label: 'Boost Energy', value: 'energy', icon: 'flash' },
      { label: 'Lose Weight', value: 'weight', icon: 'scale' },
      { label: 'Sleep Better', value: 'sleep', icon: 'moon' },
    ],
  },
  {
    id: 'symptom',
    question: "How often do you feel bloated?",
    options: [
      { label: 'Rarely', value: 'rarely' },
      { label: 'Sometimes', value: 'sometimes' },
      { label: 'Often', value: 'often' },
      { label: 'Always', value: 'always' },
    ],
  },
  {
    id: 'diet',
    question: "Any dietary preferences?",
    options: [
      { label: 'No Restrictions', value: 'none' },
      { label: 'Vegetarian', value: 'vegetarian' },
      { label: 'Vegan', value: 'vegan' },
      { label: 'Gluten Free', value: 'gluten_free' },
    ],
    multiSelect: true,
  },
];

interface QuizStepProps {
  onComplete: (data: any) => void;
  onBack: () => void;
  updateProgress: (progress: number) => void;
}

export const QuizStep: React.FC<QuizStepProps> = ({ onComplete, updateProgress }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});

  const currentQuestion = QUESTIONS[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === QUESTIONS.length - 1;

  const handleSelect = (value: string) => {
    const isMulti = currentQuestion.multiSelect;
    
    setAnswers(prev => {
      if (isMulti) {
        const currentSelected = (prev[currentQuestion.id] as string[]) || [];
        if (currentSelected.includes(value)) {
          return { ...prev, [currentQuestion.id]: currentSelected.filter(v => v !== value) };
        } else {
          return { ...prev, [currentQuestion.id]: [...currentSelected, value] };
        }
      } else {
        return { ...prev, [currentQuestion.id]: value };
      }
    });
  };

  const handleNext = () => {
    if (isLastQuestion) {
      onComplete(answers);
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
      updateProgress((currentQuestionIndex + 2) / (QUESTIONS.length + 5)); 
    }
  };

  const hasAnswer = currentQuestion.multiSelect 
    ? (answers[currentQuestion.id] as string[])?.length > 0
    : !!answers[currentQuestion.id];

  return (
    <View style={styles.container}>
      <Animated.View 
        key={currentQuestion.id}
        entering={FadeInRight}
        exiting={FadeOutLeft}
        style={styles.content}
      >
        {/* Welcome message - only shown on first question */}
        {currentQuestionIndex === 0 && (
          <View style={styles.welcomeHeader}>
            <Text variant="headline" style={styles.welcomeTitle}>
              Welcome to GutScan! 👋
            </Text>
            <Text variant="body" style={styles.welcomeSubtitle}>
              Let's personalize your gut health journey with a quick 3-question quiz.
            </Text>
          </View>
        )}

        <View style={styles.gigi}>
          {currentQuestion.id === 'symptom' ? (
            <SadCry size={150} />
          ) : currentQuestion.id === 'goal' ? (
            <HappyBalloon size={150} />
          ) : (
            <Gigi emotion="sad-sick" size="md" />
          )}
        </View>
        
        <Text variant="title2" style={styles.question}>
          {currentQuestion.question}
        </Text>

        <ScrollView showsVerticalScrollIndicator={false} style={styles.optionsList}>
          {currentQuestion.options.map((option) => {
            const isSelected = currentQuestion.multiSelect
              ? (answers[currentQuestion.id] as string[])?.includes(option.value)
              : answers[currentQuestion.id] === option.value;

            return (
              <SelectableCard
                key={option.value}
                label={option.label}
                selected={isSelected}
                onPress={() => handleSelect(option.value)}
              />
            );
          })}
        </ScrollView>

        <View style={styles.footer}>
          <Button
            title={isLastQuestion ? "See Results" : "Next"}
            onPress={handleNext}
            disabled={!hasAnswer}
            variant="primary"
            fullWidth
            size="large"
          />
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
  },
  content: {
    flex: 1,
  },
  welcomeHeader: {
    backgroundColor: 'rgba(255, 118, 100, 0.1)',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 118, 100, 0.2)',
  },
  welcomeTitle: {
    color: theme.colors.brand.coral,
    fontWeight: '600',
    marginBottom: theme.spacing.xs,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    color: theme.colors.text.white,
    opacity: 0.8,
    textAlign: 'center',
    fontSize: 14,
  },
  gigi: {
    alignSelf: 'center',
    marginBottom: theme.spacing.lg,
    marginTop: theme.spacing.md,
    overflow: 'visible',
  },
  question: {
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
    color: theme.colors.text.white, // Ensure white text
  },
  optionsList: {
    flex: 1,
  },
  footer: {
    paddingVertical: theme.spacing.lg,
  },
});
