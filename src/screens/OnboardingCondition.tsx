import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Screen } from '../components/Screen';
import { Text } from '../components/Text';
import { Button } from '../components/Button';
import { Icon } from '../components/Icon';
import { theme } from '../theme/theme';
import { useAppStore } from '../store/useAppStore';

const CONDITIONS = [
  { id: 'ibs_d',    iconName: 'ibs_d',    label: 'Mostly diarrhea' },
  { id: 'ibs_c',    iconName: 'ibs_c',    label: 'Mostly constipated' },
  { id: 'bloating', iconName: 'bloating', label: 'Bloating & gas' },
  { id: 'unsure',   iconName: 'unsure',   label: 'Not sure yet' },
];

export const OnboardingCondition = ({ navigation }: any) => {
  const { updateOnboardingAnswers, onboardingAnswers } = useAppStore();
  const [selected, setSelected] = useState<string>(onboardingAnswers.condition || '');

  const handleSelect = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelected(id);
  };

  const handleContinue = () => {
    if (!selected) return;
    updateOnboardingAnswers({ condition: selected });
    navigation.navigate('OnboardingSymptoms');
  };

  return (
    <Screen padding={true}>
      <View style={styles.progressRow}>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: '28%' }]} />
        </View>
        <Text variant="caption" style={styles.stepText}>2 of 7</Text>
      </View>

      <Text variant="hero" style={styles.title}>What best describes{'\n'}your gut?</Text>

      <View style={styles.options}>
        {CONDITIONS.map((c) => {
          const active = selected === c.id;
          return (
            <TouchableOpacity
              key={c.id}
              activeOpacity={0.75}
              onPress={() => handleSelect(c.id)}
              style={[styles.card, active && styles.cardActive]}
            >
              <Icon name={c.iconName} size={36} />
              <Text variant="body" style={[styles.cardLabel, active && styles.cardLabelActive]}>
                {c.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.footer}>
        <Button label="Continue →" onPress={handleContinue} disabled={!selected} />
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
  title: { marginBottom: theme.spacing.xxxl },
  options: { flex: 1, gap: theme.spacing.md },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.lg,
    padding: theme.spacing.xl,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  cardActive: {
    backgroundColor: 'rgba(255,107,107,0.10)',
    borderColor: theme.colors.coral,
  },
  cardLabel: { color: theme.colors.textSecondary, flex: 1 },
  cardLabelActive: { color: theme.colors.textPrimary },
  footer: { paddingTop: theme.spacing.xl, paddingBottom: theme.spacing.sm },
});
