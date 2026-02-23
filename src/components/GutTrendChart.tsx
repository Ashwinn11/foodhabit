import React from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import { theme } from '../theme/theme';
import { Text } from './Text';
import { Card } from './Card';

export interface TrendDay {
  label: string;        // 'Mon', 'Tue', etc.
  score: number | null; // 0–1 ratio of good/ok moments. null = no logs
  isToday: boolean;
}

interface GutTrendChartProps {
  days: TrendDay[];
  weekChange: number | null; // percentage point delta vs previous 7 days
}

const MAX_BAR_HEIGHT = 72;
const BAR_GAP = 6;

function barColor(score: number | null): string {
  if (score === null) return 'transparent';
  if (score >= 0.7) return theme.colors.safe;
  if (score >= 0.4) return theme.colors.caution;
  return theme.colors.danger;
}

export const GutTrendChart: React.FC<GutTrendChartProps> = ({ days, weekChange }) => {
  const { width } = useWindowDimensions();
  // 16px screen padding + 16px card padding on each side
  const chartWidth = width - 64;
  const barWidth = (chartWidth - BAR_GAP * (days.length - 1)) / days.length;

  return (
    <Card variant="bordered" style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text variant="h3">Gut Trend</Text>
          <Text variant="caption" color={theme.colors.textSecondary}>
            Good or okay moments · past 7 days
          </Text>
        </View>
        {weekChange !== null && (
          <View style={[
            styles.changeBadge,
            { backgroundColor: weekChange >= 0 ? theme.colors.safeMuted : theme.colors.dangerMuted },
          ]}>
            <Text
              variant="caption"
              color={weekChange >= 0 ? theme.colors.safe : theme.colors.danger}
              style={styles.changeBadgeText}
            >
              {weekChange >= 0 ? '↑' : '↓'} {Math.abs(weekChange)}% vs last week
            </Text>
          </View>
        )}
      </View>

      <View style={styles.chartArea}>
        <Svg width={chartWidth} height={MAX_BAR_HEIGHT}>
          {days.map((day, i) => {
            const x = i * (barWidth + BAR_GAP);
            const barH = day.score !== null
              ? Math.max(day.score * MAX_BAR_HEIGHT, 6)
              : 0;
            const y = MAX_BAR_HEIGHT - barH;

            return (
              <React.Fragment key={i}>
                {/* Background track */}
                <Rect
                  x={x} y={0}
                  width={barWidth} height={MAX_BAR_HEIGHT}
                  rx={6}
                  fill={theme.colors.surface}
                />
                {/* Score bar */}
                {day.score !== null && (
                  <Rect
                    x={x} y={y}
                    width={barWidth} height={barH}
                    rx={6}
                    fill={barColor(day.score)}
                    opacity={day.isToday ? 1 : 0.75}
                  />
                )}
              </React.Fragment>
            );
          })}
        </Svg>

        {/* Day labels */}
        <View style={[styles.labels, { gap: BAR_GAP }]}>
          {days.map((day, i) => (
            <Text
              key={i}
              variant="caption"
              color={day.isToday ? theme.colors.primary : theme.colors.textTertiary}
              align="center"
              style={{ width: barWidth }}
            >
              {day.label}
            </Text>
          ))}
        </View>
      </View>

      <View style={styles.legend}>
        {[
          { color: theme.colors.safe, label: 'Good' },
          { color: theme.colors.caution, label: 'Mixed' },
          { color: theme.colors.danger, label: 'Rough' },
          { color: theme.colors.surface, label: 'No data' },
        ].map(({ color, label }) => (
          <View key={label} style={styles.legendItem}>
            <View style={[styles.legendDot, {
              backgroundColor: color,
              borderWidth: label === 'No data' ? 1 : 0,
              borderColor: theme.colors.border,
            }]} />
            <Text variant="caption" color={theme.colors.textTertiary}>{label}</Text>
          </View>
        ))}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    gap: theme.spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerText: {
    gap: 2,
  },
  changeBadge: {
    borderRadius: theme.radius.full,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
  },
  changeBadgeText: {
    fontFamily: theme.fonts.semibold,
  },
  chartArea: {
    gap: 6,
  },
  labels: {
    flexDirection: 'row',
  },
  legend: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    flexWrap: 'wrap',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
