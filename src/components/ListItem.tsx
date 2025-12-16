/**
 * ListItem Component
 * Reusable list item with icon, label, value, and optional chevron
 */

import React from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme, haptics } from '../theme';
import Text from './Text';

interface ListItemProps {
  icon?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  iconBgColor?: string;
  label: string;
  value?: string;
  onPress?: () => void;
  showChevron?: boolean;
  destructive?: boolean;
  disabled?: boolean;
}

export default function ListItem({
  icon,
  iconColor = theme.colors.brand.white,
  iconBgColor = theme.colors.brand.primary,
  label,
  value,
  onPress,
  showChevron = true,
  destructive = false,
  disabled = false,
}: ListItemProps) {
  const handlePress = () => {
    if (onPress && !disabled) {
      haptics.selection();
      onPress();
    }
  };

  const content = (
    <>
      <View style={styles.left}>
        {icon && (
          <View style={[styles.iconContainer, { backgroundColor: iconBgColor }]}>
            <Ionicons name={icon} size={20} color={iconColor} />
          </View>
        )}
        <Text
          variant="body"
          style={[
            styles.label,
            destructive && styles.destructiveText,
            !icon && styles.labelNoIcon,
          ]}
        >
          {label}
        </Text>
      </View>
      <View style={styles.right}>
        {value && (
          <Text variant="body" color="secondary" style={styles.value}>
            {value}
          </Text>
        )}
        {showChevron && onPress && (
          <Ionicons
            name="chevron-forward"
            size={20}
            color={theme.colors.text.secondary}
          />
        )}
      </View>
    </>
  );

  if (!onPress) {
    return <View style={styles.container}>{content}</View>;
  }

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled}
      activeOpacity={0.7}
      style={[styles.container, disabled && styles.disabled]}
    >
      {content}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.lg,
    minHeight: 56,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: theme.borderRadius.circle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    marginLeft: theme.spacing.md,
    flex: 1,
  },
  labelNoIcon: {
    marginLeft: 0,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  value: {
    marginRight: theme.spacing.sm,
  },
  destructiveText: {
    color: theme.colors.brand.primary,
  },
  disabled: {
    opacity: 0.5,
  },
});
