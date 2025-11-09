import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, SafeAreaView, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { GradientBackground } from '../../components/onboarding/GradientBackground';
import { AnimatedRing } from '../../components/onboarding/AnimatedRing';
import { ProgressIndicator } from '../../components/onboarding/ProgressIndicator';
import { BackButton } from '../../components/onboarding/BackButton';
import { Button, Text, Card } from '../../components';
import { theme, haptics } from '../../theme';

interface OnboardingEducationScreenProps {
  onNext: () => void;
  ringProgress: number;
}

/**
 * Onboarding Education Screen
 * Second screen - Show value proposition
 *
 * Psychology:
 * - Display what user will get
 * - Create excitement for next step
 * - Show personalized insights they'll receive
 *
 * Animation:
 * - Ring progresses 20% → 35%
 * - 3 cards slide in from bottom with stagger (0.15s between each)
 * - Each card glows on appear
 * - Haptic on each card appear
 */
export default function OnboardingEducationScreen({
  onNext,
  ringProgress,
}: OnboardingEducationScreenProps) {
  const navigation = useNavigation();
  const cardOpacity1 = useRef(new Animated.Value(0)).current;
  const cardTranslate1 = useRef(new Animated.Value(50)).current;
  const cardOpacity2 = useRef(new Animated.Value(0)).current;
  const cardTranslate2 = useRef(new Animated.Value(50)).current;
  const cardOpacity3 = useRef(new Animated.Value(0)).current;
  const cardTranslate3 = useRef(new Animated.Value(50)).current;
  const buttonOpacity = useRef(new Animated.Value(0)).current;
  const ringValue = useRef(new Animated.Value(ringProgress)).current;

  useEffect(() => {
    // Update ring progress
    Animated.timing(ringValue, {
      toValue: 35,
      duration: 2000,
      useNativeDriver: false,
    }).start();

    // Card 1: Appear at 300ms
    Animated.parallel([
      Animated.timing(cardOpacity1, {
        toValue: 1,
        duration: 500,
        delay: 300,
        useNativeDriver: true,
      }),
      Animated.spring(cardTranslate1, {
        toValue: 0,
        tension: 20,
        friction: 10,
        delay: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      haptics.light();
    });

    // Card 2: Appear at 600ms
    Animated.parallel([
      Animated.timing(cardOpacity2, {
        toValue: 1,
        duration: 500,
        delay: 600,
        useNativeDriver: true,
      }),
      Animated.spring(cardTranslate2, {
        toValue: 0,
        tension: 20,
        friction: 10,
        delay: 600,
        useNativeDriver: true,
      }),
    ]).start(() => {
      haptics.light();
    });

    // Card 3: Appear at 900ms
    Animated.parallel([
      Animated.timing(cardOpacity3, {
        toValue: 1,
        duration: 500,
        delay: 900,
        useNativeDriver: true,
      }),
      Animated.spring(cardTranslate3, {
        toValue: 0,
        tension: 20,
        friction: 10,
        delay: 900,
        useNativeDriver: true,
      }),
    ]).start(() => {
      haptics.light();
    });

    // Button: Appear at 1400ms
    Animated.timing(buttonOpacity, {
      toValue: 1,
      duration: 400,
      delay: 1400,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleNext = () => {
    haptics.medium();
    onNext();
  };

  const educationCards = [
    {
      iconName: 'flash' as const,
      title: 'Metabolic Age',
      description: 'Discover how young your body actually performs',
      iconBg: theme.colors.brand.primary,
    },
    {
      iconName: 'bug' as const,
      title: 'Gut Health Score',
      description: 'Know when your digestion feels off balance',
      iconBg: theme.colors.brand.secondary,
    },
    {
      iconName: 'leaf' as const,
      title: 'Nutrition Balance',
      description: 'See which foods fuel or drain your energy',
      iconBg: theme.colors.brand.tertiary,
    },
  ];

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          {/* Back Button */}
          <BackButton onPress={() => navigation.goBack()} />

          {/* Scrollable Content */}
          <ScrollView
            style={styles.scrollContent}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
          >
            {/* Progress Indicator */}
            <ProgressIndicator currentStep={0} totalSteps={5} />

            {/* Title */}
            <View style={styles.titleContainer}>
              <Text variant="h2" align="center" style={styles.title}>
                Here's what FEEL reveals about you
              </Text>
            </View>

            {/* Cards */}
            {/* Card 1 */}
            <Animated.View
              style={[
                styles.cardWrapper,
                {
                  opacity: cardOpacity1,
                  transform: [{ translateY: cardTranslate1 }],
                },
              ]}
            >
              <EducationCard card={educationCards[0]} />
            </Animated.View>

            {/* Card 2 */}
            <Animated.View
              style={[
                styles.cardWrapper,
                {
                  opacity: cardOpacity2,
                  transform: [{ translateY: cardTranslate2 }],
                },
              ]}
            >
              <EducationCard card={educationCards[1]} />
            </Animated.View>

            {/* Card 3 */}
            <Animated.View
              style={[
                styles.cardWrapper,
                {
                  opacity: cardOpacity3,
                  transform: [{ translateY: cardTranslate3 }],
                },
              ]}
            >
              <EducationCard card={educationCards[2]} />
            </Animated.View>

            {/* Ring Animation - Fixed Position */}
            <View style={styles.ringContainer}>
              <Animated.View
                style={{
                  transform: [
                    {
                      scale: ringValue.interpolate({
                        inputRange: [20, 35],
                        outputRange: [0.8, 1],
                      }),
                    },
                  ],
                }}
              >
                <AnimatedRing
                  progress={35}
                  size={120}
                  strokeWidth={7}
                  color={theme.colors.brand.primary}
                  glowing
                />
              </Animated.View>
            </View>
          </ScrollView>

          {/* Fixed Footer Button */}
          <View style={styles.footer}>
            <Animated.View
              style={{
                opacity: buttonOpacity,
                width: '100%',
              }}
            >
              <Button
                title="Build My Personal Profile"
                onPress={handleNext}
                variant="ghost"
                size="large"
                fullWidth
                style={styles.blackButton}
                textStyle={styles.whiteButtonText}
              />
            </Animated.View>
          </View>
        </View>
      </SafeAreaView>
    </GradientBackground>
  );
}

/**
 * Education Card Component
 */
interface EducationCardProps {
  card: {
    iconName: 'flash' | 'bug' | 'leaf';
    title: string;
    description: string;
    iconBg: string;
  };
}

const EducationCard: React.FC<EducationCardProps> = ({ card }) => {
  return (
    <Card variant="elevated" padding="large" style={styles.card}>
      <View style={styles.cardContent}>
        {/* Icon Container */}
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: card.iconBg },
          ]}
        >
          <Ionicons name={card.iconName} size={28} color={theme.colors.brand.white} />
        </View>

        {/* Text Content */}
        <View style={styles.textContent}>
          <Text variant="h5" style={styles.cardTitle}>
            {card.title}
          </Text>
          <Text variant="body" style={styles.cardDescription}>
            {card.description}
          </Text>
        </View>
      </View>
    </Card>
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
  cardWrapper: {
    width: '100%',
    marginBottom: theme.spacing.md,
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
  cardDescription: {
    color: theme.colors.brand.black,
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
