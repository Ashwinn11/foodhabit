import React from 'react';
import { StyleSheet, ScrollView, View } from 'react-native';
import { OnboardingScreen, FeatureCard, ReviewCard } from '../../components/Onboarding';
import { useOnboardingStore } from '../../store/onboardingStore';
import { useNavigation } from '@react-navigation/native';
import { Typography, GutAvatar, Card } from '../../components';
import { colors, spacing } from '../../theme';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

export const OnboardingValuePropScreen = () => {
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
      subtitle="Real people, real transformations, real results."
      onNext={handleNext}
      onBack={handleBack}
      nextLabel="See What's Inside"
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.delay(100)} style={styles.mascotContainer}>
          <GutAvatar score={95} size={120} ringColor={colors.blue + '20'} />
          <Typography variant="bodyBold" align="center" style={{ marginTop: spacing.md }}>
            Your Gut Can Heal
          </Typography>
          <Typography variant="caption" align="center" color={colors.black + '99'}>
            And when it does, everything changes
          </Typography>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200)}>
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
                  Average Rating
                </Typography>
              </View>
            </View>
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300)}>
          <FeatureCard
            icon="shield-checkmark"
            title="Science-Backed Protocol"
            description="Our gut-healing method is based on peer-reviewed research and clinical studies."
          />
          <FeatureCard
            icon="sparkles"
            title="Visible Results Fast"
            description="Most users see clearer skin, less bloating, and more energy within 14 days."
          />
        </Animated.View>

        <Typography variant="bodyBold" style={styles.reviewTitle}>
          Hear from our community
        </Typography>

        <Animated.View entering={FadeInDown.delay(400)}>
          <ReviewCard
            name="Sarah M."
            rating={5}
            review="I didn't realize my breakouts were caused by stress/gut issues. 3 weeks on Gut Buddy and my skin has never looked clearer. 🌟"
          />
        </Animated.View>
        
        <Animated.View entering={FadeInDown.delay(500)}>
          <ReviewCard
            name="Michael R."
            rating={5}
            review="The bloating was ruining my life. This simple daily protocol solved what doctors couldn't. Finally feel like myself again!"
          />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(600)}>
          <ReviewCard
            name="Jessica L."
            rating={5}
            review="My energy is through the roof and I'm sleeping better. Who knew it all started in the gut? Life-changing! 💪"
          />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(700)}>
          <Card style={styles.trustBadge}>
            <View style={styles.trustContent}>
              <Ionicons name="shield-checkmark" size={32} color={colors.blue} />
              <View style={{ flex: 1, marginLeft: spacing.md }}>
                <Typography variant="bodyBold">Trusted by Health Professionals</Typography>
                <Typography variant="caption" color={colors.black + '99'} style={{ marginTop: 4 }}>
                  Recommended by nutritionists and gut health specialists worldwide
                </Typography>
              </View>
            </View>
          </Card>
        </Animated.View>
      </ScrollView>
    </OnboardingScreen>
  );
};

const styles = StyleSheet.create({
  mascotContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  statsCard: {
    padding: spacing.lg,
    marginBottom: spacing.lg,
    backgroundColor: colors.white + 'EE',
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
    height: 50,
    backgroundColor: colors.border,
  },
  reviewTitle: {
    marginVertical: spacing.lg,
    color: colors.black,
  },
  trustBadge: {
    padding: spacing.md,
    marginTop: spacing.md,
    backgroundColor: colors.blue + '10',
    borderColor: colors.blue + '30',
    borderWidth: 1,
  },
  trustContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
