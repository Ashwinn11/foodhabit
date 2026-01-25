/**
 * Base Onboarding Screen Component
 * Provides consistent layout for all onboarding screens
 */
import React from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '../../theme';
import { Typography } from '../Typography';
import { Button } from '../Button';
import { OnboardingProgressBar } from './OnboardingProgressBar';
import { ScreenWrapper } from '../ScreenWrapper';

interface OnboardingScreenProps {
  currentStep: number;
  totalSteps: number;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  onNext: () => void;
  onBack?: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  showBackButton?: boolean;
  centerContent?: boolean;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({
  currentStep,
  totalSteps,
  title,
  subtitle,
  children,
  onNext,
  onBack,
  nextLabel = 'Continue',
  nextDisabled = false,
  showBackButton = true,
  centerContent = false,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <ScreenWrapper useGradient={true} style={styles.container}>
      {/* Header with back button and progress bar on same line */}
      <View style={styles.header}>
        {showBackButton && onBack ? (
          <Pressable style={styles.backButton} onPress={onBack}>
            <Ionicons name="chevron-back" size={28} color={colors.black} />
          </Pressable>
        ) : (
          <View style={styles.backButtonPlaceholder} />
        )}
        
        <View style={styles.progressBarContainer}>
          <OnboardingProgressBar currentStep={currentStep} totalSteps={totalSteps} />
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          centerContent && styles.centeredContent,
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View
          entering={FadeIn.duration(300)}
          exiting={FadeOut.duration(200)}
        >
          <Typography
            variant="h2"
            align={centerContent ? 'center' : 'left'}
            style={styles.title}
          >
            {title}
          </Typography>
          
          {subtitle && (
            <Typography
              variant="body"
              color={colors.black + '99'} // Increased opacity for readability on gradient
              align={centerContent ? 'center' : 'left'}
              style={styles.subtitle}
            >
              {subtitle}
            </Typography>
          )}
        </Animated.View>

        <View style={styles.childrenContainer}>
          {children}
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom }]}>
        <Button
          title={nextLabel}
          onPress={onNext}
          disabled={nextDisabled}
          style={styles.nextButton}
          size="lg"
        />
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    gap: spacing.sm,
  },
  backButton: {
    padding: spacing.sm,
    backgroundColor: colors.white + '80',
    borderRadius: 20,
  },
  backButtonPlaceholder: {
    width: 44, // Same width as back button to maintain alignment
  },
  progressBarContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing['3xl'],
    paddingBottom: 120, // Extra space for absolute footer
  },
  centeredContent: {
    alignItems: 'center',
    justifyContent: 'center',
    flexGrow: 1,
  },
  title: {
    marginBottom: spacing.sm,
  },
  subtitle: {
    marginBottom: spacing['2xl'],
  },
  childrenContainer: {
    flex: 1,
    marginTop: spacing.lg,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    backgroundColor: 'transparent',
  },
  nextButton: {
    width: '100%',
  },
});
