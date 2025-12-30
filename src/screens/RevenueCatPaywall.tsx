import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { checkSubscriptionStatus } from '../services/revenueCatService';
import RevenueCatUI from 'react-native-purchases-ui';
import { theme } from '../theme';

interface RevenueCatPaywallProps {
  onSubscribe?: () => void;
  onBack?: () => void;
  navigation?: any; // For closing modal when already subscribed
}

export default function RevenueCatPaywall({ onSubscribe, onBack, navigation }: RevenueCatPaywallProps) {
  const [hasSubscription, setHasSubscription] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    const checkSub = async () => {
      const sub = await checkSubscriptionStatus();
      setHasSubscription(sub);
      if (sub) {
        // User is already subscribed, call onSubscribe callback and close modal
        if (onSubscribe) {
          onSubscribe();
        }
        // Close the modal since user is already subscribed
        if (navigation) {
          navigation.goBack();
        }
      }
    };
    checkSub();
  }, [onSubscribe, navigation]);

  const handlePurchaseCompleted = async () => {
    const sub = await checkSubscriptionStatus();
    if (sub && onSubscribe) {
      onSubscribe();
    }
  };

  if (hasSubscription === null) {
    return null; // Loading
  }

  if (hasSubscription) {
    return null; // Already subscribed, don't show paywall
  }

  return (
    <View style={styles.container}>
      {onBack && (
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text.white} />
        </TouchableOpacity>
      )}
      <RevenueCatUI.Paywall onPurchaseCompleted={handlePurchaseCompleted} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
    padding: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
  },
});
