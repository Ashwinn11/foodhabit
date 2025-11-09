import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';
import { theme } from '../../theme';

interface ProgressIndicatorProps {
  currentStep: number; // 0-based (0, 1, 2, 3, 4, 5)
  totalSteps: number; // 5 for 5-step onboarding
}

/**
 * Progress Indicator Component
 * Shows progress dots for onboarding flow
 * Active dot: #ff7664, Inactive: white (transparent)
 */
export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({ currentStep, totalSteps }) => {
  const dotSize = 8;
  const dotSpacing = 12;

  return (
    <View style={styles.container}>
      <View style={styles.dotsContainer}>
        {Array.from({ length: totalSteps }).map((_, index) => (
          <Animated.View
            key={index}
            style={[
              styles.dot,
              {
                width: dotSize,
                height: dotSize,
                borderRadius: dotSize / 2,
                marginHorizontal: dotSpacing / 2,
              },
              index <= currentStep
                ? styles.dotActive
                : styles.dotInactive,
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.lg,
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  dotActive: {
    backgroundColor: theme.colors.brand.white,
  },
  dotInactive: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
});
