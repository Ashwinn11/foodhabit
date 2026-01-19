import React from 'react';
import { StyleSheet, ScrollView, View } from 'react-native';
import { OnboardingScreen } from '../../components/Onboarding';
import { useOnboardingStore } from '../../store/onboardingStore';
import { useNavigation } from '@react-navigation/native';
import { Typography, Card, GutAvatar } from '../../components';
import { colors, spacing, radii } from '../../theme';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

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
      subtitle="Your profile shows your gut is under significant stress."
      onNext={handleNext}
      onBack={handleBack}
      nextLabel="See the Solution"
    >
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: spacing.xl }}>
        <Animated.View entering={FadeInDown.delay(100)} style={styles.mascotContainer}>
          <GutAvatar score={30} size={120} ringColor={colors.pink + '20'} />
          <Typography variant="bodyBold" color={colors.pink} style={{ marginTop: spacing.md }}>
            High Inflammation Detected
          </Typography>
        </Animated.View>

        <View style={styles.statsContainer}>
          <ResultStat label="Internal Stress" value="High" color={colors.pink} percent="85%" />
          <ResultStat label="Skin Barrier Risk" value="Elevated" color={colors.yellow} percent="65%" />
        </View>

        <Typography variant="bodyBold" style={{ marginBottom: spacing.md }}>
          What's really happening:
        </Typography>

        <View style={styles.symptomsContainer}>
          <SymptomItem icon="flame" title="Gut Lining Irritation" color={colors.pink} />
          <SymptomItem icon="thunderstorm" title="Neural Fog & Fatigue" color={colors.yellow} />
          <SymptomItem icon="water" title="Microbiome Disbalance" color={colors.blue} />
        </View>

        <Card style={styles.warningCard}>
          <Typography variant="caption" color={colors.black + '99'}>
            ⚠️ Left untreated, these triggers can lead to chronic fatigue and long-term digestive sensitivity.
          </Typography>
        </Card>
      </ScrollView>
    </OnboardingScreen>
  );
};

const ResultStat = ({ label, value, color, percent }: any) => (
  <View style={styles.statItem}>
    <View style={styles.statHeader}>
      <Typography variant="caption" color={colors.black + '99'}>{label}</Typography>
      <Typography variant="caption" color={color}>{value}</Typography>
    </View>
    <View style={styles.progressBarBg}>
      <View style={[styles.progressBarFill, { width: percent, backgroundColor: color }]} />
    </View>
  </View>
);

const SymptomItem = ({ icon, title, color }: any) => (
  <View style={styles.symptomItem}>
    <View style={[styles.iconCircle, { backgroundColor: color + '20' }]}>
      <Ionicons name={icon as any} size={20} color={color} />
    </View>
    <Typography variant="bodySmall" style={{ marginLeft: spacing.md }}>{title}</Typography>
    <View style={styles.severityDots}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <View style={[styles.dot, { backgroundColor: color }]} />
      <View style={[styles.dot, { backgroundColor: color + '30' }]} />
    </View>
  </View>
);

const styles = StyleSheet.create({
  mascotContainer: { alignItems: 'center', marginBottom: spacing.xl },
  statsContainer: { gap: spacing.md, marginBottom: spacing.xl },
  statItem: { backgroundColor: colors.white + '80', padding: spacing.md, borderRadius: radii.md },
  statHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  progressBarBg: { height: 6, backgroundColor: colors.border + '40', borderRadius: 3, overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 3 },
  symptomsContainer: { gap: spacing.sm, marginBottom: spacing.xl },
  symptomItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: colors.white, 
    padding: spacing.md, 
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border + '50'
  },
  iconCircle: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  severityDots: { flexDirection: 'row', gap: 4, marginLeft: 'auto' },
  dot: { width: 6, height: 6, borderRadius: 3 },
  warningCard: { padding: spacing.md, backgroundColor: colors.yellow + '10', borderColor: colors.yellow + '30', borderWidth: 1 }
});
