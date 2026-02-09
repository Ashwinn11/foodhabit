import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { OnboardingScreen } from '../../components/Onboarding';
import { useOnboardingStore } from '../../store/onboardingStore';
import { useNavigation } from '@react-navigation/native';
import { Typography, IconContainer } from '../../components';
import { colors, spacing, radii } from '../../theme';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { analyticsService } from '../../analytics/analyticsService';

const REGULARITY_OPTIONS = [
  { id: 0, label: '1-3x Daily', icon: 'time', color: colors.green, desc: 'Regular & predictable schedule' },
  { id: 1, label: '1x Daily / Every Other Day', icon: 'hourglass', color: colors.yellow, desc: 'Somewhat consistent but variable' },
  { id: 2, label: 'Unpredictable', icon: 'shuffle', color: colors.pink, desc: 'No real pattern or schedule' },
];

export const OnboardingRegularityScreen = () => {
  const navigation = useNavigation<any>();
  const { totalSteps, setCurrentStep, setGutCheckAnswer } = useOnboardingStore();
  const [selected, setSelected] = useState<number | null>(null);

  useEffect(() => {
    analyticsService.trackOnboardingScreenView('regularity', 5, totalSteps);
  }, [totalSteps]);

  const handleNext = () => {
    if (selected === null) return;
    setGutCheckAnswer('bowelRegularity', selected);
    analyticsService.trackEvent('onboarding_regularity_selected', { regularity: selected });
    setCurrentStep(6);
    navigation.navigate('OnboardingMedical');
  };

  const handleBack = () => {
    navigation.goBack();
    setCurrentStep(4);
  };

  return (
    <OnboardingScreen
      currentStep={5}
      totalSteps={totalSteps}
      title="How Regular Are You?"
      subtitle="How predictable are your bowel movements?"
      onNext={handleNext}
      onBack={handleBack}
      nextLabel="Continue"
      nextDisabled={selected === null}
    >
      <View style={styles.container}>
        {REGULARITY_OPTIONS.map((opt, index) => {
          const isSelected = selected === opt.id;
          return (
            <Animated.View key={opt.id} entering={FadeInDown.delay(100 + index * 80)}>
              <TouchableOpacity
                style={[styles.optionCard, isSelected && { borderColor: opt.color, backgroundColor: opt.color + '08' }]}
                onPress={() => setSelected(opt.id)}
                activeOpacity={0.7}
              >
                <IconContainer
                  name={opt.icon as any}
                  size={52}
                  iconSize={26}
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

        <Animated.View entering={FadeInDown.delay(400)} style={styles.tipContainer}>
          <Typography variant="caption" color={colors.textTertiary} align="center">
            Irregular bowel movements are one of the most common signs of gut imbalance. We can help fix this.
          </Typography>
        </Animated.View>
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
  tipContainer: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
});
