import React from 'react';
import PaywallScreen from '../PaywallScreen';

interface PaywallStepProps {
  onComplete: () => void;
}

export const PaywallStep: React.FC<PaywallStepProps> = ({ onComplete }) => {
  return (
    <PaywallScreen 
      onSubscribe={onComplete}
      showCloseButton={false}
    />
  );
};
