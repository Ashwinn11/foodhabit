import React from 'react';
import { View, StyleSheet, Pressable, ViewStyle } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withSequence, 
  withTiming 
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radii, shadows } from '../../theme/theme';
import { IconContainer } from '../IconContainer/IconContainer';
import { Typography } from '../Typography';

interface SymptomToggleProps {
  label: string;
  iconName: keyof typeof Ionicons.glyphMap;
  active: boolean;
  onToggle: () => void;
  color?: string;
  style?: ViewStyle;
}

export const SymptomToggle: React.FC<SymptomToggleProps> = ({
  label,
  iconName,
  active,
  onToggle,
  color = colors.yellow,
  style,
}) => {
  const scale = useSharedValue(1);
  const wiggle = useSharedValue(0);
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${wiggle.value}deg` },
    ],
  }));
  
  const handlePress = () => {
    scale.value = withSequence(
      withSpring(0.9),
      withSpring(1.1),
      withSpring(1)
    );
    
    if (!active) {
      wiggle.value = withSequence(
        withTiming(-10, { duration: 50 }),
        withTiming(10, { duration: 50 }),
        withTiming(-5, { duration: 50 }),
        withTiming(5, { duration: 50 }),
        withTiming(0, { duration: 50 })
      );
    }
    
    onToggle();
  };
  
  return (
    <Pressable onPress={handlePress}>
      <Animated.View
        style={[
          styles.container,
          active && { backgroundColor: color, borderColor: color },
          style,
          animatedStyle,
        ]}
      >
        <IconContainer
          name={iconName}
          size={32}
          iconSize={18}
          color={active ? colors.black : (color === colors.yellow ? colors.black + '66' : color)}
          backgroundColor={!active && color === colors.yellow ? colors.yellow + '30' : 'transparent'}
          borderWidth={0}
          shadow={false}
          style={styles.icon}
        />
        <Typography 
          variant="bodyBold" 
          color={active ? colors.black : colors.black + '66'}
        >
          {label}
        </Typography>
        {active && (
          <View style={[styles.activeDot, { backgroundColor: color === colors.yellow ? colors.black : colors.white }]} />
        )}
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.white,
    borderRadius: radii.full,
    borderWidth: 2,
    borderColor: colors.border,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  icon: {
    marginRight: spacing.sm,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.white, // White dot for contrast on colored background
    marginLeft: spacing.sm,
  },
});
