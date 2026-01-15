import React from 'react';
import { View, Text, StyleSheet, Pressable, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radii, shadows, fonts, fontSizes } from '../../theme';
import { MealType } from '../../store';

interface FoodBlobCardProps {
  mealType: MealType;
  name: string;
  time: string;
  completed?: boolean;
  style?: ViewStyle;
  onPress?: () => void;
}

const mealConfigs: Record<string, { bg: string; accent: string; icon: keyof typeof Ionicons.glyphMap; period: 'AM' | 'PM' }> = {
  breakfast: { bg: colors.blue + '15', accent: colors.blue, icon: 'sunny', period: 'AM' },
  lunch: { bg: colors.yellow + '15', accent: colors.yellow, icon: 'leaf', period: 'PM' },
  dinner: { bg: colors.pink + '15', accent: colors.pink, icon: 'moon', period: 'PM' },
  snack: { bg: colors.pink + '15', accent: colors.pink, icon: 'pizza', period: 'PM' },
  drink: { bg: colors.blue + '15', accent: colors.blue, icon: 'water', period: 'PM' },
};

export const FoodBlobCard: React.FC<FoodBlobCardProps> = ({
  mealType,
  name,
  time,
  completed,
  style,
  onPress,
}) => {
  const scale = useSharedValue(1);
  const config = mealConfigs[mealType] || mealConfigs.snack;
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  
  const handlePressIn = () => {
    scale.value = withSpring(0.95);
  };
  
  const handlePressOut = () => {
    scale.value = withSpring(1);
  };
  
  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View
        style={[
          styles.container,
          { 
            backgroundColor: config.bg,
            borderColor: config.accent + '40', // Semi-transparent colored border
          },
          style,
          animatedStyle,
        ]}
      >
        {/* Top Right Check Status */}
        <View style={[styles.statusBadge, completed ? { backgroundColor: config.accent } : { borderColor: config.accent, borderWidth: 2 }]}>
            {completed && <Ionicons name="checkmark" size={12} color={colors.white} />}
        </View>

        {/* Center Top Icon */}
        <View style={[styles.iconContainer, { borderColor: config.accent }]}>
            <Ionicons name={config.icon} size={32} color={config.accent} />
        </View>
        
        {/* Bottom Info */}
        <View style={styles.infoContainer}>
            <Text style={[styles.mealName, { color: config.accent }]}>{name}</Text>
            
            <View style={styles.timeRow}>
                <Text style={[styles.mealTime, { color: config.accent }]}>{time}</Text>
                <View style={[styles.periodBadge, { backgroundColor: config.accent }]}>
                    <Text style={styles.periodText}>{config.period}</Text>
                </View>
            </View>
        </View>
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 155,
    height: 170, // Slightly taller
    borderRadius: radii['2xl'],
    padding: spacing.md,
    alignItems: 'center',
    justifyContent: 'space-between',
    ...shadows.sm,
    borderWidth: 1.5,
  },
  statusBadge: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.md,
    borderWidth: 1.5,
    ...shadows.sm,
  },
  infoContainer: {
    alignItems: 'center',
    width: '100%',
    marginBottom: spacing.xs,
  },
  mealName: {
    fontFamily: fonts.bodyBold,
    fontSize: fontSizes.md,
    marginBottom: spacing.xs,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  mealTime: {
    fontFamily: fonts.heading, // Chewy font for time numbers
    fontSize: 28, 
  },
  periodBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  periodText: {
    fontFamily: fonts.bodyBold,
    fontSize: 10,
    color: colors.white,
  },
});
