import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { OnboardingScreen } from '../../components/Onboarding';
import { useOnboardingStore } from '../../store/onboardingStore';
import { useNavigation } from '@react-navigation/native';
import { Typography, IconContainer } from '../../components';
import { colors, spacing } from '../../theme';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { analyticsService } from '../../analytics/analyticsService';

const INACTIVE_COLOR = colors.black + '40';

const SYMPTOMS = [
    { id: 'gas', label: 'Gas / Smells', icon: 'thunderstorm', color: colors.yellow },
    { id: 'bloating', label: 'Bloating', icon: 'cloud', color: colors.blue },
    { id: 'fatigue', label: 'Brain Fog / Fatigue', icon: 'battery-dead', color: colors.blue },
    { id: 'acne', label: 'Acne / Skin issues', icon: 'alert-circle', color: colors.pink },
    { id: 'weight', label: 'Stubborn Weight', icon: 'speedometer', color: colors.pink },
    { id: 'constipation', label: 'Constipation', icon: 'cube', color: colors.yellow },
    { id: 'diarrhea', label: 'Diarrhea', icon: 'rainy', color: colors.blue },
];

const FREQUENCY_OPTIONS = [
    { id: 0, label: 'Rarely', icon: 'happy', color: colors.green },
    { id: 1, label: 'Weekly', icon: 'calendar', color: colors.yellow },
    { id: 2, label: 'Daily', icon: 'warning', color: colors.pink },
];

export const OnboardingQuizScreen = () => {
  const navigation = useNavigation<any>();
  const { totalSteps, setCurrentStep, setGutCheckAnswer } = useOnboardingStore();

  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [selectedFreq, setSelectedFreq] = useState<number | null>(null);
  const [showValidation, setShowValidation] = useState(false);

  useEffect(() => {
    analyticsService.trackOnboardingScreenView('symptoms', 2, totalSteps);
  }, [totalSteps]);

  const handleNext = () => {
    if (selectedSymptoms.length === 0 || selectedFreq === null) return;
    setGutCheckAnswer('symptomFrequency', selectedFreq);
    analyticsService.trackEvent('onboarding_symptoms_selected', {
      symptoms: selectedSymptoms,
      symptoms_count: selectedSymptoms.length,
      frequency: selectedFreq,
    });
    setCurrentStep(3);
    navigation.navigate('OnboardingValueInterrupt');
  };

  const handleBack = () => {
    navigation.goBack();
    setCurrentStep(1);
  };

  const toggleSymptom = (id: string) => {
    if (selectedSymptoms.includes(id)) {
      setSelectedSymptoms(prev => prev.filter(s => s !== id));
    } else {
      setSelectedSymptoms(prev => [...prev, id]);
      if (!selectedSymptoms.length) {
        setShowValidation(true);
      }
    }
  };

  const isValid = selectedSymptoms.length > 0 && selectedFreq !== null;

  return (
    <OnboardingScreen
      currentStep={2}
      totalSteps={totalSteps}
      title="What's bothering you?"
      subtitle="Select all that apply & how often"
      onNext={handleNext}
      onBack={handleBack}
      nextLabel="Continue"
      nextDisabled={!isValid}
    >
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: spacing.xl }}>
        <Animated.View entering={FadeIn}>
          <Typography variant="bodyBold" style={styles.sectionTitle}>I'm struggling with:</Typography>
          <View style={styles.grid}>
            {SYMPTOMS.map((s) => {
              const isSelected = selectedSymptoms.includes(s.id);
              return (
                <TouchableOpacity
                  key={s.id}
                  style={[styles.gridItem, isSelected && { borderColor: s.color }]}
                  onPress={() => toggleSymptom(s.id)}
                >
                  <IconContainer
                    name={s.icon as any}
                    size={44}
                    iconSize={24}
                    color={isSelected ? s.color : INACTIVE_COLOR}
                    variant={isSelected ? 'solid' : 'transparent'}
                    shadow={false}
                  />
                  <Typography variant="caption" style={{ marginTop: 8, textAlign: 'center', fontSize: 11, lineHeight: 14 }}>{s.label}</Typography>
                </TouchableOpacity>
              );
            })}
          </View>

          {showValidation && (
            <Animated.View entering={FadeIn} style={styles.validationBadge}>
              <Ionicons name="information-circle" size={16} color={colors.black} />
              <Typography variant="caption" color={colors.black} style={{ marginLeft: 6, flex: 1 }}>
                This is common! More than 65% of our users report this.
              </Typography>
              <TouchableOpacity onPress={() => setShowValidation(false)}>
                <Ionicons name="close" size={16} color={colors.black} />
              </TouchableOpacity>
            </Animated.View>
          )}

          <Typography variant="bodyBold" style={[styles.sectionTitle, { marginTop: spacing.lg }]}>How often do you feel this?</Typography>
          <View style={styles.row}>
            {FREQUENCY_OPTIONS.map((opt) => (
              <SelectableCard
                key={opt.id}
                item={opt}
                isSelected={selectedFreq === opt.id}
                onSelect={() => setSelectedFreq(opt.id)}
              />
            ))}
          </View>
        </Animated.View>
      </ScrollView>
    </OnboardingScreen>
  );
};

const SelectableCard = ({ item, isSelected, onSelect }: any) => (
  <TouchableOpacity
    style={[styles.smallCard, isSelected && { borderColor: item.color }]}
    onPress={onSelect}
  >
    <IconContainer
      name={item.icon}
      size={40}
      iconSize={20}
      color={isSelected ? item.color : INACTIVE_COLOR}
      variant={isSelected ? 'solid' : 'transparent'}
      shadow={false}
    />
    <Typography variant="caption" style={{ marginTop: 4 }}>{item.label}</Typography>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  sectionTitle: { marginBottom: spacing.md, fontSize: 18, marginLeft: 4 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  gridItem: {
    width: '30%',
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 24,
    backgroundColor: colors.white,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'transparent',
    paddingHorizontal: 4,
  },
  validationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.blue + '10',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 12,
    marginTop: spacing.md,
    width: '100%',
  },
  row: { flexDirection: 'row', gap: 12 },
  smallCard: {
    flex: 1,
    padding: spacing.md,
    alignItems: 'center',
    borderRadius: 24,
    backgroundColor: colors.white,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'transparent',
  },
});
