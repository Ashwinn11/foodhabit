import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Button, SelectableCard, Gigi } from '../../components';
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
        <View style={styles.gigi}>
          <Gigi emotion="thinking" size="sm" />
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
  gigi: {
    alignSelf: 'center',
    marginBottom: theme.spacing.lg,
    marginTop: theme.spacing.md,
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
