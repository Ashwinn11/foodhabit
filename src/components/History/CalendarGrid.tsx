/**
 * CalendarGrid Component
 * Visual calendar grid with day indicators
 *
 * Presentation Component - Pure UI, no business logic
 */

import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Typography } from '../Typography';
import { colors, spacing, radii } from '../../theme';

export type DayIndicator = 'green' | 'yellow' | 'red' | 'empty' | 'gray';

interface DayData {
  date: number;
  indicator: DayIndicator;
  hasLogs: boolean;
}

interface CalendarGridProps {
  days: DayData[];
  month: number;
  year: number;
  selectedDate?: number;
  onDayPress: (date: number) => void;
}

export const CalendarGrid: React.FC<CalendarGridProps> = ({
  days,
  selectedDate,
  onDayPress
}) => {
  const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getIndicatorColor = (indicator: DayIndicator): string => {
    switch (indicator) {
      case 'green':
        return colors.green;
      case 'yellow':
        return colors.yellow;
      case 'red':
        return colors.pink;
      case 'gray':
        return colors.mediumGray;
      default:
        return 'transparent';
    }
  };

  return (
    <View style={styles.container}>
      {/* Day headers */}
      <View style={styles.weekRow}>
        {DAYS_OF_WEEK.map(day => (
          <View key={day} style={styles.dayHeader}>
            <Typography variant="caption" color={colors.black + '60'}>
              {day}
            </Typography>
          </View>
        ))}
      </View>

      {/* Calendar grid */}
      {Array.from({ length: Math.ceil(days.length / 7) }).map((_, weekIndex) => (
        <View key={weekIndex} style={styles.weekRow}>
          {days.slice(weekIndex * 7, (weekIndex + 1) * 7).map((day, dayIndex) => (
            <TouchableOpacity
              key={`${weekIndex}-${dayIndex}`}
              style={[
                styles.dayCell,
                day.date === selectedDate && styles.selectedDay,
                day.indicator !== 'empty' && day.indicator !== 'gray' && styles.hasLogsCell
              ]}
              onPress={() => day.hasLogs && onDayPress(day.date)}
              disabled={!day.hasLogs}
              activeOpacity={0.7}
            >
              {day.date !== 0 ? (
                <>
                  {day.indicator !== 'empty' && (
                    <View
                      style={[
                        styles.indicator,
                        { backgroundColor: getIndicatorColor(day.indicator) }
                      ]}
                    />
                  )}
                  <Typography
                    variant="caption"
                    color={day.indicator === 'gray' ? colors.black + '40' : colors.black}
                  >
                    {day.date}
                  </Typography>
                </>
              ) : null}
            </TouchableOpacity>
          ))}
        </View>
      ))}

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: colors.green }]} />
          <Typography variant="caption" color={colors.black + '60'}>
            Good Day
          </Typography>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: colors.yellow }]} />
          <Typography variant="caption" color={colors.black + '60'}>
            Okay
          </Typography>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: colors.pink }]} />
          <Typography variant="caption" color={colors.black + '60'}>
            Triggered
          </Typography>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  weekRow: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  dayHeader: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  dayCell: {
    flex: 1,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  hasLogsCell: {
    borderColor: colors.blue + '40',
    backgroundColor: colors.blue + '05',
  },
  selectedDay: {
    borderColor: colors.blue,
    borderWidth: 2,
    backgroundColor: colors.blue + '15',
  },
  indicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    position: 'absolute',
    top: 4,
    right: 4,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  legendColor: {
    width: 10,
    height: 10,
    borderRadius: 2,
  },
});
