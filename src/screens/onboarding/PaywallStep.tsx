import React from 'react';
import RevenueCatPaywall from '../RevenueCatPaywall';

interface PaywallStepProps {
  onComplete: () => void;
  onBack?: () => void;
}

export const PaywallStep: React.FC<PaywallStepProps> = ({ onComplete, onBack }) => {
  return <RevenueCatPaywall onSubscribe={onComplete} onBack={onBack} />;
};

