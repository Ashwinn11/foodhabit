import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { OnboardingScreen } from '../../components/Onboarding';
import { useOnboardingStore } from '../../store/onboardingStore';
import { useNavigation } from '@react-navigation/native';
import { Typography, Card } from '../../components';
import { colors, spacing } from '../../theme';
import Animated, { FadeIn, Layout } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { RevenueCatService } from '../../services/revenueCatService';

export const OnboardingCustomPlanScreen = () => {
  const navigation = useNavigation<any>();
  const { quizAnswers, totalSteps, completeOnboarding, setCurrentStep } = useOnboardingStore();
  const [isGenerating, setIsGenerating] = useState(true);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsGenerating(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  const handleNext = async () => {
    // Show RevenueCat Paywall "GutScan Pro"
    await RevenueCatService.presentPaywall();
    
    // Always complete onboarding to enter the main app regardless of purchase 
    // (standard logic for high-converting flows where purchase is elective but highlighted)
    completeOnboarding();
  };

  const handleBack = () => {
    navigation.goBack();
    setCurrentStep(5);
  };

  if (isGenerating) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.pink} />
        <Typography variant="h3" style={styles.loadingText}>Creating your custom plan...</Typography>
        <Typography variant="body" color={colors.black + '66'}>Analyzing your profile</Typography>
      </View>
    );
  }

  return (
    <OnboardingScreen
      currentStep={6}
      totalSteps={totalSteps}
      title="Your Personal Plan"
      subtitle="Ready to transform your health."
      onNext={handleNext}
      onBack={handleBack}
      nextLabel="Get Started"
    >
      <Animated.View entering={FadeIn} layout={Layout}>
        <Card style={styles.planCard}>
          <View style={styles.planHeader}>
            <View style={styles.iconCircle}>
              <Ionicons name="document-text" size={32} color={colors.white} />
            </View>
            <View>
              <Typography variant="bodyBold">Gut Buddy Protocol</Typography>
              <Typography variant="caption">90-Day Transformation</Typography>
            </View>
          </View>
          
          <View style={styles.divider} />
          
          <PlanItem icon="leaf-outline" text="Fiber-focused nutrition guide" />
          <PlanItem icon="water-outline" text="Smart hydration tracking" />
          <PlanItem icon="fitness-outline" text="Stress-management routines" />
          <PlanItem icon="alarm-outline" text="Optimized meal timing" />
        </Card>

        <Typography variant="bodySmall" align="center" color={colors.black + '66'} style={styles.footerNote}>
          Specifically designed for your {quizAnswers.healthGoal?.replace('_', ' ')} goal.
        </Typography>
      </Animated.View>
    </OnboardingScreen>
  );
};

const PlanItem = ({ icon, text }: { icon: any, text: string }) => (
  <View style={styles.planItem}>
    <Ionicons name={icon} size={20} color={colors.pink} />
    <Typography variant="bodySmall" style={styles.planItemText}>{text}</Typography>
  </View>
);

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: spacing.xl,
  },
  loadingText: {
    marginTop: spacing.xl,
    marginBottom: spacing.xs,
  },
  planCard: {
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white + 'CC', // Slightly translucent for gradient
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.pink,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginBottom: spacing.lg,
  },
  planItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  planItemText: {
    marginLeft: spacing.md,
  },
  footerNote: {
    marginTop: spacing.xl,
  }
});
