import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { theme } from '../theme/theme';
import { Text } from './Text';
import { Icon } from './Icon';
import { Icon3D, Icon3DName } from './Icon3D';

interface SelectionCardProps {
  title: string;
  description?: string;
  icon?: Icon3DName;
  selected?: boolean;
  onPress: () => void;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export const SelectionCard: React.FC<SelectionCardProps> = ({ 
  title, 
  description, 
  icon, 
  selected, 
  onPress 
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    borderColor: withTiming(selected ? theme.colors.primary : 'rgba(255,255,255,0.06)', { duration: 250 }),
    backgroundColor: withTiming(
      selected ? 'rgba(255, 77, 77, 0.08)' : 'rgba(255,255,255,0.02)', 
      { duration: 250 }
    ),
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.97, { damping: 20, stiffness: 400 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 20, stiffness: 400 });
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <AnimatedTouchable
      style={[styles.card, animatedStyle]}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
    >
      <View style={styles.content}>
        {icon && (
          <View style={styles.iconContainer}>
            <Icon3D name={icon} size={42} animated={selected} animationType="float" />
          </View>
        )}
        <View style={styles.textContainer}>
          <Text variant="h3" style={[styles.title, selected && { color: theme.colors.primary }]}>
            {title}
          </Text>
          {description && (
            <Text variant="caption" color={theme.colors.textSecondary} style={styles.description}>
              {description}
            </Text>
          )}
        </View>
        <View style={[styles.checkContainer, selected && styles.checkContainerSelected]}>
          <Icon 
            name={selected ? "Check" : "Circle"} 
            size={18} 
            color={selected ? theme.colors.primaryForeground : 'rgba(255,255,255,0.1)'} 
            strokeWidth={2.5}
          />
        </View>
      </View>
      
      {/* Selection Glow Effect */}
      {selected && <View style={styles.glow} pointerEvents="none" />}
    </AnimatedTouchable>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative',
    marginVertical: theme.spacing.xxs,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    gap: theme.spacing.md,
    zIndex: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontFamily: theme.fonts.bold,
  },
  description: {
    lineHeight: 18,
  },
  checkContainer: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkContainerSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
    ...theme.shadows.glow,
  },
  glow: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 77, 77, 0.05)',
    zIndex: 1,
  },
});
