/**
 * CalendarHeader - Clean month navigation
 */
import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Typography } from '../Typography';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '../../theme';

interface CalendarHeaderProps {
  month: number;
  year: number;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}

export const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  month, year, onPrevMonth, onNextMonth
}) => {
  const monthName = new Date(year, month).toLocaleString('default', { month: 'long' });

  return (
    <View style={styles.container}>
      <Pressable onPress={onPrevMonth} style={styles.navBtn} hitSlop={12}>
        <Ionicons name="chevron-back" size={20} color={colors.black} />
      </Pressable>

      <View style={styles.title}>
        <Typography variant="bodyBold" color={colors.black} style={{ fontSize: 16 }}>
          {monthName}
        </Typography>
        <Typography variant="caption" color={colors.black + 'AA'} style={{ marginLeft: 6, fontSize: 14 }}>
          {year}
        </Typography>
      </View>

      <Pressable onPress={onNextMonth} style={styles.navBtn} hitSlop={12}>
        <Ionicons name="chevron-forward" size={20} color={colors.black} />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  title: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  navBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.black + '06',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
