import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { IconContainer } from '../IconContainer/IconContainer';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radii, shadows } from '../../theme/theme';
import { Typography } from '../Typography';

interface StatCardProps {
  label: string;
  value: string | number;
  unit?: string;
  color?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  style?: StyleProp<ViewStyle>;
}

export const StatCard: React.FC<StatCardProps> = ({ label, value, unit, color, icon, style }) => {
  // Use the color passed as the primary accent color.
  // If no color, default to yellow.
  const accentColor = color || colors.yellow;
  
  return (
    <View style={[
      styles.container, 
      { 
        backgroundColor: accentColor + '15', // 15% opacity for soft background
        borderColor: accentColor,
      }, 
      style
    ]}>
      {icon && (
        <IconContainer
          name={icon as any}
          size={32}
          iconSize={18}
          color={accentColor}
          variant="solid"
          shadow={false}
          style={styles.icon}
        />
      )}
      <Typography variant="bodyXS" style={styles.label}>{label}</Typography>
      <View style={styles.valueRow}>
        <Typography variant="h2">{value}</Typography>
        {unit && <Typography variant="bodyBold" style={styles.unit}>{unit}</Typography>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    borderRadius: radii['2xl'],
    justifyContent: 'center',
    minHeight: 95,
    padding: spacing.md,
    ...shadows.sm,
    borderWidth: 2.5, // Increased for more 'pop'
  },
  icon: {
    marginBottom: spacing.xs,
  },
  label: {
    letterSpacing: 1,
    marginBottom: 2,
    opacity: 0.9,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  unit: {
    alignSelf: 'flex-end',
    fontSize: 11,
    marginBottom: 4,
    marginLeft: 2,
  },
  valueRow: {
    alignItems: 'baseline',
    flexDirection: 'row',
    marginTop: spacing.xs,
  },
});
