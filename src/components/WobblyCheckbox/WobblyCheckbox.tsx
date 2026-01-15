import React from 'react';
import { View, Text, StyleSheet, Pressable, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { colors, spacing, radii, shadows, fontSizes, fonts } from '../../theme';

interface WobblyCheckboxProps {
  checked: boolean;
  onToggle: () => void;
  label?: string;
  subtitle?: string;
  style?: ViewStyle;
  showYay?: boolean;
}

export const WobblyCheckbox: React.FC<WobblyCheckboxProps> = ({
  checked,
  onToggle,
  label,
  subtitle,
  style,
  showYay = true,
}) => {
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);
  const checkScale = useSharedValue(checked ? 1 : 0);
  const yayOpacity = useSharedValue(0);
  const yayTranslateY = useSharedValue(0);
  
  React.useEffect(() => {
    if (checked) {
      checkScale.value = withSpring(1, { damping: 8, stiffness: 200 });
      if (showYay) {
        yayOpacity.value = withSequence(
          withTiming(1, { duration: 200 }),
          withTiming(1, { duration: 800 }),
          withTiming(0, { duration: 300 })
        );
        yayTranslateY.value = withSequence(
          withTiming(-20, { duration: 300 }),
          withTiming(-30, { duration: 1000 })
        );
      }
    } else {
      checkScale.value = withSpring(0);
      yayOpacity.value = 0;
      yayTranslateY.value = 0;
    }
  }, [checked, checkScale, yayOpacity, yayTranslateY, showYay]);
  
  const handlePress = () => {
    // Wobbly animation
    rotation.value = withSequence(
      withTiming(-15, { duration: 50 }),
      withTiming(15, { duration: 50 }),
      withTiming(-10, { duration: 50 }),
      withTiming(10, { duration: 50 }),
      withTiming(-5, { duration: 50 }),
      withTiming(5, { duration: 50 }),
      withTiming(0, { duration: 50 })
    );
    
    scale.value = withSequence(
      withSpring(0.85),
      withSpring(1.1),
      withSpring(1)
    );
    
    onToggle();
  };
  
  const containerStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${rotation.value}deg` },
    ],
  }));
  
  const checkmarkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
    opacity: interpolate(checkScale.value, [0, 1], [0, 1], Extrapolate.CLAMP),
  }));
  
  const yayStyle = useAnimatedStyle(() => ({
    opacity: yayOpacity.value,
    transform: [{ translateY: yayTranslateY.value }],
  }));
  
  return (
    <Pressable onPress={handlePress} style={[styles.container, style]}>
      <Animated.View style={containerStyle}>
        <View style={[styles.checkboxOuter, checked && styles.checkboxChecked]}>
          <Animated.View style={[styles.checkmarkContainer, checkmarkStyle]}>
            {/* Hand-drawn style checkmark */}
            <Text style={styles.checkmark}>✓</Text>
          </Animated.View>
        </View>
      </Animated.View>
      
      {(label || subtitle) && (
        <View style={styles.labelContainer}>
          {label && (
            <Text style={[styles.label, checked && styles.labelChecked]}>
              {label}
            </Text>
          )}
          {subtitle && (
            <Text style={styles.subtitle}>{subtitle}</Text>
          )}
        </View>
      )}
      
      {/* Yay! badge that appears on check */}
      {showYay && (
        <Animated.View style={[styles.yayBadge, yayStyle]}>
          <Text style={styles.yayText}>Yay!</Text>
        </Animated.View>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  checkboxOuter: {
    width: 28,
    height: 28,
    borderRadius: radii.lg,
    borderWidth: 2.5,
    borderColor: colors.border,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.sm,
  },
  checkboxChecked: {
    backgroundColor: colors.blue,
    borderColor: colors.blue,
  },
  checkmarkContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    fontSize: 18,
    fontFamily: fonts.heading,
    color: colors.white,
    marginTop: -2,
  },
  labelContainer: {
    marginLeft: spacing.md,
    flex: 1,
  },
  label: {
    fontSize: fontSizes.lg,
    fontFamily: fonts.bodyBold,
    color: colors.black,
  },
  labelChecked: {
    textDecorationLine: 'line-through',
    color: colors.black + '40',
  },
  subtitle: {
    fontSize: fontSizes.sm,
    color: colors.black + '66',
    marginTop: 2,
  },
  yayBadge: {
    position: 'absolute',
    right: 0,
    top: 0,
    backgroundColor: colors.yellow,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.full,
    ...shadows.sm,
  },
  yayText: {
    fontSize: fontSizes.xs,
    fontFamily: fonts.bodyBold,
    color: colors.black,
  },
});
