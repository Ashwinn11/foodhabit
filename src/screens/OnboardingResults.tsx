import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Screen } from '../components/Screen';
import { Text } from '../components/Text';
import { Button } from '../components/Button';
import { Chip } from '../components/Chip';
import { theme } from '../theme/theme';
import { useAppStore } from '../store/useAppStore';

export const OnboardingResults = ({ navigation }: any) => {
  const { onboardingAnswers } = useAppStore();
  const triggers = onboardingAnswers.knownTriggers || [];
  
  // Safe foods logic mock based on condition
  const getSafeFoods = () => {
    if (onboardingAnswers.condition === 'ibs_d') return ['🍚 Rice', '🍗 Chicken', '🥣 Oats'];
    if (onboardingAnswers.condition === 'ibs_c') return ['🥝 Kiwi', '🌾 Quinoa', '🍗 Chicken'];
    return ['🍚 Rice', '🍗 Chicken', '🥣 Oats'];
  };

  const getAvoidLabels = () => {
    if (triggers.length === 0) return ['🧄 Garlic', '🧅 Onion', '🥛 Dairy']; // default generic known killers
    return triggers.map(t => {
      // Map back to labels for display
      const map: any = { dairy: '🥛 Dairy', garlic: '🧄 Garlic', onion: '🧅 Onion', gluten: '🌾 Gluten', caffeine: '☕ Caffeine', spicy: '🌶️ Spicy', alcohol: '🍷 Alcohol', beans: '🫘 Beans' };
      return map[t] || t;
    });
  };

  const safeFoods = getSafeFoods();
  const avoidFoods = getAvoidLabels();

  return (
    <Screen padding={true}>
      <View style={styles.header}>
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { width: '71%' }]} />
        </View>
        <Text variant="caption" style={styles.step}>5 of 7</Text>
      </View>

      <Text variant="hero" style={styles.title}>
        Your Food{`\n`}Safety Map
      </Text>

      <View style={styles.section}>
        <View style={styles.dividerRow}>
          <Text variant="caption" style={{ color: theme.colors.coral }}>── AVOID </Text>
          <View style={styles.divider} />
        </View>
        <View style={styles.chipStack}>
          {avoidFoods.map((f, i) => (
            <View key={i} style={styles.chipWrapper}>
              <Chip label={f} status="risky" />
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.dividerRow}>
          <Text variant="caption" style={{ color: theme.colors.lime }}>── SAFE </Text>
          <View style={styles.divider} />
        </View>
        <View style={styles.chipStack}>
          {safeFoods.map((f, i) => (
            <View key={i} style={styles.chipWrapper}>
              <Chip label={f} status="safe" />
            </View>
          ))}
        </View>
      </View>

      <View style={styles.footer}>
        <Button 
          label="Looks right →" 
          onPress={() => navigation.navigate('OnboardingSocialProof')} 
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
    marginBottom: theme.spacing.giant,
  },
  section: {
    marginBottom: theme.spacing.xxxl,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.border,
    marginLeft: theme.spacing.sm,
  },
  chipStack: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  chipWrapper: {
    marginRight: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  footer: {
    marginTop: 'auto',
    paddingBottom: theme.spacing.xl,
  },
});
