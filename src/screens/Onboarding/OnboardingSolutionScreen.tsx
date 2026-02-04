import React from 'react';
import { View, StyleSheet } from 'react-native';
import { OnboardingScreen } from '../../components/Onboarding';
import { useOnboardingStore } from '../../store/onboardingStore';
import { useNavigation } from '@react-navigation/native';
import { Typography, GutAvatar, Card, IconContainer } from '../../components';
import { colors, spacing, radii } from '../../theme';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';


export const OnboardingSolutionScreen = () => {
  const navigation = useNavigation<any>();
  const { totalSteps, setCurrentStep } = useOnboardingStore();
  
  const handleNext = () => {
    setCurrentStep(4);
    navigation.navigate('OnboardingReviews'); 
  };

  const handleBack = () => {
    navigation.goBack();
    setCurrentStep(2);
  };

  return (
    <OnboardingScreen
      currentStep={3}
      totalSteps={totalSteps}
      title="The Gut Reset Plan"
      subtitle="Designed to heal & optimize"
      onNext={handleNext}
      onBack={handleBack}
      nextLabel="Get My Protocol"
    >
      <View style={styles.container}>
        <Animated.View entering={FadeInDown.delay(100)} style={styles.mascotContainer}>
          <GutAvatar score={90} size={110} />
          <View style={styles.speechBubble}>
            <Typography variant="bodyBold" color={colors.white}>We've got this! 🚀</Typography> 
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200)} style={styles.gridContainer}>
          <FeatureGridItem 
            icon="search" 
            title="Stop Bloating" 
            desc="AI Pinpoints pain."
            color={colors.blue}
          />
          <FeatureGridItem 
            icon="checkbox" 
            title="Heal Daily" 
            desc="Easy daily habits."
            color={colors.pink}
          />
          <FeatureGridItem 
            icon="stats-chart" 
            title="See Progress" 
            desc="Weekly reports."
            color={colors.yellow}
          />
          <FeatureGridItem 
            icon="grid" 
            title="Quick Track" 
            desc="Widgets for logging."
            color={colors.blue}
          />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(350)}>
            <Card style={styles.goalCard} variant="colored" color={colors.pink}>
                <Typography variant="bodyBold" color={colors.black}>90-DAY TRANSFORMATION</Typography>
                <Typography variant="bodySmall" color={colors.black + '99'} style={{ marginTop: 2 }}>
                    Most users feel significant relief within the first 14 days.
                </Typography>
            </Card>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(450)} style={styles.extraSection}>
            <View style={styles.badgeRow}>
                <View style={styles.miniBadge}>
                    <Ionicons name="shield-checkmark" size={14} color={colors.green} />
                    <Typography variant="bodyXS" style={{ marginLeft: 4 }}>100% Private</Typography>
                </View>
                <View style={styles.miniBadge}>
                    <Ionicons name="flash" size={14} color={colors.yellow} />
                    <Typography variant="bodyXS" style={{ marginLeft: 4 }}>AI-Powered</Typography>
                </View>
            </View>
            <Typography variant="caption" align="center" color={colors.mediumGray} style={{ marginTop: spacing.xs }}>
                Also includes: FODMAP Alerts • Smart Logging • Medical Insights • Home Widgets
            </Typography>
        </Animated.View>

      </View>
    </OnboardingScreen>
  );
};

const FeatureGridItem = ({ icon, title, desc, color }: any) => (
  <Card style={styles.gridCard} variant="white">
      <IconContainer
        name={icon}
        size={40}
        iconSize={20}
        color={color}
        variant="solid"
        style={{ marginBottom: spacing.xs }}
      />
      <Typography variant="bodyBold" style={{ fontSize: 13 }}>{title}</Typography>
      <Typography variant="bodyXS" color={colors.mediumGray} style={{ textAlign: 'center', marginTop: 2, fontSize: 10 }}>{desc}</Typography>
  </Card>
);

const styles = StyleSheet.create({
  badgeRow: {
      flexDirection: 'row',
      gap: spacing.md,
      justifyContent: 'center',
  },
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingBottom: spacing.sm,
  },
  extraSection: {
      backgroundColor: colors.white + '80',
      borderColor: colors.border,
      borderRadius: radii.xl,
      borderWidth: 1,
      marginTop: spacing.md,
      padding: spacing.md,
  },
  goalCard: {
    alignItems: 'center',
    borderRadius: 24,
    marginTop: spacing.md,
    padding: spacing.md,
  },
  gridCard: {
    alignItems: 'center', 
    borderRadius: 20,
    elevation: 2,
    padding: spacing.sm,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    width: '48%',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  mascotContainer: {
    alignItems: 'center',
    marginBottom: spacing.md,
    marginTop: 0,
  },
  miniBadge: {
      alignItems: 'center',
      backgroundColor: colors.white,
      borderColor: colors.border,
      borderRadius: radii.full,
      borderWidth: 1,
      flexDirection: 'row',
      paddingHorizontal: spacing.sm,
      paddingVertical: 4,
  },
  speechBubble: {
    backgroundColor: colors.black,
    borderBottomLeftRadius: 0,
    borderRadius: radii.xl,
    marginTop: -spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    transform: [{ rotate: '-5deg' }, { translateX: 35 }],
    zIndex: 10,
  }
});