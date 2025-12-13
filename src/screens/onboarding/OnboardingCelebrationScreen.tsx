import React, { useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Text, Button, Container } from '../../components';
import { theme, haptics } from '../../theme';

interface OnboardingCelebrationScreenProps {
  name: string;
  onContinue: () => void;
}

export default function OnboardingCelebrationScreen({
  name,
  onContinue,
}: OnboardingCelebrationScreenProps) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(100)).current;

  useEffect(() => {
    // Celebrate icon animation
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 30,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 20,
          friction: 8,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    haptics.patterns.success();
  }, []);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[
          theme.colors.background.primary,
          theme.colors.background.card,
        ]}
        style={StyleSheet.absoluteFillObject}
      />

      <Container variant="plain" style={styles.contentContainer}>
        {/* Celebration Icon */}
        <Animated.View
          style={[
            styles.iconContainer,
            {
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <View style={styles.iconCircle}>
            <Ionicons
              name="checkmark"
              size={80}
              color={theme.colors.brand.primary}
            />
          </View>
        </Animated.View>

        {/* Spacer */}
        <View style={{ flex: 0.3 }} />

        {/* Content */}
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Text variant="largeTitle" align="center" style={styles.title}>
            You Did It!
          </Text>

          <Text
            variant="body"
            align="center"
            style={[styles.subtitle, { color: theme.colors.text.secondary }]}
          >
            Entry 1 of 3
          </Text>

          {/* Progress towards insight */}
          <View style={styles.progressSection}>
            <Text variant="headline" style={styles.progressLabel}>
              Progress to First Insight
            </Text>
            <View style={styles.progressBarContainer}>
              <LinearGradient
                colors={[
                  theme.colors.brand.primary,
                  theme.colors.brand.secondary,
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.progressBar, { width: '33%' }]}
              />
            </View>
            <View style={styles.progressSteps}>
              {[1, 2, 3].map((num) => (
                <View key={num} style={styles.progressStep}>
                  <View
                    style={[
                      styles.stepNumber,
                      num <= 1 && styles.stepNumberActive,
                    ]}
                  >
                    {num <= 1 ? (
                      <Ionicons
                        name="checkmark"
                        size={16}
                        color={theme.colors.brand.white}
                      />
                    ) : (
                      <Text style={styles.stepNumberText}>{num}</Text>
                    )}
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Next Steps */}
          <View style={styles.nextStepsSection}>
            <Text variant="headline" style={styles.nextStepsTitle}>
              What's Next?
            </Text>

            <NextStep
              icon="logo-apple"
              title="Log 2 More Entries"
              description="Once you have 3 entries, I'll reveal your first trigger"
            />

            <NextStep
              icon="mail"
              title="Daily Reminder"
              description="I'll remind you tomorrow morning to log your entry"
            />

            <NextStep
              icon="analytics"
              title="First Insight"
              description="After 3 days, you'll discover what's triggering your issues"
            />
          </View>
        </Animated.View>

        {/* Spacer */}
        <View style={{ flex: 1 }} />

        {/* Continue Button */}
        <Button
          title="Go to Home"
          onPress={() => {
            haptics.patterns.buttonPress();
            onContinue();
          }}
          variant="primary"
          size="large"
          fullWidth
          style={styles.button}
        />
      </Container>
    </View>
  );
}

interface NextStepProps {
  icon: string;
  title: string;
  description: string;
}

function NextStep({ icon, title, description }: NextStepProps) {
  return (
    <View style={styles.nextStep}>
      <View style={styles.nextStepIcon}>
        <Ionicons
          name={icon as any}
          size={24}
          color={theme.colors.brand.primary}
        />
      </View>
      <View style={styles.nextStepContent}>
        <Text variant="headline" style={styles.nextStepTitle}>
          {title}
        </Text>
        <Text variant="body" color="secondary" style={styles.nextStepDesc}>
          {description}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: theme.spacing['2xl'],
    paddingTop: theme.spacing['2xl'],
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  iconCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: `${theme.colors.brand.primary}20`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  title: {
    marginBottom: theme.spacing.sm,
    color: theme.colors.text.primary,
  },
  subtitle: {
    marginBottom: theme.spacing.xl,
  },
  progressSection: {
    marginBottom: theme.spacing['2xl'],
  },
  progressLabel: {
    marginBottom: theme.spacing.md,
    fontSize: 16,
    color: theme.colors.text.primary,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: `${theme.colors.text.primary}20`,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: theme.spacing.lg,
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  progressSteps: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
  },
  progressStep: {
    alignItems: 'center',
  },
  stepNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.background.card,
    borderWidth: 2,
    borderColor: `${theme.colors.text.primary}30`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumberActive: {
    backgroundColor: theme.colors.brand.primary,
    borderColor: theme.colors.brand.primary,
  },
  stepNumberText: {
    color: theme.colors.text.secondary,
    fontWeight: '600',
  },
  nextStepsSection: {
    marginBottom: theme.spacing['2xl'],
  },
  nextStepsTitle: {
    marginBottom: theme.spacing.lg,
    color: theme.colors.text.primary,
  },
  nextStep: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  nextStepIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: `${theme.colors.brand.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextStepContent: {
    flex: 1,
    justifyContent: 'center',
  },
  nextStepTitle: {
    marginBottom: theme.spacing.xs,
    fontSize: 16,
    color: theme.colors.text.primary,
  },
  nextStepDesc: {
    fontSize: 14,
    lineHeight: 20,
  },
  button: {
    marginBottom: theme.spacing['3xl'],
  },
});
