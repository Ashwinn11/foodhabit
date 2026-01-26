import React from 'react';
import { View, StyleSheet, Pressable, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '../../theme/theme';
import { MealType } from '../../store';
import { IconContainer } from '../IconContainer/IconContainer';
import { Typography } from '../Typography';
import { Card } from '../Card';

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
      <Animated.View style={[{ width: 155, height: 170 }, animatedStyle]}>
        <Card 
          variant="colored" 
          color={config.accent} 
          style={[styles.container, style]} 
          padding="md"
        >
          {/* Top Right Check Status */}
          <View style={styles.statusBadge}>
              {completed && (
                <IconContainer
                  name="checkmark"
                  size={24}
                  iconSize={12}
                  color={config.accent}
                  variant="solid"
                  shadow={false}
                />
              )}
          </View>

          {/* Center Top Icon using IconContainer */}
          <IconContainer
            name={config.icon}
            size={70}
            iconSize={32}
            color={config.accent}
            variant="solid"
            shape="circle"
            style={{ marginTop: spacing.md }}
          />
          
          {/* Bottom Info */}
          <View style={styles.infoContainer}>
              <Typography variant="bodyBold" color={config.accent === colors.yellow ? colors.black : config.accent} align="center">
                {name}
              </Typography>
              
              <View style={styles.timeRow}>
                  <Typography variant="h2" color={config.accent === colors.yellow ? colors.black : config.accent}>{time}</Typography>
                  <View style={[styles.periodBadge, { backgroundColor: config.accent }]}>
                      <Typography variant="bodyXS" color={config.accent === colors.yellow ? colors.black : colors.white} style={{ fontSize: 10 }}>
                        {config.period}
                      </Typography>
                  </View>
              </View>
          </View>
        </Card>
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  infoContainer: {
    alignItems: 'center',
    width: '100%',
    marginBottom: spacing.xs,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  periodBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
