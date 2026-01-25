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
  const { calculatedScore, totalSteps, setCurrentStep, completeOnboarding } = useOnboardingStore();
  const [isGenerating, setIsGenerating] = useState(true);
  
  useEffect(() => {
    const timer = setTimeout(async () => {
      setIsGenerating(false);
      // Prompt for review earlier? or later. Leaving as is from original.
      if (await StoreReview.hasAction()) {
        StoreReview.requestReview();
      }
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  const handleNext = async () => {
    // Show paywall
    try {
      const paywallResult = await RevenueCatService.presentPaywall();
      const isPremium = await RevenueCatService.isPremium(true);
      const purchasedOrRestored = paywallResult === 'PURCHASED' || paywallResult === 'RESTORED';
      
      if (!isPremium && !purchasedOrRestored) {
        return; // Exit early
      }
      
      // User purchased!
      await completeOnboarding();
      
      // Trigger update
      // @ts-ignore
      if (global.refreshOnboardingStatus) {
         // @ts-ignore
         global.refreshOnboardingStatus();
      }

    } catch (error) {
      console.error('❌ Paywall error:', error);
      return;
    }
  };

  const handleBack = () => {
    navigation.goBack();
    setCurrentStep(2);
  };

  if (isGenerating) {
    return (
      <ScreenWrapper useGradient={true}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.pink} />
          <Typography variant="h3" style={styles.loadingText}>Building Your Protocol...</Typography>
          <Typography variant="body" color={colors.black + '66'}>Analyzing gut profile</Typography>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <OnboardingScreen
      currentStep={5}
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

          <View style={{ marginTop: spacing.xl }}>
              <Typography variant="h3" style={{ marginBottom: spacing.md }}>Success Stories</Typography>
              <ReviewItem 
                name="Sarah M." 
                text="The bloating is GONE! I used to look 6 months pregnant... now I can wear my jeans without pain." 
                stars={5}
              />
              <ReviewItem 
                name="Michael T." 
                text="My skin cleared up in 3 weeks. I had no idea my acne was connected to my gut." 
                stars={5}
              />
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

const ReviewItem = ({ name, text, stars }: any) => (
    <View style={{ padding: spacing.md, backgroundColor: colors.white, borderRadius: 24, marginBottom: spacing.md, shadowColor: colors.black, shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
            <Typography variant="bodyBold">{name}</Typography>
            <View style={{ flexDirection: 'row' }}>
                {[...Array(stars)].map((_, i) => <Ionicons key={i} name="star" size={14} color={colors.yellow} />)}
            </View>
        </View>
        <Typography variant="caption" color={colors.black + '80'}>"{text}"</Typography>
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
  planCard: {
    padding: spacing.lg,
    backgroundColor: colors.white,
    borderRadius: 32,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    // Removed border
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
