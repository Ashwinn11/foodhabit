import React from 'react';
import { checkSubscriptionStatus } from '../services/revenueCatService';
import RevenueCatUI from 'react-native-purchases-ui';

interface RevenueCatPaywallProps {
  onSubscribe?: () => void;
}

export default function RevenueCatPaywall({ onSubscribe }: RevenueCatPaywallProps) {
  const handlePurchaseCompleted = async () => {
    const hasSubscription = await checkSubscriptionStatus();
    if (hasSubscription && onSubscribe) {
      onSubscribe();
    }
  };

  return <RevenueCatUI.Paywall onPurchaseCompleted={handlePurchaseCompleted} />;
}
