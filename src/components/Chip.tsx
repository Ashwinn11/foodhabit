import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { theme } from '../theme/theme';
import { Text } from './Text';

export type ChipStatus = 'safe' | 'caution' | 'risky' | 'neutral';

export interface ChipProps {
  label: string;
  status?: ChipStatus;
  selected?: boolean;
  onPress?: () => void;
  icon?: React.ReactNode;
}

export const Chip: React.FC<ChipProps> = ({ 
  label, 
  status = 'neutral',
  selected = false,
  onPress,
  icon
}) => {
  const getStatusColor = () => {
    switch (status) {
      case 'safe': return theme.colors.lime;
      case 'caution': return theme.colors.amber;
      case 'risky': return theme.colors.coral;
      default: return theme.colors.surfaceHigh;
    }
  };

  const getBackgroundColor = () => {
    if (selected) {
      if (status !== 'neutral') return `${getStatusColor()}20`; // 20% opacity
      return theme.colors.coral;
    }
    return theme.colors.surface;
  };

  const getBorderColor = () => {
    if (selected) {
      if (status !== 'neutral') return getStatusColor();
      return theme.colors.coral;
    }
    return 'transparent';
  };

  const getTextColor = () => {
    if (status !== 'neutral') return getStatusColor();
    if (selected) return theme.colors.textPrimary;
    return theme.colors.textSecondary;
  };

  const Container = onPress ? TouchableOpacity : View;

  return (
    <Container 
      onPress={onPress}
      activeOpacity={0.8}
      style={[
        styles.chip,
        { 
          backgroundColor: getBackgroundColor(),
          borderColor: getBorderColor(),
          borderWidth: selected || status !== 'neutral' ? 1 : 0
        }
      ]}
    >
      {icon && <View style={styles.iconContainer}>{icon}</View>}
      <Text 
        variant="label" 
        style={{ color: getTextColor() }}
      >
        {label}
      </Text>
    </Container>
  );
};

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radii.full,
    alignSelf: 'flex-start',
  },
  iconContainer: {
    marginRight: theme.spacing.sm,
  }
});
