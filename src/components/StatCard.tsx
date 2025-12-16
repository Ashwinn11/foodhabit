/**
 * StatCard Component
 * Specialized GridCard for displaying statistics with icon, value, and label
 */

import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';
import Text from './Text';
import GridCard from './GridCard';

interface StatCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  value: string | number;
  label: string;
}

export default function StatCard({ icon, iconColor, value, label }: StatCardProps) {
  return (
    <GridCard>
      <Ionicons name={icon} size={24} color={iconColor} />
      <Text
        variant="title2"
        weight="bold"
        style={{ marginTop: theme.spacing.sm, color: iconColor }}
      >
        {value}
      </Text>
      <Text variant="caption" color="secondary">
        {label}
      </Text>
    </GridCard>
  );
}
