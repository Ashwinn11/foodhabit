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
          backgroundColor="transparent"
          borderWidth={0}
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
    borderRadius: radii['2xl'],
    padding: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 95,
    ...shadows.sm,
    borderWidth: 2.5, // Increased for more 'pop'
  },
  icon: {
    marginBottom: spacing.xs,
  },
  label: {
    textTransform: 'uppercase',
    letterSpacing: 1,
    textAlign: 'center',
    marginBottom: 2,
    opacity: 0.9,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: spacing.xs,
  },
  unit: {
    fontSize: 11,
    marginLeft: 2,
    alignSelf: 'flex-end',
    marginBottom: 4,
  },
});
