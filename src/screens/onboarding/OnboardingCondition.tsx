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
  { id: 'IBS-D', icon: 'ArrowDown' as LucideIconName, color: '#C75050' },
  { id: 'IBS-C', icon: 'Lock' as LucideIconName, color: '#C75050' },
  { id: 'IBS-M', icon: 'RefreshCw' as LucideIconName, color: '#C75050' },
  { id: 'GERD', icon: 'Flame' as LucideIconName, color: '#C98A45' },
  { id: 'Celiac Disease', icon: 'Wheat' as LucideIconName, color: '#D4A95A' },
  { id: "Crohn's Disease", icon: 'Activity' as LucideIconName, color: '#B55050' },
  { id: 'Lactose Intolerant', icon: 'Milk' as LucideIconName, color: '#7E8A9A' },
  { id: 'SIBO', icon: 'Microscope' as LucideIconName, color: '#5AAF7B' },
  { id: 'Gastroparesis', icon: 'Clock' as LucideIconName, color: '#4A84D4' },
  { id: 'Just Bloating / Unsure', icon: 'HelpCircle' as LucideIconName, color: '#7E8A9A' },
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
      step={2}
      scroll
      icon="avocado_scientist"
      title="What should we watch out for?"
      subtitle="This determines which foods we'll flag as risky for you."
    >
      <View style={styles.container}>
        <View style={styles.pillContainer}>
          {CONDITIONS.map((c) => (
            <SelectionCard
              key={c.id}
              layout="pill"
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
