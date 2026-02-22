import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Screen } from '../components/Screen';
import { Text } from '../components/Text';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Icon } from '../components/Icon';
import { theme } from '../theme/theme';
import { useAppStore } from '../store/useAppStore';
import { authService } from '../services/authService';
import Purchases from 'react-native-purchases';

export const OnboardingCustomPlan = ({ navigation }: any) => {
  const { onboardingAnswers, setOnboardingCompleted } = useAppStore();
  const [loading, setLoading] = useState(false);

  const handleStartTrial = async () => {
    setLoading(true);
    try {
      // 1. Save REAL onboarding data to Supabase
      await authService.completeOnboarding(onboardingAnswers);
      setOnboardingCompleted(true);
      
      // 2. Trigger REAL RevenueCat Paywall natively
      try {
        if (await Purchases.isConfigured()) {
           // We try to fetch offerings to see if it's set up
           const offerings = await Purchases.getOfferings();
           if (offerings.current !== null && offerings.current.availablePackages.length !== 0) {
             // Basic purchase flow initiation - since Paywall UI isn't fully configured in bare React Native by default without RevenueCat UI
             // We will try triggering the purchase of the first package as a trial
             const packageToBuy = offerings.current.availablePackages[0];
             await Purchases.purchasePackage(packageToBuy);
           }
        }
      } catch (rcError: any) {
        if (!rcError.userCancelled) {
           console.error("RevenueCat purchase error:", rcError);
           // We intentionally swallow non-cancel errors here so the user isn't permanently locked out of the app during dev
        }
      }
      
      // Navigate to main tabs
      navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
    } catch (e: any) {
      console.error(e);
      Alert.alert("Error saving profile", e.message);
    } finally {
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

  const TopAvoids = () => {
    const triggers = onboardingAnswers.knownTriggers;
    if (triggers && triggers.length > 0) {
      return (
        <View style={styles.avoidsContainer}>
          {triggers.map((t: string) => (
             <View key={t} style={styles.avoidPill}>
               <Icon name="risky" size={12} />
               <Text variant="body" style={styles.avoidText}>{t}</Text>
             </View>
          ))}
        </View>
      );
    }
    return (
      <View style={styles.avoidsContainer}>
        <View style={styles.avoidPill}>
           <Icon name="risky" size={12} />
           <Text variant="body" style={styles.avoidText}>Unknown</Text>
        </View>
      </View>
    );
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
        Your gut plan{`\n`}is ready.{' '}
        <Icon name="check" size={24} style={{ display: 'flex', marginTop: 12 }} />
      </Text>

      <Card elevated={true} style={styles.planCard}>
        <View style={styles.planRow}>
          <Text variant="label" style={styles.planLabel}>Condition:</Text>
          <Text variant="body" style={styles.planValue}>{getConditionName()}</Text>
        </View>
        <View style={[styles.planRow, { alignItems: 'flex-start' }]}>
          <Text variant="label" style={styles.planLabel}>Top avoid:</Text>
          <TopAvoids />
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
    backgroundColor: theme.colors.lime, 
    borderRadius: theme.radii.full,
  },
  step: {
    color: theme.colors.textSecondary,
  },
  title: {
    marginBottom: theme.spacing.xxxl,
    flexDirection: 'row',
    alignItems: 'center',
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
    alignItems: 'center'
  },
  planLabel: {
    width: 100,
    color: theme.colors.textSecondary,
  },
  planValue: {
    flex: 1,
    color: theme.colors.textPrimary,
  },
  avoidsContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  avoidPill: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: theme.spacing.md,
    marginBottom: theme.spacing.sm
  },
  avoidText: {
    color: theme.colors.textPrimary,
    marginLeft: 6,
    textTransform: 'capitalize'
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
