import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { theme, r } from '../theme';
import { Container, Text, Card } from '../components';
import { AnimatedRing } from '../components/onboarding/AnimatedRing';
import { metricsService } from '../services/health/metricsService';
import { HealthMetrics } from '../types/profile';

export default function HomeScreen() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<HealthMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMetrics();
  }, [user?.id]);

  const loadMetrics = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const metricsData = await metricsService.getLatestMetrics(user.id);
      setMetrics(metricsData);
    } catch (error) {
      console.error('Error loading metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const calculateRingProgress = (metabolicAge: number): number => {
    // Assuming ideal age is 20 and max visible age is 70
    // Progress goes from 100 (age 20) down to 0 (age 70)
    const idealAge = 20;
    const maxAge = 70;
    const clampedAge = Math.max(idealAge, Math.min(maxAge, metabolicAge));
    return ((maxAge - clampedAge) / (maxAge - idealAge)) * 100;
  };

  const getRingColor = (metabolicAge: number | null): string => {
    if (!metabolicAge) return theme.colors.brand.primary;
    if (metabolicAge < 25) return theme.colors.brand.secondary;
    if (metabolicAge < 35) return theme.colors.brand.primary;
    return theme.colors.secondary[500];
  };

  return (
    <Container variant="grouped" scrollable>
      <View style={styles.header}>
        <View style={styles.greetingRow}>
          <Text variant="h5" color="secondary">
            {getGreeting()}
          </Text>
          {user?.user_metadata?.full_name && (
            <Text variant="h5" style={styles.userNameText}>
              {user.user_metadata.full_name as string}
            </Text>
          )}
        </View>
      </View>

      {/* Body Age Ring Section */}
      {loading ? (
        <Card variant="elevated" padding="large" style={styles.metricsCard}>
          <ActivityIndicator size="large" color={theme.colors.brand.primary} />
        </Card>
      ) : metrics ? (
        <Card variant="elevated" padding="large" style={StyleSheet.flatten([styles.metricsCard, styles.ringCard])}>
          <Text variant="label" color="secondary" style={styles.metricsLabel}>
            Your Body Age
          </Text>

          <View style={styles.ringContainer}>
            <AnimatedRing
              progress={calculateRingProgress(metrics.metabolic_age)}
              size={r.scaleWidth(200)}
              strokeWidth={12}
              color={getRingColor(metrics.metabolic_age)}
              glowing={true}
              pulsing={false}
            />

            <View style={styles.ringCenter}>
              <Text variant="h1" style={StyleSheet.flatten([styles.ringAge, { color: getRingColor(metrics.metabolic_age) }])}>
                {metrics.metabolic_age}
              </Text>
              <Text variant="label" color="secondary" style={styles.ageLabel}>
                years
              </Text>
            </View>
          </View>

          <View style={styles.metricsGrid}>
            <View style={styles.metricItem}>
              <Text variant="label" color="secondary">Gut Health</Text>
              <Text variant="h4" style={StyleSheet.flatten([styles.metricScore, { color: theme.colors.brand.primary }])}>
                {metrics.gut_health_score}
              </Text>
              <Text variant="caption" color="tertiary" style={styles.metricUnit}>
                /100
              </Text>
            </View>

            <View style={styles.dividerVertical} />

            <View style={styles.metricItem}>
              <Text variant="label" color="secondary">Nutrition</Text>
              <Text variant="h4" style={StyleSheet.flatten([styles.metricScore, { color: theme.colors.brand.primary }])}>
                {metrics.nutrition_balance_score}
              </Text>
              <Text variant="caption" color="tertiary" style={styles.metricUnit}>
                /100
              </Text>
            </View>
          </View>

          <Text variant="caption" color="tertiary" style={styles.lastUpdated}>
            Last calculated: Today
          </Text>
        </Card>
      ) : (
        <Card variant="elevated" padding="large" style={styles.metricsCard}>
          <Text variant="body" color="tertiary" style={styles.noDataText}>
            Complete your onboarding to see your Body Age
          </Text>
        </Card>
      )}

      <Card variant="filled" padding="large" style={styles.welcomeCard}>
        <Text variant="h4" style={styles.welcomeTitle}>
          Track Your Progress
        </Text>
        <Text variant="body" color="secondary" style={styles.welcomeText}>
          Log your meals and watch your Body Age improve as you build healthier eating habits.
        </Text>
      </Card>

      <View style={styles.section}>
        <Text variant="h4" style={styles.sectionTitle}>
          Quick Stats
        </Text>

        <View style={styles.statsGrid}>
          <Card variant="elevated" padding="large" style={styles.statCard}>
            <Text variant="h1" style={styles.statValue}>
              0
            </Text>
            <Text variant="label" color="secondary" align="center" style={styles.statLabel}>
              Meals Logged
            </Text>
          </Card>

          <Card variant="elevated" padding="large" style={styles.statCard}>
            <Text variant="h1" style={styles.statValue}>
              0
            </Text>
            <Text variant="label" color="secondary" align="center" style={styles.statLabel}>
              Days Tracked
            </Text>
          </Card>
        </View>
      </View>

      <View style={styles.placeholderSection}>
        <Text variant="body" color="tertiary">
          More features coming soon
        </Text>
      </View>
    </Container>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: r.adaptiveSpacing['2xl'],
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  userNameText: {
    color: theme.colors.brand.primary,
  },
  // Metrics Card Styles
  metricsCard: {
    marginBottom: r.adaptiveSpacing['2xl'],
    alignItems: 'center',
  },
  ringCard: {
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.brand.primary,
  },
  metricsLabel: {
    marginBottom: theme.spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  ringContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: r.adaptiveSpacing.xl,
    position: 'relative',
  },
  ringCenter: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringAge: {
    fontWeight: 'bold',
    marginBottom: theme.spacing.xs,
  },
  ageLabel: {
    fontSize: 12,
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: r.adaptiveSpacing.lg,
    paddingHorizontal: theme.spacing.lg,
  },
  metricItem: {
    alignItems: 'center',
    flex: 1,
  },
  metricScore: {
    marginTop: theme.spacing.sm,
  },
  metricUnit: {
    marginTop: theme.spacing.xs,
  },
  dividerVertical: {
    width: StyleSheet.hairlineWidth,
    height: 60,
    backgroundColor: theme.colors.border.main,
    marginHorizontal: theme.spacing.md,
  },
  lastUpdated: {
    marginTop: theme.spacing.lg,
  },
  noDataText: {
    textAlign: 'center',
    paddingVertical: theme.spacing.lg,
  },
  welcomeCard: {
    marginBottom: r.adaptiveSpacing['2xl'],
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.brand.primary,
  },
  welcomeTitle: {
    color: theme.colors.brand.primary,
    marginBottom: theme.spacing.md,
  },
  welcomeText: {
    lineHeight: 24,
  },
  section: {
    marginBottom: r.adaptiveSpacing['2xl'],
  },
  sectionTitle: {
    marginBottom: theme.spacing.lg,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    color: theme.colors.brand.primary,
    marginBottom: theme.spacing.sm,
  },
  statLabel: {
    marginTop: theme.spacing.xs,
  },
  placeholderSection: {
    alignItems: 'center',
    paddingVertical: r.adaptiveSpacing['3xl'],
  },
});
