/**
 * CalendarGrid - Clean, modern calendar
 * Generous spacing, rounded cells, clear color coding
 */
import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Typography } from '../Typography';
import { colors, spacing } from '../../theme';

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

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const indicatorColors: Record<DayIndicator, string> = {
  green: colors.green,
  yellow: colors.yellow,
  red: colors.pink,
  empty: 'transparent',
  gray: 'transparent',
};

export const CalendarGrid: React.FC<CalendarGridProps> = ({
  days, selectedDate, onDayPress
}) => {
  return (
    <View style={styles.grid}>
      {/* Weekday headers */}
      <View style={styles.row}>
        {WEEKDAYS.map((d, i) => (
          <View key={`h-${i}`} style={styles.cell}>
            <Typography variant="caption" color={colors.black + '99'} style={styles.headerText}>
              {d}
            </Typography>
          </View>
        ))}
      </View>

      {/* Day rows */}
      {Array.from({ length: Math.ceil(days.length / 7) }).map((_, week) => (
        <View key={week} style={styles.row}>
          {days.slice(week * 7, (week + 1) * 7).map((day, di) => {
            if (day.date === 0) {
              return <View key={`e-${di}`} style={styles.cell} />;
            }

            const isSelected = day.date === selectedDate;
            const hasData = day.indicator !== 'empty' && day.indicator !== 'gray';
            const dotColor = indicatorColors[day.indicator];
            const isFuture = day.indicator === 'gray';

            return (
              <View key={`d-${di}`} style={styles.cell}>
                <Pressable
                  onPress={() => day.hasLogs && onDayPress(day.date)}
                  disabled={!day.hasLogs}
                  style={[
                    styles.dayBtn,
                    isSelected && styles.selectedBtn,
                    hasData && !isSelected && styles.hasDataBtn,
                  ]}
                >
                  <Typography
                    variant="body"
                    color={
                      isSelected ? colors.white
                      : isFuture ? colors.black + '30'
                      : hasData ? dotColor
                      : colors.black
                    }
                    style={[
                      styles.dayText,
                      isSelected && { fontWeight: '700' },
                      hasData && !isSelected && { fontWeight: '700' },
                    ]}
                  >
                    {day.date}
                  </Typography>
                </Pressable>
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );
};

const CELL_SIZE = 40;

const styles = StyleSheet.create({
  grid: {
    paddingHorizontal: spacing.xs,
    paddingBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 2,
  },
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE + 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  dayBtn: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderRadius: CELL_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedBtn: {
    backgroundColor: colors.blue,
  },
  hasDataBtn: {
    backgroundColor: colors.black + '04',
  },
  dayText: {
    fontSize: 14,
    lineHeight: 18,
  },
});
