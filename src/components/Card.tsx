import React from 'react';
import { View, StyleSheet, ViewProps } from 'react-native';
import { theme } from '../theme/theme';

export interface CardProps extends ViewProps {
  elevated?: boolean;
  glow?: 'coral' | 'lime' | 'amber';
}

export const Card: React.FC<CardProps> = ({
  elevated = false,
  glow,
  style,
  children,
  ...props
}) => {
  const glowColor = glow === 'coral'
    ? 'rgba(224,93,76,0.18)'
    : glow === 'lime'
    ? 'rgba(212,248,112,0.18)'
    : glow === 'amber'
    ? 'rgba(245,201,122,0.18)'
    : undefined;

  return (
    <View
      style={[
        styles.card,
        elevated && styles.elevated,
        glow && { borderColor: glowColor, borderWidth: 1.5 },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: theme.spacing.lg,
    borderRadius: theme.radii.lg,
    backgroundColor: theme.colors.surface,
  },
  elevated: {
    backgroundColor: theme.colors.surfaceHigh,
    shadowColor: '#000',
    shadowOffset: { width: 3, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 10,
    elevation: 8,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderTopColor: 'rgba(255,255,255,0.08)',
    borderLeftColor: 'rgba(255,255,255,0.05)',
  },
});
