/**
 * IconButton Component
 * Reusable icon-only button for headers, toolbars, and actions
 */

import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme, haptics } from '../theme';

interface IconButtonProps {
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  color?: string;
  size?: number;
  disabled?: boolean;
  style?: ViewStyle;
  hapticFeedback?: boolean;
}

export default function IconButton({
  icon,
  onPress,
  color = theme.colors.text.primary,
  size = 24,
  disabled = false,
  style,
  hapticFeedback = true,
}: IconButtonProps) {
  const handlePress = () => {
    if (hapticFeedback && !disabled) {
      haptics.selection();
    }
    onPress();
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled}
      activeOpacity={0.7}
      style={[styles.button, disabled && styles.disabled, style]}
    >
      <Ionicons name={icon} size={size} color={color} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: theme.spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
});
