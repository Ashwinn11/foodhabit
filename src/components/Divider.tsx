/**
 * Divider Component
 * Reusable horizontal divider line
 */

import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { theme } from '../theme';

interface DividerProps {
  style?: ViewStyle;
  color?: string;
  thickness?: number;
  spacing?: 'none' | 'small' | 'medium' | 'large';
}

export default function Divider({
  style,
  color = theme.colors.border.light,
  thickness = StyleSheet.hairlineWidth,
  spacing = 'none',
}: DividerProps) {
  const spacingMap = {
    none: 0,
    small: theme.spacing.sm,
    medium: theme.spacing.md,
    large: theme.spacing.lg,
  };

  return (
    <View
      style={[
        styles.divider,
        {
          height: thickness,
          backgroundColor: color,
          marginVertical: spacingMap[spacing],
        },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  divider: {
    width: '100%',
  },
});
