import React, { useRef, useEffect } from 'react';
import { StyleSheet, Animated, Pressable, View, StyleProp, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme, haptics } from '../theme';

interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  color?: string;
  disabled?: boolean;
  size?: 'small' | 'medium';
  style?: StyleProp<ViewStyle>;
}

export default function Chip({
  label,
  selected = false,
  onPress,
  icon,
  color = theme.colors.brand.primary,
  disabled = false,
  size = 'medium',
  style,
}: ChipProps) {
  // Move isSelected before its first usage
  const isSelected = selected;
  const scaleAnim = useRef(new Animated.Value(isSelected ? 1.05 : 1)).current;
  const selectAnim = useRef(new Animated.Value(selected ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(selectAnim, {
      toValue: isSelected ? 1 : 0,
      useNativeDriver: false,
      ...theme.animations.springConfig.bouncy,
    }).start();
  }, [isSelected]);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
      ...theme.animations.springConfig.default,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: isSelected ? 1.05 : 1,
      useNativeDriver: true,
      ...theme.animations.springConfig.bouncy,
    }).start();
  };

  const handlePress = () => {
    if (onPress && !disabled) {
      haptics.selection();
      onPress();
    }
  };

  const backgroundColor = selectAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [theme.colors.background.card, color],
  });

  const borderColor = selectAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [theme.colors.border.light, color],
  });

  const textColor = selectAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [theme.colors.text.secondary, theme.colors.brand.white],
  });

  const content = (
    <View style={styles.content}>
      {icon && (
        <Ionicons
          name={icon}
          size={size === 'small' ? 14 : 16}
          color={isSelected ? theme.colors.brand.white : color}
          style={styles.icon}
        />
      )}
      <Animated.Text
        style={[
          styles.labelText,
          {
            color: textColor,
            fontSize: size === 'small' ? 11 : 13,
            fontWeight: isSelected ? '700' : '600',
          },
        ]}
      >
        {label}
      </Animated.Text>
    </View>
  );

  return (
    <Animated.View 
      style={[
        styles.chipWrapper, 
        { transform: [{ scale: scaleAnim }] },
        style
      ]}
    >
      <Pressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || !onPress}
      >
        <Animated.View
          style={[
            styles.chip,
            size === 'small' && styles.chipSmall,
            {
              backgroundColor,
              borderColor,
              borderWidth: 1,
            },
            disabled && styles.disabled,
          ]}
        >
          {content}
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  chipWrapper: {
    alignSelf: 'flex-start',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.pill,
  },
  chipSmall: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: theme.spacing.xs,
  },
  labelText: {
    fontFamily: theme.fontFamily.semiBold,
  },
  disabled: {
    opacity: 0.5,
  },
});
