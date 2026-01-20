import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Typography, Card, ScreenWrapper } from '../components';
import { colors, spacing, radii, shadows } from '../theme';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { RevenueCatService } from '../services/revenueCatService';
import { useGutStore } from '../store';
import { LinearGradient } from 'expo-linear-gradient';

export const SubscriptionRequiredScreen: React.FC = () => {
  const { getStats, getGutHealthScore, gutMoments, getPotentialTriggers, meals } = useGutStore();
  const stats = getStats();
  const healthScore = getGutHealthScore();
  const recentLogs = gutMoments.slice(-30); // Last 30 entries
  const [isLoading, setIsLoading] = useState(false);

  const handleResubscribe = async () => {
    setIsLoading(true);
    try {
      const result = await RevenueCatService.presentPaywall();
      
      if (result === 'PURCHASED' || result === 'RESTORED') {
        // Check premium status
        const isPremium = await RevenueCatService.isPremium(true);
        
        if (isPremium) {
          // Trigger app refresh to reload with premium access
          // @ts-ignore
          if (global.refreshOnboardingStatus) {
            // @ts-ignore
            global.refreshOnboardingStatus();
          }
        }
      }
    } catch (error) {
      console.error('Resubscribe error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate real insights from user data
  const daysTracked = stats.totalPoops;
  const avgHealthScore = healthScore.score;
  const longestStreak = stats.longestStreak;
  const totalInsights = recentLogs.length;
  
  // Get potential triggers
  const triggers = getPotentialTriggers();
  const topTrigger = triggers.length > 0 ? triggers[0] : null;
  
  // Calculate most common Bristol type
  const bristolCounts: Record<number, number> = {};
  gutMoments.forEach(moment => {
    if (moment.bristolType) {
      bristolCounts[moment.bristolType] = (bristolCounts[moment.bristolType] || 0) + 1;
    }
  });
  const mostCommonBristol = Object.entries(bristolCounts).sort((a, b) => b[1] - a[1])[0];
  
  // Get meal insights
  const totalMeals = meals.length;

  return (
    <ScreenWrapper edges={['top', 'bottom']}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <Animated.View 
          entering={FadeInDown.delay(100).springify()}
          style={styles.header}
        >
          <View style={styles.lockIconContainer}>
            <LinearGradient
              colors={[colors.pink, colors.yellow]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.lockGradient}
            >
              <Ionicons name="lock-closed" size={40} color={colors.white} />
            </LinearGradient>
          </View>
          
          <Typography variant="h1" style={styles.title}>
            Subscription Expired
          </Typography>
          <Typography variant="body" color={colors.black + '99'} style={styles.subtitle}>
            Your journey isn't over! See how far you've come.
          </Typography>
        </Animated.View>

        {/* Your Progress Card */}
        <Animated.View entering={FadeInDown.delay(200).springify()}>
          <Card 
            variant="white" 
            style={styles.progressCard}
            padding="xl"
            shadow="md"
          >
            <Typography variant="h3" style={styles.cardTitle}>
              Your Progress 📊
            </Typography>
            <Typography variant="bodySmall" color={colors.black + '66'} style={styles.cardSubtitle}>
              Look at what you've achieved with Gut Buddy
            </Typography>

            <View style={styles.statsGrid}>
              <StatItem
                icon="calendar"
                value={daysTracked.toString()}
                label="Days Tracked"
                color={colors.blue}
                delay={250}
              />
              <StatItem
                icon="flame"
                value={longestStreak.toString()}
                label="Best Streak"
                color={colors.pink}
                delay={300}
              />
              <StatItem
                icon="heart"
                value={avgHealthScore.toString()}
                label="Health Score"
                color={colors.yellow}
                delay={350}
              />
              <StatItem
                icon="analytics"
                value={totalInsights.toString()}
                label="Insights"
                color={colors.blue}
                delay={400}
              />
            </View>
          </Card>
        </Animated.View>

        {/* Personalized Insights Card - Show real data */}
        {(topTrigger || mostCommonBristol || totalMeals > 0) && (
          <Animated.View entering={FadeInDown.delay(425).springify()}>
            <Card 
              variant="colored"
              color={colors.pink}
              style={styles.insightsCard}
              padding="xl"
            >
              <Typography variant="h3" style={styles.cardTitle}>
                Your Insights 💡
              </Typography>
              <Typography variant="bodySmall" color={colors.black + '80'} style={styles.cardSubtitle}>
                Personalized data you've collected
              </Typography>

              <View style={styles.insightsList}>
                {topTrigger && (
                  <InsightItem 
                    icon="warning"
                    label="Top Trigger Food"
                    value={topTrigger.food}
                    subtext={`${topTrigger.count} occurrences`}
                    color={colors.pink}
                    delay={430}
                  />
                )}
                {mostCommonBristol && (
                  <InsightItem 
                    icon="analytics"
                    label="Most Common Type"
                    value={`Bristol Type ${mostCommonBristol[0]}`}
                    subtext={`${mostCommonBristol[1]} times`}
                    color={colors.blue}
                    delay={440}
                  />
                )}
                {totalMeals > 0 && (
                  <InsightItem 
                    icon="restaurant"
                    label="Meals Tracked"
                    value={`${totalMeals} meals`}
                    subtext="Complete food history"
                    color={colors.yellow}
                    delay={450}
                  />
                )}
              </View>
            </Card>
          </Animated.View>
        )}

        {/* What You're Missing */}
        <Animated.View entering={FadeInDown.delay(450).springify()}>
          <Card 
            variant="colored"
            color={colors.yellow}
            style={styles.missingCard}
            padding="xl"
          >
            <Typography variant="h3" style={styles.cardTitle}>
              Continue Your Journey 🚀
            </Typography>
            <Typography variant="bodySmall" color={colors.black + '80'} style={styles.cardSubtitle}>
              Resubscribe to unlock:
            </Typography>

            <View style={styles.featuresList}>
              <FeatureItem 
                icon="infinite"
                text="Unlimited gut health tracking"
                delay={500}
              />
              <FeatureItem 
                icon="trending-up"
                text="Advanced insights & trends"
                delay={550}
              />
              <FeatureItem 
                icon="calendar-outline"
                text="Complete history access"
                delay={600}
              />
              <FeatureItem 
                icon="notifications"
                text="Smart daily reminders"
                delay={650}
              />
              <FeatureItem 
                icon="shield-checkmark"
                text="Priority support"
                delay={700}
              />
            </View>
          </Card>
        </Animated.View>

        {/* CTA Button */}
        <Animated.View entering={FadeInDown.delay(750).springify()}>
          <Pressable 
            onPress={handleResubscribe}
            disabled={isLoading}
            style={({ pressed }) => [
              styles.ctaButton,
              pressed && styles.ctaButtonPressed,
              isLoading && styles.ctaButtonDisabled,
            ]}
          >
            <LinearGradient
              colors={[colors.pink, '#FF6B9D']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.ctaGradient}
            >
              <Ionicons name="star" size={24} color={colors.white} style={{ marginRight: spacing.sm }} />
              <Typography variant="h3" color={colors.white}>
                {isLoading ? 'Loading...' : 'Resubscribe Now'}
              </Typography>
            </LinearGradient>
          </Pressable>
        </Animated.View>

        {/* Footer Message */}
        <Animated.View entering={FadeIn.delay(800)} style={styles.footer}>
          <Typography variant="bodySmall" color={colors.black + '66'} style={styles.footerText}>
            Your data is safe and waiting for you
          </Typography>
          <Typography variant="bodyXS" color={colors.black + '40'} style={styles.footerSubtext}>
            All your logs and insights will be restored immediately
          </Typography>
        </Animated.View>
      </ScrollView>
    </ScreenWrapper>
  );
};

const StatItem: React.FC<{
  icon: keyof typeof Ionicons.glyphMap;
  value: string;
  label: string;
  color: string;
  delay: number;
}> = ({ icon, value, label, color, delay }) => (
  <Animated.View entering={FadeInDown.delay(delay).springify()} style={styles.statItem}>
    <View style={[styles.statIconContainer, { backgroundColor: color + '15', borderColor: color }]}>
      <Ionicons name={icon} size={24} color={color} />
    </View>
    <Typography variant="h2" style={styles.statValue}>{value}</Typography>
    <Typography variant="caption" color={colors.black + '66'}>{label}</Typography>
  </Animated.View>
);

const FeatureItem: React.FC<{
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
  delay: number;
}> = ({ icon, text, delay }) => (
  <Animated.View entering={FadeInDown.delay(delay).springify()} style={styles.featureItem}>
    <View style={styles.featureIconContainer}>
      <Ionicons name={icon} size={20} color={colors.black} />
    </View>
    <Typography variant="bodySmall" style={styles.featureText}>{text}</Typography>
    <Ionicons name="checkmark-circle" size={20} color={colors.black + '40'} />
  </Animated.View>
);

const InsightItem: React.FC<{
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  subtext: string;
  color: string;
  delay: number;
}> = ({ icon, label, value, subtext, color, delay }) => (
  <Animated.View entering={FadeInDown.delay(delay).springify()} style={styles.insightItem}>
    <View style={[styles.insightIconContainer, { backgroundColor: color + '20', borderColor: color }]}>
      <Ionicons name={icon} size={20} color={color} />
    </View>
    <View style={styles.insightContent}>
      <Typography variant="caption" color={colors.black + '66'}>{label}</Typography>
      <Typography variant="bodyBold">{value}</Typography>
      <Typography variant="bodyXS" color={colors.black + '60'}>{subtext}</Typography>
    </View>
  </Animated.View>
);

const styles = StyleSheet.create({
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing['3xl'],
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
    paddingTop: spacing.xl,
  },
  lockIconContainer: {
    marginBottom: spacing.lg,
  },
  lockGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.md,
  },
  title: {
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  subtitle: {
    textAlign: 'center',
    maxWidth: '80%',
  },
  progressCard: {
    marginBottom: spacing.lg,
  },
  cardTitle: {
    marginBottom: spacing.xs,
  },
  cardSubtitle: {
    marginBottom: spacing.lg,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -spacing.xs,
  },
  statItem: {
    width: '50%',
    padding: spacing.xs,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  statIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
    borderWidth: 2,
  },
  statValue: {
    marginBottom: spacing.xs,
  },
  missingCard: {
    marginBottom: spacing.lg,
    backgroundColor: colors.yellow + '40',
    borderWidth: 2,
  },
  featuresList: {
    marginTop: spacing.sm,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white + '60',
    padding: spacing.md,
    borderRadius: radii.lg,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.black + '10',
  },
  featureIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  featureText: {
    flex: 1,
  },
  ctaButton: {
    borderRadius: radii.xl,
    overflow: 'hidden',
    ...shadows.md,
    marginBottom: spacing.lg,
  },
  ctaButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  ctaButtonDisabled: {
    opacity: 0.6,
  },
  ctaGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
  },
  footer: {
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  footerText: {
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  footerSubtext: {
    textAlign: 'center',
  },
  insightsCard: {
    marginBottom: spacing.lg,
    backgroundColor: colors.pink + '20',
    borderWidth: 2,
  },
  insightsList: {
    marginTop: spacing.sm,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white + '80',
    padding: spacing.md,
    borderRadius: radii.lg,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.black + '10',
  },
  insightIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
    borderWidth: 2,
  },
  insightContent: {
    flex: 1,
  },
});
