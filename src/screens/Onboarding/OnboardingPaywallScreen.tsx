import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { OnboardingScreen } from '../../components/Onboarding';
import { useOnboardingStore } from '../../store/onboardingStore';
import { useNavigation } from '@react-navigation/native';
import { Typography, Card } from '../../components';
import { colors, spacing, radii } from '../../theme';
import Animated, { FadeIn, Layout } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as StoreReview from 'expo-store-review';
import { RevenueCatService } from '../../services/revenueCatService';
import { analyticsService } from '../../analytics/analyticsService';

export const OnboardingPaywallScreen = () => {
  const navigation = useNavigation<any>();
  const { calculatedScore, totalSteps, setCurrentStep, completeOnboarding } = useOnboardingStore();
  const [countdown, setCountdown] = useState(15 * 60); // 15 minutes in seconds
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    analyticsService.trackPaywallViewed();
    analyticsService.trackOnboardingScreenView('paywall', 10, totalSteps);

    // Countdown timer (loss aversion)
    countdownRef.current = setInterval(() => {
      setCountdown(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    // Request store review after a delay
    const reviewTimer = setTimeout(async () => {
      if (await StoreReview.hasAction()) {
        StoreReview.requestReview();
      }
    }, 2000);

    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
      clearTimeout(reviewTimer);
    };
  }, [totalSteps]);

  const handleNext = async () => {
    // Show native RevenueCat Paywall
    try {
      const paywallResult = await RevenueCatService.presentPaywall();
      const isPremium = await RevenueCatService.isPremium(true);
      const purchasedOrRestored = paywallResult === 'PURCHASED' || paywallResult === 'RESTORED';

      if (!isPremium && !purchasedOrRestored) {
        return; // Exit if they didn't buy anything
      }

      // Track conversion
      analyticsService.trackConversionCompleted(
        'premium',
        60, // Price in cents ($0.60/week or ~$29/year)
        analyticsService.getSessionDurationSeconds()
      );

      // User purchased! Mark complete
      await completeOnboarding();

      // Trigger update in App.tsx
      // @ts-ignore
      if (global.refreshOnboardingStatus) {
        // @ts-ignore
        global.refreshOnboardingStatus();
      }
    } catch (error) {
      console.error('❌ Paywall error:', error);
    }
  };

  const handleBack = () => {
    navigation.goBack();
    setCurrentStep(9);
  };

  const formatCountdown = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <OnboardingScreen
      currentStep={10}
      totalSteps={totalSteps}
      title="Your Plan Is Ready"
      subtitle="Don't lose your personalized protocol"
      onNext={handleNext}
      onBack={handleBack}
      nextLabel="Keep My Plan — Start Free Trial"
    >
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: spacing.xl }}>
        <Animated.View entering={FadeIn} layout={Layout} style={styles.content}>

          {/* Loss Aversion Timer */}
          <Animated.View entering={FadeIn.delay(50)} style={styles.timerContainer}>
            <Ionicons name="time-outline" size={16} color={colors.pink} />
            <Typography variant="bodySmall" color={colors.pink} style={{ marginLeft: spacing.xs }}>
              Offer locked for {formatCountdown(countdown)}
            </Typography>
          </Animated.View>

          {/* Score Projection */}
          <Animated.View entering={FadeIn.delay(100)} style={styles.projectionContainer}>
            <Typography variant="bodyBold" align="center" style={{ marginBottom: spacing.md }}>
              Expected Improvement
            </Typography>
            <View style={styles.projectionBar}>
              <View style={{ alignItems: 'center' }}>
                <Typography variant="h2" color={colors.pink} style={{ fontSize: 28 }}>
                  {calculatedScore}
                </Typography>
                <Typography variant="caption" style={{ fontSize: 12, marginTop: spacing.xs }}>
                  Today
                </Typography>
              </View>
              <Ionicons name="arrow-forward" size={20} color={colors.mediumGray} style={{ marginHorizontal: spacing.md }} />
              <View style={{ alignItems: 'center' }}>
                <Typography variant="h2" color={colors.green} style={{ fontSize: 28 }}>
                  85+
                </Typography>
                <Typography variant="caption" style={{ fontSize: 12, marginTop: spacing.xs }}>
                  12 Weeks
                </Typography>
              </View>
            </View>
          </Animated.View>

          {/* Price Anchoring */}
          <Animated.View entering={FadeIn.delay(200)} style={styles.anchorContainer}>
            <View style={styles.anchorGrid}>
              <AnchorItem label="GI Specialist" cost="$350+" color={colors.mediumGray} />
              <AnchorItem label="Trial & Error" cost="Years" color={colors.mediumGray} />
              <AnchorItem label="GutBuddy" cost="$1.15/wk" color={colors.green} highlighted />
            </View>
          </Animated.View>

          {/* 90-Day Plan Card */}
          <Animated.View entering={FadeIn.delay(300)}>
            <Card style={styles.planCard}>
              <View style={styles.planHeader}>
                <Typography variant="h3" color={colors.black} style={{ fontSize: 20 }}>
                  90-Day Gut Reset
                </Typography>
              </View>

              <View style={styles.divider} />

              <View style={styles.timeline}>
                <TimelineItem
                  title="Phase 1: CALM"
                  duration="Week 1-2"
                  desc="Reduce inflammation & find triggers."
                  color={colors.pink}
                />
                <TimelineItem
                  title="Phase 2: RESTORE"
                  duration="Week 3-6"
                  desc="Rebuild bacteria & optimize hydration."
                  color={colors.green}
                />
                <TimelineItem
                  title="Phase 3: THRIVE"
                  duration="Week 7-12"
                  desc="Maintain progress & fine-tune diet."
                  color={colors.blue}
                  isLast
                />
              </View>
            </Card>
          </Animated.View>

          {/* What's Included */}
          <Animated.View entering={FadeIn.delay(400)}>
            <Typography variant="bodyBold" style={{ marginTop: spacing.lg, marginBottom: spacing.md }}>
              What's Included
            </Typography>
            <View style={styles.featureList}>
              <FeatureItem icon="scan" text="AI Food Scanner" />
              <FeatureItem icon="trending-up" text="Smart Trigger Tracking" />
              <FeatureItem icon="calendar" text="Personalized Daily Plan" />
              <FeatureItem icon="shield-checkmark" text="100% Private & Secure" />
            </View>
          </Animated.View>

        </Animated.View>
      </ScrollView>
    </OnboardingScreen>
  );
};

