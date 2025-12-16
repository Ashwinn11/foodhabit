/**
 * Chip Component
 * Small pill-shaped button for tags, filters, and selections
 */

import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme, haptics } from '../theme';
import Text from './Text';
import { View } from 'react-native';

interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  color?: string;
  disabled?: boolean;
  size?: 'small' | 'medium';
}

export default function Chip({
  label,
  selected = false,
  onPress,
  icon,
  color = theme.colors.brand.primary,
  disabled = false,
  size = 'medium',
}: ChipProps) {
  const handlePress = () => {
    if (onPress && !disabled) {
      haptics.selection();
      onPress();
    }
  };

  const content = (
    <View style={styles.content}>
      {icon && (
        <Ionicons
          name={icon}
          size={size === 'small' ? 14 : 16}
          color={selected ? theme.colors.brand.white : color}
          style={styles.icon}
        />
      )}
      <Text
        variant="caption"
        weight="semiBold"
        style={{
          color: selected ? theme.colors.brand.white : theme.colors.text.secondary,
          fontSize: size === 'small' ? 11 : 13,
        }}
      >
        {label}
      </Text>
    </View>
  );

  if (!onPress) {
    return (
      <View
        style={[
          styles.chip,
          size === 'small' && styles.chipSmall,
          selected && [styles.chipSelected, { backgroundColor: color }],
        ]}
      >
        {content}
      </View>
    );
  }

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled}
      activeOpacity={0.7}
      style={[
        styles.chip,
        size === 'small' && styles.chipSmall,
        selected && [styles.chipSelected, { backgroundColor: color }],
        disabled && styles.disabled,
      ]}
    >
      {content}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.pill,
    backgroundColor: theme.colors.background.primary,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
  },
  chipSmall: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
  },
  chipSelected: {
    borderColor: 'transparent',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: theme.spacing.xs,
  },
  disabled: {
    opacity: 0.5,
  },
});
