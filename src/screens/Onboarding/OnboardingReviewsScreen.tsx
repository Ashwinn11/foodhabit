import React from 'react';
import { View, StyleSheet } from 'react-native';
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
      title="Join 50,000+ Happy Guts"
      subtitle="Real people, real results."
      onNext={handleNext}
      onBack={handleBack}
      nextLabel="Get My Personalized Plan"
    >
      <View style={styles.container}>
        
        <Animated.View entering={FadeInDown.delay(100)}>
          <Card style={styles.statsCard}>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Typography variant="h2" color={colors.black}>92%</Typography>
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

        <View style={styles.reviewsContainer}>
          <Animated.View entering={FadeInDown.delay(200)} style={styles.reviewWrapper}>
            <ReviewCard
              name="Sarah M."
              rating={5}
              review="The bloating is GONE! I used to look 6 months pregnant after every meal. Now I can wear my jeans without pain."
            />
          </Animated.View>
          
          <Animated.View entering={FadeInDown.delay(300)} style={styles.reviewWrapper}>
            <ReviewCard
              name="Michael T."
              rating={5}
              review="My skin cleared up in 3 weeks. I had no idea my acne was connected to my gut. Mind. Blown."
            />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(400)} style={styles.reviewWrapper}>
            <ReviewCard
              name="Emma L."
              rating={5}
              review="Finally know what triggers my issues. Turns out it was dairy + onions together. The app found it in 2 weeks!"
            />
          </Animated.View>
        </View>

      </View>
    </OnboardingScreen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  divider: {
    backgroundColor: colors.border,
    height: 40,
    width: 1,
  },
  reviewWrapper: {
    flex: 1,
    justifyContent: 'center',
  },
  reviewsContainer: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statsCard: {
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderWidth: 1,
    marginBottom: spacing.xs,
    padding: spacing.md,
  },
  statsRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
});
