/**
 * UserTriggersCard Component
 * Displays user's identified food triggers
 *
 * Presentation Component - Pure UI, no business logic
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Typography } from '../Typography';
import { Card } from '../Card';
import { IconContainer } from '../IconContainer/IconContainer';
import { colors, spacing } from '../../theme';
import { Ionicons } from '@expo/vector-icons';

export interface Trigger {
  food: string;
  symptoms: string[];
  count: number;
}

interface UserTriggersCardProps {
  triggers: Trigger[];
  maxDisplay?: number;
}

export const UserTriggersCard: React.FC<UserTriggersCardProps> = ({
  triggers,
  maxDisplay = 3
}) => {
  if (triggers.length === 0) {
    return null;
  }

  const displayTriggers = triggers.slice(0, maxDisplay);

  return (
    <Card variant="white" padding="lg" style={styles.container}>
      <View style={styles.header}>
        <IconContainer
          name="alert-circle"
          size={32}
          iconSize={18}
          color={colors.pink}
          variant="solid"
          shadow={false}
        />
        <View style={{ flex: 1, marginLeft: spacing.sm }}>
          <Typography variant="bodyBold" color={colors.black}>
            Your Top Triggers
          </Typography>
          <Typography variant="caption" color={colors.black + '60'}>
            Based on your logs
          </Typography>
        </View>
      </View>

      {displayTriggers.map((trigger, index) => (
        <View key={`${trigger.food}-${index}`} style={styles.triggerItem}>
          <View style={styles.triggerContent}>
            <Typography variant="body" color={colors.black}>
              <Ionicons name="alert-circle" size={14} color={colors.pink} /> {trigger.food}
            </Typography>
            <Typography variant="caption" color={colors.black + '60'}>
              Caused {trigger.symptoms.join(' + ')} ({trigger.count}x)
            </Typography>
          </View>
        </View>
      ))}

      {triggers.length > maxDisplay && (
        <Typography variant="caption" color={colors.blue} style={{ marginTop: spacing.sm }}>
          +{triggers.length - maxDisplay} more triggers
        </Typography>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  triggerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  triggerContent: {
    flex: 1,
  },
});
