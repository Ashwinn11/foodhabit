import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
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
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: spacing.xl }}>
        <Animated.View entering={FadeInDown.delay(100)} style={styles.mascotContainer}>
          <GutAvatar score={90} size={140} />
          <View style={styles.speechBubble}>
            <Typography variant="bodyBold" color={colors.white}>We've got this! 🚀</Typography> 
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200)} style={styles.gridContainer}>
          <FeatureGridItem 
            icon="search" 
            title="Stop Bloating" 
            desc="AI Pinpoints what's causing pain."
            color={colors.blue}
          />
          <FeatureGridItem 
            icon="checkbox" 
            title="Heal Daily" 
            desc="Easy habits to fix your digestion."
            color={colors.pink}
          />
          <FeatureGridItem 
            icon="stats-chart" 
            title="See Progress" 
            desc="Weekly reports on your healing."
            color={colors.yellow}
          />
          <FeatureGridItem 
            icon="grid" 
            title="Quick Track" 
            desc="Widgets for 1-tap logging."
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
            <Typography variant="caption" align="center" color={colors.mediumGray} style={{ marginTop: spacing.md }}>
                Also includes: FODMAP Alerts • Smart Logging • Medical Insights • Home Widgets
            </Typography>
        </Animated.View>

      </ScrollView>
    </OnboardingScreen>
  );
};

const FeatureGridItem = ({ icon, title, desc, color }: any) => (
  <Card style={styles.gridCard} variant="white">
      <IconContainer
        name={icon}
        size={52}
        iconSize={26}
        color={color}
        variant="solid"
        style={{ marginBottom: spacing.sm }}
      />
      <Typography variant="bodyBold" style={{ fontSize: 15 }}>{title}</Typography>
      <Typography variant="bodyXS" color={colors.mediumGray} style={{ textAlign: 'center', marginTop: 4 }}>{desc}</Typography>
  </Card>
);

const styles = StyleSheet.create({
  mascotContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
    marginTop: spacing.sm,
  },
  speechBubble: {
    backgroundColor: colors.black,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.xl,
    marginTop: -spacing.md,
    borderBottomLeftRadius: 0,
    transform: [{ rotate: '-5deg' }, { translateX: 35 }],
    zIndex: 10,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  gridCard: {
    width: '47.5%', // Slightly less than 50% to account for gap
    padding: spacing.md,
    alignItems: 'center',
    borderRadius: 28,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  goalCard: {
    marginTop: spacing.xl,
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: 24,
  },
  extraSection: {
      marginTop: spacing.xl,
      padding: spacing.lg,
      backgroundColor: colors.white + '80',
      borderRadius: radii.xl,
      borderWidth: 1,
      borderColor: colors.border,
  },
  badgeRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: spacing.md,
  },
  miniBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.white,
      paddingHorizontal: spacing.sm,
      paddingVertical: 4,
      borderRadius: radii.full,
      borderWidth: 1,
      borderColor: colors.border,
  }
});