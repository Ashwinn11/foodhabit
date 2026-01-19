import React from 'react';
import { StyleSheet, ScrollView, View } from 'react-native';
import { OnboardingScreen } from '../../components/Onboarding';
import { useOnboardingStore } from '../../store/onboardingStore';
import { useNavigation } from '@react-navigation/native';
import { Typography, Card, IconContainer } from '../../components';
import { colors, spacing, radii } from '../../theme';
import Animated, { FadeInDown } from 'react-native-reanimated';

export const OnboardingResultsScreen = () => {
  const navigation = useNavigation<any>();
  const { quizAnswers, setCurrentStep, totalSteps } = useOnboardingStore();
  
  const handleNext = () => {
    setCurrentStep(4);
    navigation.navigate('OnboardingValueProp');
  };

  const handleBack = () => {
    navigation.goBack();
    setCurrentStep(2);
  };

  return (
    <OnboardingScreen
      currentStep={3}
      totalSteps={totalSteps}
      title="The Toll on Your Body"
      subtitle="Your results show your gut is under significant stress."
      onNext={handleNext}
      onBack={handleBack}
      nextLabel="See the Solution"
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.delay(200)}>
          <Card variant="colored" color={colors.pink} style={styles.warningCard}>
            <View style={styles.warningHeader}>
              <IconContainer name="alert-circle" color={colors.pink} backgroundColor={colors.white} size={40} />
              <Typography variant="bodyBold" color={colors.pink} style={{ marginLeft: spacing.md }}>
                High Gut Irritation Detected
              </Typography>
            </View>
            <Typography variant="bodySmall" color={colors.pink} style={styles.warningText}>
              Your current profile suggests that stress and diet are causing micro-inflammation in your gut lining.
            </Typography>
          </Card>
        </Animated.View>

        <View style={styles.statsContainer}>
          <ResultStat 
            label="Internal Stress" 
            value="High" 
            color={colors.pink} 
            description="Your digestive system is in 'fight or flight' mode."
          />
          <ResultStat 
            label="Skin Barrier Risk" 
            value="Elevated" 
            color={colors.yellow} 
            description="Gut inflammation is starting to surface on your skin."
          />
          <ResultStat 
            label="Bacterial Balance" 
            value="Critical" 
            color={colors.pink} 
            description="Good bacteria levels are below the optimal 80% threshold."
          />
        </View>

        <Typography variant="bodySmall" color={colors.black + '99'} align="center" style={styles.footerNote}>
          Based on your {quizAnswers.stressLevel} stress profile and symptoms.
        </Typography>
      </ScrollView>
    </OnboardingScreen>
  );
};

const ResultStat = ({ label, value, color, description }: { label: string, value: string, color: string, description: string }) => (
  <View style={styles.statItem}>
    <View style={styles.statHeader}>
      <Typography variant="bodyBold">{label}</Typography>
      <Typography variant="bodyBold" color={color}>{value}</Typography>
    </View>
    <View style={styles.progressBarBg}>
      <View style={[styles.progressBarFill, { width: value === 'High' || value === 'Critical' ? '85%' : '60%', backgroundColor: color }]} />
    </View>
    <Typography variant="caption" color={colors.black + '66'} style={{ marginTop: 4 }}>
      {description}
    </Typography>
  </View>
);

const styles = StyleSheet.create({
  warningCard: {
    padding: spacing.md,
    backgroundColor: colors.pink + '10',
    marginBottom: spacing.xl,
  },
  warningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  warningText: {
    marginTop: spacing.xs,
    lineHeight: 18,
  },
  statsContainer: {
    gap: spacing.lg,
    marginBottom: spacing.xl,
  },
  statItem: {
    backgroundColor: colors.white + '66',
    padding: spacing.md,
    borderRadius: radii.lg,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: colors.border + '40',
    borderRadius: radii.full,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: radii.full,
  },
  footerNote: {
    marginTop: spacing.md,
    fontStyle: 'italic',
  }
});
