/**
 * ScoreGauge Component - Circular score badge
 * Filled circle with score number centered inside, label underneath
 * Color-coded via getNutritionScoreColor
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Svg, Circle } from 'react-native-svg';
import { Typography } from '../Typography';
import { getNutritionScoreColor } from '../../utils/nutritionScore';

interface ScoreGaugeProps {
  score: number; // 1-10
  size?: number; // diameter of circle
  label?: string; // e.g. "+Safe", "Triggers", "Risk"
}

const getScoreLabel = (score: number): string => {
  if (score >= 7) return '+Safe';
  if (score >= 4) return 'Moderate';
  return 'Triggers';
};

export const ScoreGauge: React.FC<ScoreGaugeProps> = ({
  score,
  size = 52,
  label,
}) => {
  const color = getNutritionScoreColor(score);
  const displayLabel = label ?? getScoreLabel(score);
  const strokeWidth = 3;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(score / 10, 1);
  const offset = circumference - progress * circumference;

  return (
    <View style={styles.container}>
      {/* Circle with progress ring */}
      <View style={[styles.ringWrapper, { width: size, height: size }]}>
        <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* Background ring */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color + '15'}
            strokeWidth={strokeWidth}
            fill={color + '08'}
          />
          {/* Progress ring */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
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
        {/* Score number centered */}
        <View style={styles.scoreCenter}>
          <Typography
            variant="bodyBold"
            color={color}
            style={{ fontSize: size * 0.34, lineHeight: size * 0.4 }}
          >
            {score}
          </Typography>
        </View>
      </View>
      {/* Label below */}
      <Typography
        variant="caption"
        color={color}
        style={styles.label}
      >
        {displayLabel}
      </Typography>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  ringWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreCenter: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    marginTop: 2,
    fontSize: 10,
    fontWeight: '600',
  },
});
