import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { GradientBackground } from '../../components/onboarding/GradientBackground';
import { BackButton } from '../../components/onboarding/BackButton';
import { AnimatedRing } from '../../components/onboarding/AnimatedRing';
import { ProgressIndicator } from '../../components/onboarding/ProgressIndicator';
import { Button, Text, Card } from '../../components';
import { theme, haptics } from '../../theme';
import { HealthMetrics } from '../../types/profile';

interface OnboardingSummaryScreenProps {
  metrics: HealthMetrics;
  onNavigateToDashboard: () => void;
}

/**
 * Onboarding Summary Screen
 * Seventh screen - Show calculated metrics (dopamine hit)
 *
 * Psychology:
 * - Instant gratification (see results immediately after loading)
 * - Personalized reveal (results feel custom-made)
 * - Clear next action (View Dashboard button)
 * - Visual closure with ring at 100%
 *
 * Animation:
 * - Ring at 100% with soft pulse
 * - Cards slide in with 0.15s stagger
 * - Numbers count up from 0 to final value
 * - Haptic on each card appear
 * - Button pulses to call attention
 */
export default function OnboardingSummaryScreen({
  metrics,
  onNavigateToDashboard,
}: OnboardingSummaryScreenProps) {
  const navigation = useNavigation();
  const card1Opacity = useRef(new Animated.Value(0)).current;
  const card1Translate = useRef(new Animated.Value(50)).current;
  const card2Opacity = useRef(new Animated.Value(0)).current;
  const card2Translate = useRef(new Animated.Value(50)).current;
  const card3Opacity = useRef(new Animated.Value(0)).current;
  const card3Translate = useRef(new Animated.Value(50)).current;

  const metabolicAge = useRef(new Animated.Value(0)).current;
  const gutScore = useRef(new Animated.Value(0)).current;
  const nutritionScore = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Card 1 animations
    Animated.parallel([
      Animated.timing(card1Opacity, {
        toValue: 1,
        duration: 500,
        delay: 300,
        useNativeDriver: true,
      }),
      Animated.spring(card1Translate, {
        toValue: 0,
        tension: 20,
        friction: 10,
        delay: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      haptics.light();
      // Start number count-up for metabolic age
      Animated.timing(metabolicAge, {
        toValue: metrics.metabolic_age,
        duration: 1000,
        useNativeDriver: false,
      }).start();
    });

    // Card 2 animations
    Animated.parallel([
      Animated.timing(card2Opacity, {
        toValue: 1,
        duration: 500,
        delay: 600,
        useNativeDriver: true,
      }),
      Animated.spring(card2Translate, {
        toValue: 0,
        tension: 20,
        friction: 10,
        delay: 600,
        useNativeDriver: true,
      }),
    ]).start(() => {
      haptics.light();
      // Start number count-up for gut score
      Animated.timing(gutScore, {
        toValue: metrics.gut_health_score,
        duration: 1000,
        useNativeDriver: false,
      }).start();
    });

    // Card 3 animations
    Animated.parallel([
      Animated.timing(card3Opacity, {
        toValue: 1,
        duration: 500,
        delay: 900,
        useNativeDriver: true,
      }),
      Animated.spring(card3Translate, {
        toValue: 0,
        tension: 20,
        friction: 10,
        delay: 900,
        useNativeDriver: true,
      }),
    ]).start(() => {
      haptics.light();
      // Start number count-up for nutrition score
      Animated.timing(nutritionScore, {
        toValue: metrics.nutrition_balance_score,
        duration: 1000,
        useNativeDriver: false,
      }).start();
    });
  }, [metrics]);

  const handleNavigate = () => {
    haptics.heavy();
    onNavigateToDashboard();
  };

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          {/* Back Button */}
          <BackButton onPress={() => navigation.goBack()} />

          {/* Scrollable Content */}
          <ScrollView
            style={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.contentContainer}
          >
            {/* Progress Indicator (5/5 - completed) */}
            <ProgressIndicator currentStep={4} totalSteps={5} />

            {/* Title */}
            <View style={styles.titleContainer}>
              <Text variant="h2" align="center" style={styles.title}>
                Here's your personalized FEEL dashboard
              </Text>
            </View>

            {/* Metrics Cards */}
            <View style={styles.cardsContainer}>
              {/* Card 1: Metabolic Age */}
              <Animated.View
                style={[
                  styles.cardWrapper,
                  {
                    opacity: card1Opacity,
                    transform: [{ translateY: card1Translate }],
                  },
                ]}
              >
                <MetricsCard
                  iconName="flash"
                  iconBg={theme.colors.brand.primary}
                  title="Metabolic Age"
                  value={metabolicAge}
                  targetValue={metrics.metabolic_age}
                  suffix=" years"
                  description="Your body performs like a"
                />
              </Animated.View>

              {/* Card 2: Gut Health Score */}
              <Animated.View
                style={[
                  styles.cardWrapper,
                  {
                    opacity: card2Opacity,
                    transform: [{ translateY: card2Translate }],
                  },
                ]}
              >
                <MetricsCard
                  iconName="bug"
                  iconBg={theme.colors.brand.secondary}
                  title="Gut Health Score"
                  value={gutScore}
                  targetValue={metrics.gut_health_score}
                  suffix="/100"
                  description="Above average — room to optimize"
                />
              </Animated.View>

              {/* Card 3: Nutrition Balance */}
              <Animated.View
                style={[
                  styles.cardWrapper,
                  {
                    opacity: card3Opacity,
                    transform: [{ translateY: card3Translate }],
                  },
                ]}
              >
                <MetricsCard
                  iconName="leaf"
                  iconBg={theme.colors.brand.tertiary}
                  title="Nutrition Balance"
                  value={nutritionScore}
                  targetValue={metrics.nutrition_balance_score}
                  suffix="/100"
                  description="Balanced, but we found gaps"
                />
              </Animated.View>
            </View>

            {/* Info Text */}
            <View style={styles.infoContainer}>
              <Text variant="caption" align="center" style={styles.infoText}>
                These scores will update daily as you log meals
              </Text>
            </View>

            {/* Ring Animation - Fixed Position */}
            <View style={styles.ringContainer}>
              <AnimatedRing
                progress={100}
                size={120}
                strokeWidth={8}
                color={theme.colors.brand.primary}
                glowing
                pulsing
              />
            </View>
          </ScrollView>

          {/* Fixed Footer Button */}
          <View style={styles.footer}>
            <Button
              title="View My Body Dashboard"
              onPress={handleNavigate}
              variant="ghost"
              size="large"
              fullWidth
              style={styles.blackButton}
              textStyle={styles.whiteButtonText}
            />
          </View>
        </View>
      </SafeAreaView>
    </GradientBackground>
  );
}

