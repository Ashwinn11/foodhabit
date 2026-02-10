/**
 * PersonalHistoryCard Component
 * Shows user's personal history with this food (if they've eaten it before)
 *
 * Presentation Component - Pure UI, no business logic
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Typography } from '../Typography';
import { Card } from '../Card';
import { IconContainer } from '../IconContainer/IconContainer';
import { colors, spacing } from '../../theme';

interface PersonalHistoryCardProps {
  everEaten: boolean;
  symptoms: string[];
  occurrenceCount: number;
  latency?: string | null;
}

export const PersonalHistoryCard: React.FC<PersonalHistoryCardProps> = ({
  everEaten,
  symptoms,
  occurrenceCount,
  latency
}) => {
  if (!everEaten || symptoms.length === 0) {
    return null;
  }

  const getSymptomIcon = (symptom: string): keyof typeof import('@expo/vector-icons').Ionicons.glyphMap => {
    const iconMap: Record<string, keyof typeof import('@expo/vector-icons').Ionicons.glyphMap> = {
      'diarrhea': 'alert-circle',
      'bloating': 'cloud',
      'gas': 'flash',
      'cramping': 'close-circle',
      'nausea': 'sad-outline',
      'constipation': 'pause-circle',
    };
    return iconMap[symptom.toLowerCase()] || 'alert-circle';
  };

  return (
    <Card variant="white" padding="lg" style={styles.container}>
      <View style={styles.header}>
        <IconContainer
          name="document-text"
          size={32}
          iconSize={18}
          color={colors.pink}
          variant="solid"
          shadow={false}
        />
        <Typography variant="bodyBold" color={colors.black} style={{ marginLeft: spacing.sm }}>
          Your History with This Food
        </Typography>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Typography variant="h3" color={colors.pink}>
            {occurrenceCount}x
          </Typography>
          <Typography variant="caption" color={colors.black + '80'}>
            Times eaten
          </Typography>
        </View>

        {latency && (
          <View style={styles.stat}>
            <Typography variant="bodyBold" color={colors.black}>
              {latency}
            </Typography>
            <Typography variant="caption" color={colors.black + '80'}>
              Symptoms appeared
            </Typography>
          </View>
        )}
      </View>

      <View style={styles.divider} />

      <Typography variant="caption" color={colors.black + '80'} style={{ marginBottom: spacing.sm }}>
        Symptoms you experienced:
      </Typography>

      <View style={styles.symptomsRow}>
        {symptoms.map(symptom => (
          <View key={symptom} style={styles.symptomBadge}>
            <IconContainer
              name={getSymptomIcon(symptom)}
              size={20}
              iconSize={12}
              color={colors.pink}
              variant="transparent"
              shadow={false}
            />
            <Typography variant="caption" color={colors.pink} style={{ marginLeft: 4 }}>
              {symptom}
            </Typography>
          </View>
        ))}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.pink,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginBottom: spacing.md,
  },
  stat: {
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  symptomsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  symptomBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.pink + '10',
    borderRadius: 12,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
});
