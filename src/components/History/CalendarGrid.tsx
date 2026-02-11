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
          {days.slice(weekIndex * 7, (weekIndex + 1) * 7).map((day, dayIndex) => {
            const isSelected = day.date === selectedDate;
            const hasLogs = day.indicator !== 'empty' && day.indicator !== 'gray';
            const isEmpty = day.indicator === 'gray' || day.indicator === 'empty';

            return (
              <TouchableOpacity
                key={`${weekIndex}-${dayIndex}`}
                style={[
                  styles.dayCell,
                  isSelected && styles.selectedDay,
                  !isSelected && hasLogs && styles.hasLogsCell,
                  !isSelected && isEmpty && styles.emptyCell
                ]}
                onPress={() => day.hasLogs && onDayPress(day.date)}
                disabled={!day.hasLogs}
                activeOpacity={0.7}
              >
                {day.date !== 0 ? (
                  <>
                    <Typography
                      variant="bodyBold"
                      color={isSelected ? colors.white : isEmpty ? colors.black + '40' : colors.black}
                    >
                      {day.date}
                    </Typography>
                    {!isSelected && hasLogs && (
                      <View
                        style={[
                          styles.indicator,
                          { backgroundColor: getIndicatorColor(day.indicator) }
                        ]}
                      />
                    )}
                  </>
                ) : null}
              </TouchableOpacity>
            );
          })}
        </View>
      ))}
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
    marginBottom: spacing.sm,
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
    borderRadius: radii.lg,
    margin: 2,
    backgroundColor: colors.white,
  },
  hasLogsCell: {
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.blue,
  },
  selectedDay: {
    backgroundColor: colors.blue,
    borderWidth: 0,
    shadowColor: colors.blue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  emptyCell: {
    backgroundColor: '#F3F4F6',
    opacity: 0.6,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    position: 'absolute',
    bottom: 4,
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