/**
 * Metrics Card Component
 */
interface MetricsCardProps {
  iconName: 'flash' | 'bug' | 'leaf';
  iconBg: string;
  title: string;
  value: Animated.Value;
  targetValue: number;
  suffix: string;
  description: string;
}

const MetricsCard: React.FC<MetricsCardProps> = ({
  iconName,
  iconBg,
  title,
  value,
  targetValue,
  suffix,
  description,
}) => {
  return (
    <Card variant="elevated" padding="large" style={styles.card}>
      <View style={styles.cardContent}>
        {/* Icon Container */}
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: iconBg },
          ]}
        >
          <Ionicons name={iconName} size={28} color={theme.colors.brand.white} />
        </View>

        {/* Text Content */}
        <View style={styles.textContent}>
          <Text variant="h5" style={styles.cardTitle}>
            {title}
          </Text>

          {/* Animated Value */}
          <Animated.View style={styles.valueContainer}>
            <AnimatedNumber value={value} targetValue={targetValue} suffix={suffix} />
          </Animated.View>

          <Text variant="caption" style={styles.description}>
            {description}
          </Text>
        </View>
      </View>
    </Card>
  );
};

/**
 * Animated Number Component
 */
const AnimatedNumber: React.FC<{
  value: Animated.Value;
  targetValue: number;
  suffix: string;
}> = ({ value, targetValue, suffix }) => {
  return (
    <Animated.Text
      style={[
        styles.animatedValue,
      ]}
    >
      <Animated.Text
        numberOfLines={1}
        style={{
          fontWeight: '700',
          fontSize: 32,
          color: theme.colors.brand.primary,
        }}
      >
        {value.interpolate({
          inputRange: [0, targetValue],
          outputRange: ['0', Math.round(targetValue).toString()],
        })}
      </Animated.Text>
      <Text style={styles.suffix}>{suffix}</Text>
    </Animated.Text>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    flexDirection: 'column',
  },
  scrollContent: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
  },
  contentContainer: {
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.lg,
    gap: theme.spacing.lg,
  },
  titleContainer: {
    gap: theme.spacing.lg,
    marginTop: theme.spacing.xl,
  },
  title: {
    color: theme.colors.brand.white,
  },
  cardsContainer: {
    gap: theme.spacing.md,
    marginBottom: theme.spacing['2xl'],
  },
  cardWrapper: {
    width: '100%',
  },
  card: {
    backgroundColor: theme.colors.brand.white,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.lg,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  textContent: {
    flex: 1,
    gap: theme.spacing.sm,
  },
  cardTitle: {
    color: theme.colors.brand.black,
  },
  valueContainer: {
    marginVertical: theme.spacing.xs,
  },
  animatedValue: {
    fontWeight: '700',
    fontSize: 32,
    color: theme.colors.brand.primary,
  },
  suffix: {
    fontSize: 14,
    color: theme.colors.brand.primary,
    fontWeight: '500',
  },
  description: {
    color: theme.colors.brand.black,
  },
  infoContainer: {
    marginVertical: theme.spacing.lg,
  },
  infoText: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  ringContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: theme.spacing['2xl'],
  },
  footer: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
    borderTopWidth: 0,
  },
  blackButton: {
    backgroundColor: theme.colors.brand.black,
    borderWidth: 0,
  },
  whiteButtonText: {
    color: theme.colors.brand.white,
  },
});
