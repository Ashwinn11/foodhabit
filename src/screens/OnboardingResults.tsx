import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Screen } from '../components/Screen';
import { Text } from '../components/Text';
import { Button } from '../components/Button';
import { Chip } from '../components/Chip';
import { Icon } from '../components/Icon';
import { theme } from '../theme/theme';
import { AnalysisResult } from '../services/fodmapService';

export const OnboardingResults = ({ route, navigation }: any) => {
  const analysisData: AnalysisResult[] = route.params?.analysisData || [];
  const avoidFoods = analysisData.filter(r => r.level === 'avoid' || r.level === 'caution');
  const safeFoods  = analysisData.filter(r => r.level === 'safe');
  const displayAvoid = avoidFoods.length > 0 ? avoidFoods.map(f => f.normalizedName) : ['Garlic', 'Dairy'];
  const displaySafe  = safeFoods.length  > 0 ? safeFoods.map(f => f.normalizedName)  : ['Rice', 'Chicken'];

  return (
    <Screen padding={true}>
      <View style={styles.progressRow}>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: '71%' }]} />
        </View>
        <Text variant="caption" style={styles.stepText}>5 of 7</Text>
      </View>

      <Text variant="hero" style={styles.title}>Your Food{'\n'}Safety Map</Text>

      {/* AVOID */}
      <View style={styles.section}>
        <View style={styles.dividerRow}>
          <Text variant="caption" style={{ color: theme.colors.coral }}>── AVOID </Text>
          <View style={styles.divider} />
        </View>
        <View style={styles.chipRow}>
          {displayAvoid.map((name, i) => (
            <Chip key={i} label={name} status="risky" icon={<Icon name="risky" size={14} />} />
          ))}
        </View>
      </View>

      {/* SAFE */}
      <View style={styles.section}>
        <View style={styles.dividerRow}>
          <Text variant="caption" style={{ color: theme.colors.lime }}>── SAFE </Text>
          <View style={styles.divider} />
        </View>
        <View style={styles.chipRow}>
          {displaySafe.map((name, i) => (
            <Chip key={i} label={name} status="safe" icon={<Icon name="safe" size={14} />} />
          ))}
        </View>
      </View>

      <View style={styles.footer}>
        <Button label="Looks right →" onPress={() => navigation.navigate('OnboardingSocialProof')} />
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
  title: { marginBottom: theme.spacing.giant },
  section: { marginBottom: theme.spacing.xxxl },
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
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm },
  footer: { marginTop: 'auto', paddingBottom: theme.spacing.sm },
});
