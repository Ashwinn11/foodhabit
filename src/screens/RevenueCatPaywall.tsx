import React from 'react';
import RevenueCatUI, { PAYWALL_RESULT } from 'react-native-purchases-ui';

interface RevenueCatPaywallProps {
  onSubscribe?: () => void;
}

export default function RevenueCatPaywall({ onSubscribe }: RevenueCatPaywallProps) {
  const [hasPresented, setHasPresented] = React.useState(false);

  React.useEffect(() => {
    const presentPaywall = async (): Promise<void> => {
      if (hasPresented) return;
      
      setHasPresented(true);
      
      try {
        // Present paywall for current offering
        const paywallResult: PAYWALL_RESULT = await RevenueCatUI.presentPaywall();
        
        console.log('Paywall result:', paywallResult);
        
        // HARD PAYWALL: Only proceed if user purchased or restored
        switch (paywallResult) {
          case PAYWALL_RESULT.PURCHASED:
            // User successfully purchased - proceed to app
            console.log('✅ User purchased subscription');
            if (onSubscribe) {
              onSubscribe();
            }
            break;
            
          case PAYWALL_RESULT.RESTORED:
            // User restored previous purchase - proceed to app
            console.log('✅ User restored subscription');
            if (onSubscribe) {
              onSubscribe();
            }
            break;
            
          case PAYWALL_RESULT.CANCELLED:
            // User cancelled - stay on paywall, allow retry
            console.log('❌ User cancelled paywall - staying on onboarding');
            // Reset so they can try again
            setHasPresented(false);
            break;
            
          case PAYWALL_RESULT.NOT_PRESENTED:
            // Paywall was not presented - retry
            console.log('⚠️ Paywall not presented - retrying');
            setHasPresented(false);
            // Retry after a short delay
            setTimeout(() => {
              setHasPresented(false);
            }, 1000);
            break;
            
          case PAYWALL_RESULT.ERROR:
            // Error occurred - allow retry
            console.error('❌ Paywall error occurred - user can retry');
            setHasPresented(false);
            break;
            
          default:
            // Unknown result - allow retry
            console.log('⚠️ Unknown paywall result:', paywallResult);
            setHasPresented(false);
            break;
        }
      } catch (error) {
        console.error('Error presenting paywall:', error);
        // On error, allow user to retry
        setHasPresented(false);
      }
    };

    presentPaywall();
  }, [hasPresented, onSubscribe]);

  // Return null - the paywall is presented as a modal by RevenueCat
  return null;
}
