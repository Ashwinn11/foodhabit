import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { OnboardingScreen } from '../../components/Onboarding';
import { useOnboardingStore } from '../../store/onboardingStore';
import { useNavigation } from '@react-navigation/native';
import { Typography, Card, ScreenWrapper, GutAvatar } from '../../components';
import { colors, spacing, radii } from '../../theme';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

export const OnboardingResultsScreen = () => {
  const navigation = useNavigation<any>();
  const { calculatedScore, setCurrentStep, totalSteps, gutCheckAnswers } = useOnboardingStore();
  const [isAnalyzing, setIsAnalyzing] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAnalyzing(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleNext = () => {
    setCurrentStep(3);
    navigation.navigate('OnboardingSolution');
  };

  const handleBack = () => {
     navigation.goBack();
     setCurrentStep(1);
  };

  if (isAnalyzing) {
      return (
          <ScreenWrapper useGradient={true} contentContainerStyle={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.pink} />
              <Typography variant="h3" style={styles.loadingText}>Analyzing Gut Health...</Typography>
              <View style={styles.checkList}>
                  <CheckItem text="Checking stool consistency" delay={0} />
                  <CheckItem text="Evaluating symptom patterns" delay={500} />
                  <CheckItem text="Measuring regularity" delay={1000} />
                  <CheckItem text="Assessing warning signs" delay={1500} />
              </View>
          </ScreenWrapper>
      );
  }

  // Calculate breakdown scores for display
  const stoolScore = [10, 25, 40, 25, 10][gutCheckAnswers.stoolConsistency ?? 2] || 20;
  const symptomScore = [30, 20, 10, 0][gutCheckAnswers.symptomFrequency ?? 1] || 15;
  const regularityScore = [20, 15, 5][gutCheckAnswers.bowelRegularity ?? 1] || 10;
  const medicalScore = gutCheckAnswers.medicalFlags ? 0 : 10;
  
  const getScoreColor = (score: number) => {
      if (score >= 80) return colors.green;
      if (score >= 50) return colors.blue;
      return colors.pink;
  };

  const scoreColor = getScoreColor(calculatedScore);

  return (
    <OnboardingScreen
      currentStep={2}
      totalSteps={totalSteps}
      title="Your Gut Health Report"
      subtitle=""
      onNext={handleNext}
      onBack={handleBack}
      nextLabel="See The Solution"
      nextDisabled={false}
    >
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: spacing.xl }}>
        
        <Animated.View entering={FadeInDown.delay(100)} style={styles.scoreContainer}>
            <GutAvatar score={calculatedScore} size={120} style={{ marginBottom: spacing.md }} />
            <View style={[styles.scoreCircle, { borderColor: scoreColor }]}>
                <Typography variant="h1" color={scoreColor} style={{ fontSize: 38 }}>{calculatedScore}</Typography>
                <Typography variant="caption" color={colors.mediumGray}>GUT SCORE</Typography>
            </View>
            <Typography variant="h3" color={scoreColor} style={{ marginTop: spacing.xs }}>
                {calculatedScore >= 80 ? 'Doing Great!' : calculatedScore >= 50 ? 'Needs Improvement' : 'Needs Work'}
            </Typography>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300)}>
            <Typography variant="bodyBold" style={{ marginBottom: spacing.md }}>Here's what we found:</Typography>
            
            <ScoreBar label="Stool Health" score={stoolScore} max={40} color={stoolScore >= 30 ? colors.green : stoolScore >= 20 ? colors.yellow : colors.pink} />
            <ScoreBar label="Symptom Burden" score={symptomScore} max={30} color={symptomScore >= 20 ? colors.green : symptomScore >= 10 ? colors.yellow : colors.pink} />
            <ScoreBar label="Regularity" score={regularityScore} max={20} color={regularityScore >= 15 ? colors.green : colors.yellow} />
            <ScoreBar label="Medical Flags" score={medicalScore} max={10} color={medicalScore === 10 ? colors.green : colors.pink} />

            <Card style={styles.warningCard}>
                 <Ionicons name="warning" size={24} color={colors.yellow} style={{ marginBottom: spacing.sm }} />
                 <Typography variant="caption" color={colors.black}>
                    Without intervention, symptoms can worsen.
                 </Typography>
            </Card>

        </Animated.View>
      </ScrollView>
    </OnboardingScreen>
  );
};

const CheckItem = ({ text, delay }: { text: string, delay: number }) => {
    const [visible, setVisible] = useState(false);
    useEffect(() => {
        setTimeout(() => setVisible(true), delay);
    }, []);

    if (!visible) return null;
    return (
        <Animated.View entering={FadeIn} style={styles.checkItem}>
            <Ionicons name="checkmark-circle" size={20} color={colors.green} />
            <Typography variant="body" style={{ marginLeft: spacing.sm }}>{text}</Typography>
        </Animated.View>
    );
}

const ScoreBar = ({ label, score, max, color }: { label: string, score: number, max: number, color: string }) => (
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
  loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: spacing.xl,
  },
  loadingText: {
      marginTop: spacing.xl,
      marginBottom: spacing.xl,
  },
  checkList: {
      alignItems: 'flex-start',
      gap: spacing.sm,
  },
  checkItem: {
      flexDirection: 'row',
      alignItems: 'center',
  },
  scoreContainer: {
      alignItems: 'center',
      marginBottom: spacing.xl,
      marginTop: spacing.md, 
  },
  scoreCircle: {
      width: 140,
      height: 140,
      borderRadius: 70,
      borderWidth: 6,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.white,
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
  }
});
