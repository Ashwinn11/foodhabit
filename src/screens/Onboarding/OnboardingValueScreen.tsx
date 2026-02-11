import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { OnboardingScreen, ReviewCard } from '../../components/Onboarding';
import { useOnboardingStore } from '../../store/onboardingStore';
import { useNavigation } from '@react-navigation/native';
import { Typography, Card, IconContainer } from '../../components';
import { colors, spacing, radii } from '../../theme';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { analyticsService } from '../../analytics/analyticsService';

const VALUE_PROPOSITIONS = [
  { icon: 'search', title: 'Stop Bloating', desc: 'AI pinpoints pain.', color: colors.blue },
  { icon: 'checkbox', title: 'Heal Daily', desc: 'Easy daily habits.', color: colors.pink },
  { icon: 'stats-chart', title: 'See Progress', desc: 'Weekly reports.', color: colors.yellow },
  { icon: 'grid', title: 'Quick Track', desc: 'Widgets for logging.', color: colors.blue },
];

const FEATURES = [
  { icon: 'scan', text: 'AI Food Scanner', subtext: 'Know if it\'s safe to eat instantly.', color: colors.blue },
  { icon: 'trending-up', text: 'Smart Trigger Tracking', subtext: 'Discover what specifically hurts you.', color: colors.pink },
  { icon: 'calendar', text: 'Personalized Daily Plan', subtext: 'Step-by-step roadmap to consistency.', color: colors.yellow },
  { icon: 'notifications', text: 'Intelligent Reminders', subtext: 'Stay on track with your water & meds.', color: colors.green },
];

export const OnboardingValueScreen = () => {
  const navigation = useNavigation<any>();
  const { totalSteps, setCurrentStep } = useOnboardingStore();

  useEffect(() => {
    analyticsService.trackOnboardingScreenView('value', 9, totalSteps);
  }, [totalSteps]);

  const handleNext = () => {
    setCurrentStep(12);
    navigation.navigate('OnboardingPaywall');
  };

  const handleBack = () => {
    navigation.goBack();
    setCurrentStep(10);
  };

  return (
    <OnboardingScreen
      currentStep={11}
      totalSteps={totalSteps}
      title="Your Transformation Awaits"
      subtitle="Everything you need to heal & optimize"
      onNext={handleNext}
      onBack={handleBack}
      nextLabel="View Pricing"
    >
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: spacing.xl }}>

        {/* Confidence Message */}
        <Animated.View entering={FadeInDown.delay(100)} style={styles.messageContainer}>
          <View style={styles.speechBubble}>
            <Typography variant="bodyBold" color={colors.white}>
              We've got this! <Ionicons name="rocket" size={16} color={colors.white} />
            </Typography>
          </View>
        </Animated.View>

        {/* Value Grid (2x2) */}
        <Animated.View entering={FadeInDown.delay(150)} style={styles.gridContainer}>
          {VALUE_PROPOSITIONS.map((value, index) => (
            <View key={index} style={styles.valueGridItem}>
              <IconContainer
                name={value.icon as any}
                size={56}
                iconSize={28}
                color={value.color}
                variant="solid"
                shadow={false}
              />
              <Typography variant="bodyBold" color={colors.black} style={{ marginTop: spacing.xs, fontSize: 14 }}>
                {value.title}
              </Typography>
              <Typography variant="caption" color={colors.mediumGray} align="center" style={{ marginTop: 2 }}>
                {value.desc}
              </Typography>
            </View>
          ))}
        </Animated.View>

        {/* Trust Badges */}
        <Animated.View entering={FadeInDown.delay(200)} style={styles.badgesContainer}>
          <View style={styles.badgeRow}>
            <View style={styles.miniBadge}>
              <Ionicons name="shield-checkmark" size={14} color={colors.green} />
              <Typography variant="bodyXS" style={{ marginLeft: 4 }}>100% Private</Typography>
            </View>
            <View style={styles.miniBadge}>
              <Ionicons name="flash" size={14} color={colors.yellow} />
              <Typography variant="bodyXS" style={{ marginLeft: 4 }}>AI-Powered</Typography>
            </View>
          </View>
        </Animated.View>

        {/* Social Proof Stats */}
        <Animated.View entering={FadeInDown.delay(250)}>
          <Card style={styles.statsCard}>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Typography variant="h2" color={colors.black}>92%</Typography>
                <Typography variant="caption" align="center" color={colors.black + '99'}>
                  Feel Better in 2 Weeks
                </Typography>
              </View>
              <View style={styles.divider} />
              <View style={styles.statItem}>
                <Typography variant="h2" color={colors.pink}>4.9★</Typography>
                <Typography variant="caption" align="center" color={colors.black + '99'}>
                  App Store Rating
                </Typography>
              </View>
            </View>
          </Card>
        </Animated.View>

        {/* Key Features */}
        <Animated.View entering={FadeInDown.delay(300)}>
          <Typography variant="bodyBold" style={{ marginTop: spacing.lg, marginBottom: spacing.md }}>
            Key Features
          </Typography>
          {FEATURES.slice(0, 2).map((feature, index) => (
            <Card key={index} style={styles.featureCard}>
              <IconContainer
                name={feature.icon as any}
                size={48}
                iconSize={24}
                color={feature.color}
                variant="solid"
                style={{ marginRight: spacing.lg }}
              />
              <View style={{ flex: 1 }}>
                <Typography variant="bodyBold" color={colors.black}>
                  {feature.text}
                </Typography>
                <Typography variant="caption" color={colors.mediumGray}>
                  {feature.subtext}
                </Typography>
              </View>
            </Card>
          ))}
        </Animated.View>

        {/* Testimonial */}
        <Animated.View entering={FadeInDown.delay(350)} style={{ marginTop: spacing.lg }}>
          <ReviewCard
            name="Sarah M."
            rating={5}
            review="The bloating is GONE! Now I can wear my jeans without pain."
          />
        </Animated.View>

        {/* 90-Day Transformation Card */}
        <Animated.View entering={FadeInDown.delay(400)}>
          <Card style={styles.transformationCard}>
            <Typography variant="bodyBold" color={colors.black}>
              90-DAY TRANSFORMATION
            </Typography>
            <Typography variant="bodySmall" color={colors.black + '99'} style={{ marginTop: spacing.xs }}>
              Most users feel significant relief within the first 14 days.
            </Typography>
          </Card>
        </Animated.View>

      </ScrollView>
    </OnboardingScreen>
  );
};

const styles = StyleSheet.create({
  messageContainer: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  speechBubble: {
    backgroundColor: colors.pink,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.lg,
    marginTop: spacing.sm,
    alignItems: 'center',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  valueGridItem: {
    width: '48%',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.lg,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  badgesContainer: {
    marginBottom: spacing.lg,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'center',
  },
  miniBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.lightGray,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.full,
  },
  statsCard: {
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderWidth: 1,
    marginBottom: spacing.lg,
    padding: spacing.md,
  },
  statsRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  divider: {
    backgroundColor: colors.border,
    height: 40,
    width: 1,
  },
  featureCard: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: radii.xl,
    borderWidth: 1,
    flexDirection: 'row',
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  transformationCard: {
    backgroundColor: colors.pink + '15',
    borderColor: colors.pink,
    borderWidth: 1,
    padding: spacing.md,
    borderRadius: radii.xl,
    marginTop: spacing.lg,
  },
});
