import React, { useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Platform, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../hooks/useAuth';
import { theme, r } from '../theme';
import { Container, Text, Card } from '../components';
import { AnimatedRing } from '../components/onboarding/AnimatedRing';
import { HealthRing } from '../components/health/HealthRing';
import { metricsService } from '../services/health/metricsService';
import { mealService } from '../services/meal/mealService';
import { insightEngine } from '../services/insights/insightEngine';
import { HealthMetrics } from '../types/profile';
import { Insight } from '../types/insight';

export default function HomeScreen() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<HealthMetrics | null>(null);
  const [todayMealCount, setTodayMealCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [latestInsight, setLatestInsight] = useState<Insight | null>(null);

  // Refresh metrics when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadMetrics();
      loadMealStats();
      loadLatestInsight();
    }, [user?.id])
  );

  const loadMetrics = async () => {
    if (!user?.id) return;

    try {
      const metricsData = await metricsService.getLatestMetrics(user.id);
      setMetrics(metricsData);
    } catch (error) {
      console.error('Error loading metrics:', error);
    }
  };

  const loadMealStats = async () => {
    if (!user?.id) return;

    try {
      const count = await mealService.getTodayMealCount(user.id);
      setTodayMealCount(count);
    } catch (error) {
      console.error('Error loading meal stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadLatestInsight = async () => {
    if (!user?.id) return;

    try {
      const insights = await insightEngine.getInsights(user.id);
      if (insights.length > 0) {
        setLatestInsight(insights[0]); // Get most recent unread insight
      }
    } catch (error) {
      console.error('Error loading latest insight:', error);
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

      {/* Hero: Body Age Ring */}
      {loading ? (
        <Card variant="elevated" padding="large" style={styles.heroCard}>
          <ActivityIndicator size="large" color={theme.colors.brand.primary} />
        </Card>
      ) : metrics ? (
        <>
          <Card variant="elevated" padding="large" style={styles.heroCard}>
            {/* Data Source Badge */}
            <View style={styles.badgeContainer}>
              <View
                style={[
                  styles.dataBadge,
                  {
                    backgroundColor: metrics.body_age_real
                      ? theme.colors.brand.secondary + '30'
                      : theme.colors.neutral[500] + '30',
                  },
                ]}
              >
                <Text
                  variant="caption"
                  style={{
                    color: metrics.body_age_real ? theme.colors.brand.secondary : theme.colors.text.secondary,
                    fontWeight: '600',
                    fontSize: 10,
                  }}
                >
                  {metrics.body_age_real ? 'REAL-TIME' : 'BASELINE'}
                </Text>
              </View>
            </View>

            <Text variant="label" color="secondary" style={styles.metricsLabel}>
              Your Body Age
            </Text>

            <View style={styles.ringContainer}>
              <AnimatedRing
                progress={calculateRingProgress(metrics.body_age_real || metrics.metabolic_age)}
                size={r.scaleWidth(280)}
                strokeWidth={16}
                color={getRingColor(metrics.body_age_real || metrics.metabolic_age)}
                glowing={true}
                pulsing={false}
              />

              <View style={styles.ringCenter}>
                <Text
                  variant="h1"
                  style={StyleSheet.flatten([
                    styles.ringAge,
                    { color: getRingColor(metrics.body_age_real || metrics.metabolic_age), fontSize: r.adaptiveFontSize['3xl'] * 2 },
                  ])}
                >
                  {metrics.body_age_real || metrics.metabolic_age}
                </Text>
                <Text variant="label" color="secondary" style={styles.ageLabel}>
                  years
                </Text>
              </View>
            </View>
          </Card>

          {/* Supporting Health Rings */}
          <View style={styles.healthRingsContainer}>
            <HealthRing
              score={metrics.gut_health_score_real || metrics.gut_health_score || 0}
              label="Gut Health"
              color={theme.colors.brand.secondary}
              size={r.scaleWidth(120)}
              strokeWidth={8}
              delay={0}
            />
            <HealthRing
              score={metrics.nutrition_score_real || metrics.nutrition_balance_score || 0}
              label="Nutrition"
              color={theme.colors.brand.tertiary}
              size={r.scaleWidth(120)}
              strokeWidth={8}
              delay={200}
            />
            <HealthRing
              score={metrics.metabolism_score_real || 50}
              label="Metabolism"
              color={theme.colors.brand.primary}
              size={r.scaleWidth(120)}
              strokeWidth={8}
              delay={400}
            />
          </View>
        </>
      ) : (
        <Card variant="elevated" padding="large" style={styles.heroCard}>
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

      {/* Latest Insight Preview */}
      {latestInsight && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text variant="h4" style={styles.sectionTitle}>
              Latest Insight
            </Text>
            <TouchableOpacity onPress={() => {
              // TODO: Navigate to Insights tab
              console.log('Navigate to Insights');
            }}>
              <Text variant="label" style={styles.seeAllLink}>
                See All
              </Text>
            </TouchableOpacity>
          </View>

          <Card variant="elevated" padding="large" style={styles.insightPreviewCard}>
            <View style={[styles.insightBadge, {
              backgroundColor: latestInsight.type === 'milestone'
                ? theme.colors.brand.primary + '20'
                : theme.colors.brand.secondary + '20'
            }]}>
              <Text variant="caption" style={{
                color: latestInsight.type === 'milestone'
                  ? theme.colors.brand.primary
                  : theme.colors.brand.secondary,
                fontWeight: '600',
                fontSize: 10,
              }}>
                {latestInsight.type === 'milestone' ? 'ACHIEVEMENT' : 'NEW INSIGHT'}
              </Text>
            </View>

            <Text variant="h5" style={styles.insightTitle}>
              {latestInsight.title}
            </Text>
            <Text variant="body" color="secondary" style={styles.insightDescription} numberOfLines={2}>
              {latestInsight.subtitle}
            </Text>
          </Card>
        </View>
      )}

      <View style={styles.section}>
        <Text variant="h4" style={styles.sectionTitle}>
          Quick Stats
        </Text>

        <View style={styles.statsGrid}>
          <Card variant="elevated" padding="large" style={styles.statCard}>
            <Text variant="h1" style={styles.statValue}>
              {todayMealCount}
            </Text>
            <Text variant="label" color="secondary" align="center" style={styles.statLabel}>
              Meals Today
            </Text>
          </Card>

          <Card variant="elevated" padding="large" style={styles.statCard}>
            <Text variant="h1" style={styles.statValue}>
              {metrics?.days_with_data || 0}
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
    marginBottom: r.adaptiveSpacing.xl,
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  userNameText: {
    color: theme.colors.brand.primary,
  },
  // Hero Body Age Card
  heroCard: {
    marginBottom: r.adaptiveSpacing.lg,
    alignItems: 'center',
    position: 'relative',
  },
  badgeContainer: {
    position: 'absolute',
    top: theme.spacing.md,
    right: theme.spacing.md,
    zIndex: 10,
  },
  dataBadge: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: 9999,
  },
  metricsLabel: {
    marginBottom: theme.spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  ringContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: r.adaptiveSpacing.lg,
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
  // Supporting Health Rings
  healthRingsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: r.adaptiveSpacing['2xl'],
    paddingHorizontal: theme.spacing.sm,
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
    lineHeight: theme.typography.body.lineHeight,
  },
  section: {
    marginBottom: r.adaptiveSpacing['2xl'],
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    marginBottom: 0,
  },
  seeAllLink: {
    color: theme.colors.brand.primary,
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
    paddingBottom: Platform.OS === 'ios' ? 94 : 76, // Clearance for floating tab bar
  },
});
