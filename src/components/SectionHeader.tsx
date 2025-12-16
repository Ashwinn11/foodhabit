/**
 * SectionHeader Component
 * Reusable section header with title, optional subtitle, and action button
 */

import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';
import Text from './Text';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  onActionPress?: () => void;
  actionIcon?: keyof typeof Ionicons.glyphMap;
  variant?: 'default' | 'compact';
}

export default function SectionHeader({
  title,
  subtitle,
  onActionPress,
  actionIcon,
  variant = 'default',
}: SectionHeaderProps) {
  return (
    <View style={[styles.container, variant === 'compact' && styles.containerCompact]}>
      <View style={styles.textContainer}>
        <Text variant={variant === 'compact' ? 'body' : 'title3'} weight="bold">
          {title}
        </Text>
        {subtitle && (
          <Text variant="caption" color="secondary" style={{ marginLeft: theme.spacing.sm }}>
            {subtitle}
          </Text>
        )}
      </View>
      {onActionPress && actionIcon && (
        <TouchableOpacity onPress={onActionPress} activeOpacity={0.7}>
          <Ionicons name={actionIcon} size={24} color={theme.colors.text.secondary} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
    paddingHorizontal: theme.spacing['2xl'],
  },
  containerCompact: {
    marginBottom: theme.spacing.md,
  },
  textContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
