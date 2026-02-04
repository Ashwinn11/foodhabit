import React from 'react';
import { Pressable, StyleSheet, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { IconContainer } from '../IconContainer/IconContainer';
import { colors } from '../../theme/theme';
import { Typography } from '../Typography';

interface BoxButtonProps {
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  size?: number;
  color?: string;
  style?: ViewStyle;
  badgeCount?: number;
  variant?: 'solid' | 'transparent';
  borderColor?: string;
}

export const BoxButton: React.FC<BoxButtonProps> = ({
  icon,
  onPress,
  size = 44,
  color = colors.pink,
  style,
  badgeCount,
  variant = 'solid',
  borderColor
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.92);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
    onPress();
  };

  return (
    <Pressable onPressIn={handlePressIn} onPressOut={handlePressOut}>
      <Animated.View
        style={[
          style,
          animatedStyle,
        ]}
      >
        <IconContainer
          name={icon}
          size={size}
          iconSize={size * 0.5}
          color={color}
          variant={variant}
          borderColor={borderColor || color}
          shape="circle"
        />
        {badgeCount !== undefined && badgeCount > 0 && (
          <Animated.View style={styles.badge}>
            <Typography 
              variant="bodyBold" 
              color={colors.white} 
              style={{ fontSize: 9, lineHeight: 12 }}
            >
              {badgeCount > 9 ? '9+' : badgeCount}
            </Typography>
          </Animated.View>
        )}
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  badge: {
    alignItems: 'center',
    backgroundColor: colors.pink,
    borderColor: colors.white,
    borderRadius: 8,
    borderWidth: 1.5,
    height: 16,
    justifyContent: 'center',
    minWidth: 16,
    paddingHorizontal: 2,
    position: 'absolute',
    right: -2,
    top: -2,
  },
});
