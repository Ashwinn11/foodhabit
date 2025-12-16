/**
 * InfoRow Component
 * Reusable row for displaying label-value pairs
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';
import Text from './Text';

interface InfoRowProps {
  label: string;
  value: string;
  icon?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  vertical?: boolean;
}

export default function InfoRow({
  label,
  value,
  icon,
  iconColor = theme.colors.brand.primary,
  vertical = false,
}: InfoRowProps) {
  if (vertical) {
    return (
      <View style={styles.containerVertical}>
        {icon && (
          <View style={styles.iconContainer}>
            <Ionicons name={icon} size={20} color={iconColor} />
          </View>
        )}
        <Text variant="caption" color="secondary" style={styles.labelVertical}>
          {label}
        </Text>
        <Text variant="body" weight="semiBold" style={styles.valueVertical}>
          {value}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {icon && (
        <View style={styles.iconContainer}>
          <Ionicons name={icon} size={20} color={iconColor} />
        </View>
      )}
      <Text variant="caption" color="secondary" style={styles.label}>
        {label}
      </Text>
      <Text variant="body" weight="semiBold">
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  containerVertical: {
    alignItems: 'flex-start',
  },
  iconContainer: {
    marginRight: theme.spacing.sm,
  },
  label: {
    flex: 1,
  },
  labelVertical: {
    marginTop: theme.spacing.xs,
  },
  valueVertical: {
    marginTop: theme.spacing.xs,
  },
});
