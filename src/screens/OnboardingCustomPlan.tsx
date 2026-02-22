import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, Dimensions } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { Screen } from '../components/Screen';
import { Text } from '../components/Text';
import { Button } from '../components/Button';
import { Chip } from '../components/Chip';
import { Icon } from '../components/Icon';
import { theme } from '../theme/theme';
import { useAppStore } from '../store/useAppStore';
import { authService } from '../services/authService';
import Purchases from 'react-native-purchases';

const SCREEN_W = Dimensions.get('window').width;
const TRACK_W  = SCREEN_W - theme.spacing.xl * 2 - 56;
const PROGRESS = TRACK_W * 1.0;

const CONDITION_LABEL: Record<string, string> = {
  ibs_d:    'IBS-D (Diarrhea)',
  ibs_c:    'IBS-C (Constipation)',
  bloating: 'Bloating & Gas',
};

export const OnboardingCustomPlan = ({ navigation }: any) => {
  const { onboardingAnswers, setOnboardingCompleted } = useAppStore();
  const [loading, setLoading] = useState(false);

  const progressAnim = useSharedValue(0);
  useEffect(() => { progressAnim.value = withTiming(PROGRESS, { duration: 600 }); }, []);
  const progressStyle = useAnimatedStyle(() => ({ width: progressAnim.value }));

  const conditionName = CONDITION_LABEL[onboardingAnswers.condition] ?? 'Gut Sensitivity';
  const triggers      = onboardingAnswers.knownTriggers ?? [];

  const handleStartTrial = async () => {
    setLoading(true);
    try {
      await authService.completeOnboarding(onboardingAnswers);
      setOnboardingCompleted(true);
      try {
        if (await Purchases.isConfigured()) {
          const offerings = await Purchases.getOfferings();
          if (offerings.current?.availablePackages.length) {
            await Purchases.purchasePackage(offerings.current.availablePackages[0]);
          }
        }
      } catch (rcError: any) {
        if (!rcError.userCancelled) console.error('RevenueCat error:', rcError);
      }
      navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
    } catch (e: any) {
      Alert.alert('Error saving profile', e.message);
    } finally { setLoading(false); }
  };

  return (
    <Screen padding>
      {/* Progress */}
      <View style={styles.progressRow}>
        <View style={styles.progressTrack}>
          <Animated.View style={[styles.progressFill, progressStyle]} />
        </View>
        <Text variant="caption" style={styles.stepText}>7 of 7</Text>
      </View>

      {/* Hero icon in coral-tint circle */}
      <View style={styles.heroIconContainer}>
        <View style={styles.heroIconRing}>
          <Icon name="understand" size={36} color={theme.colors.coral} />
        </View>
      </View>

      {/* Header */}
      <Text variant="hero" style={styles.title}>Your gut plan{'\n'}is ready.</Text>

      {/* Plan card — structured reveal */}
      <View style={styles.planCard}>
        {/* Condition block */}
        <Text variant="caption" style={styles.planSection}>YOUR CONDITION</Text>
        <Text variant="title" style={styles.planCondition}>{conditionName}</Text>

        <View style={styles.planDivider} />

        {/* Avoid block */}
        <Text variant="caption" style={styles.planSection}>TOP TRIGGERS TO AVOID</Text>
        <View style={styles.chipRow}>
          {triggers.length > 0
            ? triggers.map((t: string) => (
                <Chip key={t} label={t.charAt(0).toUpperCase() + t.slice(1)} status="risky" />
              ))
            : <Chip label="Unknown — will learn from scans" status="risky" />
          }
        </View>
      </View>

      <Text variant="body" style={styles.learningText}>
        Your AI starts learning from your very first scan.
      </Text>

      <View style={styles.footer}>
        <Button label="Start My Free Trial" onPress={handleStartTrial} loading={loading} />
        <Text variant="caption" style={styles.disclaimer}>Cancel anytime. No commitment.</Text>
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
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: theme.radii.full,
    marginRight: theme.spacing.md,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.coral,
    borderRadius: theme.radii.full,
  },
  stepText: { color: theme.colors.textPrimary, fontFamily: 'Inter_700Bold' },
  heroIconContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.xxxl,
  },
  heroIconRing: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(224,93,76,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(224,93,76,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { marginBottom: theme.spacing.xxxl },
  planCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.xl,
    padding: theme.spacing.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    marginBottom: theme.spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 3, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  planSection: {
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  planCondition: {
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xl,
  },
  planDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginBottom: theme.spacing.xl,
  },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm },
  learningText: {
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: theme.spacing.xxxl,
  },
  footer: {
    marginTop: 'auto',
    paddingBottom: theme.spacing.sm,
  },
  disclaimer: {
    textAlign: 'center',
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.lg,
    textTransform: 'none',
    letterSpacing: 0,
    fontSize: 12,
  },
});