const TimelineItem = ({ title, duration, desc, color, isLast }: any) => (
  <View style={{ flexDirection: 'row', marginBottom: isLast ? 0 : spacing.sm }}>
    <View style={{ alignItems: 'center', width: 20, marginRight: spacing.sm }}>
      <View style={[styles.timelineDot, { backgroundColor: color }]} />
      {!isLast && <View style={[styles.timelineLine, { backgroundColor: color + '30' }]} />}
    </View>
    <View style={{ flex: 1 }}>
      <Typography variant="bodyBold" style={{ fontSize: 14 }}>
        {title}{' '}
        <Typography variant="caption" color={colors.black} style={{ fontSize: 12 }}>
          {duration}
        </Typography>
      </Typography>
      <Typography variant="caption" color={colors.black + '99'} style={{ fontSize: 12 }}>
        {desc}
      </Typography>
    </View>
  </View>
);

const AnchorItem = ({ label, cost, color, highlighted = false }: any) => (
  <View style={[styles.anchorItem, highlighted && styles.anchorHighlighted]}>
    <Typography variant="bodyXS" color={highlighted ? colors.white : colors.mediumGray} style={{ fontSize: 10 }}>
      {label}
    </Typography>
    <Typography variant="bodyBold" color={highlighted ? colors.white : color} style={{ fontSize: 13 }}>
      {cost}
    </Typography>
  </View>
);

const FeatureItem = ({ icon, text }: any) => (
  <View style={styles.featureItem}>
    <Ionicons name={icon} size={20} color={colors.pink} style={{ marginRight: spacing.md }} />
    <Typography variant="body" color={colors.black}>
      {text}
    </Typography>
  </View>
);

const styles = StyleSheet.create({
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.pink + '10',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radii.full,
    marginBottom: spacing.md,
    alignSelf: 'center',
  },
  anchorContainer: {
    backgroundColor: colors.white + '80',
    borderRadius: 16,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    marginVertical: spacing.md,
  },
  anchorGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  anchorHighlighted: {
    backgroundColor: colors.green,
    borderColor: colors.green,
  },
  anchorItem: {
    alignItems: 'center',
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 1,
    flex: 1,
    padding: spacing.xs,
  },
  content: {
    paddingBottom: spacing.sm,
  },
  divider: {
    backgroundColor: colors.border,
    height: 1,
    marginBottom: spacing.md,
  },
  featureItem: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  featureList: {
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  planCard: {
    backgroundColor: colors.white,
    borderRadius: 24,
    elevation: 4,
    padding: spacing.md,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
  },
  planHeader: {
    marginBottom: spacing.sm,
  },
  projectionBar: {
    alignItems: 'center',
    backgroundColor: colors.lightGray,
    borderRadius: radii.lg,
    flexDirection: 'row',
    justifyContent: 'center',
    padding: spacing.md,
  },
  projectionContainer: {
    marginTop: spacing.md,
  },
  timeline: {
    gap: 2,
  },
  timelineDot: {
    borderRadius: 5,
    height: 10,
    width: 10,
    zIndex: 1,
  },
  timelineLine: {
    bottom: -spacing.md,
    left: 4,
    position: 'absolute',
    top: 10,
    width: 2,
  },
});
