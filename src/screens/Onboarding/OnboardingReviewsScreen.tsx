import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { OnboardingScreen, ReviewCard } from '../../components/Onboarding';
import { useOnboardingStore } from '../../store/onboardingStore';
import { useNavigation } from '@react-navigation/native';
import { Typography, Card } from '../../components';
import { colors, spacing } from '../../theme';
import Animated, { FadeInDown } from 'react-native-reanimated';

export const OnboardingReviewsScreen = () => {
  const navigation = useNavigation<any>();
  const { totalSteps, setCurrentStep } = useOnboardingStore();
  
  const handleNext = () => {
    setCurrentStep(5);
    navigation.navigate('OnboardingCustomPlan');
  };

  const handleBack = () => {
    navigation.goBack();
    setCurrentStep(3);
  };

  return (
    <OnboardingScreen
      currentStep={4}
      totalSteps={totalSteps}
      title="Join 50,000+ Happy Guts"
      subtitle="Real people, real results."
      onNext={handleNext}
      onBack={handleBack}
      nextLabel="Get My Personalized Plan"
    >
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: spacing.xl }}>
        
        <Animated.View entering={FadeInDown.delay(100)}>
          <Card style={styles.statsCard}>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Typography variant="h2" color={colors.blue}>92%</Typography>
                <Typography variant="caption" align="center" color={colors.black + '99'}>
                  Feel Better in 2 Weeks
                </Typography>
              </View>
              <View style={styles.divider} />
              <View style={styles.statItem}>
                <Typography variant="h2" color={colors.pink}>4.9★</Typography>
                <Typography variant="caption" align="center" color={colors.black + '99'}>
                  App Store Rating
                </Typography>
              </View>
            </View>
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200)}>
          <ReviewCard
            name="Sarah M."
            rating={5}
            review="The bloating is GONE! I used to look 6 months pregnant after every meal. Now I can wear my jeans without pain."
          />
        </Animated.View>
        
        <Animated.View entering={FadeInDown.delay(300)}>
          <ReviewCard
            name="Michael T."
            rating={5}
            review="My skin cleared up in 3 weeks. I had no idea my acne was connected to my gut. Mind. Blown."
          />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(400)}>
          <ReviewCard
            name="Emma L."
            rating={5}
            review="Finally know what triggers my issues. Turns out it was dairy + onions together. The app found it in 2 weeks!"
          />
        </Animated.View>

      </ScrollView>
    </OnboardingScreen>
  );
};

const styles = StyleSheet.create({
  statsCard: {
    padding: spacing.lg,
    marginBottom: spacing.lg,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: colors.border,
  },
});
