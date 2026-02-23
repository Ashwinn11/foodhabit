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
    title: 'Conquer the bloat',
    description: "I feel constantly bloated or heavy after eating",
  },
  {
    id: 'triggers',
    lucideIcon: 'Search' as const,
    lucideColor: '#4D94FF', // Info/Blue
    title: 'Uncover hidden triggers',
    description: 'Pinpoint the exact foods that cause discomfort',
  },
  {
    id: 'eating_out',
    lucideIcon: 'Utensils' as const,
    lucideColor: '#FF9D4D', // Orange
    title: 'Reclaim dining out',
    description: 'Navigate restaurant menus without the stress',
  },
  {
    id: 'condition',
    lucideIcon: 'Activity' as const,
    lucideColor: '#FF4D4D', // Primary/Red
    title: 'Manage a condition',
    description: 'Take control of IBS, GERD, or similar',
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
      scroll
      icon="avocado_thinking" 
      title="What brings you to GutBuddy?"
      titleIcon="Target"
      titleIconColor="#FF4D4D"
      subtitle="Select the journey that aligns with your goals."
    >
      <View style={styles.container}>
        <View style={styles.goalsGrid}>
          {GOALS.map((goal) => (
            <View key={goal.id} style={styles.gridItem}>
              <SelectionCard
                layout="grid"
                title={goal.title}
                description={goal.description}
                lucideIcon={goal.lucideIcon}
                lucideColor={goal.lucideColor}
                selected={selected === goal.id}
                onPress={() => handleSelect(goal.id)}
              />
            </View>
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
  goalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -theme.spacing.xxs,
  },
  gridItem: {
    width: '50%',
  },
});
