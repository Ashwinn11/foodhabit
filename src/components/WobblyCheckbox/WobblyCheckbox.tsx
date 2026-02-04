import React from 'react';
import { View, StyleSheet, Pressable, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { colors, spacing, radii, shadows } from '../../theme/theme';
import { Typography } from '../Typography';
import { IconContainer } from '../IconContainer/IconContainer';

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
            <IconContainer 
              name="checkmark" 
              size={20} 
              iconSize={16} 
              color={colors.white} 
              backgroundColor="transparent"
              borderWidth={0}
              shadow={false}
            />
          </Animated.View>
        </View>
      </Animated.View>
      
      {(label || subtitle) && (
        <View style={styles.labelContainer}>
          {label && (
            <Typography 
              variant="h4" 
              color={checked ? colors.black + '40' : colors.black}
              style={checked ? styles.labelChecked : undefined}
            >
              {label}
            </Typography>
          )}
          {subtitle && (
            <Typography variant="bodySmall" color={colors.black + '66'} style={{ marginTop: 2 }}>
              {subtitle}
            </Typography>
          )}
        </View>
      )}
      
      {/* Yay! badge that appears on check */}
      {showYay && (
        <Animated.View style={[styles.yayBadge, yayStyle]}>
          <Typography variant="bodyBold" style={{ fontSize: 10 }}>Yay!</Typography>
        </Animated.View>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  checkboxChecked: {
    backgroundColor: colors.blue,
    borderColor: colors.blue,
  },
  checkboxOuter: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: radii.lg,
    borderWidth: 2.5,
    height: 28,
    justifyContent: 'center',
    width: 28,
    ...shadows.sm,
  },
  checkmarkContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingVertical: spacing.sm,
  },
  labelChecked: {
    textDecorationLine: 'line-through',
  },
  labelContainer: {
    flex: 1,
    marginLeft: spacing.md,
  },
  yayBadge: {
    backgroundColor: colors.yellow,
    borderRadius: radii.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    position: 'absolute',
    right: 0,
    top: 0,
    ...shadows.sm,
  },
});
