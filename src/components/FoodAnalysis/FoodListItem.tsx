/**
 * FoodListItem Component - Premium Scannable Version
 * Displays a single food with semi-circle score gauge and visual hierarchy
 *
 * Shows: name, score gauge, risk dot, nutrition pills, explanation
 * Presentation Component - Pure UI, receives data as props
 */

import React from 'react';
import { View, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Typography } from '../Typography';
import { Card } from '../Card';
import { ScoreGauge } from './ScoreGauge';
import { colors, spacing, radii } from '../../theme';
import { Ionicons } from '@expo/vector-icons';

interface FoodListItemProps {
  foodName: string;
  analysis: {
    level?: 'low' | 'moderate' | 'high';
    nutrition?: {
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
      fiber: number;
      sugar: number;
      sodium: number;
    };
    nutritionScore?: number;
    score?: number;
    explanation?: string;
  } | null;
  isSelected: boolean;
  onToggle: () => void;
  isLoading: boolean;
  triggerWarning?: {
    confidence: string;
    frequencyText: string;
    symptoms: string[];
    latency: string;
  };
}

const getRiskColor = (level?: string): string => {
  switch (level) {
    case 'low':
      return colors.green;
    case 'moderate':
      return colors.yellow;
    case 'high':
      return colors.pink;
    default:
      return colors.mediumGray;
  }
};

const getRiskLabel = (level?: string): string => {
  switch (level) {
    case 'low':
      return 'Low Risk';
    case 'moderate':
      return 'Moderate';
    case 'high':
      return 'High Risk';
    default:
      return 'Unknown';
  }
};

const getRiskIcon = (level?: string): keyof typeof Ionicons.glyphMap => {
  switch (level) {
    case 'low':
      return 'shield-checkmark';
    case 'moderate':
      return 'alert-circle';
    case 'high':
      return 'warning';
    default:
      return 'help-circle';
  }
};

type NutrientKey = 'calories' | 'protein' | 'carbs' | 'fat' | 'fiber' | 'sugar' | 'sodium';

const getNutrientColor = (key: NutrientKey): string => {
  const map: Record<NutrientKey, string> = {
    calories: colors.pink,
    protein: colors.blue,
    carbs: colors.yellow,
    fat: colors.pink,
    fiber: colors.green,
    sugar: colors.pink,
    sodium: colors.blue,
  };
  return map[key];
};

