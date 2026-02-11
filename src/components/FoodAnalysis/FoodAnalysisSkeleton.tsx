/**
 * FoodAnalysisSkeleton Component
 * Animated skeleton loader that mimics FoodListItem structure
 * Provides visual feedback during food analysis
 */

import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, withRepeat, withTiming, useSharedValue, Easing } from 'react-native-reanimated';
import { Card } from '../Card';
import { Typography } from '../Typography';
import { colors, spacing, radii } from '../../theme';

interface FoodAnalysisSkeletonProps {
  foodName: string;
}

export const FoodAnalysisSkeleton: React.FC<FoodAnalysisSkeletonProps> = ({ foodName }) => {
  const shimmer = useSharedValue(0);

  useEffect(() => {
    shimmer.value = withRepeat(
      withTiming(1, {
        duration: 1500,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true
    );
  }, [shimmer]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: 0.3 + shimmer.value * 0.4,
  }));

  return (
    <Card
      variant="white"
      padding="md"
      style={[styles.container, { borderLeftColor: colors.mediumGray, borderLeftWidth: 4 }]}
    >
      {/* Header skeleton */}
      <View style={styles.header}>
        {/* Checkbox skeleton */}
        <Animated.View style={[styles.skeleton, styles.checkbox, animatedStyle]} />

        {/* Food name skeleton */}
        <Animated.View style={[styles.skeleton, styles.skeletonText, animatedStyle]} />

        {/* Score badge skeleton */}
        <Animated.View style={[styles.skeleton, styles.badge, animatedStyle]} />
      </View>

      {/* Nutrition grid skeleton */}
      <View style={styles.nutritionGrid}>
        {[0, 1, 2, 3, 4, 5, 6].map(i => (
          <Animated.View
            key={i}
            style={[styles.skeleton, styles.nutrientItem, animatedStyle]}
          />
        ))}
      </View>

      {/* Status text */}
      <Animated.View style={[animatedStyle, { marginTop: spacing.sm }]}>
        <Typography variant="caption" color={colors.black + '60'}>
          Analyzing {foodName}...
        </Typography>
      </Animated.View>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  skeleton: {
    backgroundColor: colors.black + '10',
    borderRadius: radii.sm,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  skeletonText: {
    flex: 1,
    height: 16,
    marginRight: spacing.sm,
  },
  badge: {
    width: 40,
    height: 20,
    borderRadius: radii.sm,
    marginLeft: spacing.xs,
  },
  nutritionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  nutrientItem: {
    flex: 1,
    minWidth: '28%',
    height: 40,
    borderRadius: radii.sm,
  },
});
