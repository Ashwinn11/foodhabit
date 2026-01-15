import React from 'react';
import { View, StyleSheet, Pressable, ViewStyle } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  ZoomIn
} from 'react-native-reanimated';
import { colors, spacing } from '../../theme/theme';
import { IconContainer } from '../IconContainer/IconContainer';
import { Typography } from '../Typography';
import { Card } from '../Card';

interface MissionCardProps {
  title: string;
  subtitle: string;
  completed: boolean;
  onToggle: () => void;
  type: 'poop' | 'meal' | 'symptom' | 'water' | 'fiber' | 'probiotic' | 'exercise';
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
      <Animated.View style={animatedStyle}>
        <Card variant="white" style={[styles.container, style]} padding="lg">
          {/* Left Checkbox Area */}
          <View style={styles.checkboxContainer}>
            <IconContainer
              name={completed ? "checkmark" : "ellipse-outline"}
              size={28}
              iconSize={16}
              color={completed ? colors.white : colors.border}
              backgroundColor={completed ? colors.pink : "transparent"}
              borderColor={completed ? colors.pink : colors.border}
              borderWidth={2}
              shadow={false}
            />
          </View>
          
          {/* Content */}
          <View style={styles.content}>
            <Typography 
              variant="bodyBold" 
              color={completed ? colors.pink : colors.black}
              style={completed ? styles.titleCompleted : undefined}
            >
              {title}
            </Typography>
            <Typography variant="bodyXS" color={colors.black + '66'}>{subtitle}</Typography>
          </View>

          {/* Yay! Sticker when completed */}
          {completed && (
              <Animated.View 
                  entering={ZoomIn.springify()}
                  style={styles.yaySticker}
              >
                  <View style={[styles.stickerBody, { transform: [{ rotate: '15deg' }] }]}>
                       <Typography variant="h4" style={styles.yayText}>Yay!</Typography>
                  </View>
              </Animated.View>
          )}
        </Card>
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxContainer: {
    marginRight: spacing.md,
  },
  content: {
    flex: 1,
  },
  titleCompleted: {
    textDecorationLine: 'line-through',
    textDecorationStyle: 'solid',
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  yayText: {
    fontSize: 12,
    color: colors.black,
  },
});
