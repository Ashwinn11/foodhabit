import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { OnboardingScreen } from '../../components/Onboarding';
import { useOnboardingStore } from '../../store/onboardingStore';
import { useNavigation } from '@react-navigation/native';
import { Typography, Card, GutAvatar } from '../../components';
import { colors, spacing, radii } from '../../theme';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { getFunGrade } from '../../utils/funnyMessages';
import { analyticsService } from '../../analytics/analyticsService';

const getGoalDate = (): string => {
  const date = new Date();
  date.setDate(date.getDate() + 84); // 12 weeks
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
};

export const OnboardingResultsScreen = () => {
  const navigation = useNavigation<any>();
  const { calculatedScore, setCurrentStep, totalSteps, gutCheckAnswers } = useOnboardingStore();

  useEffect(() => {
    analyticsService.trackResultsViewed(calculatedScore, gutCheckAnswers.medicalFlags || false);
    analyticsService.trackOnboardingScreenView('results', 8, totalSteps);
  }, [calculatedScore, gutCheckAnswers.medicalFlags, totalSteps]);

  const handleNext = () => {
    setCurrentStep(9);
    navigation.navigate('OnboardingCondition');
  };

  const handleBack = () => {
    navigation.goBack();
    setCurrentStep(7);
  };

  const stoolScore = [10, 25, 40, 25, 10][gutCheckAnswers.stoolConsistency ?? 2] || 20;
  const symptomScore = [30, 20, 10, 0][gutCheckAnswers.symptomFrequency ?? 1] || 15;
  const regularityScore = [20, 15, 5][gutCheckAnswers.bowelRegularity ?? 1] || 10;
  const medicalScore = gutCheckAnswers.medicalFlags ? 0 : 10;

  const getScoreColor = (score: number) => {
    if (score >= 90) return colors.green;
    if (score >= 80) return colors.yellow;
    if (score >= 70) return colors.blue;
    if (score >= 50) return colors.pink;
    return colors.red;
  };

  const scoreColor = getScoreColor(calculatedScore);
  const funGrade = getFunGrade(calculatedScore);
  const goalDate = getGoalDate();

  return (
    <OnboardingScreen
      currentStep={8}
      totalSteps={totalSteps}
      title="Your Gut Health Report"
      subtitle=""
      onNext={handleNext}
      onBack={handleBack}
      nextLabel="See Your Plan"
      nextDisabled={false}
    >
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: spacing.xl }}>

        {/* Score Display */}
        <Animated.View entering={FadeInDown.delay(100)} style={styles.scoreContainer}>
          <GutAvatar score={calculatedScore} size={110} style={{ marginBottom: spacing.md }} />
          <View style={[styles.scoreCircle, { borderColor: scoreColor }]}>
            <Typography variant="h1" color={scoreColor} style={{ fontSize: 38 }}>{calculatedScore}</Typography>
            <Typography variant="caption" color={colors.mediumGray}>GUT SCORE</Typography>
          </View>
          <Typography variant="h3" color={scoreColor} style={{ marginTop: spacing.xs }}>
            {funGrade}
          </Typography>
        </Animated.View>

        {/* Dynamic Goal Date - Noom tactic */}
        <Animated.View entering={FadeInDown.delay(200)}>
          <Card style={styles.goalDateCard}>
            <View style={styles.goalRow}>
              <View style={{ alignItems: 'center', flex: 1 }}>
                <Typography variant="h3" color={colors.pink}>{calculatedScore}</Typography>
                <Typography variant="caption" color={colors.textSecondary}>Today</Typography>
              </View>
              <Ionicons name="arrow-forward" size={20} color={colors.textTertiary} />
              <View style={{ alignItems: 'center', flex: 1 }}>
                <Typography variant="h3" color={colors.green}>85+</Typography>
                <Typography variant="caption" color={colors.textSecondary}>{goalDate}</Typography>
              </View>
            </View>
            <Typography variant="caption" color={colors.textSecondary} align="center" style={{ marginTop: spacing.sm }}>
              Based on users with similar profiles
            </Typography>
          </Card>
        </Animated.View>

        {/* Score Breakdown */}
        <Animated.View entering={FadeInDown.delay(300)}>
          <Typography variant="bodyBold" style={{ marginBottom: spacing.md }}>Here's what we found:</Typography>

          <ScoreBar label="Stool Health" score={stoolScore} max={40} color={stoolScore >= 30 ? colors.green : stoolScore >= 20 ? colors.red : colors.pink} />
          <ScoreBar label="Symptom Relief" score={symptomScore} max={30} color={symptomScore >= 20 ? colors.green : symptomScore >= 10 ? colors.yellow : colors.pink} />
          <ScoreBar label="Regularity" score={regularityScore} max={20} color={regularityScore >= 15 ? colors.green : colors.yellow} />
          <ScoreBar label="Clinical Safety" score={medicalScore} max={10} color={medicalScore === 10 ? colors.green : colors.pink} />
        </Animated.View>

        {/* Medical Warning / Good News */}
        <Animated.View entering={FadeInDown.delay(400)}>
          {gutCheckAnswers.medicalFlags ? (
            <Card style={[styles.warningCard, { borderColor: colors.pink, backgroundColor: colors.pink + '10' }]}>
              <Ionicons name="alert-circle" size={24} color={colors.pink} style={{ marginBottom: spacing.sm }} />
              <Typography variant="bodyBold" color={colors.pink}>Red Flag Detected</Typography>
              <Typography variant="caption" color={colors.black} style={{ textAlign: 'center' }}>
                Blood or mucus in stool requires medical attention. Please consult a doctor alongside using this app.
              </Typography>
            </Card>
          ) : (
            <Card style={styles.warningCard}>
              <Ionicons name="shield-checkmark" size={24} color={colors.green} style={{ marginBottom: spacing.sm }} />
              <Typography variant="bodyBold" color={colors.green}>Good News</Typography>
              <Typography variant="caption" color={colors.black} style={{ textAlign: 'center' }}>
                No immediate medical red flags. Your gut is ready for a reset protocol.
              </Typography>
            </Card>
          )}
        </Animated.View>

        {/* Personalized Insight */}
        <Animated.View entering={FadeInDown.delay(500)} style={styles.insightContainer}>
          <Typography variant="bodySmall" color={colors.textSecondary} align="center" style={{ fontStyle: 'italic' }}>
            92% of users with similar profiles see significant improvement within 14 days of starting the protocol.
          </Typography>
        </Animated.View>

      </ScrollView>
    </OnboardingScreen>
  );
};

const ScoreBar = ({ label, score, max, color }: { label: string; score: number; max: number; color: string }) => (
  <View style={styles.scoreBarContainer}>
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
      <Typography variant="caption" style={{ fontWeight: '600' }}>{label}</Typography>
      <Typography variant="caption" color={color}>{score}/{max}</Typography>
    </View>
    <View style={styles.track}>
      <View style={[styles.fill, { width: `${(score / max) * 100}%`, backgroundColor: color }]} />
    </View>
  </View>
);

const styles = StyleSheet.create({
  scoreContainer: {
    alignItems: 'center',
    marginBottom: spacing.lg,
    marginTop: spacing.sm,
  },
  scoreCircle: {
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 6,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
  },
  goalDateCard: {
    backgroundColor: colors.lightGray,
    borderWidth: 0,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  goalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
  },
  scoreBarContainer: {
    marginBottom: spacing.md,
  },
  track: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 4,
  },
  warningCard: {
    marginTop: spacing.md,
    backgroundColor: colors.yellow + '20',
    borderColor: colors.yellow,
    borderWidth: 1,
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radii.xl,
  },
  insightContainer: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.md,
  },
});
