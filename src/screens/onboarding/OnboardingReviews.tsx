import React, { useEffect } from 'react';
import * as StoreReview from 'expo-store-review';
import { View, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { OnboardingLayout } from './OnboardingLayout';
import { theme } from '../../theme/theme';
import { Text } from '../../components/Text';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { Icon } from '../../components/Icon';
import { Icon3D } from '../../components/Icon3D';
import { useAppStore } from '../../store/useAppStore';

const REVIEWS = [
  {
    name: 'Sarah M.',
    condition: 'IBS-D',
    stars: 5,
    text: "First time eating out without getting sick in over a year. I scanned the menu, ordered exactly what GutBuddy said was safe, and felt completely fine after.",
    initial: 'S',
  },
  {
    name: 'James T.',
    condition: 'Celiac Disease',
    stars: 5,
    text: "Week 2 and GutBuddy already caught a hidden gluten source in my 'safe' soup. My doctor was impressed. This app is doing what no dietitian could.",
    initial: 'J',
  },
  {
    name: 'Priya K.',
    condition: 'Bloating & Gas',
    stars: 5,
    text: "GutBuddy flagged onion as my #1 trigger after 10 days. Cut it out and my bloating dropped 80%. I'd been eating it daily for years without realizing.",
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
  const variant = useAppStore((s) => s.onboardingVariant) ?? 'A';

  useEffect(() => {
    StoreReview.isAvailableAsync().then((available) => {
      if (available) StoreReview.requestReview();
    });
  }, []);

  return (
    <OnboardingLayout step={8} scroll icon="avocado_growth" title="Thousands trust their gut to GutBuddy">
      <View style={styles.container}>
        {/* Aggregate rating */}
        <View style={styles.aggregate}>
          <View style={styles.stars3d}>
            {Array.from({ length: 5 }).map((_, i) => (
              <Icon3D key={i} name="star" size={24} animated animationType="float" />
            ))}
          </View>
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
            // Variant B: this screen is shown after CustomPlan, so go to Paywall
            onPress={() => navigation.navigate(variant === 'B' ? 'OnboardingPaywall' : 'OnboardingFeatures')}
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
  stars3d: {
    flexDirection: 'row',
    gap: 4,
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
