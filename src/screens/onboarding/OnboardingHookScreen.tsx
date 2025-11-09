import React, { useRef } from 'react';
import { View, StyleSheet, Animated, SafeAreaView, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { GradientBackground } from '../../components/onboarding/GradientBackground';
import { AnimatedRing } from '../../components/onboarding/AnimatedRing';
import { ProgressIndicator } from '../../components/onboarding/ProgressIndicator';
import { Button, Text } from '../../components';
import { theme, haptics } from '../../theme';

interface OnboardingHookScreenProps {
  onNext: () => void;
}

/**
 * Onboarding Hook Screen
 * First screen - Emotional trigger to build curiosity
 *
 * Psychology:
 * - Create curiosity ("What's wrong with MY body?")
 * - FOMO ("Most people never learn to listen")
 * - Anticipation for next step
 *
 * Animation:
 * - Ring forms 0-20% over 3s
 * - Text appears with stagger
 * - Soft haptic pulse (heartbeat rhythm)
 * - Button scales in from bottom
 */
export default function OnboardingHookScreen({ onNext }: OnboardingHookScreenProps) {
  const ringProgress = useRef(new Animated.Value(0)).current;
  const textOpacity1 = useRef(new Animated.Value(0)).current;
  const textOpacity2 = useRef(new Animated.Value(0)).current;
  const textOpacity3 = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(0.8)).current;
  const buttonOpacity = useRef(new Animated.Value(0)).current;

  useFocusEffect(
    React.useCallback(() => {
      // Reset animations when screen comes into focus
      ringProgress.setValue(0);
      textOpacity1.setValue(0);
      textOpacity2.setValue(0);
      textOpacity3.setValue(0);
      buttonScale.setValue(0.8);
      buttonOpacity.setValue(0);

      // Start ring animation (0-20%)
      Animated.timing(ringProgress, {
        toValue: 20,
        duration: 3000,
        useNativeDriver: false,
      }).start();

      // First text appears at 500ms
      Animated.timing(textOpacity1, {
        toValue: 1,
        duration: 500,
        delay: 500,
        useNativeDriver: true,
      }).start();

      // Second text appears at 2000ms
      Animated.timing(textOpacity2, {
        toValue: 1,
        duration: 500,
        delay: 2000,
        useNativeDriver: true,
      }).start();

      // Third text appears at 3500ms
      Animated.timing(textOpacity3, {
        toValue: 1,
        duration: 500,
        delay: 3500,
        useNativeDriver: true,
      }).start();

      // Button appears at 4000ms
      Animated.parallel([
        Animated.timing(buttonOpacity, {
          toValue: 1,
          duration: 400,
          delay: 4000,
          useNativeDriver: true,
        }),
        Animated.spring(buttonScale, {
          toValue: 1,
          tension: 20,
          friction: 8,
          delay: 4000,
          useNativeDriver: true,
        }),
      ]).start();

      // Soft haptic pulse (heartbeat rhythm)
      let pulseCount = 0;
      const pulseInterval = setInterval(() => {
        if (pulseCount < 8) {
          haptics.light();
          pulseCount++;
        } else {
          clearInterval(pulseInterval);
        }
      }, 2000); // Every 2 seconds

      return () => clearInterval(pulseInterval);
    }, [])
  );

  const handleNext = () => {
    haptics.medium();
    onNext();
  };

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          {/* Scrollable Content */}
          <ScrollView
            style={styles.scrollContent}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
          >
            {/* Progress Indicator */}
            <ProgressIndicator currentStep={-1} totalSteps={5} />

            {/* Title and Content */}
            <View style={styles.titleContainer}>
              <Animated.View style={{ opacity: textOpacity1, marginBottom: theme.spacing.lg }}>
                <Text variant="h2" align="center" style={styles.titleText}>
                  Your body is constantly talking.
                </Text>
              </Animated.View>

              <Animated.View style={{ opacity: textOpacity2, marginVertical: theme.spacing.xl }}>
                <Text variant="body" align="center" style={styles.bodyText}>
                  Most people never learn to listen.
                </Text>
              </Animated.View>

              <Animated.View style={{ opacity: textOpacity3, marginTop: theme.spacing.xl }}>
                <Text variant="body" align="center" style={styles.bodyText}>
                  FEEL helps you finally understand what your body is trying to tell you.
                </Text>
              </Animated.View>
            </View>

            {/* Ring Animation */}
            <View style={styles.ringContainer}>
              <Animated.View
                style={{
                  transform: [
                    {
                      scale: ringProgress.interpolate({
                        inputRange: [0, 20],
                        outputRange: [0.3, 1],
                      }),
                    },
                  ],
                }}
              >
                <AnimatedRing
                  progress={20}
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
                transform: [{ scale: buttonScale }],
                width: '100%',
              }}
            >
              <Button
                title="Show Me What I'm Missing"
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
  titleText: {
    color: theme.colors.brand.white,
  },
  bodyText: {
    color: theme.colors.brand.white,
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
