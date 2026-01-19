import React from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import { OnboardingScreen, FeatureCard, ReviewCard } from '../../components/Onboarding';
import { useOnboardingStore } from '../../store/onboardingStore';
import { useNavigation } from '@react-navigation/native';
import { Typography } from '../../components';
import { colors, spacing } from '../../theme';
import Animated, { FadeInDown } from 'react-native-reanimated';

export const OnboardingValuePropScreen = () => {
  const navigation = useNavigation<any>();
  const { totalSteps, setCurrentStep } = useOnboardingStore();
  
  const handleNext = () => {
    setCurrentStep(5);
    navigation.navigate('OnboardingFeatures');
  };

  const handleBack = () => {
    navigation.goBack();
    setCurrentStep(3);
  };

  return (
    <OnboardingScreen
      currentStep={4}
      totalSteps={totalSteps}
      title="The Gut Buddy Solution"
      subtitle="We help you calm the internal stress and restore your glow."
      onNext={handleNext}
      onBack={handleBack}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.delay(200)}>
          <FeatureCard
            icon="shield-checkmark"
            title="Inflammation Shield"
            description="Our protocol actively cools gut inflammation triggered by modern stress."
          />
          <FeatureCard
            icon="sparkles"
            title="Skin-Gut Axis Restore"
            description="Specifically designed to clear skin by cleansing your microbiome from within."
          />
        </Animated.View>

        <Typography variant="bodyBold" style={styles.reviewTitle}>
          Join thousands who found relief
        </Typography>

        <ReviewCard
          name="Sarah M."
          rating={5}
          review="I didn't realize my breakouts were caused by stress/gut issues. 3 weeks on Gut Buddy and my skin has never looked clearer."
        />
        
        <ReviewCard
          name="Michael R."
          rating={5}
          review="The bloating was ruining my life. This simple daily protocol solved what doctors couldn't."
        />
      </ScrollView>
    </OnboardingScreen>
  );
};

const styles = StyleSheet.create({
  reviewTitle: {
    marginVertical: spacing.lg,
    color: colors.black,
  },
});
