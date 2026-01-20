import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { OnboardingScreen } from '../../components/Onboarding';
import { useOnboardingStore } from '../../store/onboardingStore';
import { useNavigation } from '@react-navigation/native';
import { Typography, Card, ScreenWrapper } from '../../components';
import { colors, spacing, radii } from '../../theme';
import Animated, { FadeIn, Layout } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { RevenueCatService } from '../../services/revenueCatService';
import * as StoreReview from 'expo-store-review';

export const OnboardingCustomPlanScreen = () => {
  const navigation = useNavigation<any>();
  const { quizAnswers, totalSteps, setCurrentStep } = useOnboardingStore();
  const [isGenerating, setIsGenerating] = useState(true);
  
  useEffect(() => {
    const timer = setTimeout(async () => {
      setIsGenerating(false);
      
      // Prompt for rating after "analysis" is complete
      if (await StoreReview.hasAction()) {
        StoreReview.requestReview();
      }
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  const handleNext = async () => {

    
    // Show paywall (hard paywall - must purchase to proceed)
    try {

      const paywallResult = await RevenueCatService.presentPaywall();

      
      // Check if user actually purchased (force refresh to bypass cache)
      const isPremium = await RevenueCatService.isPremium(true);

      
      // Also check the paywall result for immediate feedback
      const purchasedOrRestored = paywallResult === 'PURCHASED' || paywallResult === 'RESTORED';
      
      if (!isPremium && !purchasedOrRestored) {
        // User closed paywall without purchasing - stay on onboarding screen

        return; // Exit early, don't complete onboarding
      }
      
      // User purchased! Proceed with onboarding completion

      
    } catch (error) {
      console.error('❌ Paywall error:', error);
      // On error, stay on onboarding screen
      return;
    }
    
    // Update database - single source of truth

    const { supabase } = await import('../../config/supabase');
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session?.user?.id) {
      const { error } = await supabase
        .from('users')
        .update({ 
          onboarding_completed: true,
          onboarding_data: quizAnswers 
        })
        .eq('id', session.user.id);
      
      if (error) {
        console.error('❌ Database update error:', error);
      } else {

        // Trigger App.tsx to re-check onboarding status
        // @ts-ignore
        if (global.refreshOnboardingStatus) {
          // @ts-ignore
          global.refreshOnboardingStatus();
        }
      }
    }
  };

  const handleBack = () => {
    navigation.goBack();
    setCurrentStep(4);
  };

  if (isGenerating) {
    return (
      <ScreenWrapper useGradient={true}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.pink} />
          <Typography variant="h3" style={styles.loadingText}>Creating your custom plan...</Typography>
          <Typography variant="body" color={colors.black + '66'}>Analyzing your profile</Typography>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <OnboardingScreen
      currentStep={5}
      totalSteps={totalSteps}
      title="Your Personal Plan"
      subtitle="The 90-Day Gut Buddy Protocol tailored for you."
      onNext={handleNext}
      onBack={handleBack}
      nextLabel="Get Started"
    >
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: spacing.xl }}>
        <Animated.View entering={FadeIn} layout={Layout}>
          <Card style={styles.planCard}>
            <View style={styles.planHeader}>
              <View style={styles.iconCircle}>
                <Ionicons name="document-text" size={32} color={colors.white} />
              </View>
              <View>
                <Typography variant="bodyBold">Personal Protocol</Typography>
                <Typography variant="caption" color={colors.pink}>90 Days to Success</Typography>
              </View>
            </View>
            
            <View style={styles.divider} />
            
            <TimelineItem title="Phase 1: Calm" duration="Week 1" desc="Reduce inflammation and soothe gut lining." color={colors.pink} />
            <TimelineItem title="Phase 2: Restore" duration="Week 2-4" desc="Rebuild bacterial diversity with smart hydration." color={colors.yellow} />
            <TimelineItem title="Phase 3: Heal" duration="Week 5-12" desc="Sustain clear skin and optimal energy." color={colors.blue} isLast />
          </Card>

          <View style={styles.featuresList}>
            <PlanItem icon="leaf-outline" text="Fiber-focused nutrition guide" />
            <PlanItem icon="water-outline" text="Smart hydration tracking" />
            <PlanItem icon="pulse-outline" text="Stress-management routines" />
          </View>
        </Animated.View>
      </ScrollView>
    </OnboardingScreen>
  );
};

const TimelineItem = ({ title, duration, desc, color, isLast }: any) => (
  <View style={{ flexDirection: 'row', marginBottom: isLast ? 0 : spacing.md }}>
    <View style={{ alignItems: 'center', width: 24, marginRight: spacing.md }}>
      <View style={[styles.timelineDot, { backgroundColor: color }]} />
      {!isLast && <View style={[styles.timelineLine, { backgroundColor: color + '30' }]} />}
    </View>
    <View style={{ flex: 1 }}>
      <Typography variant="bodyBold">{title} <Typography variant="caption" color={color}>{duration}</Typography></Typography>
      <Typography variant="caption" color={colors.black + '99'}>{desc}</Typography>
    </View>
  </View>
);

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
    backgroundColor: 'transparent',
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
    backgroundColor: colors.white,
    borderRadius: radii.xl,
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
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
    backgroundColor: colors.white + '80',
    padding: spacing.md,
    borderRadius: radii.md,
  },
  planItemText: {
    marginLeft: spacing.md,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    zIndex: 1,
  },
  timelineLine: {
    position: 'absolute',
    top: 12,
    width: 2,
    bottom: -spacing.md,
    left: 11,
  },
  featuresList: {
    marginTop: spacing.lg,
  }
});
