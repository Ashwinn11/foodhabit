import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { OnboardingLayout } from './OnboardingLayout';
import { theme } from '../../theme/theme';
import { Text } from '../../components/Text';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { Icon } from '../../components/Icon';
import { useAppStore } from '../../store/useAppStore';

const BENEFITS = [
  {
    icon: 'Camera' as const,
    title: 'Scan Any Menu',
    description:
      'Point your camera at any restaurant menu. We instantly tell you what\'s safe.',
  },
  {
    icon: 'Brain' as const,
    title: 'Personalized to You',
    description:
      'Every score is based on YOUR condition, YOUR triggers, YOUR gut.',
  },
  {
    icon: 'TrendingUp' as const,
    title: 'Find Your Triggers',
    description:
      'Log meals and symptoms. We connect the dots automatically.',
  },
];

export const OnboardingHowItHelps: React.FC = () => {
  const navigation = useNavigation<any>();
  const answers = useAppStore((s) => s.onboardingAnswers);

  const conditionText = answers.condition
    ? `For people with ${answers.condition.split(',')[0].trim()}...`
    : '';

  return (
    <OnboardingLayout step={7} scroll>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text variant="h1">Here's how GutBuddy works for you</Text>
          {conditionText ? (
            <Text variant="body" color={theme.colors.primary} style={styles.personalized}>
              {conditionText}
            </Text>
          ) : null}
        </View>

        <View style={styles.cards}>
          {BENEFITS.map((benefit, i) => (
            <Card key={i} variant="bordered" style={styles.card}>
              <View style={styles.cardInner}>
                <View style={styles.iconBadge}>
                  <Icon name={benefit.icon} size={22} color={theme.colors.primary} />
                </View>
                <View style={styles.cardText}>
                  <Text variant="h3">{benefit.title}</Text>
                  <Text variant="bodySmall" color={theme.colors.textSecondary} style={styles.desc}>
                    {benefit.description}
                  </Text>
                </View>
              </View>
            </Card>
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
    paddingTop: theme.spacing.md,
    gap: theme.spacing.xl,
  },
  header: {
    gap: theme.spacing.sm,
  },
  personalized: {
    fontFamily: theme.fonts.medium,
  },
  cards: {
    gap: theme.spacing.md,
  },
  card: {
    padding: theme.spacing.md,
  },
  cardInner: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    alignItems: 'flex-start',
  },
  iconBadge: {
    width: 44,
    height: 44,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  cardText: {
    flex: 1,
    gap: 4,
  },
  desc: {
    lineHeight: 20,
  },
  footer: {
    paddingBottom: theme.spacing.xl,
    marginTop: 'auto',
  },
});
