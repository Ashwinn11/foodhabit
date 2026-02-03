import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { OnboardingScreen } from '../../components/Onboarding';
import { useOnboardingStore } from '../../store/onboardingStore';
import { useNavigation } from '@react-navigation/native';
import { Typography, Card, ScreenWrapper } from '../../components';
import { colors, spacing, radii } from '../../theme';
import Animated, { FadeIn, Layout } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as StoreReview from 'expo-store-review';
import { RevenueCatService } from '../../services/revenueCatService';

export const OnboardingCustomPlanScreen = () => {
  const navigation = useNavigation<any>();
  const { calculatedScore, totalSteps, setCurrentStep, completeOnboarding } = useOnboardingStore(); 
  const [isGenerating, setIsGenerating] = useState(true);
  const [loadingStep, setLoadingStep] = useState(0);
  const loadingMessages = [
    "Synthesizing gut profile data...",
    "Matching dietary patterns with recovery protocols...",
    "Optimizing fermentation mitigation strategy...",
    "Mapping 90-day biological reset timeline...",
    "Generating personalized trigger alerts..."
  ];

  useEffect(() => {
    const timer = setInterval(() => {
        setLoadingStep(prev => (prev < loadingMessages.length - 1 ? prev + 1 : prev));
    }, 600);

    const timer2 = setTimeout(async () => {
      setIsGenerating(false);
      if (await StoreReview.hasAction()) {
        StoreReview.requestReview();
      }
    }, 3500);
    return () => {
        clearInterval(timer);
        clearTimeout(timer2);
    };
  }, []);

  const handleNext = async () => {
    // Show native RevenueCat Paywall
    try {
      const paywallResult = await RevenueCatService.presentPaywall();
      const isPremium = await RevenueCatService.isPremium(true);
      const purchasedOrRestored = paywallResult === 'PURCHASED' || paywallResult === 'RESTORED';
      
      if (!isPremium && !purchasedOrRestored) {
        return; // Exit if they didn't buy anything
      }
      
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
    setCurrentStep(6);
  };

  if (isGenerating) {
    return (
      <ScreenWrapper useGradient={true}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.pink} />
          <Typography variant="h3" style={[styles.loadingText, { textAlign: 'center' }]}>
            {loadingMessages[loadingStep]}
          </Typography>
          <Typography variant="caption" color={colors.mediumGray}>
            Step {loadingStep + 1} of {loadingMessages.length}: Profile Optimization
          </Typography>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <OnboardingScreen
      currentStep={7}
      totalSteps={totalSteps}
      title="Your Personalized Protocol"
      subtitle=""
      onNext={handleNext}
      onBack={handleBack}
      nextLabel="Start My Transformation"
    >
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: spacing.xl }}>
        <Animated.View entering={FadeIn} layout={Layout}>
          
          <Card style={styles.summaryCard}>
              <Typography variant="bodyBold" style={{marginBottom: spacing.xs}}>Based on your profile:</Typography>
              <View style={styles.bulletItem}><Ionicons name="ellipse" size={8} color={colors.pink} /><Typography variant="bodySmall" style={{marginLeft: 8}}>Score: {calculatedScore} (Goal: 85+)</Typography></View>
              <View style={styles.bulletItem}><Ionicons name="ellipse" size={8} color={colors.pink} /><Typography variant="bodySmall" style={{marginLeft: 8}}>Optimized for sensitive digestion</Typography></View>
              <View style={styles.bulletItem}><Ionicons name="ellipse" size={8} color={colors.pink} /><Typography variant="bodySmall" style={{marginLeft: 8}}>Focus on symptom reduction</Typography></View>
          </Card>

          {/* Trigger 2: Price Anchoring (Cost of Inaction) */}
          <View style={styles.anchorContainer}>
            <Typography variant="caption" color={colors.mediumGray} align="center" style={{ marginBottom: spacing.md }}>
              THE COST OF INACTION
            </Typography>
            <View style={styles.anchorGrid}>
                <AnchorItem label="GI Specialist" cost="$350+" color={colors.mediumGray} />
                <AnchorItem label="Trial & Error" cost="Years" color={colors.mediumGray} />
                <AnchorItem label="GutBuddy" cost="$1.15/wk" color={colors.green} highlighted />
            </View>
          </View>

          <Card style={styles.planCard}>
            <View style={styles.planHeader}>
                <Typography variant="h3" color={colors.black}>90-Day Gut Reset</Typography>
            </View>
            
            <View style={styles.divider} />
            
            <TimelineItem title="Phase 1: CALM" duration="Week 1-2" desc="Reduce inflammation & find triggers." color={colors.pink} />
            <TimelineItem title="Phase 2: RESTORE" duration="Week 3-6" desc="Rebuild bacteria & optimize hydration." color={colors.yellow} />
            <TimelineItem title="Phase 3: THRIVE" duration="Week 7-12" desc="Maintain progress & fine-tune diet." color={colors.blue} isLast />
          </Card>

          <View style={styles.projectionContainer}>
               <Typography variant="bodyBold" align="center" style={{marginBottom: spacing.sm}}>Expected Improvement</Typography>
               <View style={styles.projectionBar}>
                   <View style={{alignItems: 'center'}}>
                       <Typography variant="h3" color={colors.pink}>{calculatedScore}</Typography>
                       <Typography variant="caption">Today</Typography>
                   </View>
                   <Ionicons name="arrow-forward" size={24} color={colors.mediumGray} />
                   <View style={{alignItems: 'center'}}>
                       <Typography variant="h3" color={colors.green}>85+</Typography>
                       <Typography variant="caption">12 Weeks</Typography>
                   </View>
               </View>
          </View>
        </Animated.View>
      </ScrollView>
    </OnboardingScreen>
  );
};

const TimelineItem = ({ title, duration, desc, color, isLast }: any) => (
  <View style={{ flexDirection: 'row', marginBottom: isLast ? 0 : spacing.lg }}>
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

const AnchorItem = ({ label, cost, color, highlighted = false }: any) => (
  <View style={[styles.anchorItem, highlighted && styles.anchorHighlighted]}>
    <Typography variant="bodyXS" color={highlighted ? colors.white : colors.mediumGray}>{label}</Typography>
    <Typography variant="bodyBold" color={highlighted ? colors.white : color} style={{ fontSize: 16 }}>{cost}</Typography>
  </View>
);

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  loadingText: {
    marginTop: spacing.xl,
    marginBottom: spacing.xs,
  },
  summaryCard: {
      padding: spacing.md,
      marginBottom: spacing.md,
      backgroundColor: colors.background,
  },
  bulletItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 4,
  },
  anchorContainer: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.white + '80',
    borderRadius: 24,
    marginBottom: spacing.xl,
  },
  anchorGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  anchorItem: {
    flex: 1,
    padding: spacing.sm,
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  anchorHighlighted: {
    backgroundColor: colors.green,
    borderColor: colors.green,
  },
  planCard: {
    padding: spacing.lg,
    backgroundColor: colors.white,
    borderRadius: 32,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  planHeader: {
    marginBottom: spacing.lg,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginBottom: spacing.lg,
  },
  timelineDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    zIndex: 1,
  },
  timelineLine: {
    position: 'absolute',
    top: 14,
    width: 2,
    bottom: -spacing.lg,
    left: 6,
  },
  projectionContainer: {
      marginTop: spacing.xl,
  },
  projectionBar: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
      backgroundColor: colors.white,
      padding: spacing.md,
      borderRadius: radii.lg,
  }
});
