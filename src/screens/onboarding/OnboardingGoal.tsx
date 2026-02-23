import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { OnboardingLayout } from './OnboardingLayout';
import { theme } from '../../theme/theme';
import { SelectionCard } from '../../components/SelectionCard';
import { useAppStore } from '../../store/useAppStore';
import { analyticsService } from '../../services/analyticsService';

const GOALS = [
  {
    id: 'bloating',
    lucideIcon: 'Wind' as const,
    lucideColor: '#6DBE8C', // Safe/Green
    title: 'Stop feeling bloated',
    description: "I'm bloated or gassy after most meals",
  },
  {
    id: 'triggers',
    lucideIcon: 'Search' as const,
    lucideColor: '#4D94FF', // Info/Blue
    title: 'Find my triggers',
    description: 'I suspect certain foods are hurting me',
  },
  {
    id: 'eating_out',
    lucideIcon: 'Utensils' as const,
    lucideColor: '#FF9D4D', // Orange
    title: 'Eat out safely',
    description: 'Restaurants stress me out',
  },
  {
    id: 'condition',
    lucideIcon: 'Activity' as const,
    lucideColor: '#FF4D4D', // Primary/Red
    title: 'Manage my condition',
    description: 'I have IBS, GERD, or similar',
  },
] as const;

export const OnboardingGoal: React.FC = () => {
  const navigation = useNavigation<any>();
  const [selected, setSelected] = useState<string | null>(null);
  const updateOnboardingAnswers = useAppStore((s) => s.updateOnboardingAnswers);

  const handleSelect = (goalId: string) => {
    setSelected(goalId);
    updateOnboardingAnswers({ goal: goalId });
    analyticsService.logObStart();
    analyticsService.logObGoal(goalId);
    setTimeout(() => navigation.navigate('OnboardingCondition'), 350);
  };

  return (
    <OnboardingLayout 
      step={2} 
      icon="avocado_thinking" 
      title="What's bringing you here today?"
      titleIcon="Target"
      titleIconColor="#FF4D4D"
      subtitle="Choose the one that fits best."
    >
      <View style={styles.container}>

        <View style={styles.goals}>
          {GOALS.map((goal) => (
            <SelectionCard
              key={goal.id}
              title={goal.title}
              description={goal.description}
              lucideIcon={goal.lucideIcon}
              lucideColor={goal.lucideColor}
              selected={selected === goal.id}
              onPress={() => handleSelect(goal.id)}
            />
          ))}
        </View>
      </View>
    </OnboardingLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: theme.spacing.md,
    gap: theme.spacing.xl,
  },
  header: {
    gap: theme.spacing.sm,
  },
  sub: {
    lineHeight: 24,
  },
  goals: {
    gap: theme.spacing.sm,
  },
});
