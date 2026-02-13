/**
 * DailyIntakeSummary Component - Premium Version
 * Displays user's daily calorie and nutrient intake with visual rings and colored badges
 *
 * Presentation Component - Pure UI, no business logic
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Svg, Circle } from 'react-native-svg';
import { Typography } from '../Typography';
import { Card } from '../Card';
import { colors, spacing, radii } from '../../theme';
import { Ionicons } from '@expo/vector-icons';

interface DailyIntakeSummaryProps {
  calories: number;
  calorieGoal?: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
}

// Mini ring component for macros
const MiniRing: React.FC<{ value: number; max: number; color: string; size?: number }> = ({
  value, max, color, size = 40
}) => {
  const strokeWidth = 3;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(value / max, 1);
  const offset = circumference - progress * circumference;

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <Circle
        cx={size / 2} cy={size / 2} r={radius}
        stroke={color + '18'}
        strokeWidth={strokeWidth}
        fill="none"
      />
      <Circle
        cx={size / 2} cy={size / 2} r={radius}
        stroke={color}
        strokeWidth={strokeWidth}
        fill="none"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        rotation={-90}
        origin={`${size / 2}, ${size / 2}`}
      />
    </Svg>
  );
};

export const DailyIntakeSummary: React.FC<DailyIntakeSummaryProps> = ({
  calories: rawCalories,
  calorieGoal = 2000,
  protein: rawProtein,
  carbs: rawCarbs,
  fat: rawFat,
  fiber: rawFiber,
  sugar: rawSugar
}) => {
  const calories = Math.round(rawCalories);
  const protein = Math.round(rawProtein);
  const carbs = Math.round(rawCarbs);
  const fat = Math.round(rawFat);
  const fiber = Math.round(rawFiber);
  const sugar = Math.round(rawSugar);

  const caloriePercentage = Math.round((calories / calorieGoal) * 100);
  const calorieProgress = Math.min(calories / calorieGoal, 1);
  const fiberHealthy = fiber >= 15;
  const sugarHigh = sugar > 50;

  // Calorie ring dimensions
  const ringSize = 100;
  const ringStroke = 6;
  const ringRadius = (ringSize - ringStroke) / 2;
  const ringCircum = 2 * Math.PI * ringRadius;
  const ringOffset = ringCircum - calorieProgress * ringCircum;
  const ringColor = caloriePercentage > 100
    ? colors.pink
    : caloriePercentage > 80
    ? colors.yellow
    : colors.green;

  return (
    <Card variant="white" padding="lg" style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Ionicons name="nutrition" size={16} color={colors.green} />
        </View>
        <View style={{ flex: 1, marginLeft: spacing.sm }}>
          <Typography variant="bodyBold" color={colors.black}>
            Today's Intake
          </Typography>
          <Typography variant="caption" color={colors.black + 'AA'}>
            {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </Typography>
        </View>
      </View>

      {/* Main: Calorie Ring + Macros */}
      <View style={styles.mainRow}>
        {/* Calorie Ring */}
        <View style={styles.ringContainer}>
          <Svg width={ringSize} height={ringSize} viewBox={`0 0 ${ringSize} ${ringSize}`}>
            <Circle
              cx={ringSize / 2} cy={ringSize / 2} r={ringRadius}
              stroke={colors.black + '08'}
              strokeWidth={ringStroke}
              fill="none"
            />
            <Circle
              cx={ringSize / 2} cy={ringSize / 2} r={ringRadius}
              stroke={ringColor}
              strokeWidth={ringStroke}
              fill="none"
              strokeDasharray={ringCircum}
              strokeDashoffset={ringOffset}
              strokeLinecap="round"
              rotation={-90}
              origin={`${ringSize / 2}, ${ringSize / 2}`}
            />
          </Svg>
          <View style={styles.ringCenter}>
            <Typography variant="h3" color={colors.black} style={{ fontSize: 22, lineHeight: 26 }}>
              {calories}
            </Typography>
            <Typography variant="caption" color={colors.black + 'AA'} style={{ fontSize: 10 }}>
              / {calorieGoal} kcal
            </Typography>
          </View>
        </View>

        {/* Macro Rings */}
        <View style={styles.macrosColumn}>
          {[
            { label: 'Protein', value: protein, max: 60, color: colors.blue, unit: 'g' },
            { label: 'Carbs', value: carbs, max: 250, color: colors.yellow, unit: 'g' },
            { label: 'Fat', value: fat, max: 65, color: colors.pink, unit: 'g' },
          ].map(({ label, value, max, color }) => (
            <View key={label} style={styles.macroItem}>
              <View style={styles.macroRingWrap}>
                <MiniRing value={value} max={max} color={color} size={36} />
                <View style={styles.macroRingCenter}>
                  <Typography variant="caption" color={color} style={{ fontSize: 10, fontWeight: '700' }}>
                    {value}
                  </Typography>
                </View>
              </View>
              <Typography variant="caption" color={colors.black + 'AA'} style={{ fontSize: 10, marginTop: 2 }}>
                {label}
              </Typography>
            </View>
          ))}
        </View>
      </View>

      {/* Health Chips */}
      <View style={styles.healthChips}>
        <View style={[styles.chip, { backgroundColor: fiberHealthy ? colors.green + '15' : colors.black + '06' }]}>
          <Ionicons
            name={fiberHealthy ? 'checkmark-circle' : 'ellipse-outline'}
            size={14}
            color={fiberHealthy ? colors.green : colors.black + '40'}
          />
          <Typography variant="caption" color={fiberHealthy ? colors.green : colors.black + 'AA'} style={{ marginLeft: 4 }}>
            Fiber {fiber}g
          </Typography>
        </View>
        <View style={[styles.chip, { backgroundColor: sugarHigh ? colors.pink + '15' : colors.black + '06' }]}>
          <Ionicons
            name={sugarHigh ? 'alert-circle' : 'ellipse-outline'}
            size={14}
            color={sugarHigh ? colors.pink : colors.black + '40'}
          />
          <Typography variant="caption" color={sugarHigh ? colors.pink : colors.black + 'AA'} style={{ marginLeft: 4 }}>
            Sugar {sugar}g
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
  headerIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.green + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xl,
    marginBottom: spacing.lg,
  },
  ringContainer: {
    width: 100,
    height: 100,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringCenter: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  macrosColumn: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  macroItem: {
    alignItems: 'center',
  },
  macroRingWrap: {
    width: 36,
    height: 36,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  macroRingCenter: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  healthChips: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  chip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radii.lg,
  },
});
