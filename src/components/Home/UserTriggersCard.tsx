/**
 * UserTriggersCard Component - Premium Version
 * Each trigger is a standalone soft-rounded row, no boxy card nesting
 */

import React, { useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Typography } from '../Typography';
import { colors, spacing, radii } from '../../theme';
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
  const [localFeedback, setLocalFeedback] = useState<Record<string, boolean>>({});

  if (triggers.length === 0) return null;

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
    <View style={styles.wrapper}>
      {/* Section Header */}
      <View style={styles.header}>
        <Ionicons name="flame" size={18} color={colors.pink} />
        <Typography variant="bodyBold" color={colors.black} style={{ marginLeft: spacing.sm, flex: 1 }}>
          Top Triggers
        </Typography>
        <View style={styles.countPill}>
          <Typography variant="caption" color={colors.pink} style={{ fontWeight: '700', fontSize: 11 }}>
            {triggers.length}
          </Typography>
        </View>
      </View>

      {/* Trigger Items — standalone rounded rows */}
      {displayTriggers.map((trigger, index) => {
        const feedback = getFeedback(trigger);
        return (
          <View key={`${trigger.food}-${index}`} style={styles.triggerRow}>
            {/* Icon circle */}
            <View style={styles.iconCircle}>
              <Ionicons name="restaurant" size={16} color={colors.white} />
            </View>

            {/* Content */}
            <View style={styles.content}>
              <View style={styles.nameRow}>
                <Typography variant="bodyBold" color={colors.black} style={{ fontSize: 14 }}>
                  {trigger.food}
                </Typography>
                <Typography variant="caption" color={colors.black + 'AA'} style={{ fontSize: 11, marginLeft: 6 }}>
                  {trigger.symptomOccurrences}×
                </Typography>
              </View>
              <View style={styles.symptomRow}>
                {trigger.symptoms.slice(0, 3).map(s => (
                  <Typography key={s} variant="caption" color={colors.pink} style={{ fontSize: 11 }}>
                    {s}
                  </Typography>
                ))}
              </View>
            </View>

            {/* Actions */}
            {feedback === true ? (
              <Ionicons name="checkmark-circle" size={22} color={colors.green} />
            ) : feedback === false ? (
              <Ionicons name="close-circle" size={22} color={colors.black + '25'} />
            ) : (
              <View style={styles.actions}>
                <Pressable onPress={() => handleConfirm(trigger.food)} style={styles.yesBtn} hitSlop={8}>
                  <Ionicons name="checkmark" size={14} color={colors.white} />
                </Pressable>
                <Pressable onPress={() => handleDismiss(trigger.food)} style={styles.noBtn} hitSlop={8}>
                  <Ionicons name="close" size={14} color={colors.black + '40'} />
                </Pressable>
              </View>
            )}
          </View>
        );
      })}

      {hasMore && (
        <Pressable onPress={() => setExpanded(!expanded)} style={styles.showMore}>
          <Typography variant="caption" color={colors.blue} style={{ fontWeight: '600' }}>
            {expanded ? 'Show less' : `See ${triggers.length - maxDisplay} more`}
          </Typography>
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  countPill: {
    backgroundColor: colors.pink + '12',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  triggerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    // Subtle shadow
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.pink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    marginLeft: spacing.md,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  symptomRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    gap: 6,
  },
  yesBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.black + '06',
    alignItems: 'center',
    justifyContent: 'center',
  },
  showMore: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
});
