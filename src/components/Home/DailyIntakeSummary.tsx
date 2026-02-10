/**
 * DailyIntakeSummary Component
 * Displays user's daily calorie and nutrient intake
 *
 * Presentation Component - Pure UI, no business logic
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Typography } from '../Typography';
import { Card } from '../Card';
import { IconContainer } from '../IconContainer/IconContainer';
import { colors, spacing, radii } from '../../theme';

interface DailyIntakeSummaryProps {
  calories: number;
  calorieGoal?: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
}

export const DailyIntakeSummary: React.FC<DailyIntakeSummaryProps> = ({
  calories,
  calorieGoal = 2000,
  protein,
  carbs,
  fat,
  fiber,
  sugar
}) => {
  const caloriePercentage = Math.round((calories / calorieGoal) * 100);
  const fiberHealthy = fiber >= 15;
  const sugarHigh = sugar > 50;

  return (
    <Card variant="white" padding="lg" style={styles.container}>
      <View style={styles.header}>
        <IconContainer
          name="stats-chart"
          size={32}
          iconSize={18}
          color={colors.blue}
          variant="solid"
          shadow={false}
        />
        <View style={{ flex: 1, marginLeft: spacing.sm }}>
          <Typography variant="bodyBold" color={colors.black}>
            Today's Intake
          </Typography>
          <Typography variant="caption" color={colors.black + '60'}>
            {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </Typography>
        </View>
      </View>

      {/* Calorie Progress */}
      <View style={styles.calorieSection}>
        <View style={styles.calorieHeader}>
          <Typography variant="h3" color={colors.black}>
            {calories}
          </Typography>
          <Typography variant="caption" color={colors.black + '60'}>
            / {calorieGoal} kcal
          </Typography>
        </View>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${Math.min(caloriePercentage, 100)}%`,
                backgroundColor:
                  caloriePercentage > 100
                    ? colors.pink
                    : caloriePercentage > 80
                    ? colors.yellow
                    : colors.green
              }
            ]}
          />
        </View>
        <Typography variant="caption" color={colors.black + '60'}>
          {caloriePercentage}% of daily goal
        </Typography>
      </View>

      {/* Macros Row */}
      <View style={styles.macrosRow}>
        <View style={styles.macro}>
          <Typography variant="caption" color={colors.black + '80'}>
            Protein
          </Typography>
          <Typography variant="bodyBold" color={colors.black}>
            {protein}g
          </Typography>
        </View>
        <View style={styles.macro}>
          <Typography variant="caption" color={colors.black + '80'}>
            Carbs
          </Typography>
          <Typography variant="bodyBold" color={colors.black}>
            {carbs}g
          </Typography>
        </View>
        <View style={styles.macro}>
          <Typography variant="caption" color={colors.black + '80'}>
            Fat
          </Typography>
          <Typography variant="bodyBold" color={colors.black}>
            {fat}g
          </Typography>
        </View>
      </View>

      {/* Health Indicators */}
      <View style={styles.divider} />
      <View style={styles.healthRow}>
        <View style={styles.healthItem}>
          <Typography variant="caption" color={colors.black + '80'}>
            Fiber
          </Typography>
          <Typography
            variant="bodyBold"
            color={fiberHealthy ? colors.green : colors.black}
          >
            {fiber}g {fiberHealthy ? '✅' : ''}
          </Typography>
        </View>
        <View style={styles.healthItem}>
          <Typography variant="caption" color={colors.black + '80'}>
            Sugar
          </Typography>
          <Typography
            variant="bodyBold"
            color={sugarHigh ? colors.pink : colors.black}
          >
            {sugar}g {sugarHigh ? '⚠️' : ''}
          </Typography>
        </View>
      </View>
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
    marginBottom: spacing.lg,
  },
  calorieSection: {
    marginBottom: spacing.lg,
  },
  calorieHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: spacing.sm,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: radii.full,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  progressFill: {
    height: '100%',
    borderRadius: radii.full,
  },
  macrosRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  macro: {
    alignItems: 'center',
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  healthRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.lg,
  },
  healthItem: {
    flex: 1,
    alignItems: 'center',
  },
});
