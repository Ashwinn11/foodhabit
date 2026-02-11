/**
 * FoodListItem Component - Minimal Scannable Version
 * Displays a single food in a concise card for easy comparison
 *
 * Shows: name, nutrition grade, risk level, summary line, explanation
 * Presentation Component - Pure UI, receives data as props
 */

import React from 'react';
import { View, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { Typography } from '../Typography';
import { Card } from '../Card';
import { colors, spacing, radii } from '../../theme';
import { Ionicons } from '@expo/vector-icons';
import { getNutritionScoreColor } from '../../utils/nutritionScore';

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
      return 'Low';
    case 'moderate':
      return 'Moderate';
    case 'high':
      return 'High';
    default:
      return 'Unknown';
  }
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

  if (isLoading) {
    return (
      <Card
        variant="white"
        padding="md"
        style={[styles.container, { borderLeftColor: colors.mediumGray, borderLeftWidth: 4 }]}
      >
        <View style={styles.header}>
          <Pressable onPress={onToggle} style={styles.checkbox}>
            <ActivityIndicator size="small" color={colors.blue} />
          </Pressable>
          <Typography variant="bodyBold" color={colors.black} style={{ flex: 1 }}>
            {foodName}
          </Typography>
          <Typography variant="caption" color={colors.black + '60'}>
            Analyzing...
          </Typography>
        </View>
      </Card>
    );
  }

  if (!analysis) {
    return (
      <Card
        variant="white"
        padding="md"
        style={[styles.container, { borderLeftColor: colors.mediumGray, borderLeftWidth: 4 }]}
      >
        <View style={styles.header}>
          <Pressable onPress={onToggle} style={styles.checkbox}>
            <Ionicons
              name={isSelected ? 'checkmark-circle' : 'radio-button-off'}
              size={20}
              color={isSelected ? colors.blue : colors.black + '40'}
            />
          </Pressable>
          <Typography variant="bodyBold" color={colors.black} style={{ flex: 1 }}>
            {foodName}
          </Typography>
          <Typography variant="caption" color={colors.black + '60'}>
            Not found
          </Typography>
        </View>
      </Card>
    );
  }

  // Use nutrition score from AI
  const scoreValue = analysis.nutritionScore || 5;
  const scoreColor = getNutritionScoreColor(scoreValue);

  return (
    <Pressable onPress={onToggle}>
      <Card
        variant="white"
        padding="md"
        style={[styles.container, { borderLeftColor: riskColor, borderLeftWidth: 4 }]}
      >
        {/* Header: Checkbox + Name + Score + Risk */}
        <View style={styles.header}>
          <Pressable onPress={onToggle} style={styles.checkbox}>
            <Ionicons
              name={isSelected ? 'checkmark-circle' : 'radio-button-off'}
              size={20}
              color={isSelected ? colors.blue : colors.black + '40'}
            />
          </Pressable>

          <View style={{ flex: 1 }}>
            <Typography variant="bodyBold" color={colors.black}>
              {foodName}
            </Typography>
          </View>

          {/* Score Badge */}
          <View style={[styles.badge, { backgroundColor: scoreColor + '20' }]}>
            <Typography variant="caption" color={scoreColor} style={{ fontWeight: '700' }}>
              {scoreValue}/10
            </Typography>
          </View>

          {/* Risk Badge */}
          <View style={[styles.badge, { backgroundColor: riskColor + '20', marginLeft: spacing.xs }]}>
            <Typography variant="caption" color={riskColor}>
              {riskLabel}
            </Typography>
          </View>
        </View>

        {/* Nutrition Grid */}
        {analysis.nutrition && (
          <View style={styles.nutritionGrid}>
            <View style={styles.nutrientItem}>
              <Typography variant="caption" color={colors.black + '70'}>Cal</Typography>
              <Typography variant="caption" color={colors.black} style={{ fontWeight: '600' }}>
                {analysis.nutrition.calories}
              </Typography>
            </View>
            <View style={styles.nutrientItem}>
              <Typography variant="caption" color={colors.black + '70'}>Pro</Typography>
              <Typography variant="caption" color={colors.black} style={{ fontWeight: '600' }}>
                {analysis.nutrition.protein}g
              </Typography>
            </View>
            <View style={styles.nutrientItem}>
              <Typography variant="caption" color={colors.black + '70'}>Carb</Typography>
              <Typography variant="caption" color={colors.black} style={{ fontWeight: '600' }}>
                {analysis.nutrition.carbs}g
              </Typography>
            </View>
            <View style={styles.nutrientItem}>
              <Typography variant="caption" color={colors.black + '70'}>Fat</Typography>
              <Typography variant="caption" color={colors.black} style={{ fontWeight: '600' }}>
                {analysis.nutrition.fat}g
              </Typography>
            </View>
            <View style={styles.nutrientItem}>
              <Typography variant="caption" color={colors.black + '70'}>Fiber</Typography>
              <Typography variant="caption" color={colors.black} style={{ fontWeight: '600' }}>
                {analysis.nutrition.fiber}g
              </Typography>
            </View>
            <View style={styles.nutrientItem}>
              <Typography variant="caption" color={colors.black + '70'}>Sugar</Typography>
              <Typography variant="caption" color={colors.black} style={{ fontWeight: '600' }}>
                {analysis.nutrition.sugar}g
              </Typography>
            </View>
            <View style={styles.nutrientItem}>
              <Typography variant="caption" color={colors.black + '70'}>Sodium</Typography>
              <Typography variant="caption" color={colors.black} style={{ fontWeight: '600' }}>
                {analysis.nutrition.sodium}mg
              </Typography>
            </View>
          </View>
        )}

        {/* Known Trigger Warning */}
        {triggerWarning && (
          <View style={styles.triggerWarning}>
            <Ionicons name="warning" size={16} color={colors.pink} />
            <View style={{ flex: 1, marginLeft: spacing.xs }}>
              <Typography variant="caption" color={colors.pink} style={{ fontWeight: '600' }}>
                Known Trigger ({triggerWarning.confidence} confidence)
              </Typography>
              <Typography variant="caption" color={colors.black + '80'}>
                {triggerWarning.frequencyText} · {triggerWarning.symptoms.join(', ')} · {triggerWarning.latency}
              </Typography>
            </View>
          </View>
        )}

        {/* Single explanation - AI chooses most relevant (history or personalized) */}
        {analysis.explanation && (
          <Typography
            variant="caption"
            color={colors.black + '60'}
            style={{ marginTop: spacing.xs, fontStyle: 'italic' }}
          >
            {analysis.explanation}
          </Typography>
        )}
      </Card>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  checkbox: {
    padding: spacing.xs,
  },
  badge: {
    borderRadius: radii.sm,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    alignItems: 'center',
    minWidth: 32,
  },
  nutritionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  nutrientItem: {
    flex: 1,
    minWidth: '28%',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.xs,
    backgroundColor: colors.black + '02',
    borderRadius: radii.sm,
  },
  triggerWarning: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.pink + '10',
    borderRadius: radii.sm,
    padding: spacing.sm,
    marginTop: spacing.sm,
  },
});
