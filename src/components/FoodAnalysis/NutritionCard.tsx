/**
 * NutritionCard Component
 * Displays nutrition breakdown for analyzed food
 *
 * Presentation Component - Pure UI, no business logic
 * Receives nutrition data and condition as props
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Typography } from '../Typography';
import { Card } from '../Card';
import { IconContainer } from '../IconContainer/IconContainer';
import { colors, spacing } from '../../theme';

interface NutritionCardProps {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
  expanded?: boolean;
}

export const NutritionCard: React.FC<NutritionCardProps> = ({
  calories,
  protein,
  carbs,
  fat,
  fiber,
  sugar,
  sodium,
  expanded = true
}) => {
  if (!expanded) {
    return null;
  }

  const getNutrientColor = (value: number, threshold: number) => {
    return value > threshold ? colors.pink : colors.green;
  };

  return (
    <Card variant="white" padding="lg" style={styles.container}>
      <View style={styles.header}>
        <IconContainer
          name="nutrition"
          size={32}
          iconSize={18}
          color={colors.blue}
          variant="solid"
          shadow={false}
        />
        <Typography variant="bodyBold" color={colors.black} style={{ marginLeft: spacing.sm }}>
          Nutrition Breakdown
        </Typography>
      </View>

      {/* Main macros */}
      <View style={styles.row}>
        <View style={styles.nutrient}>
          <Typography variant="caption" color={colors.black + '80'}>
            Calories
          </Typography>
          <Typography variant="bodyBold" color={colors.black}>
            {calories}
          </Typography>
        </View>
        <View style={styles.nutrient}>
          <Typography variant="caption" color={colors.black + '80'}>
            Protein
          </Typography>
          <Typography variant="bodyBold" color={colors.black}>
            {protein}g
          </Typography>
        </View>
        <View style={styles.nutrient}>
          <Typography variant="caption" color={colors.black + '80'}>
            Carbs
          </Typography>
          <Typography variant="bodyBold" color={colors.black}>
            {carbs}g
          </Typography>
        </View>
        <View style={styles.nutrient}>
          <Typography variant="caption" color={colors.black + '80'}>
            Fat
          </Typography>
          <Typography variant="bodyBold" color={colors.black}>
            {fat}g
          </Typography>
        </View>
      </View>

      {/* Important micronutrients */}
      <View style={styles.divider} />
      <View style={styles.row}>
        <View style={styles.nutrient}>
          <Typography variant="caption" color={colors.black + '80'}>
            Fiber
          </Typography>
          <Typography
            variant="bodyBold"
            color={fiber >= 3 ? colors.green : colors.black}
          >
            {fiber}g {fiber >= 3 ? '✅' : ''}
          </Typography>
        </View>
        <View style={styles.nutrient}>
          <Typography variant="caption" color={colors.black + '80'}>
            Sugar
          </Typography>
          <Typography
            variant="bodyBold"
            color={getNutrientColor(sugar, 10)}
          >
            {sugar}g {sugar > 10 ? '⚠️' : ''}
          </Typography>
        </View>
        <View style={styles.nutrient}>
          <Typography variant="caption" color={colors.black + '80'}>
            Sodium
          </Typography>
          <Typography
            variant="bodyBold"
            color={getNutrientColor(sodium, 400)}
          >
            {sodium}mg {sodium > 400 ? '⚠️' : ''}
          </Typography>
        </View>
      </View>
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
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  nutrient: {
    flex: 1,
    alignItems: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
});
