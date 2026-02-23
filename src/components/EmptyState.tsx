import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { theme } from '../theme/theme';
import { Text } from './Text';
import { Button } from './Button';
import { LucideIconName } from './Icon';
import { IconContainer } from './IconContainer';

interface EmptyStateAction {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
}

interface EmptyStateProps {
  icon?: LucideIconName;
  title: string;
  subtitle?: string;
  action?: EmptyStateAction;
  style?: ViewStyle;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  subtitle,
  action,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      {icon && (
        <IconContainer
          name={icon}
          size={80}
          iconSize={40}
          variant="muted"
          style={styles.icon}
        />
      )}
      <Text variant="h3" align="center" style={styles.title}>
        {title}
      </Text>
      {subtitle && (
        <Text
          variant="body"
          color={theme.colors.textSecondary}
          align="center"
          style={styles.subtitle}
        >
          {subtitle}
        </Text>
      )}
      {action && (
        <Button
          variant={action.variant ?? 'primary'}
          size="md"
          onPress={action.onPress}
          style={styles.button}
        >
          {action.label}
        </Button>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.xxl,
    gap: theme.spacing.md,
  },
  icon: {
    marginBottom: theme.spacing.sm,
  },
  title: {
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    maxWidth: 280,
  },
  button: {
    marginTop: theme.spacing.sm,
    minWidth: 160,
  },
});
