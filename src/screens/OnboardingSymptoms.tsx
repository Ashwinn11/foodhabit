import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Screen } from '../components/Screen';
import { Text } from '../components/Text';
import { Button } from '../components/Button';
import { theme } from '../theme/theme';
import { useAppStore } from '../store/useAppStore';

const SYMPTOMS = [
  { id: 'bloating', icon: '🫧', label: 'Bloating' },
  { id: 'gas', icon: '💨', label: 'Gas' },
  { id: 'cramping', icon: '⚡', label: 'Cramping' },
  { id: 'nausea', icon: '🤢', label: 'Nausea' },
  { id: 'diarrhea', icon: '💧', label: 'Diarrhea' },
  { id: 'constipation', icon: '🧱', label: 'Constipation' }
];

export const OnboardingSymptoms = ({ navigation }: any) => {
  const { updateOnboardingAnswers, onboardingAnswers } = useAppStore();
  const [selected, setSelected] = useState<string[]>(onboardingAnswers.symptoms || []);

  const toggleSymptom = (id: string) => {
    setSelected(prev => 
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const handleContinue = () => {
    updateOnboardingAnswers({ symptoms: selected });
    navigation.navigate('OnboardingTriggers');
  };

  return (
    <Screen padding={true} scroll={true}>
      <View style={styles.header}>
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { width: '42%' }]} />
        </View>
        <Text variant="caption" style={styles.step}>3 of 7</Text>
      </View>

      <Text variant="hero" style={styles.title}>
        What do you{`\n`}experience?
      </Text>
      <Text variant="body" style={styles.subtitle}>
        Select all that apply
      </Text>

      <View style={styles.grid}>
        {SYMPTOMS.map((symp) => {
          const isSelected = selected.includes(symp.id);
          return (
            <TouchableOpacity
              key={symp.id}
              activeOpacity={0.8}
              onPress={() => toggleSymptom(symp.id)}
              style={[
                styles.card,
                isSelected && styles.cardSelected
              ]}
            >
              <Text variant="title" style={styles.icon}>{symp.icon}</Text>
              <Text variant="label" style={[
                styles.label,
                isSelected && styles.labelSelected
              ]}>
                {symp.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.footer}>
        <Button 
          label="Continue →" 
          onPress={handleContinue} 
          disabled={selected.length === 0}
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
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xxxl,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.giant,
  },
  card: {
    width: '48%',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  cardSelected: {
    backgroundColor: theme.colors.surfaceHigh,
    borderColor: theme.colors.coral,
  },
  icon: {
    marginBottom: theme.spacing.sm,
  },
  label: {
    color: theme.colors.textSecondary,
  },
  labelSelected: {
    color: theme.colors.textPrimary,
  },
  footer: {
    marginTop: 'auto',
  },
});
