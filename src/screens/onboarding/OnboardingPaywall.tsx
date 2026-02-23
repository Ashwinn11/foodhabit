import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { theme } from '../../theme/theme';
import { Text } from '../../components/Text';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { Icon } from '../../components/Icon';
import { authService } from '../../services/authService';
import { useAppStore } from '../../store/useAppStore';

// RevenueCat integration
let RevenueCatUI: any;
try {
  RevenueCatUI = require('react-native-purchases-ui');
} catch {
  // RevenueCat not configured in dev
}

const FEATURES = [
  'Unlimited menu scans',
  'Personalized gut scores',
  'Trigger food detection',
  'Full gut journal',
  'AI-powered insights',
];

export const OnboardingPaywall: React.FC = () => {
  const navigation = useNavigation<any>();
  const answers = useAppStore((s) => s.onboardingAnswers);
  const setOnboardingCompleted = useAppStore((s) => s.setOnboardingCompleted);

  const [loading, setLoading] = useState(false);

  const handlePurchaseCompleted = async () => {
    setLoading(true);
    try {
      await authService.completeOnboarding(answers);
      setOnboardingCompleted(true);
      // Navigation handled by App.tsx session listener
    } catch (e) {
      Alert.alert('Error', 'Could not complete setup. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // If RevenueCat UI is available, use it
  if (RevenueCatUI?.Paywall) {
    return (
      <RevenueCatUI.Paywall
        onDismiss={() => navigation.goBack()}
        onPurchaseCompleted={handlePurchaseCompleted}
      />
    );
  }

  // Fallback paywall UI when RevenueCat isn't configured
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      <View style={styles.inner}>
        <View style={styles.header}>
          <View style={styles.badgeRow}>
            <View style={styles.badge}>
              <Text variant="caption" color={theme.colors.primaryForeground} style={styles.badgeText}>
                7-DAY FREE TRIAL
              </Text>
            </View>
          </View>
          <Text variant="display" align="center">
            Start eating freely
          </Text>
          <Text variant="body" color={theme.colors.textSecondary} align="center">
            Try GutBuddy Pro free for 7 days, then just $9.99/month.
          </Text>
        </View>

        <Card variant="bordered" style={styles.featureCard}>
          {FEATURES.map((f, i) => (
            <View key={i} style={[styles.featureRow, i > 0 && styles.featureRowBorder]}>
              <View style={styles.checkCircle}>
                <Icon name="Check" size={14} color={theme.colors.primaryForeground} strokeWidth={2.5} />
              </View>
              <Text variant="body">{f}</Text>
            </View>
          ))}
        </Card>

        <View style={styles.actions}>
          <Button
            variant="primary"
            size="lg"
            onPress={handlePurchaseCompleted}
            loading={loading}
            fullWidth
          >
            Start Free Trial
          </Button>
          <Button variant="ghost" size="sm" onPress={() => {}}>
            Restore Purchases
          </Button>
        </View>

        <Text variant="caption" color={theme.colors.textTertiary} align="center" style={styles.legal}>
          Cancel anytime. By subscribing you agree to our{' '}
          <Text variant="caption" color={theme.colors.primary}>Terms</Text>{' '}
          and{' '}
          <Text variant="caption" color={theme.colors.primary}>Privacy Policy</Text>.
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  inner: {
    flex: 1,
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.xxl,
    gap: theme.spacing.xl,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  badgeRow: {
    flexDirection: 'row',
  },
  badge: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.full,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
  },
  badgeText: {
    fontFamily: theme.fonts.bold,
  },
  featureCard: {
    padding: 0,
    overflow: 'hidden',
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    padding: theme.spacing.md,
  },
  featureRowBorder: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  checkCircle: {
    width: 26,
    height: 26,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  actions: {
    gap: theme.spacing.sm,
    alignItems: 'center',
  },
  legal: {
    lineHeight: 18,
    textAlign: 'center',
  },
});
