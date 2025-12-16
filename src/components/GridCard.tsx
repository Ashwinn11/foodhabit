/**
 * GridCard Component
 * Reusable card component for grid layouts (3 columns)
 */

import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { theme } from '../theme';

interface GridCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  opacity?: number;
}

export default function GridCard({ children, style, opacity = 1 }: GridCardProps) {
  return (
    <View style={[styles.card, { opacity }, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '30.5%', // 3 columns: 30.5% × 3 = 91.5%, rest is 2 gaps
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border.light,
  },
});
