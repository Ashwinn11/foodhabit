import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Screen } from '../components/Screen';
import { Text } from '../components/Text';
import { Button } from '../components/Button';
import { Icon } from '../components/Icon';
import { theme } from '../theme/theme';
import { useAppStore } from '../store/useAppStore';

const SYMPTOMS = [
  { id: 'bloating',  iconName: 'bloating',  label: 'Bloat' },
  { id: 'gas',       iconName: 'gas',       label: 'Gas' },
  { id: 'cramping',  iconName: 'cramping',  label: 'Cramp' },
  { id: 'nausea',    iconName: 'nausea',    label: 'Nausea' },
  { id: 'ibs_d',     iconName: 'ibs_d',     label: 'Diarrhea' },
  { id: 'ibs_c',     iconName: 'ibs_c',     label: 'Constipation' },
];

export const OnboardingSymptoms = ({ navigation }: any) => {
  const { updateOnboardingAnswers, onboardingAnswers } = useAppStore();
  const [selected, setSelected] = useState<string[]>(onboardingAnswers.symptoms || []);

  const toggle = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelected(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  };

  const handleContinue = () => {
    updateOnboardingAnswers({ symptoms: selected });
    navigation.navigate('OnboardingTriggers');
  };

  return (
    <Screen padding={true}>
      <View style={styles.progressRow}>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: '42%' }]} />
        </View>
        <Text variant="caption" style={styles.stepText}>3 of 7</Text>
      </View>

      <Text variant="hero" style={styles.title}>What do you{'\n'}experience?</Text>
      <Text variant="body" style={styles.sub}>Select all that apply</Text>

      {/* 2-col toggle grid — Selected = coral fill per plan */}
      <View style={styles.grid}>
        {SYMPTOMS.map((s) => {
          const active = selected.includes(s.id);
          return (
            <TouchableOpacity
              key={s.id}
              activeOpacity={0.75}
              onPress={() => toggle(s.id)}
              style={[styles.card, active && styles.cardActive]}
            >
              <Icon name={s.iconName} size={40} />
              <Text variant="label" style={[styles.cardLabel, active && styles.cardLabelActive]}>
                {s.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.footer}>
        <Button label="Continue →" onPress={handleContinue} disabled={selected.length === 0} />
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xxxl,
  },
  progressTrack: {
    flex: 1,
    height: 4,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.full,
    marginRight: theme.spacing.md,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.coral,
    borderRadius: theme.radii.full,
  },
  stepText: { color: theme.colors.textSecondary },
  title: { marginBottom: theme.spacing.sm },
  sub: { color: theme.colors.textSecondary, marginBottom: theme.spacing.xxxl },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
    flex: 1,
  },
  card: {
    width: '47%',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.lg,
    padding: theme.spacing.xl,
    alignItems: 'center',
    gap: theme.spacing.md,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  cardActive: {
    backgroundColor: theme.colors.coral,
    borderColor: theme.colors.coral,
  },
  cardLabel: { color: theme.colors.textSecondary },
  cardLabelActive: { color: '#fff' },
  footer: { paddingTop: theme.spacing.xl, paddingBottom: theme.spacing.sm },
});
