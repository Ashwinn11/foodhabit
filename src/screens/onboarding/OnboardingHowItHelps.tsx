import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { OnboardingLayout } from './OnboardingLayout';
import { theme } from '../../theme/theme';
import { Text } from '../../components/Text';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { Icon3D } from '../../components/Icon3D';
import { useAppStore } from '../../store/useAppStore';

const BENEFITS = [
  {
    icon: 'magnifying_glass' as const,
    title: 'Scan Any Menu',
    description:
      'Point your camera at any restaurant menu. We instantly tell you what\'s safe.',
  },
  {
    icon: 'brain' as const,
    title: 'Personalized to You',
    description:
      'Every score is based on YOUR condition, YOUR triggers, YOUR gut.',
  },
  {
    icon: 'chart_increasing' as const,
    title: 'Find Your Triggers',
    description:
      'Log meals and symptoms. We connect the dots automatically.',
  },
];

const BenefitCard: React.FC<{
  benefit: typeof BENEFITS[number];
}> = ({ benefit }) => (
  <Card variant="glass" style={styles.card}>
    <Icon3D name={benefit.icon} size={42} animated animationType="float" />
    <View style={styles.cardContent}>
      <Text variant="h3" style={styles.title}>{benefit.title}</Text>
      <Text variant="bodySmall" color={theme.colors.textSecondary} style={styles.description}>
        {benefit.description}
      </Text>
    </View>
  </Card>
);

export const OnboardingHowItHelps: React.FC = () => {
  const navigation = useNavigation<any>();
  const answers = useAppStore((s) => s.onboardingAnswers);

  const conditionText = answers.condition
    ? `Tailored for ${answers.condition.split(',')[0].trim()}...`
    : '';

  return (
    <OnboardingLayout step={7} scroll icon="sparkles" title="How GutBuddy Works">
      <View style={styles.container}>
        {conditionText ? (
          <View style={styles.badge}>
            <Text variant="caption" color={theme.colors.primary} style={styles.badgeText}>
              {conditionText}
            </Text>
          </View>
        ) : null}

        <View style={styles.cards}>
          {BENEFITS.map((benefit, i) => (
            <BenefitCard key={i} benefit={benefit} />
          ))}
        </View>

        <View style={styles.footer}>
          <Button
            variant="primary"
            size="lg"
            onPress={() => navigation.navigate('OnboardingReviews')}
            fullWidth
          >
            Sounds good
          </Button>
        </View>
      </View>
    </OnboardingLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: theme.spacing.lg,
  },
  badge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    backgroundColor: 'rgba(255, 77, 77, 0.1)',
    borderRadius: theme.radius.full,
    alignSelf: 'flex-start',
    marginBottom: -8,
  },
  badgeText: {
    fontFamily: theme.fonts.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cards: {
    gap: theme.spacing.sm,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    padding: theme.spacing.md,
  },
  cardContent: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontFamily: theme.fonts.bold,
  },
  description: {
    lineHeight: 18,
  },
  footer: {
    paddingBottom: theme.spacing.xl,
    marginTop: 'auto',
  },
});
