import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Screen } from '../components/Screen';
import { Text } from '../components/Text';
import { Button } from '../components/Button';
import { theme } from '../theme/theme';
import { useAppStore } from '../store/useAppStore';

const GOALS = [
  { id: 'triggers', icon: '🎯', label: 'Identify my triggers' },
  { id: 'bloating', icon: '🫧', label: 'Reduce bloating' },
  { id: 'fear', icon: '🍽️', label: 'Eat without fear' },
  { id: 'understand', icon: '🔍', label: 'Understand my gut' }
];

export const OnboardingGoal = ({ navigation }: any) => {
  const { updateOnboardingAnswers, onboardingAnswers } = useAppStore();
  const [selected, setSelected] = useState<string>(onboardingAnswers.goal || '');

  const handleContinue = () => {
    if (!selected) return;
    updateOnboardingAnswers({ goal: selected });
    navigation.navigate('OnboardingCondition');
  };

  return (
    <Screen padding={true}>
      <View style={styles.header}>
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { width: '14%' }]} />
        </View>
        <Text variant="caption" style={styles.step}>1 of 7</Text>
      </View>

      <Text variant="hero" style={styles.title}>
        What's your{`\n`}main goal?
      </Text>

      <View style={styles.optionsContainer}>
        {GOALS.map((goal) => {
          const isSelected = selected === goal.id;
          return (
            <TouchableOpacity
              key={goal.id}
              activeOpacity={0.8}
              onPress={() => setSelected(goal.id)}
              style={[
                styles.optionCard,
                isSelected && styles.optionCardSelected
              ]}
            >
              <Text variant="title" style={styles.optionIcon}>{goal.icon}</Text>
              <Text variant="body" style={[
                styles.optionLabel,
                isSelected && styles.optionLabelSelected
              ]}>
                {goal.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.footer}>
        <Button 
          label="Continue →" 
          onPress={handleContinue} 
          disabled={!selected}
        />
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xxxl,
  },
  progressContainer: {
    flex: 1,
    height: 4,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.full,
    marginRight: theme.spacing.md,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: theme.colors.coral,
    borderRadius: theme.radii.full,
  },
  step: {
    color: theme.colors.textSecondary,
  },
  title: {
    marginBottom: theme.spacing.xxxl,
  },
  optionsContainer: {
    flex: 1,
  },
  optionCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.lg,
    padding: theme.spacing.xxl,
    marginBottom: theme.spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionCardSelected: {
    borderColor: theme.colors.coral,
    backgroundColor: theme.colors.surfaceHigh,
  },
  optionIcon: {
    marginRight: theme.spacing.lg,
  },
  optionLabel: {
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  optionLabelSelected: {
    color: theme.colors.textPrimary,
  },
  footer: {
    paddingBottom: theme.spacing.xl,
  },
});
