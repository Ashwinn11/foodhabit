import React from 'react';
import { View, ScrollView, SafeAreaView, StyleSheet } from 'react-native';
import { GradientBackground } from './GradientBackground';
import { AnimatedRing } from './AnimatedRing';
import { ProgressIndicator } from './ProgressIndicator';
import { theme } from '../../theme';

interface OnboardingLayoutProps {
  children: React.ReactNode;
  footer: React.ReactNode;
  ringProgress: number;
  currentStep: number;
  totalSteps: number;
}

/**
 * Consistent onboarding layout with fixed ring position
 *
 * Layout structure:
 * - Progress indicator (top)
 * - Scrollable content (middle)
 * - Animated ring (FIXED middle-right position)
 * - Fixed footer button (bottom)
 */
export const OnboardingLayout: React.FC<OnboardingLayoutProps> = ({
  children,
  footer,
  ringProgress,
  currentStep,
  totalSteps,
}) => {
  return (
    <GradientBackground>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          {/* Progress Indicator */}
          <View style={styles.progressContainer}>
            <ProgressIndicator currentStep={currentStep} totalSteps={totalSteps} />
          </View>

          {/* Main Content Area with Ring Overlay */}
          <View style={styles.contentArea}>
            {/* Scrollable Content */}
            <ScrollView
              style={styles.scrollContent}
              contentContainerStyle={styles.contentContainer}
              showsVerticalScrollIndicator={false}
            >
              {children}
            </ScrollView>

            {/* Fixed Ring Position (overlaid on right side) */}
            <View style={styles.ringOverlay}>
              <AnimatedRing
                progress={ringProgress}
                size={140}
                strokeWidth={8}
                color={theme.colors.brand.primary}
                glowing
              />
            </View>
          </View>

          {/* Fixed Footer Button */}
          <View style={styles.footer}>
            {footer}
          </View>
        </View>
      </SafeAreaView>
    </GradientBackground>
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
  progressContainer: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
  },
  contentArea: {
    flex: 1,
    position: 'relative',
  },
  scrollContent: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
  },
  contentContainer: {
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing['2xl'],
    gap: theme.spacing.lg,
  },
  ringOverlay: {
    position: 'absolute',
    right: theme.spacing.lg,
    top: '50%',
    transform: [{ translateY: -70 }],
    zIndex: 1,
  },
  footer: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
  },
});
