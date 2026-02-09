import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { OnboardingScreen } from '../../components/Onboarding';
import { useOnboardingStore } from '../../store/onboardingStore';
import { useNavigation } from '@react-navigation/native';
import { Typography, IconContainer } from '../../components';
import { colors, spacing, radii } from '../../theme';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { analyticsService } from '../../analytics/analyticsService';

const STOOL_OPTIONS = [
  { id: 0, label: 'Hard / Difficult', icon: 'stop', color: colors.pink, desc: 'Pellet-like, painful to pass' },
  { id: 1, label: 'Slightly Hard', icon: 'cube', color: colors.yellow, desc: 'Lumpy, requires some effort' },
  { id: 2, label: 'Smooth (Ideal)', icon: 'checkmark-circle', color: colors.green, desc: 'Soft, well-formed, easy to pass' },
  { id: 3, label: 'Loose / Mushy', icon: 'water', color: colors.yellow, desc: 'Soft blobs, lacks solid form' },
  { id: 4, label: 'Watery', icon: 'rainy', color: colors.pink, desc: 'Entirely liquid, no solid pieces' },
];

export const OnboardingStoolScreen = () => {
  const navigation = useNavigation<any>();
  const { totalSteps, setCurrentStep, setGutCheckAnswer } = useOnboardingStore();
  const [selected, setSelected] = useState<number | null>(null);

  useEffect(() => {
    analyticsService.trackOnboardingScreenView('stool', 4, totalSteps);
  }, [totalSteps]);

  const handleNext = () => {
    if (selected === null) return;
    setGutCheckAnswer('stoolConsistency', selected);
    analyticsService.trackEvent('onboarding_stool_selected', { stool_type: selected });
    setCurrentStep(5);
    navigation.navigate('OnboardingRegularity');
  };

  const handleBack = () => {
    navigation.goBack();
    setCurrentStep(3);
  };

  return (
    <OnboardingScreen
      currentStep={4}
      totalSteps={totalSteps}
      title="Stool Consistency"
      subtitle="What best describes your typical bowel movement?"
      onNext={handleNext}
      onBack={handleBack}
      nextLabel="Continue"
      nextDisabled={selected === null}
    >
      <View style={styles.container}>
        {STOOL_OPTIONS.map((opt, index) => {
          const isSelected = selected === opt.id;
          return (
            <Animated.View key={opt.id} entering={FadeInDown.delay(80 + index * 60)}>
              <TouchableOpacity
                style={[styles.optionCard, isSelected && { borderColor: opt.color, backgroundColor: opt.color + '08' }]}
                onPress={() => setSelected(opt.id)}
                activeOpacity={0.7}
              >
                <IconContainer
                  name={opt.icon as any}
                  size={48}
                  iconSize={24}
                  color={isSelected ? opt.color : colors.iconInactive}
                  variant={isSelected ? 'solid' : 'transparent'}
                  shadow={false}
                  shape="circle"
                />
                <View style={{ flex: 1, marginLeft: spacing.md }}>
                  <Typography variant="bodyBold">{opt.label}</Typography>
                  <Typography variant="caption" color={colors.textSecondary}>{opt.desc}</Typography>
                </View>
                {isSelected && <IconContainer name="checkmark-circle" size={24} color={opt.color} variant="transparent" />}
              </TouchableOpacity>
            </Animated.View>
          );
        })}
      </View>
    </OnboardingScreen>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
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
});
