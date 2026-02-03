import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { OnboardingScreen } from '../../components/Onboarding';
import { useOnboardingStore } from '../../store/onboardingStore';
import { useNavigation } from '@react-navigation/native';
import { Typography, Card, IconContainer } from '../../components';
import { colors, spacing } from '../../theme';
import Animated, { FadeInDown } from 'react-native-reanimated';

const FEATURES = [
  { icon: 'scan', text: 'AI Food Scanner', subtext: 'Know if it\'s safe to eat instantly.', color: colors.blue },
  { icon: 'trending-up', text: 'Smart Trigger Tracking', subtext: 'Discover what specifically hurts you.', color: colors.pink },
  { icon: 'calendar', text: 'Personalized Daily Plan', subtext: 'Step-by-step roadmap to consistency.', color: colors.yellow },
  { icon: 'notifications', text: 'Intelligent Reminders', subtext: 'Stay on track with your water & meds.', color: colors.green },
];

export const OnboardingFeaturesScreen = () => {
  const navigation = useNavigation<any>();
  const { totalSteps, setCurrentStep } = useOnboardingStore();
  
  const handleNext = () => {
    setCurrentStep(6);
    navigation.navigate('OnboardingCommitment');
  };

  const handleBack = () => {
    navigation.goBack();
    setCurrentStep(4);
  };

  return (
    <OnboardingScreen
      currentStep={5}
      totalSteps={totalSteps}
      title="Everything You Need"
      subtitle="To regain control of your life"
      onNext={handleNext}
      onBack={handleBack}
      nextLabel="Get My Plan"
    >
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: spacing.xl }}>
        <Animated.View entering={FadeInDown.delay(100)} style={{ gap: spacing.lg, marginTop: spacing.md }}>
          {FEATURES.map((feature, index) => (
            <Card key={index} style={styles.featureCard}>
              <IconContainer 
                name={feature.icon as any} 
                size={56} 
                iconSize={28} 
                color={feature.color} 
                variant="solid"
                style={styles.iconMargin}
              />
              <View style={{ flex: 1 }}>
                <Typography variant="bodyBold" color={colors.black} style={{ fontSize: 18 }}>
                  {feature.text}
                </Typography>
                <Typography variant="caption" color={colors.mediumGray}>
                  {feature.subtext}
                </Typography>
              </View>
            </Card>
          ))}
        </Animated.View>
      </ScrollView>
    </OnboardingScreen>
  );
};

const styles = StyleSheet.create({
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: 32,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconMargin: {
    marginRight: spacing.lg,
  },
});
