import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../components';
import { theme } from '../theme';
import RevenueCatUI from 'react-native-purchases-ui';
import { getOfferings, restorePurchases, checkSubscriptionStatus } from '../services/revenueCatService';

interface RevenueCatPaywallProps {
  navigation?: any;
  onSubscribe?: () => void;
  onClose?: () => void;
  showCloseButton?: boolean;
}

export default function RevenueCatPaywall({ 
  navigation, 
  onSubscribe: onSubscribeProp,
  onClose: onCloseProp,
  showCloseButton = true 
}: RevenueCatPaywallProps) {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [hasOfferings, setHasOfferings] = useState(false);

  useEffect(() => {
    checkForOfferings();
  }, []);

  const checkForOfferings = async () => {
    try {
      const offerings = await getOfferings();
      setHasOfferings(offerings !== null);
    } catch (error) {
      console.error('Error checking offerings:', error);
      setHasOfferings(false);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (onCloseProp) {
      onCloseProp();
    } else {
      navigation?.goBack();
    }
  };

  const handleRestorePurchases = async () => {
    try {
      const restored = await restorePurchases();
      if (restored) {
        Alert.alert('Success', 'Your purchases have been restored!');
        if (onSubscribeProp) {
          onSubscribeProp();
        } else {
          handleClose();
        }
      } else {
        Alert.alert('No Purchases Found', 'We couldn\'t find any previous purchases to restore.');
      }
    } catch (error) {
      console.error('Error restoring purchases:', error);
      Alert.alert('Error', 'Failed to restore purchases. Please try again.');
    }
  };

  const handlePurchaseCompleted = async () => {
    // Check if user now has active subscription
    const hasSubscription = await checkSubscriptionStatus();
    if (hasSubscription) {
      if (onSubscribeProp) {
        onSubscribeProp();
      } else {
        handleClose();
      }
    }
  };

  if (loading) {
    return (
      <LinearGradient
        colors={[theme.colors.brand.backgroundGradientStart, theme.colors.brand.backgroundGradientEnd]}
        style={styles.container}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.brand.coral} />
          <Text variant="body" style={styles.loadingText}>Loading...</Text>
        </View>
      </LinearGradient>
    );
  }

  if (!hasOfferings) {
    return (
      <LinearGradient
        colors={[theme.colors.brand.backgroundGradientStart, theme.colors.brand.backgroundGradientEnd]}
        style={styles.container}
      >
        <View style={styles.errorContainer}>
          {showCloseButton && (
            <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
              <Ionicons name="close" size={28} color={theme.colors.text.white} />
            </TouchableOpacity>
          )}
          <Ionicons name="alert-circle" size={64} color={theme.colors.brand.coral} />
          <Text variant="title3" style={styles.errorTitle}>
            Offerings Unavailable
          </Text>
          <Text variant="body" style={styles.errorMessage}>
            We couldn't load the subscription options. Please check your internet connection and try again.
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => {
              setLoading(true);
              checkForOfferings();
            }}
          >
            <Text variant="body" weight="semiBold" style={styles.retryButtonText}>
              Try Again
            </Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={[theme.colors.brand.backgroundGradientStart, theme.colors.brand.backgroundGradientEnd]}
      style={styles.container}
    >
      {showCloseButton && (
        <TouchableOpacity
          style={[styles.closeButton, { top: insets.top + 10 }]}
          onPress={handleClose}
        >
          <Ionicons name="close" size={28} color={theme.colors.text.white} />
        </TouchableOpacity>
      )}

      <RevenueCatUI.Paywall
        onPurchaseCompleted={handlePurchaseCompleted}
        onRestoreCompleted={handlePurchaseCompleted}
        onDismiss={handleClose}
      />

    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: theme.spacing.md,
    color: theme.colors.text.white,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  errorTitle: {
    color: theme.colors.text.white,
    marginTop: theme.spacing.lg,
    textAlign: 'center',
  },
  errorMessage: {
    color: theme.colors.brand.cream,
    marginTop: theme.spacing.md,
    textAlign: 'center',
    opacity: 0.8,
  },
  retryButton: {
    marginTop: theme.spacing.xl,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.brand.coral,
    borderRadius: theme.borderRadius.lg,
  },
  retryButtonText: {
    color: theme.colors.text.white,
  },
  closeButton: {
    position: 'absolute',
    right: theme.spacing.md,
    zIndex: 1000,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingTop: theme.spacing.md,
  },
  restoreButton: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
  },
  restoreText: {
    color: theme.colors.brand.cream,
    opacity: 0.8,
  },
});
