import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { OnboardingLayout } from './OnboardingLayout';
import { theme } from '../../theme/theme';
import { Button } from '../../components/Button';
import { SelectionCard } from '../../components/SelectionCard';
import { LucideIconName } from '../../components/Icon';
import { useAppStore } from '../../store/useAppStore';
import { analyticsService } from '../../services/analyticsService';

const CONDITIONS = [
  { id: 'IBS-D', icon: 'Activity' as LucideIconName, color: '#FF4D4D' },
  { id: 'IBS-C', icon: 'Activity' as LucideIconName, color: '#FF4D4D' },
  { id: 'IBS-M', icon: 'Activity' as LucideIconName, color: '#FF4D4D' },
  { id: 'GERD', icon: 'Flame' as LucideIconName, color: '#FF9D4D' },
  { id: 'Celiac Disease', icon: 'Wheat' as LucideIconName, color: '#F5C97A' },
  { id: "Crohn's Disease", icon: 'HeartPulse' as LucideIconName, color: '#E05D4C' },
  { id: 'Lactose Intolerant', icon: 'Milk' as LucideIconName, color: '#8E96A3' },
  { id: 'SIBO', icon: 'Bacteria' as LucideIconName, color: '#6DBE8C' },
  { id: 'Gastroparesis', icon: 'Clock' as LucideIconName, color: '#4D94FF' },
  { id: 'Just Bloating / Unsure', icon: 'HelpCircle' as LucideIconName, color: '#8E96A3' },
];

export const OnboardingCondition: React.FC = () => {
  const navigation = useNavigation<any>();
  const [selected, setSelected] = useState<string[]>([]);
  const updateOnboardingAnswers = useAppStore((s) => s.updateOnboardingAnswers);

  const toggle = (condition: string) => {
    setSelected((prev) =>
      prev.includes(condition) ? prev.filter((c) => c !== condition) : [...prev, condition]
    );
  };

  const handleNext = () => {
    const condition = selected.join(', ');
    updateOnboardingAnswers({ condition });
    analyticsService.logObCondition(condition);
    navigation.navigate('OnboardingSymptoms');
  };

  return (
    <OnboardingLayout
      step={3}
      scroll
      icon="avocado_scientist"
      title="Do you have a diagnosed condition?"
      titleIcon="Activity"
      titleIconColor="#4D94FF"
      subtitle="Select all that apply. This helps us tailor your food analysis."
    >
      <View style={styles.container}>
        <View style={styles.list}>
          {CONDITIONS.map((c) => (
            <SelectionCard
              key={c.id}
              title={c.id}
              lucideIcon={c.icon}
              lucideColor={c.color}
              selected={selected.includes(c.id)}
              onPress={() => toggle(c.id)}
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
    gap: theme.spacing.xl,
  },
  list: {
    gap: theme.spacing.sm,
  },
  footer: {
    paddingBottom: theme.spacing.xl,
    marginTop: theme.spacing.md,
  },
});
