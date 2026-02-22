import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Screen } from '../components/Screen';
import { Text } from '../components/Text';
import { Button } from '../components/Button';
import { Chip } from '../components/Chip';
import { theme } from '../theme/theme';
import { useAppStore } from '../store/useAppStore';

const COMMON_TRIGGERS = [
  { id: 'dairy', icon: '🥛', label: 'Dairy' },
  { id: 'garlic', icon: '🧄', label: 'Garlic' },
  { id: 'onion', icon: '🧅', label: 'Onion' },
  { id: 'gluten', icon: '🌾', label: 'Gluten' },
  { id: 'caffeine', icon: '☕', label: 'Caffeine' },
  { id: 'spicy', icon: '🌶️', label: 'Spicy' },
  { id: 'alcohol', icon: '🍷', label: 'Alcohol' },
  { id: 'beans', icon: '🫘', label: 'Beans' }
];

export const OnboardingTriggers = ({ navigation }: any) => {
  const { updateOnboardingAnswers, onboardingAnswers } = useAppStore();
  const [selected, setSelected] = useState<string[]>(onboardingAnswers.knownTriggers || []);

  const toggleTrigger = (id: string) => {
    setSelected(prev => 
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
  };

  const handleContinue = () => {
    updateOnboardingAnswers({ knownTriggers: selected });
    navigation.navigate('OnboardingResults');
  };

  return (
    <Screen padding={true} scroll={true}>
      <View style={styles.header}>
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { width: '56%' }]} />
        </View>
        <Text variant="caption" style={styles.step}>4 of 7</Text>
      </View>

      <Text variant="hero" style={styles.title}>
        Foods you already{`\n`}know bother you?
      </Text>
      <Text variant="body" style={styles.subtitle}>
        We use this to pre-seed your personalized AI.
      </Text>

      <View style={styles.chipContainer}>
        {COMMON_TRIGGERS.map((trigger) => (
          <View key={trigger.id} style={styles.chipWrapper}>
            <Chip 
              icon={<Text variant="label">{trigger.icon}</Text>}
              label={trigger.label}
              selected={selected.includes(trigger.id)}
              onPress={() => toggleTrigger(trigger.id)}
            />
          </View>
        ))}
      </View>

      <View style={styles.footer}>
        <Button 
          label={selected.length > 0 ? "Continue →" : "Skip for now →"}
          onPress={handleContinue} 
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
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: theme.spacing.giant,
  },
  chipWrapper: {
    marginRight: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  footer: {
    marginTop: 'auto',
  },
});
