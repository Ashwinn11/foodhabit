import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { OnboardingLayout } from './OnboardingLayout';
import { theme } from '../../theme/theme';
import { Text } from '../../components/Text';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { Icon } from '../../components/Icon';

const REVIEWS = [
  {
    name: 'Sarah M.',
    condition: 'IBS-D',
    stars: 5,
    text: "I used to dread eating out. Now I scan the menu before I even sit down. Changed my life.",
    initial: 'S',
  },
  {
    name: 'James T.',
    condition: 'Celiac',
    stars: 5,
    text: "Finally an app that doesn't just list FODMAPs. It tells me what to actually order.",
    initial: 'J',
  },
  {
    name: 'Priya K.',
    condition: 'Bloating',
    stars: 5,
    text: "Found out onion was my main trigger in 2 weeks of logging. Worth every penny.",
    initial: 'P',
  },
];

const StarRow: React.FC<{ count: number }> = ({ count }) => (
  <View style={styles.stars}>
    {Array.from({ length: count }).map((_, i) => (
      <Icon key={i} name="Star" size={14} color={theme.colors.caution} />
    ))}
  </View>
);

export const OnboardingReviews: React.FC = () => {
  const navigation = useNavigation<any>();

  return (
    <OnboardingLayout step={8} scroll icon="star" title="Thousands trust their gut to GutBuddy">
      <View style={styles.container}>
        {/* Aggregate rating */}
        <View style={styles.aggregate}>
          <StarRow count={5} />
          <Text variant="bodySmall" color={theme.colors.textSecondary}>
            4.8 · 2,400+ reviews
          </Text>
        </View>

        <View style={styles.reviews}>
          {REVIEWS.map((review, i) => (
            <Card key={i} variant="bordered" style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.avatar}>
                  <Text variant="h3" color={theme.colors.primaryForeground}>
                    {review.initial}
                  </Text>
                </View>
                <View style={styles.reviewerInfo}>
                  <Text variant="bodySmall" style={{ fontFamily: theme.fonts.semibold }}>
                    {review.name}
                  </Text>
                  <Text variant="caption" color={theme.colors.textSecondary}>
                    {review.condition}
                  </Text>
                </View>
                <StarRow count={review.stars} />
              </View>
              <Text variant="body" color={theme.colors.textSecondary} style={styles.reviewText}>
                "{review.text}"
              </Text>
            </Card>
          ))}
        </View>

        <View style={styles.footer}>
          <Button
            variant="primary"
            size="lg"
            onPress={() => navigation.navigate('OnboardingFeatures')}
            fullWidth
          >
            Continue
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
  aggregate: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  stars: {
    flexDirection: 'row',
    gap: 2,
  },
  reviews: {
    gap: theme.spacing.md,
  },
  card: {},
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewerInfo: {
    flex: 1,
    gap: 2,
  },
  reviewText: {
    lineHeight: 22,
    fontStyle: 'italic',
  },
  footer: {
    paddingBottom: theme.spacing.xl,
    marginTop: 'auto',
  },
});
