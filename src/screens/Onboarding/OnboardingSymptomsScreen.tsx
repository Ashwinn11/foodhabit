import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { OnboardingScreen } from '../../components/Onboarding';
import { useOnboardingStore } from '../../store/onboardingStore';
import { useNavigation } from '@react-navigation/native';
import { Typography, GutAvatar, Card, IconContainer } from '../../components';
import { colors, spacing, radii } from '../../theme';
import Animated, { FadeInDown } from 'react-native-reanimated';

const PAIN_POINTS = [
  { icon: 'thunderstorm', text: 'Embarrassing gas & smells', color: colors.yellow },
  { icon: 'cloud', text: 'Constant bloating', color: colors.blue },
  { icon: 'battery-dead', text: 'Constant fatigue & brain fog', color: colors.blue },
  { icon: 'alert-circle', text: 'Breakouts & skin issues', color: colors.pink },
  { icon: 'speedometer', text: 'Stubborn weight', color: colors.pink },
];

export const OnboardingSymptomsScreen = () => {
  const navigation = useNavigation<any>();
  const { totalSteps, setCurrentStep } = useOnboardingStore();
  
  const handleNext = () => {
    setCurrentStep(3);
    navigation.navigate('OnboardingSolution');
  };

  const handleBack = () => {
    navigation.goBack();
    setCurrentStep(1);
  };

  return (
    <OnboardingScreen
      currentStep={2}
      totalSteps={totalSteps}
      title="Common Gut Struggles"
      subtitle="Sound familiar? You're not alone."
      onNext={handleNext}
      onBack={handleBack}
      nextLabel="I Need Your Help"
    >
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: spacing.xl }}>
        <Animated.View entering={FadeInDown.delay(100)} style={styles.mascotContainer}>
          <GutAvatar score={30} size={140} /> 
          <View style={styles.speechBubble}>
            <Typography variant="bodyBold" color={colors.white}>It's tough, but we'll fix it! 🤕</Typography> 
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200)} style={{ gap: spacing.md }}>
          {PAIN_POINTS.map((point, index) => (
            <Card key={index} style={[styles.painCard, { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border }]}>
              <IconContainer 
                name={point.icon as any} 
                size={48} 
                iconSize={24} 
                color={point.color} 
                variant="solid"
                style={styles.iconMargin}
              />
              <Typography variant="bodyBold" color={colors.black} style={{ flex: 1, fontSize: 17 }}>
                {point.text}
              </Typography>
            </Card>
          ))}
        </Animated.View>
      </ScrollView>
    </OnboardingScreen>
  );
};

const styles = StyleSheet.create({
  iconMargin: {
    marginRight: spacing.md,
  },
  mascotContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
    marginTop: spacing.md,
  },
  painCard: {
    alignItems: 'center',
    borderRadius: 24,
    flexDirection: 'row',
    padding: spacing.md, 
  },
  speechBubble: {
    backgroundColor: colors.black,
    borderBottomLeftRadius: 0,
    borderRadius: radii.xl,
    marginTop: -spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    transform: [{ rotate: '-5deg' }, { translateX: 40 }],
    zIndex: 10,
  },
});
