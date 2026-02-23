import React, { useEffect } from 'react';
import { View, ActivityIndicator, Alert } from 'react-native';
import RevenueCatUI from 'react-native-purchases-ui';
import { PAYWALL_RESULT } from '@revenuecat/purchases-typescript-internal';
import { ENTITLEMENT_ID } from '../../services/purchasesService';
import { authService } from '../../services/authService';
import { analyticsService } from '../../services/analyticsService';
import { useAppStore } from '../../store/useAppStore';
import { theme } from '../../theme/theme';

export const OnboardingPaywall: React.FC = () => {
  const answers = useAppStore((s) => s.onboardingAnswers);
  const setOnboardingCompleted = useAppStore((s) => s.setOnboardingCompleted);
  const variant = useAppStore((s) => s.onboardingVariant) ?? 'A';

  const completeOnboarding = async () => {
    try {
      analyticsService.logObPurchase(variant);
      await authService.completeOnboarding(answers);
      analyticsService.logObComplete();
      setOnboardingCompleted(true);
    } catch {
      Alert.alert('Error', 'Could not complete setup. Please try again.');
    }
  };

  const showPaywall = async () => {
    analyticsService.logObPaywallView(variant);
    const result = await RevenueCatUI.presentPaywallIfNeeded({
      requiredEntitlementIdentifier: ENTITLEMENT_ID,
      displayCloseButton: false,
    });

    switch (result) {
      case PAYWALL_RESULT.PURCHASED:
      case PAYWALL_RESULT.RESTORED:
      case PAYWALL_RESULT.NOT_PRESENTED:
        await completeOnboarding();
        break;
      case PAYWALL_RESULT.CANCELLED:
        analyticsService.logObPaywallDismiss(variant);
        showPaywall();
        break;
    }
  };

  useEffect(() => {
    showPaywall();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background, alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator color={theme.colors.primary} />
    </View>
  );
};
