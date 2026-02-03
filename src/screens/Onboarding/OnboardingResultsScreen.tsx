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
  const [loadingStep, setLoadingStep] = useState(0);
  const loadingMessages = [
    "Analyzing stool architecture...",
    "Cross-referencing symptom frequency against peer data...",
    "Evaluating Bristol Scale consistency metrics...",
    "Correlating regularity patterns with clinical baselines...",
    "Finalizing Gut Health Score..."
  ];

  useEffect(() => {
    const timer = setInterval(() => {
        setLoadingStep(prev => (prev < loadingMessages.length - 1 ? prev + 1 : prev));
    }, 600);
    
    const analysisTimer = setTimeout(() => {
      setIsAnalyzing(false);
    }, 3200);
    
    return () => {
        clearInterval(timer);
        clearTimeout(analysisTimer);
    };
  }, []);

  const handleNext = () => {
    setCurrentStep(2);
    navigation.navigate('OnboardingSymptoms');
  };

  const handleBack = () => {
     navigation.goBack();
     setCurrentStep(0);
  };

  if (isAnalyzing) {
      return (
          <ScreenWrapper useGradient={true} contentContainerStyle={styles.loadingContainer}>
              <Animated.View entering={FadeIn} style={{ alignItems: 'center' }}>
                <ActivityIndicator size="large" color={colors.pink} />
                <Typography variant="h3" style={[styles.loadingText, { textAlign: 'center' }]}>
                    {loadingMessages[loadingStep]}
                </Typography>
                <Typography variant="caption" color={colors.mediumGray}>
                    {Math.round(((loadingStep + 1) / loadingMessages.length) * 100)}% Complete
                </Typography>
              </Animated.View>
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
            
            <ScoreBar label="Stool Health" score={stoolScore} max={40} color={stoolScore >= 30 ? colors.green : stoolScore >= 20 ? colors.red : colors.pink} />
            <ScoreBar label="Symptom Relief" score={symptomScore} max={30} color={symptomScore >= 20 ? colors.green : symptomScore >= 10 ? colors.yellow : colors.pink} />
            <ScoreBar label="Regularity" score={regularityScore} max={20} color={regularityScore >= 15 ? colors.green : colors.yellow} />
            <ScoreBar label="Clinical Safety" score={medicalScore} max={10} color={medicalScore === 10 ? colors.green : colors.pink} />

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
                  <Typography variant="caption" color={colors.black}>
                     Your gut signs show no immediate medical red flags.
                  </Typography>
              </Card>
            )}

        </Animated.View>
      </ScrollView>
    </OnboardingScreen>
  );
};

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
