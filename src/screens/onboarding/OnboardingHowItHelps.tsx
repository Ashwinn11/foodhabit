import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { OnboardingLayout } from './OnboardingLayout';
import { theme } from '../../theme/theme';
import { Text } from '../../components/Text';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { LucideIconName } from '../../components/Icon';
import { IconContainer } from '../../components/IconContainer';
import { useAppStore } from '../../store/useAppStore';

const BENEFITS = [
  {
    icon: 'Search' as LucideIconName,
    color: '#4A84D4',
    title: 'Instant menu scan',
    description:
      'Point your camera at any restaurant menu — we tell you exactly what to order.',
  },
  {
    icon: 'Brain' as LucideIconName,
    color: '#8B6CC4',
    title: 'Built for your gut, not everyone\'s',
    description:
      'Every rating is based on your condition, your triggers, and your history.',
  },
  {
    icon: 'TrendingUp' as LucideIconName,
    color: '#5AAF7B',
    title: 'Triggers revealed automatically',
    description:
      'Log meals and how you feel. We find the patterns so you don\'t have to.',
  },
];

const BenefitCard: React.FC<{
  benefit: typeof BENEFITS[number];
}> = ({ benefit }) => (
  <Card variant="glass" style={styles.card}>
    <IconContainer name={benefit.icon} color={benefit.color} variant="solid" size={44} iconSize={22} />
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
  const variant = useAppStore((s) => s.onboardingVariant) ?? 'A';

  const conditionText = answers.condition
    ? `Tailored for ${answers.condition.split(',')[0].trim()}...`
    : '';

  return (
    <OnboardingLayout
      step={7}
      scroll
      icon="avocado_magic"
      title="GutBuddy learns your gut"
    >
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
            // Variant B: Reviews moved to just before paywall, so skip it here
            onPress={() => navigation.navigate(variant === 'B' ? 'OnboardingFeatures' : 'OnboardingReviews')}
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
    backgroundColor: 'rgba(46, 189, 129, 0.1)',
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
