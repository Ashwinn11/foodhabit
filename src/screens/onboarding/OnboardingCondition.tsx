import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { OnboardingLayout } from './OnboardingLayout';
import { theme } from '../../theme/theme';
import { Button } from '../../components/Button';
import { SelectionCard } from '../../components/SelectionCard';
import { useAppStore } from '../../store/useAppStore';
import { analyticsService } from '../../services/analyticsService';

const CONDITIONS = [
  'IBS-D',
  'IBS-C',
  'IBS-M',
  'GERD',
  'Celiac Disease',
  "Crohn's Disease",
  'Lactose Intolerant',
  'SIBO',
  'Gastroparesis',
  'Just Bloating / Unsure',
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
      icon="test_tube"
      title="Do you have a diagnosed condition?"
      subtitle="Select all that apply. This helps us tailor your food analysis."
    >
      <View style={styles.container}>
        <View style={styles.list}>
          {CONDITIONS.map((condition) => (
            <SelectionCard
              key={condition}
              title={condition}
              selected={selected.includes(condition)}
              onPress={() => toggle(condition)}
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
