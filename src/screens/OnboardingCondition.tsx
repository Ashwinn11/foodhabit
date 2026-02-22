import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Screen } from '../components/Screen';
import { Text } from '../components/Text';
import { Button } from '../components/Button';
import { theme } from '../theme/theme';
import { useAppStore } from '../store/useAppStore';

const CONDITIONS = [
  { id: 'ibs_d', icon: '💧', label: 'Mostly diarrhea' },
  { id: 'ibs_c', icon: '🧱', label: 'Mostly constipated' },
  { id: 'bloating', icon: '🫧', label: 'Bloating & gas' },
  { id: 'unsure', icon: '🤷', label: 'Not sure yet' }
];

export const OnboardingCondition = ({ navigation }: any) => {
  const { updateOnboardingAnswers, onboardingAnswers } = useAppStore();
  const [selected, setSelected] = useState<string>(onboardingAnswers.condition || '');

  const handleContinue = () => {
    if (!selected) return;
    updateOnboardingAnswers({ condition: selected });
    navigation.navigate('OnboardingSymptoms');
  };

  return (
    <Screen padding={true}>
      <View style={styles.header}>
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { width: '28%' }]} />
        </View>
        <Text variant="caption" style={styles.step}>2 of 7</Text>
      </View>

      <Text variant="hero" style={styles.title}>
        What best describes{`\n`}your gut?
      </Text>

      <View style={styles.optionsContainer}>
        {CONDITIONS.map((cond) => {
          const isSelected = selected === cond.id;
          return (
            <TouchableOpacity
              key={cond.id}
              activeOpacity={0.8}
              onPress={() => setSelected(cond.id)}
              style={[
                styles.optionCard,
                isSelected && styles.optionCardSelected
              ]}
            >
              <Text variant="title" style={styles.optionIcon}>{cond.icon}</Text>
              <Text variant="body" style={[
                styles.optionLabel,
                isSelected && styles.optionLabelSelected
              ]}>
                {cond.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.footer}>
        <Button 
          label="Continue →" 
          onPress={handleContinue} 
          disabled={!selected}
        />
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xxxl,
  },
  progressContainer: {
    flex: 1,
    height: 4,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.full,
    marginRight: theme.spacing.md,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: theme.colors.coral,
    borderRadius: theme.radii.full,
  },
  step: {
    color: theme.colors.textSecondary,
  },
  title: {
    marginBottom: theme.spacing.xxxl,
  },
  optionsContainer: {
    flex: 1,
  },
  optionCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.lg,
    padding: theme.spacing.xxl,
    marginBottom: theme.spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionCardSelected: {
    borderColor: theme.colors.coral,
    backgroundColor: theme.colors.surfaceHigh,
  },
  optionIcon: {
    marginRight: theme.spacing.lg,
  },
  optionLabel: {
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  optionLabelSelected: {
    color: theme.colors.textPrimary,
  },
  footer: {
    paddingBottom: theme.spacing.xl,
  },
});
