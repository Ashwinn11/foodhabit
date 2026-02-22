import React, { useState } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Screen } from '../components/Screen';
import { Text } from '../components/Text';
import { Button } from '../components/Button';
import { Chip } from '../components/Chip';
import { Icon } from '../components/Icon';
import { theme } from '../theme/theme';
import { useAppStore } from '../store/useAppStore';
import { fodmapService } from '../services/fodmapService';

const TRIGGERS = [
  { id: 'dairy',    iconName: 'dairy',    label: 'Dairy' },
  { id: 'garlic',   iconName: 'garlic',   label: 'Garlic' },
  { id: 'onion',    iconName: 'onion',    label: 'Onion' },
  { id: 'gluten',   iconName: 'gluten',   label: 'Gluten' },
  { id: 'caffeine', iconName: 'caffeine', label: 'Caffeine' },
  { id: 'spicy',    iconName: 'spicy',    label: 'Spicy' },
  { id: 'alcohol',  iconName: 'alcohol',  label: 'Alcohol' },
  { id: 'beans',    iconName: 'beans',    label: 'Beans' },
];

export const OnboardingTriggers = ({ navigation }: any) => {
  const { updateOnboardingAnswers, onboardingAnswers } = useAppStore();
  const [selected, setSelected] = useState<string[]>(onboardingAnswers.knownTriggers || []);
  const [loading, setLoading] = useState(false);

  const toggle = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelected(prev => prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]);
  };

  const handleContinue = async () => {
    updateOnboardingAnswers({ knownTriggers: selected });
    setLoading(true);
    try {
      const testFoods = [...selected, 'Rice', 'Chicken breast', 'Oatmeal', 'Apples', 'Bread'].filter(Boolean);
      const results = await fodmapService.analyzeFoods(testFoods);
      navigation.navigate('OnboardingResults', { analysisData: results });
    } catch {
      navigation.navigate('OnboardingResults', { analysisData: null });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen padding={true} scroll={true}>
      <View style={styles.progressRow}>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: '56%' }]} />
        </View>
        <Text variant="caption" style={styles.stepText}>4 of 7</Text>
      </View>

      <Text variant="hero" style={styles.title}>Foods you already{'\n'}know bother you?</Text>
      <Text variant="body" style={styles.sub}>We use this to pre-seed your personalised AI.</Text>

      <View style={styles.chipGrid}>
        {TRIGGERS.map((t) => (
          <Chip
            key={t.id}
            label={t.label}
            icon={<Icon name={t.iconName} size={18} />}
            selected={selected.includes(t.id)}
            onPress={() => toggle(t.id)}
          />
        ))}
      </View>

      {loading && (
        <View style={styles.loadingRow}>
          <ActivityIndicator color={theme.colors.coral} size="small" />
          <Text variant="caption" style={styles.loadingText}>Building your gut model…</Text>
        </View>
      )}

      <View style={styles.footer}>
        <Button
          label={selected.length > 0 ? 'Continue →' : 'Skip for now →'}
          onPress={handleContinue}
          disabled={loading}
          loading={loading}
        />
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
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.giant,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  loadingText: { color: theme.colors.textSecondary },
  footer: { paddingBottom: theme.spacing.sm },
});
