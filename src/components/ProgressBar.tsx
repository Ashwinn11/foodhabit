import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  Easing 
} from 'react-native-reanimated';
import { theme } from '../theme';



interface ProgressBarProps {
  progress: number; // 0 to 1
  totalSteps?: number; // Optional, if you want to calculate progress
  currentStep?: number; // Optional
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ 
  progress,
  totalSteps,
  currentStep 
}) => {
  const normalizedProgress = totalSteps && currentStep !== undefined 
    ? currentStep / totalSteps 
    : progress;

  const validProgress = Math.min(Math.max(normalizedProgress, 0), 1);
  
  const widthValue = useSharedValue(0);

  useEffect(() => {
    widthValue.value = withTiming(validProgress, {
      duration: 500,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });
  }, [validProgress]);

  const progressStyle = useAnimatedStyle(() => {
    return {
      width: `${widthValue.value * 100}%`,
    };
  });

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.bar, progressStyle]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)', // Subtle dark mode track
    borderRadius: 2,
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    backgroundColor: theme.colors.brand.coral, // Brand color
    borderRadius: 2,
  },
});
