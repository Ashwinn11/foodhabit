import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { OnboardingScreen } from '../../components/Onboarding';
import { useOnboardingStore } from '../../store/onboardingStore';
import { useNavigation } from '@react-navigation/native';
import { Typography, GutAvatar, Card, IconContainer } from '../../components';
import { colors, spacing, radii } from '../../theme';
import Animated, { FadeInDown } from 'react-native-reanimated';


export const OnboardingSolutionScreen = () => {
  const navigation = useNavigation<any>();
  const { totalSteps, setCurrentStep } = useOnboardingStore();
  
  const handleNext = () => {
    setCurrentStep(4);
    navigation.navigate('OnboardingCustomPlan'); // Reviews merged into Plan
  };

  const handleBack = () => {
    navigation.goBack();
    setCurrentStep(2);
  };

  return (
    <OnboardingScreen
      currentStep={3}
      totalSteps={totalSteps}
      title="Here's How We Fix It"
      subtitle="Your 90-Day Gut Reset"
      onNext={handleNext}
      onBack={handleBack}
      nextLabel="Get My Protocol"
    >
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: spacing.xl }}>
        <Animated.View entering={FadeInDown.delay(100)} style={styles.mascotContainer}>
          <GutAvatar score={90} size={120} />
          <View style={styles.speechBubble}>
            <Typography variant="bodyBold" color={colors.white}>We can fix this together! 🛠️</Typography> 
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200)}>
          <FeatureBlock 
            icon="search" 
            title="IDENTIFY TRIGGERS" 
            description="Track meals & symptoms. AI finds exactly what's causing your bloating."
            color={colors.blue}
          />
          <FeatureBlock 
            icon="checkbox" 
            title="DAILY MISSIONS" 
            description="Small tasks for hydration, fiber, and stress that heal your gut step-by-step."
            color={colors.pink}
          />
          <FeatureBlock 
            icon="stats-chart" 
            title="WATCH SCORE IMPROVE" 
            description="See your Gut Score rise as you fix your stool consistency and regularity."
            color={colors.yellow}
          />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(400)} style={styles.extraFeatures}>
             <Typography variant="caption" align="center" color={colors.mediumGray}>
                 Also includes: FODMAP alerts • Smart Logging • Medical Insights
             </Typography>
        </Animated.View>

      </ScrollView>
    </OnboardingScreen>
  );
};

const FeatureBlock = ({ icon, title, description, color }: any) => (
  <Card style={styles.featureCard}>
      <IconContainer
        name={icon}
        size={56}
        iconSize={28}
        color={color}
        variant="solid"
        style={styles.iconMargin}
      />
      <View style={{ flex: 1 }}>
        <Typography variant="bodyBold" style={{ marginBottom: 4 }}>{title}</Typography>
        <Typography variant="bodySmall" color={colors.mediumGray}>{description}</Typography>
      </View>
  </Card>
);

const styles = StyleSheet.create({
  mascotContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
    marginTop: spacing.md,
  },
  speechBubble: {
    backgroundColor: colors.black,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.xl,
    marginTop: -spacing.md,
    borderBottomLeftRadius: 0,
    transform: [{ rotate: '-5deg' }, { translateX: 40 }],
    zIndex: 10,
  },
  featureCard: {
    flexDirection: 'row',
    padding: spacing.md,
    marginBottom: spacing.md,
    alignItems: 'flex-start',
    backgroundColor: colors.white,
    borderRadius: 32, // Whimsical round
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
    // No border
  },
  iconMargin: {
    marginRight: spacing.md,
  },
  extraFeatures: {
      marginTop: spacing.md,
      padding: spacing.md,
      backgroundColor: colors.white + '80', // Glass-ish
      borderRadius: radii.lg,
  }
});