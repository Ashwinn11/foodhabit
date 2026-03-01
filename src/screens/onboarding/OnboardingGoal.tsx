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
    id: 'eating_out',
    lucideIcon: 'Camera' as const,
    lucideColor: '#5AAF7B',
    title: 'Know what to order at restaurants',
    description: 'Scan any menu and instantly see what\'s safe for you.',
  },
  {
    id: 'triggers',
    lucideIcon: 'Search' as const,
    lucideColor: '#4A84D4',
    title: 'Find out which foods hurt me',
    description: 'We\'ll track patterns and uncover your hidden triggers.',
  },
  {
    id: 'ordering',
    lucideIcon: 'PenLine' as const,
    lucideColor: '#C98A45',
    title: 'Check if my order is safe',
    description: 'Type any dish before ordering — we\'ll tell you if it\'s okay.',
  },
  {
    id: 'condition',
    lucideIcon: 'Activity' as const,
    lucideColor: '#C75050',
    title: 'Manage my gut condition',
    description: 'IBS, GERD, Celiac — eat based on what works for your body.',
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
      step={1}
      scroll
      icon="avocado_thinking"
      title="What would help you the most?"
      subtitle="We'll personalize everything around your answer."
    >
      <View style={styles.container}>
        <View style={styles.goalsList}>
          {GOALS.map((goal) => (
            <SelectionCard
              key={goal.id}
              layout="row"
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
    paddingTop: theme.spacing.sm,
    gap: theme.spacing.xl,
  },
  goalsList: {
    gap: theme.spacing.sm,
  },
});
