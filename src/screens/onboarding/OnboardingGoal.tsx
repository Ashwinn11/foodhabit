import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { OnboardingLayout } from './OnboardingLayout';
import { theme } from '../../theme/theme';
import { Text } from '../../components/Text';
import { Icon } from '../../components/Icon';
import { Icon3D } from '../../components/Icon3D';
import { useAppStore } from '../../store/useAppStore';

const GOALS = [
  {
    id: 'bloating',
    icon: 'face_with_head_bandage' as const,
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

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const GoalCard: React.FC<{
  goal: typeof GOALS[number];
  selected: boolean;
  onSelect: () => void;
}> = ({ goal, selected, onSelect }) => {
  const scale = useSharedValue(1);
  const checkOpacity = useSharedValue(0);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.97, { damping: 20, stiffness: 400 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 20, stiffness: 400 });
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    checkOpacity.value = withTiming(1, { duration: 200 });
    onSelect();
  };

  return (
    <AnimatedTouchable
      style={[styles.goalCard, selected && styles.goalCardSelected, animStyle]}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
    >
      <Icon3D name={goal.icon} size={48} />
      <View style={styles.goalText}>
        <Text variant="h3">{goal.title}</Text>
        <Text variant="bodySmall" color={theme.colors.textSecondary}>
          {goal.description}
        </Text>
      </View>
      {selected && (
        <View style={styles.checkBadge}>
          <Icon name="Check" size={16} color={theme.colors.primaryForeground} strokeWidth={2.5} />
        </View>
      )}
    </AnimatedTouchable>
  );
};

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
            <GoalCard
              key={goal.id}
              goal={goal}
              selected={selected === goal.id}
              onSelect={() => handleSelect(goal.id)}
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
  goalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  goalCardSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryMuted,
    ...theme.shadows.glow,
  },
  goalText: {
    flex: 1,
    gap: 4,
  },
  checkBadge: {
    width: 28,
    height: 28,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
