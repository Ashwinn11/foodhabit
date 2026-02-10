/**
 * PortionAdviceCard Component
 * Shows safe portion sizes for yellow/moderate foods
 *
 * Presentation Component - Pure UI, no business logic
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Typography } from '../Typography';
import { Card } from '../Card';
import { IconContainer } from '../IconContainer/IconContainer';
import { colors, spacing } from '../../theme';

interface PortionAdviceCardProps {
  advice?: string | null;
}

export const PortionAdviceCard: React.FC<PortionAdviceCardProps> = ({ advice }) => {
  if (!advice) {
    return null;
  }

  return (
    <Card variant="white" padding="lg" style={styles.container}>
      <View style={styles.header}>
        <IconContainer
          name="resize"
          size={32}
          iconSize={18}
          color={colors.yellow}
          variant="solid"
          shadow={false}
        />
        <Typography variant="bodyBold" color={colors.black} style={{ marginLeft: spacing.sm }}>
          Safe Portion Size
        </Typography>
      </View>

      <View style={styles.adviceBox}>
        <Typography variant="body" color={colors.black}>
          {advice}
        </Typography>
      </View>

      <Typography variant="caption" color={colors.black + '60'} style={{ marginTop: spacing.sm }}>
        💡 Staying within safe portions helps you enjoy this food without triggering symptoms
      </Typography>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
    backgroundColor: colors.yellow + '08',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  adviceBox: {
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.yellow,
  },
});