export const FoodListItem: React.FC<FoodListItemProps> = ({
  foodName,
  analysis,
  isSelected,
  onToggle,
  isLoading,
  triggerWarning,
}) => {
  const riskColor = getRiskColor(analysis?.level);
  const riskLabel = getRiskLabel(analysis?.level);
  const riskIcon = getRiskIcon(analysis?.level);

  // Loading state
  if (isLoading && !analysis) {
    return (
      <Animated.View entering={FadeIn.duration(200)}>
        <Card
          variant="white"
          padding="md"
          style={[styles.container, styles.loadingContainer]}
        >
          <View style={styles.header}>
            <Pressable onPress={onToggle} style={styles.checkbox}>
              <Ionicons
                name={isSelected ? 'checkmark-circle' : 'radio-button-off'}
                size={22}
                color={isSelected ? colors.green : colors.black + '30'}
              />
            </Pressable>
            <Typography variant="bodyBold" color={colors.black} style={{ flex: 1 }}>
              {foodName}
            </Typography>
            <View style={styles.loadingBadge}>
              <ActivityIndicator size="small" color={colors.blue} />
              <Typography variant="caption" color={colors.blue} style={{ marginLeft: 6 }}>
                Analyzing...
              </Typography>
            </View>
          </View>
        </Card>
      </Animated.View>
    );
  }

  // Not found state
  if (!analysis) {
    return (
      <Animated.View entering={FadeIn.duration(200)}>
        <Card
          variant="white"
          padding="md"
          style={[styles.container, { borderLeftColor: colors.mediumGray, borderLeftWidth: 3 }]}
        >
          <View style={styles.header}>
            <Pressable onPress={onToggle} style={styles.checkbox}>
              <Ionicons
                name={isSelected ? 'checkmark-circle' : 'radio-button-off'}
                size={22}
                color={isSelected ? colors.green : colors.black + '30'}
              />
            </Pressable>
            <Typography variant="bodyBold" color={colors.black} style={{ flex: 1 }}>
              {foodName}
            </Typography>
            <Typography variant="caption" color={colors.black + '50'}>
              Not found
            </Typography>
          </View>
        </Card>
      </Animated.View>
    );
  }

  // Use nutrition score from AI
  const scoreValue = analysis.score ?? analysis.nutritionScore ?? 5;

  return (
    <Animated.View entering={FadeIn.duration(300)}>
      <Pressable onPress={onToggle}>
        <Card
          variant="white"
          padding="md"
          style={[
            styles.container,
            { borderLeftColor: riskColor, borderLeftWidth: 3 },
            isSelected && styles.selectedContainer,
          ]}
        >
          {/* Header: Checkbox + Name + Score Gauge */}
          <View style={styles.header}>
            <Pressable onPress={onToggle} style={styles.checkbox}>
              <Ionicons
                name={isSelected ? 'checkmark-circle' : 'radio-button-off'}
                size={22}
                color={isSelected ? colors.green : colors.black + '30'}
              />
            </Pressable>

            <View style={{ flex: 1 }}>
              <Typography variant="bodyBold" color={colors.black}>
                {foodName}
              </Typography>
              {/* Risk inline with dot */}
              <View style={styles.riskRow}>
                <Ionicons name={riskIcon} size={13} color={riskColor} />
                <Typography variant="caption" color={riskColor} style={{ marginLeft: 3, fontWeight: '600' }}>
                  {riskLabel}
                </Typography>
              </View>
            </View>

            {/* Semi-circle Score Gauge */}
            <ScoreGauge score={scoreValue} size={52} />
          </View>

          {/* Nutrition Pills */}
          {analysis.nutrition && (
            <View style={styles.nutritionRow}>
              {([
                { key: 'calories' as NutrientKey, label: 'Cal', value: analysis.nutrition.calories, unit: '' },
                { key: 'protein' as NutrientKey, label: 'Pro', value: analysis.nutrition.protein, unit: 'g' },
                { key: 'carbs' as NutrientKey, label: 'Carb', value: analysis.nutrition.carbs, unit: 'g' },
                { key: 'fat' as NutrientKey, label: 'Fat', value: analysis.nutrition.fat, unit: 'g' },
                { key: 'fiber' as NutrientKey, label: 'Fib', value: analysis.nutrition.fiber, unit: 'g' },
              ]).map(({ key, label, value, unit }) => {
                const pillColor = getNutrientColor(key);
                return (
                  <View key={key} style={[styles.nutrientPill, { backgroundColor: pillColor + '12' }]}>
                    <Typography variant="caption" color={pillColor + 'AA'} style={{ fontSize: 10 }}>
                      {label}
                    </Typography>
                    <Typography variant="caption" color={colors.black} style={{ fontWeight: '700', fontSize: 12 }}>
                      {value}{unit}
                    </Typography>
                  </View>
                );
              })}
            </View>
          )}

          {/* Known Trigger Warning */}
          {triggerWarning && (
            <View style={styles.triggerWarning}>
              <Ionicons name="warning" size={16} color={colors.white} />
              <View style={{ flex: 1, marginLeft: spacing.sm }}>
                <Typography variant="caption" color={colors.white} style={{ fontWeight: '700' }}>
                  Known Trigger ({triggerWarning.confidence})
                </Typography>
                <Typography variant="caption" color={colors.white + 'cc'} style={{ fontSize: 11 }}>
                  {triggerWarning.frequencyText} · {triggerWarning.symptoms.join(', ')} · {triggerWarning.latency}
                </Typography>
              </View>
            </View>
          )}

          {/* AI Explanation */}
          {analysis.explanation && (
            <Typography
              variant="caption"
              color={colors.black + '55'}
              style={{ marginTop: spacing.sm, fontStyle: 'italic', lineHeight: 16 }}
            >
              {analysis.explanation}
            </Typography>
          )}
        </Card>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.sm,
  },
  loadingContainer: {
    borderLeftColor: colors.blue,
    borderLeftWidth: 3,
  },
  selectedContainer: {
    backgroundColor: colors.green + '06',
    borderColor: colors.green + '30',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  checkbox: {
    padding: spacing.xs,
  },
  riskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  loadingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: colors.blue + '10',
    borderRadius: radii.lg,
  },
  nutritionRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: spacing.sm,
    paddingLeft: 34, // align with food name (past checkbox)
  },
  nutrientPill: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 4,
    borderRadius: radii.md,
    gap: 1,
  },
  triggerWarning: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.pink,
    borderRadius: radii.lg,
    padding: spacing.md,
    marginTop: spacing.sm,
  },
});
