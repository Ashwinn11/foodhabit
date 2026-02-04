import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
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
      <View style={styles.container}>
        <Animated.View entering={FadeIn} layout={Layout} style={styles.content}>
          
          <Card style={styles.summaryCard}>
              <View style={styles.bulletRow}>
                  <View style={styles.bulletItem}><Ionicons name="ellipse" size={6} color={colors.pink} /><Typography variant="bodySmall" style={styles.bulletText}>Score: {calculatedScore} (Goal: 85+)</Typography></View>
                  <View style={styles.bulletItem}><Ionicons name="ellipse" size={6} color={colors.pink} /><Typography variant="bodySmall" style={styles.bulletText}>Sensitive digestion</Typography></View>
                  <View style={styles.bulletItem}><Ionicons name="ellipse" size={6} color={colors.pink} /><Typography variant="bodySmall" style={styles.bulletText}>Symptom reduction</Typography></View>
              </View>
          </Card>

          {/* Trigger 2: Price Anchoring (Cost of Inaction) */}
          <View style={styles.anchorContainer}>
            <View style={styles.anchorGrid}>
                <AnchorItem label="GI Specialist" cost="$350+" color={colors.mediumGray} />
                <AnchorItem label="Trial & Error" cost="Years" color={colors.mediumGray} />
                <AnchorItem label="GutBuddy" cost="$1.15/wk" color={colors.green} highlighted />
            </View>
          </View>

          <Card style={styles.planCard}>
            <View style={styles.planHeader}>
                <Typography variant="h3" color={colors.black} style={{ fontSize: 20 }}>90-Day Gut Reset</Typography>
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.timeline}>
                <TimelineItem title="Phase 1: CALM" duration="Week 1-2" desc="Reduce inflammation & find triggers." color={colors.pink} />
                <TimelineItem title="Phase 2: RESTORE" duration="Week 3-6" desc="Rebuild bacteria & optimize hydration." color={colors.green} />
                <TimelineItem title="Phase 3: THRIVE" duration="Week 7-12" desc="Maintain progress & fine-tune diet." color={colors.blue} isLast />
            </View>
          </Card>

          <View style={styles.projectionContainer}>
               <Typography variant="bodyBold" align="center" style={{marginBottom: spacing.xs, fontSize: 13}}>Expected Improvement</Typography>
               <View style={styles.projectionBar}>
                   <View style={{alignItems: 'center'}}>
                       <Typography variant="h3" color={colors.pink} style={{fontSize: 20}}>{calculatedScore}</Typography>
                       <Typography variant="caption" style={{fontSize: 10}}>Today</Typography>
                   </View>
                   <Ionicons name="arrow-forward" size={16} color={colors.mediumGray} />
                   <View style={{alignItems: 'center'}}>
                       <Typography variant="h3" color={colors.green} style={{fontSize: 20}}>85+</Typography>
                       <Typography variant="caption" style={{fontSize: 10}}>12 Weeks</Typography>
                   </View>
               </View>
          </View>
        </Animated.View>
      </View>
    </OnboardingScreen>
  );
};

const TimelineItem = ({ title, duration, desc, color, isLast }: any) => (
  <View style={{ flexDirection: 'row', marginBottom: isLast ? 0 : spacing.sm }}>
    <View style={{ alignItems: 'center', width: 20, marginRight: spacing.sm }}>
      <View style={[styles.timelineDot, { backgroundColor: color }]} />
      {!isLast && <View style={[styles.timelineLine, { backgroundColor: color + '30' }]} />}
    </View>
    <View style={{ flex: 1 }}>
      <Typography variant="bodyBold" style={{ fontSize: 14 }}>{title} <Typography variant="caption" color={colors.black} style={{ fontSize: 12 }}>{duration}</Typography></Typography>
      <Typography variant="caption" color={colors.black + '99'} style={{ fontSize: 12 }}>{desc}</Typography>
    </View>
  </View>
);

const AnchorItem = ({ label, cost, color, highlighted = false }: any) => (
  <View style={[styles.anchorItem, highlighted && styles.anchorHighlighted]}>
    <Typography variant="bodyXS" color={highlighted ? colors.white : colors.mediumGray} style={{ fontSize: 10 }}>{label}</Typography>
    <Typography variant="bodyBold" color={highlighted ? colors.white : color} style={{ fontSize: 13 }}>{cost}</Typography>
  </View>
);

const styles = StyleSheet.create({
  anchorContainer: {
    backgroundColor: colors.white + '80',
    borderRadius: 16,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    // marginBottom: spacing.sm,
  },
  anchorGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  anchorHighlighted: {
    backgroundColor: colors.green,
    borderColor: colors.green,
  },
  anchorItem: {
    alignItems: 'center',
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 1,
    flex: 1,
    padding: spacing.xs,
  },
  bulletItem: {
      alignItems: 'center',
      flexDirection: 'row',
  },
  bulletRow: {
      flexDirection: 'column',
      gap: 2,
  },
  bulletText: {
      fontSize: 12,
      marginLeft: 6,
  },
  container: {
      flex: 1,
  },
  content: {
      flex: 1,
      justifyContent: 'space-between',
      paddingBottom: spacing.sm,
  },
  divider: {
    backgroundColor: colors.border,
    height: 1,
    marginBottom: spacing.md,
  },
  loadingContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: spacing.xl,
  },
  loadingText: {
    marginBottom: spacing.xs,
    marginTop: spacing.xl,
  },
  planCard: {
    backgroundColor: colors.white,
    borderRadius: 24,
    elevation: 4,
    padding: spacing.md,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
  },
  planHeader: {
    marginBottom: spacing.sm,
  },
  projectionBar: {
      alignItems: 'center',
      backgroundColor: colors.white,
      borderRadius: radii.lg,
      flexDirection: 'row',
      justifyContent: 'space-around',
      padding: spacing.sm,
  },
  projectionContainer: {
    //   marginTop: spacing.sm,
  },
  summaryCard: {
      backgroundColor: colors.background,
      padding: spacing.sm,
  },
  timeline: {
    gap: 2,
  },
  timelineDot: {
    borderRadius: 5,
    height: 10,
    width: 10,
    zIndex: 1,
  },
  timelineLine: {
    bottom: -spacing.md,
    left: 4,
    position: 'absolute',
    top: 10,
    width: 2,
  }
});
