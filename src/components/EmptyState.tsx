import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { theme } from '../theme/theme';
import { Text } from './Text';
import { Button } from './Button';
import { Icon3D, Icon3DName } from './Icon3D';

interface EmptyStateAction {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
}

interface EmptyStateProps {
  icon?: Icon3DName;
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
        <Icon3D
          name={icon}
          size={72}
          animated
          animationType="float"
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
