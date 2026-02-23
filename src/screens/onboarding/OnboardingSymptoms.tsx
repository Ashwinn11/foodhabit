import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { OnboardingLayout } from './OnboardingLayout';
import { theme } from '../../theme/theme';
import { Text } from '../../components/Text';
import { Button } from '../../components/Button';
import { Chip } from '../../components/Chip';
import { useAppStore } from '../../store/useAppStore';

const SYMPTOMS = [
  'Bloating',
  'Gas',
  'Cramping',
  'Diarrhea',
  'Constipation',
  'Nausea',
  'Heartburn',
  'Acid Reflux',
  'Brain Fog',
  'Fatigue',
  'Urgency',
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
      icon="face_with_head_bandage"
      title="Which symptoms do you regularly experience?"
      subtitle="Select all that apply after eating."
    >
      <View style={styles.container}>
        {selected.length > 0 && (
          <Text variant="caption" color={theme.colors.primary}>
            {selected.length} symptom{selected.length !== 1 ? 's' : ''} selected
          </Text>
        )}

        <View style={styles.chips}>
          {SYMPTOMS.map((symptom) => (
            <Chip
              key={symptom}
              label={symptom}
              variant="selectable"
              size="md"
              selected={selected.includes(symptom)}
              onPress={() => toggle(symptom)}
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
    gap: theme.spacing.lg,
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
