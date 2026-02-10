/**
 * CalendarHeader Component
 * Month/year navigation header for calendar view
 *
 * Presentation Component - Pure UI, no business logic
 */

import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Typography } from '../Typography';
import { IconContainer } from '../IconContainer/IconContainer';
import { colors, spacing } from '../../theme';

interface CalendarHeaderProps {
  month: number;
  year: number;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}

export const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  month,
  year,
  onPrevMonth,
  onNextMonth
}) => {
  const monthName = new Date(year, month).toLocaleString('default', { month: 'long' });

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onPrevMonth} hitSlop={8}>
        <IconContainer
          name="chevron-back"
          size={32}
          iconSize={20}
          color={colors.blue}
          variant="transparent"
          shadow={false}
        />
      </TouchableOpacity>

      <View style={styles.titleContainer}>
        <Typography variant="h3" color={colors.black}>
          {monthName} {year}
        </Typography>
      </View>

      <TouchableOpacity onPress={onNextMonth} hitSlop={8}>
        <IconContainer
          name="chevron-forward"
          size={32}
          iconSize={20}
          color={colors.blue}
          variant="transparent"
          shadow={false}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
  },
});
