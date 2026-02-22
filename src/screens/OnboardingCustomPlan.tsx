import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Screen } from '../components/Screen';
import { Text } from '../components/Text';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { theme } from '../theme/theme';
import { useAppStore } from '../store/useAppStore';
// import { authService } from '../services/authService';
// Import revenue cat here
// import Purchases from 'react-native-purchases';

export const OnboardingCustomPlan = ({ navigation }: any) => {
  const { onboardingAnswers } = useAppStore();
  const [loading, setLoading] = useState(false);

  const handleStartTrial = async () => {
    setLoading(true);
    try {
      // 1. Save onboarding data directly to user in supabase
      // await authService.completeOnboarding(onboardingAnswers);
      
      // 2. Trigger RevenueCat Paywall UI natively
      // const paywallResult = await RevenueCatUI.presentPaywall();
      
      // Temporary manual route to main tabs for testing Phase 5:
      navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  const getConditionName = () => {
    const c = onboardingAnswers.condition;
    if (c === 'ibs_d') return 'IBS-D (Diarrhea)';
    if (c === 'ibs_c') return 'IBS-C (Constipation)';
    if (c === 'bloating') return 'Bloating & Gas';
    return 'Gut Sensitivity';
  };

  const getTopAvoids = () => {
    if (onboardingAnswers.knownTriggers?.length > 0) {
      return onboardingAnswers.knownTriggers.map((t: string) => `🔴 ${t}`).join('  ');
    }
    return '🔴 Garlic  🔴 Dairy'; // Generic
  };

  return (
    <Screen padding={true}>
      <View style={styles.header}>
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { width: '100%' }]} />
        </View>
        <Text variant="caption" style={styles.step}>7 of 7</Text>
      </View>

      <Text variant="hero" style={styles.title}>
        Your gut plan{`\n`}is ready. ✓
      </Text>

      <Card elevated={true} style={styles.planCard}>
        <View style={styles.planRow}>
          <Text variant="label" style={styles.planLabel}>Condition:</Text>
          <Text variant="body" style={styles.planValue}>{getConditionName()}</Text>
        </View>
        <View style={styles.planRow}>
          <Text variant="label" style={styles.planLabel}>Top avoid:</Text>
          <Text variant="body" style={styles.planValue}>{getTopAvoids()}</Text>
        </View>
      </Card>

      <Text variant="body" style={styles.learningText}>
        Your food AI starts learning{`\n`}from your very first scan.
      </Text>

      <View style={styles.footer}>
        <Button 
          label="Start My Free Trial →" 
          onPress={handleStartTrial} 
          loading={loading}
        />
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.giant,
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
    backgroundColor: theme.colors.lime, // Full green at end
    borderRadius: theme.radii.full,
  },
  step: {
    color: theme.colors.textSecondary,
  },
  title: {
    marginBottom: theme.spacing.xxxl,
  },
  planCard: {
    backgroundColor: theme.colors.surfaceHigh,
    borderColor: theme.colors.border,
    borderWidth: 1,
    marginBottom: theme.spacing.xxxl,
  },
  planRow: {
    flexDirection: 'row',
    marginBottom: theme.spacing.md,
  },
  planLabel: {
    width: 100,
    color: theme.colors.textSecondary,
  },
  planValue: {
    flex: 1,
    color: theme.colors.textPrimary,
  },
  learningText: {
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  footer: {
    marginTop: 'auto',
    paddingBottom: theme.spacing.xl,
  },
});
