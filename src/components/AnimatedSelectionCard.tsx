import React, { useRef, useEffect } from 'react';
import {
  StyleSheet,
  Pressable,
  Animated,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { theme, haptics } from '../theme';

interface AnimatedSelectionCardProps {
  children: React.ReactNode;
  selected: boolean;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  disabled?: boolean;
  isCreamBg?: boolean;
}

export const AnimatedSelectionCard: React.FC<AnimatedSelectionCardProps> = ({
  children,
  selected,
  onPress,
  style,
  containerStyle,
  disabled = false,
  isCreamBg = false,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const selectAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(selectAnim, {
      toValue: selected ? 1 : 0,
      useNativeDriver: false, // Color interpolation requires false
      ...theme.animations.springConfig.bouncy,
    }).start();
  }, [selected]);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
      ...theme.animations.springConfig.bouncy,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      ...theme.animations.springConfig.default,
    }).start();
  };

  const borderColor = selectAnim.interpolate({
    inputRange: [0, 1],
    outputRange: isCreamBg
      ? ['transparent', theme.colors.brand.black]
      : ['transparent', theme.colors.brand.primary],
  });

  const borderWidth = selectAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 2],
  });

  const backgroundColor = selectAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [theme.colors.background.card, theme.colors.background.card], // Could be lighter primary if desired
  });

  return (
    <Animated.View
      style={[
        styles.container,
        { transform: [{ scale: scaleAnim }] },
        containerStyle,
      ]}
    >
      <Pressable
        onPress={() => {
          haptics.selection();
          onPress();
        }}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        style={({ pressed }) => [
          styles.pressable,
          pressed && styles.pressed,
        ]}
      >
        <Animated.View
          style={[
            styles.contentContainer,
            {
              borderColor,
              borderWidth,
              backgroundColor,
            },
            style,
          ]}
        >
          {children}
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    minHeight: 60,
  },
  pressable: {
    width: '100%',
  },
  pressed: {
    opacity: 0.9,
  },
  contentContainer: {
    width: '100%',
    minHeight: 60,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.xl,
    justifyContent: 'center',
    alignItems: 'center',
    borderStyle: 'solid',
  },
});
