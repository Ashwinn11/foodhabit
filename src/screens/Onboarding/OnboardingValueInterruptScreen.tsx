import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { OnboardingScreen } from '../../components/Onboarding';
import { useOnboardingStore } from '../../store/onboardingStore';
import { useNavigation } from '@react-navigation/native';
import { Typography, GutAvatar, Card } from '../../components';
import { colors, spacing } from '../../theme';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { analyticsService } from '../../analytics/analyticsService';

export const OnboardingValueInterruptScreen = () => {
  const navigation = useNavigation<any>();
  const { totalSteps, setCurrentStep } = useOnboardingStore();

  useEffect(() => {
    analyticsService.trackOnboardingScreenView('value_interrupt', 3, totalSteps);
  }, [totalSteps]);

  const handleNext = () => {
    setCurrentStep(4);
    navigation.navigate('OnboardingStool');
  };

  const handleBack = () => {
    navigation.goBack();
    setCurrentStep(2);
  };

  return (
    <OnboardingScreen
      currentStep={3}
      totalSteps={totalSteps}
      title="You're Not Alone"
      subtitle="More than 65% of people experience these exact symptoms"
      onNext={handleNext}
      onBack={handleBack}
      nextLabel="Continue Assessment"
    >
      <View style={styles.container}>

        <Animated.View entering={FadeInDown.delay(100)} style={styles.mascotContainer}>
          <GutAvatar score={70} size={120} mood="neutral" />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200)}>
          <Card style={styles.insightCard}>
            <View style={styles.insightRow}>
              <Ionicons name="people" size={24} color={colors.pink} />
              <View style={{ flex: 1, marginLeft: spacing.md }}>
                <Typography variant="bodyBold">1 in 3 adults</Typography>
                <Typography variant="caption" color={colors.textSecondary}>
                  struggle with digestive issues daily
                </Typography>
              </View>
            </View>
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300)}>
          <Card style={styles.insightCard}>
            <View style={styles.insightRow}>
              <Ionicons name="trending-up" size={24} color={colors.green} />
              <View style={{ flex: 1, marginLeft: spacing.md }}>
                <Typography variant="bodyBold">92% improved</Typography>
                <Typography variant="caption" color={colors.textSecondary}>
                  within just 2 weeks of using GutBuddy
                </Typography>
              </View>
            </View>
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(400)}>
          <Card style={styles.insightCard}>
            <View style={styles.insightRow}>
              <Ionicons name="search" size={24} color={colors.blue} />
              <View style={{ flex: 1, marginLeft: spacing.md }}>
                <Typography variant="bodyBold">AI-powered detection</Typography>
                <Typography variant="caption" color={colors.textSecondary}>
                  finds your specific triggers in days, not months
                </Typography>
              </View>
            </View>
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(500)} style={styles.quoteContainer}>
          <Typography variant="bodySmall" color={colors.textSecondary} align="center" style={{ fontStyle: 'italic' }}>
            "The first step to healing is understanding what's happening inside your gut."
          </Typography>
        </Animated.View>

      </View>
    </OnboardingScreen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mascotContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  insightCard: {
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderWidth: 1,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  insightRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quoteContainer: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
});
