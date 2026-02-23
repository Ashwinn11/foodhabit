import React, { useState, useEffect } from 'react';
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
    lucideColor: '#6DBE8C',
    title: 'Stop feeling bloated',
    description: 'That heavy, tight feeling after every meal ends here.',
  },
  {
    id: 'triggers',
    lucideIcon: 'Search' as const,
    lucideColor: '#4D94FF',
    title: "Find what's hurting me",
    description: 'Pinpoint the exact foods behind your symptoms.',
  },
  {
    id: 'eating_out',
    lucideIcon: 'Utensils' as const,
    lucideColor: '#FF9D4D',
    title: 'Eat out confidently',
    description: 'Order without anxiety at any restaurant.',
  },
  {
    id: 'condition',
    lucideIcon: 'Activity' as const,
    lucideColor: '#FF4D4D',
    title: 'Control my condition',
    description: 'IBS, GERD, Celiac — backed by dietary science.',
  },
] as const;

export const OnboardingGoal: React.FC = () => {
  const navigation = useNavigation<any>();
  const [selected, setSelected] = useState<string | null>(null);
  const updateOnboardingAnswers = useAppStore((s) => s.updateOnboardingAnswers);

  useEffect(() => {
    analyticsService.logObStart();
  }, []);

  const handleSelect = (goalId: string) => {
    setSelected(goalId);
    updateOnboardingAnswers({ goal: goalId });
    analyticsService.logObGoal(goalId);
    setTimeout(() => navigation.navigate('OnboardingCondition'), 350);
  };

  return (
    <OnboardingLayout
      step={2}
      scroll
      icon="avocado_thinking"
      title="What's your gut holding you back from?"
      titleIcon="Target"
      titleIconColor="#FF4D4D"
      subtitle="Pick your biggest challenge — we'll build everything around it."
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
