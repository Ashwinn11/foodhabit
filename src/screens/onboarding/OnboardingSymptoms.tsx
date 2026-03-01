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
import { analyticsService } from '../../services/analyticsService';

const SYMPTOMS = [
  { id: 'Bloating', icon: 'Wind' as LucideIconName, color: '#D4A95A' },
  { id: 'Gas', icon: 'Cloud' as LucideIconName, color: '#7E8A9A' },
  { id: 'Cramping', icon: 'RotateCcw' as LucideIconName, color: '#C75050' },
  { id: 'Diarrhea', icon: 'ArrowDown' as LucideIconName, color: '#B55050' },
  { id: 'Constipation', icon: 'Lock' as LucideIconName, color: '#7E8A9A' },
  { id: 'Nausea', icon: 'Frown' as LucideIconName, color: '#5AAF7B' },
  { id: 'Heartburn', icon: 'Flame' as LucideIconName, color: '#C98A45' },
  { id: 'Acid Reflux', icon: 'ArrowUp' as LucideIconName, color: '#C98A45' },
  { id: 'Brain Fog', icon: 'Cloud' as LucideIconName, color: '#8B6CC4' },
  { id: 'Fatigue', icon: 'BatteryLow' as LucideIconName, color: '#B55050' },
  { id: 'Urgency', icon: 'Zap' as LucideIconName, color: '#C75050' },
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
    analyticsService.logObSymptoms(selected);
    navigation.navigate('OnboardingTriggers');
  };

  return (
    <OnboardingLayout
      step={3}
      scroll
      icon="avocado_bloated"
      title="Which reactions should we help you avoid?"
      subtitle="We'll connect these to specific foods so you know what causes what."
    >
      <View style={styles.container}>
        {selected.length > 0 && (
          <Text variant="caption" color={theme.colors.primary} style={styles.counter}>
            {selected.length} symptom{selected.length !== 1 ? 's' : ''} selected
          </Text>
        )}

        <View style={styles.pillContainer}>
          {SYMPTOMS.map((s) => (
            <SelectionCard
              key={s.id}
              layout="pill"
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
    textAlign: 'center',
  },
  pillContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: theme.spacing.xs,
  },
  footer: {
    paddingBottom: theme.spacing.xl,
    marginTop: theme.spacing.md,
  },
});
