import React from 'react';
import { Pressable, StyleSheet, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { IconContainer } from '../IconContainer/IconContainer';
import { colors, fonts } from '../../theme';

interface BoxButtonProps {
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  size?: number;
  color?: string;
  style?: ViewStyle;
  badgeCount?: number;
  borderColor?: string;
}

export const BoxButton: React.FC<BoxButtonProps> = ({
  icon,
  onPress,
  size = 44,
  color = colors.pink,
  style,
  badgeCount,
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
          borderColor={borderColor || color}
          shape="circle"
        />
        {badgeCount !== undefined && badgeCount > 0 && (
          <Animated.View style={styles.badge}>
            <Animated.Text style={styles.badgeText}>
              {badgeCount > 9 ? '9+' : badgeCount}
            </Animated.Text>
          </Animated.View>
        )}
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.pink,
    borderWidth: 1.5,
    borderColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  badgeText: {
    color: colors.white,
    fontSize: 10,
    fontFamily: fonts.bodyBold,
  },
});
