/**
 * UserTriggersCard Component
 * Displays user's identified food triggers with confirm/dismiss actions
 *
 * Presentation Component - Pure UI, no business logic
 */

import React, { useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Typography } from '../Typography';
import { Card } from '../Card';
import { IconContainer } from '../IconContainer/IconContainer';
import { colors, spacing } from '../../theme';
import { Ionicons } from '@expo/vector-icons';

export interface Trigger {
  food: string;
  symptoms: string[];
  symptomOccurrences: number;
  userFeedback?: boolean | null;
}

interface UserTriggersCardProps {
  triggers: Trigger[];
  maxDisplay?: number;
  onConfirm?: (foodName: string) => void;
  onDismiss?: (foodName: string) => void;
}

export const UserTriggersCard: React.FC<UserTriggersCardProps> = ({
  triggers,
  maxDisplay = 3,
  onConfirm,
  onDismiss,
}) => {
  const [expanded, setExpanded] = useState(false);
  // Optimistic local feedback state: food -> true (confirmed) | false (dismissed)
  const [localFeedback, setLocalFeedback] = useState<Record<string, boolean>>({});

  if (triggers.length === 0) {
    return null;
  }

  const hasMore = triggers.length > maxDisplay;
  const displayTriggers = expanded ? triggers : triggers.slice(0, maxDisplay);

  const getFeedback = (trigger: Trigger): boolean | null | undefined => {
    const local = localFeedback[trigger.food];
    if (local !== undefined) return local;
    return trigger.userFeedback;
  };

  const handleConfirm = (food: string) => {
    setLocalFeedback(prev => ({ ...prev, [food]: true }));
    onConfirm?.(food);
  };

  const handleDismiss = (food: string) => {
    setLocalFeedback(prev => ({ ...prev, [food]: false }));
    onDismiss?.(food);
  };

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

      {displayTriggers.map((trigger, index) => {
        const feedback = getFeedback(trigger);
        return (
          <View key={`${trigger.food}-${index}`} style={styles.triggerItem}>
            <View style={styles.triggerContent}>
              <Typography variant="body" color={colors.black}>
                <Ionicons name="alert-circle" size={14} color={colors.pink} /> {trigger.food}
              </Typography>
              <Typography variant="caption" color={colors.black + '60'}>
                Caused {trigger.symptoms.join(' + ')} ({trigger.symptomOccurrences}x)
              </Typography>
            </View>
            {feedback === true ? (
              <View style={styles.confirmedBadge}>
                <Ionicons name="checkmark-circle" size={14} color={colors.green} />
                <Typography variant="caption" color={colors.green} style={{ marginLeft: 2 }}>
                  Confirmed
                </Typography>
              </View>
            ) : feedback === false ? (
              <View style={styles.dismissedBadge}>
                <Ionicons name="close-circle" size={14} color={colors.black + '40'} />
                <Typography variant="caption" color={colors.black + '40'} style={{ marginLeft: 2 }}>
                  Dismissed
                </Typography>
              </View>
            ) : (
              <View style={styles.feedbackButtons}>
                <Pressable
                  onPress={() => handleConfirm(trigger.food)}
                  style={styles.confirmButton}
                  hitSlop={8}
                >
                  <Ionicons name="checkmark" size={16} color={colors.white} />
                </Pressable>
                <Pressable
                  onPress={() => handleDismiss(trigger.food)}
                  style={styles.dismissButton}
                  hitSlop={8}
                >
                  <Ionicons name="close" size={16} color={colors.black + '60'} />
                </Pressable>
              </View>
            )}
          </View>
        );
      })}

      {hasMore && (
        <Pressable onPress={() => setExpanded(!expanded)} style={styles.toggleButton}>
          <Typography variant="caption" color={colors.blue}>
            {expanded ? 'Show less' : `+${triggers.length - maxDisplay} more triggers`}
          </Typography>
          <Ionicons
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={14}
            color={colors.blue}
            style={{ marginLeft: 4 }}
          />
        </Pressable>
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
  feedbackButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  confirmButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dismissButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.black + '10',
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dismissedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
});
