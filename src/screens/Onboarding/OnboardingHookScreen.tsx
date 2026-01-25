import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { OnboardingScreen } from '../../components/Onboarding';
import { useOnboardingStore } from '../../store/onboardingStore';
import { useNavigation } from '@react-navigation/native';
import { Typography, GutAvatar, Card } from '../../components';
import { colors, spacing, radii } from '../../theme';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

const PAIN_POINTS = [
  { icon: 'thunderstorm', text: 'Embarrassing gas & smells', color: colors.yellow },
  { icon: 'cloud', text: 'Constant bloating', color: colors.blue },
  { icon: 'battery-dead', text: 'Constant fatigue & brain fog', color: colors.black },
  { icon: 'alert-circle', text: 'Breakouts & skin issues', color: colors.pink },
  { icon: 'speedometer', text: 'Stubborn weight', color: colors.pink },
];

export const OnboardingHookScreen = () => {
  const navigation = useNavigation<any>();
  const { totalSteps, setCurrentStep } = useOnboardingStore();
  
  const handleNext = () => {
    setCurrentStep(1);
    navigation.navigate('OnboardingQuiz');
  };

  return (
    <OnboardingScreen
      currentStep={0}
      totalSteps={totalSteps}
      title="Is Your Gut Sabotaging Your Life?"
      subtitle="Sound familiar?"
      onNext={handleNext}
      nextLabel="Yep, That's Me!"
      showBackButton={false}
    >
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: spacing.xl }}>
        <Animated.View entering={FadeInDown.delay(100)} style={styles.mascotContainer}>
          <GutAvatar score={30} size={140} /> 
          <View style={styles.speechBubble}>
            <Typography variant="bodyBold" color={colors.white}>Oof... is this you? 🤕</Typography> 
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200)} style={{ gap: spacing.md }}>
          {PAIN_POINTS.map((point, index) => (
            <Card key={index} style={[styles.painCard, { backgroundColor: point.color + '15', borderWidth: 0 }]}>
              <View style={[styles.iconContainer, { backgroundColor: colors.white }]}>
                <Ionicons name={point.icon as any} size={28} color={point.color} />
              </View>
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
  painCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: 24, 
    // border handled inline for color
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
});
