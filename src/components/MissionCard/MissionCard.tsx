import React from 'react';
import { View, Text, StyleSheet, Pressable, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  ZoomIn,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radii, shadows, fonts, fontSizes } from '../../theme';

interface MissionCardProps {
  title: string;
  subtitle: string;
  completed: boolean;
  onToggle: () => void;
  type: 'poop' | 'meal' | 'symptom' | 'water';
  style?: ViewStyle;
}


export const MissionCard: React.FC<MissionCardProps> = ({
  title,
  subtitle,
  completed,
  onToggle,
  style,
}) => {
  const scale = useSharedValue(1);
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  
  const handlePressIn = () => {
    scale.value = withSpring(0.98);
  };
  
  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const handleToggle = () => {
    onToggle();
  };
  
  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handleToggle}
    >
      <Animated.View
        style={[
          styles.container,
          style,
          animatedStyle,
        ]}
      >
        {/* Left Checkbox Area */}
        <View style={styles.checkboxContainer}>
            <View style={[
                styles.checkbox, 
                completed ? styles.checkboxChecked : styles.checkboxUnchecked
            ]}>
                {completed && (
                    <Ionicons name="checkmark" size={16} color={colors.white} />
                )}
            </View>
        </View>
        
        {/* Content */}
        <View style={styles.content}>
          <Text style={[
              styles.title, 
              completed && styles.titleCompleted
            ]}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>

        {/* Yay! Sticker when completed */}
        {completed && (
            <Animated.View 
                entering={ZoomIn.springify()}
                style={styles.yaySticker}
            >
                <View style={[styles.stickerBody, { transform: [{ rotate: '15deg' }] }]}>
                     <Text style={styles.yayText}>Yay!</Text>
                </View>
            </Animated.View>
        )}
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: radii['2xl'],
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.sm,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  checkboxContainer: {
    marginRight: spacing.md,
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  checkboxUnchecked: {
    borderColor: colors.border,
    backgroundColor: 'transparent',
  },
  checkboxChecked: {
    borderColor: colors.pink, 
    backgroundColor: colors.pink,
  },
  content: {
    flex: 1,
  },
  title: {
    fontFamily: fonts.bodyBold,
    fontSize: fontSizes.md,
    color: colors.black,
    marginBottom: 2,
  },
  titleCompleted: {
    color: colors.pink,
    textDecorationLine: 'line-through',
    textDecorationStyle: 'solid',
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: fontSizes.xs,
    color: colors.black + '66',
  },
  yaySticker: {
    position: 'absolute',
    top: -8,
    right: -5,
    zIndex: 10,
  },
  stickerBody: {
    backgroundColor: colors.yellow,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20, // Sticker shape
    borderWidth: 2,
    borderColor: colors.white,
    ...shadows.sm,
  },
  yayText: {
    fontFamily: fonts.heading, // Chewy
    fontSize: 12,
    color: colors.black,
  },
});
