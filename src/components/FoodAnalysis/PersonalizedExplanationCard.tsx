/**
 * PersonalizedExplanationCard Component
 * Shows why a food is safe/risky for THIS USER specifically
 *
 * Presentation Component - Pure UI, no business logic
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Typography } from '../Typography';
import { Card } from '../Card';
import { IconContainer } from '../IconContainer/IconContainer';
import { colors, spacing } from '../../theme';

interface PersonalizedExplanationCardProps {
  explanation: string;
  condition?: string;
  compoundRiskWarning?: string | null;
}

export const PersonalizedExplanationCard: React.FC<PersonalizedExplanationCardProps> = ({
  explanation,
  condition,
  compoundRiskWarning
}) => {
  if (!explanation) {
    return null;
  }

  return (
    <Card variant="white" padding="lg" style={styles.container}>
      <View style={styles.header}>
        <IconContainer
          name="information-circle"
          size={32}
          iconSize={18}
          color={colors.yellow}
          variant="solid"
          shadow={false}
        />
        <Typography variant="bodyBold" color={colors.black} style={{ marginLeft: spacing.sm }}>
          Why It Matters for You
        </Typography>
      </View>

      {condition && (
        <View style={styles.conditionBadge}>
          <Typography variant="caption" color={colors.blue}>
            {condition}
          </Typography>
        </View>
      )}

      <Typography variant="body" color={colors.black} style={{ lineHeight: 20 }}>
        {explanation}
      </Typography>

      {compoundRiskWarning && (
        <>
          <View style={styles.divider} />
          <View style={styles.warningBox}>
            <IconContainer
              name="warning"
              size={24}
              iconSize={14}
              color={colors.pink}
              variant="transparent"
              shadow={false}
            />
            <Typography
              variant="bodySmall"
              color={colors.pink}
              style={{ marginLeft: spacing.sm, flex: 1 }}
            >
              {compoundRiskWarning}
            </Typography>
          </View>
        </>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  conditionBadge: {
    backgroundColor: colors.blue + '15',
    borderRadius: 6,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    alignSelf: 'flex-start',
    marginBottom: spacing.md,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.pink + '08',
    borderRadius: 8,
    padding: spacing.md,
    marginTop: spacing.sm,
  },
});
