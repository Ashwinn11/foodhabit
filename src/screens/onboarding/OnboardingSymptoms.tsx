import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { OnboardingLayout } from './OnboardingLayout';
import { theme } from '../../theme/theme';
import { Text } from '../../components/Text';
import { Button } from '../../components/Button';
import { SelectionCard } from '../../components/SelectionCard';
import { LucideIconName } from '../../components/Icon';
import { useAppStore } from '../../store/useAppStore';

const SYMPTOMS = [
  { id: 'Bloating', icon: 'Wind' as LucideIconName, color: '#F5C97A' },
  { id: 'Gas', icon: 'Cloud' as LucideIconName, color: '#8E96A3' },
  { id: 'Cramping', icon: 'RotateCcw' as LucideIconName, color: '#FF4D4D' },
  { id: 'Diarrhea', icon: 'ArrowDown' as LucideIconName, color: '#E05D4C' },
  { id: 'Constipation', icon: 'Lock' as LucideIconName, color: '#8E96A3' },
  { id: 'Nausea', icon: 'Frown' as LucideIconName, color: '#6DBE8C' },
  { id: 'Heartburn', icon: 'Flame' as LucideIconName, color: '#FF9D4D' },
  { id: 'Acid Reflux', icon: 'ArrowUp' as LucideIconName, color: '#FF9D4D' },
  { id: 'Brain Fog', icon: 'Cloud' as LucideIconName, color: '#A855F7' },
  { id: 'Fatigue', icon: 'BatteryLow' as LucideIconName, color: '#E05D4C' },
  { id: 'Urgency', icon: 'Zap' as LucideIconName, color: '#FF4D4D' },
];

export const OnboardingSymptoms: React.FC = () => {
  const navigation = useNavigation<any>();
  const [selected, setSelected] = useState<string[]>([]);
  const updateOnboardingAnswers = useAppStore((s) => s.updateOnboardingAnswers);

  const toggle = (symptom: string) => {
    setSelected((prev) =>
      prev.includes(symptom) ? prev.filter((s) => s !== symptom) : [...prev, symptom]
    );
  };

  const handleNext = () => {
    updateOnboardingAnswers({ symptoms: selected });
    navigation.navigate('OnboardingAnalyzing');
  };

  return (
    <OnboardingLayout
      step={4}
      scroll
      icon="avocado_bloated"
      title="Which symptoms do you regularly experience?"
      titleIcon="Flame"
      titleIconColor="#FF9D4D"
      subtitle="Select all that apply after eating."
    >
      <View style={styles.container}>
        {selected.length > 0 && (
          <Text variant="caption" color={theme.colors.primary} style={styles.counter}>
            {selected.length} symptom{selected.length !== 1 ? 's' : ''} selected
          </Text>
        )}

        <View style={styles.list}>
          {SYMPTOMS.map((s) => (
            <SelectionCard
              key={s.id}
              title={s.id}
              lucideIcon={s.icon}
              lucideColor={s.color}
              selected={selected.includes(s.id)}
              onPress={() => toggle(s.id)}
            />
          ))}
        </View>

        <View style={styles.footer}>
          <Button
            variant="primary"
            size="lg"
            onPress={handleNext}
            disabled={selected.length === 0}
            fullWidth
          >
            Next
          </Button>
        </View>
      </View>
    </OnboardingLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: theme.spacing.md,
  },
  counter: {
    fontFamily: theme.fonts.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  list: {
    gap: theme.spacing.sm,
  },
  footer: {
    paddingBottom: theme.spacing.xl,
    marginTop: theme.spacing.md,
  },
});
