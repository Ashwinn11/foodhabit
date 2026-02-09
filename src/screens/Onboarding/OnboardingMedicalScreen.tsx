import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { OnboardingScreen } from '../../components/Onboarding';
import { useOnboardingStore } from '../../store/onboardingStore';
import { useNavigation } from '@react-navigation/native';
import { Typography, IconContainer, Card } from '../../components';
import { colors, spacing, radii } from '../../theme';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { analyticsService } from '../../analytics/analyticsService';

const MEDICAL_OPTIONS = [
  { id: false, label: 'No', icon: 'shield-checkmark', color: colors.green, desc: 'No blood or mucus noticed' },
  { id: true, label: 'Yes', icon: 'medkit', color: colors.pink, desc: 'I have noticed blood or mucus' },
];

export const OnboardingMedicalScreen = () => {
  const navigation = useNavigation<any>();
  const { totalSteps, setCurrentStep, setGutCheckAnswer, calculateScore } = useOnboardingStore();
  const [selected, setSelected] = useState<boolean | null>(null);

  useEffect(() => {
    analyticsService.trackOnboardingScreenView('medical', 6, totalSteps);
  }, [totalSteps]);

  const handleNext = () => {
    if (selected === null) return;
    setGutCheckAnswer('medicalFlags', selected);
    calculateScore();

    analyticsService.trackEvent('onboarding_medical_selected', { has_medical_flags: selected });

    setCurrentStep(7);
    navigation.navigate('OnboardingProcessing');
  };

  const handleBack = () => {
    navigation.goBack();
    setCurrentStep(5);
  };

  return (
    <OnboardingScreen
      currentStep={6}
      totalSteps={totalSteps}
      title="One Last Question"
      subtitle="Have you noticed blood or mucus in your stool?"
      onNext={handleNext}
      onBack={handleBack}
      nextLabel="Analyze My Gut"
      nextDisabled={selected === null}
    >
      <View style={styles.container}>
        {MEDICAL_OPTIONS.map((opt, index) => {
          const isSelected = selected === opt.id;
          return (
            <Animated.View key={String(opt.id)} entering={FadeInDown.delay(100 + index * 100)}>
              <TouchableOpacity
                style={[styles.optionCard, isSelected && { borderColor: opt.color, backgroundColor: opt.color + '08' }]}
                onPress={() => setSelected(opt.id)}
                activeOpacity={0.7}
              >
                <IconContainer
                  name={opt.icon as any}
                  size={56}
                  iconSize={28}
                  color={isSelected ? opt.color : colors.iconInactive}
                  variant={isSelected ? 'solid' : 'transparent'}
                  shadow={false}
                  shape="circle"
                />
                <View style={{ flex: 1, marginLeft: spacing.md }}>
                  <Typography variant="bodyBold" style={{ fontSize: 18 }}>{opt.label}</Typography>
                  <Typography variant="caption" color={colors.textSecondary}>{opt.desc}</Typography>
                </View>
                {isSelected && <IconContainer name="checkmark-circle" size={24} color={opt.color} variant="transparent" />}
              </TouchableOpacity>
            </Animated.View>
          );
        })}

        <Animated.View entering={FadeInDown.delay(350)}>
          <Card style={styles.disclaimerCard}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="lock-closed" size={16} color={colors.textTertiary} />
              <Typography variant="caption" color={colors.textTertiary} style={{ marginLeft: spacing.sm, flex: 1 }}>
                Your answers are 100% private and never shared. This helps us provide the most accurate health assessment.
              </Typography>
            </View>
          </Card>
        </Animated.View>
      </View>
    </OnboardingScreen>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: spacing.lg,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: radii.xl,
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.border,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  disclaimerCard: {
    backgroundColor: colors.lightGray,
    borderWidth: 0,
    padding: spacing.md,
  },
});
