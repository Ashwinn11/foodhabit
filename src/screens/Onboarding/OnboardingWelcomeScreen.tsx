import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { OnboardingScreen } from '../../components/Onboarding';
import { useOnboardingStore } from '../../store/onboardingStore';
import { useNavigation } from '@react-navigation/native';
import { Typography, Card } from '../../components';
import { colors, spacing, radii } from '../../theme';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { analyticsService } from '../../analytics/analyticsService';

export const OnboardingWelcomeScreen = () => {
  const navigation = useNavigation<any>();
  const { totalSteps, setCurrentStep } = useOnboardingStore();

  useEffect(() => {
    analyticsService.trackOnboardingScreenView('welcome', 0, totalSteps);
    analyticsService.resetSession();
  }, [totalSteps]);

  const handleNext = () => {
    setCurrentStep(1);
    navigation.navigate('OnboardingGoal');
  };

  return (
    <OnboardingScreen
      currentStep={0}
      totalSteps={totalSteps}
      title="Let's Fix Your Gut"
      subtitle="Answer a few quick questions so we can build your personalized plan"
      onNext={handleNext}
      showBackButton={false}
      nextLabel="Start My Assessment"
    >
      <View style={styles.container}>



        <Animated.View entering={FadeInDown.delay(200)} style={styles.promiseContainer}>
          <View style={styles.promiseItem}>
            <Ionicons name="time-outline" size={20} color={colors.pink} />
            <Typography variant="body" style={{ marginLeft: spacing.md, flex: 1 }}>
              Takes only <Typography variant="bodyBold">2 minutes</Typography>
            </Typography>
          </View>
          <View style={styles.promiseItem}>
            <Ionicons name="shield-checkmark-outline" size={20} color={colors.green} />
            <Typography variant="body" style={{ marginLeft: spacing.md, flex: 1 }}>
              100% private & secure
            </Typography>
          </View>
          <View style={styles.promiseItem}>
            <Ionicons name="sparkles-outline" size={20} color={colors.yellow} />
            <Typography variant="body" style={{ marginLeft: spacing.md, flex: 1 }}>
              Get a personalized gut reset plan
            </Typography>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(350)}>
          <Card style={styles.socialProofCard}>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Typography variant="h3" color={colors.pink}>50,000+</Typography>
                <Typography variant="caption" color={colors.textSecondary}>Happy Guts</Typography>
              </View>
              <View style={styles.divider} />
              <View style={styles.statItem}>
                <Typography variant="h3" color={colors.yellow}>
                  4.9 <Ionicons name="star" size={24} color={colors.yellow} />
                </Typography>
                <Typography variant="caption" color={colors.textSecondary}>App Store</Typography>
              </View>
              <View style={styles.divider} />
              <View style={styles.statItem}>
                <Typography variant="h3" color={colors.green}>92%</Typography>
                <Typography variant="caption" color={colors.textSecondary}>Feel Better</Typography>
              </View>
            </View>
          </Card>
        </Animated.View>

      </View>
    </OnboardingScreen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },

  promiseContainer: {
    gap: spacing.lg,
    marginBottom: spacing.xl,
  },
  promiseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  socialProofCard: {
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderWidth: 1,
    padding: spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  divider: {
    width: 1,
    height: 36,
    backgroundColor: colors.border,
  },
});
