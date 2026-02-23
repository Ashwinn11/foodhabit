import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { OnboardingLayout } from './OnboardingLayout';
import { theme } from '../../theme/theme';
import { Button } from '../../components/Button';
import { Chip } from '../../components/Chip';
import { useAppStore } from '../../store/useAppStore';

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
    updateOnboardingAnswers({ condition: selected.join(', ') });
    navigation.navigate('OnboardingSymptoms');
  };

  return (
    <OnboardingLayout
      step={3}
      scroll
      icon="test_tube"
      title="Do you have a diagnosed condition?"
      subtitle="This helps us tailor your food analysis."
    >
      <View style={styles.container}>
        <View style={styles.chips}>
          {CONDITIONS.map((condition) => (
            <Chip
              key={condition}
              label={condition}
              variant="selectable"
              size="md"
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
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  footer: {
    paddingBottom: theme.spacing.xl,
    marginTop: 'auto',
  },
});
