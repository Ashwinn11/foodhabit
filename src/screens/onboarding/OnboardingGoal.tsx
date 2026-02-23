import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { OnboardingLayout } from './OnboardingLayout';
import { theme } from '../../theme/theme';
import { Text } from '../../components/Text';
import { SelectionCard } from '../../components/SelectionCard';
import { useAppStore } from '../../store/useAppStore';

const GOALS = [
  {
    id: 'bloating',
    icon: 'face_with_sad' as const,
    title: 'Stop feeling bloated',
    description: "I'm bloated or gassy after most meals",
  },
  {
    id: 'triggers',
    icon: 'magnifying_glass' as const,
    title: 'Find my triggers',
    description: 'I suspect certain foods are hurting me',
  },
  {
    id: 'eating_out',
    icon: 'fork_and_knife' as const,
    title: 'Eat out safely',
    description: 'Restaurants stress me out',
  },
  {
    id: 'condition',
    icon: 'test_tube' as const,
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
    setTimeout(() => navigation.navigate('OnboardingCondition'), 350);
  };

  return (
    <OnboardingLayout step={2}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text variant="h1">What's bringing you here today?</Text>
          <Text variant="body" color={theme.colors.textSecondary} style={styles.sub}>
            Choose the one that fits best.
          </Text>
        </View>

        <View style={styles.goals}>
          {GOALS.map((goal) => (
            <SelectionCard
              key={goal.id}
              title={goal.title}
              description={goal.description}
              icon={goal.icon}
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
