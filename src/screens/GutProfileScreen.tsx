import React, { useMemo } from 'react';

import {
  View,
  StyleSheet,
  ScrollView,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radii } from '../theme';
import { useGutStore } from '../store';
import { generateCalendarDays } from '../utils/calendarUtils';
import {
  ScreenWrapper,
  BoxButton,
  Typography,
  CalendarHeader,
  CalendarGrid,
  Card,
} from '../components';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type GutProfileScreenProps = {
  navigation: NativeStackNavigationProp<any>;
};

export const GutProfileScreen: React.FC<GutProfileScreenProps> = ({ navigation }) => {
  const { gutMoments, meals } = useGutStore();

  // Calendar navigation state
  const [currentMonth, setCurrentMonth] = React.useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = React.useState(new Date().getFullYear());
  const [selectedDate, setSelectedDate] = React.useState(new Date().getDate());

  // Generate calendar days based on gut moments and meals
  const calendarDays = useMemo(() => {
    return generateCalendarDays(currentMonth, currentYear, gutMoments, meals);
  }, [currentMonth, currentYear, gutMoments, meals]);

  // Month stats
  const monthStats = useMemo(() => {
    const startOfMonth = new Date(currentYear, currentMonth, 1);
    const endOfMonth = new Date(currentYear, currentMonth + 1, 0);

    const monthMeals = meals.filter(meal => {
      const d = new Date(meal.timestamp);
      return d >= startOfMonth && d <= endOfMonth;
    });

    const monthMoments = gutMoments.filter(moment => {
      const d = new Date(moment.timestamp);
      return d >= startOfMonth && d <= endOfMonth;
    });

    const daysWithLogs = new Set([
      ...monthMeals.map(m => new Date(m.timestamp).getDate()),
      ...monthMoments.map(m => new Date(m.timestamp).getDate()),
    ]).size;

    return {
      meals: monthMeals.length,
      movements: monthMoments.length,
      daysLogged: daysWithLogs,
    };
  }, [currentMonth, currentYear, meals, gutMoments]);

  // Get logs for selected date
  const selectedDateLogs = useMemo(() => {
    const selectedDateObj = new Date(currentYear, currentMonth, selectedDate);
    selectedDateObj.setHours(0, 0, 0, 0);

    const dayMeals = meals.filter(meal => {
      const mealDate = new Date(meal.timestamp);
      mealDate.setHours(0, 0, 0, 0);
      return mealDate.getTime() === selectedDateObj.getTime();
    });

    const dayMoments = gutMoments.filter(moment => {
      const momentDate = new Date(moment.timestamp);
      momentDate.setHours(0, 0, 0, 0);
      return momentDate.getTime() === selectedDateObj.getTime();
    });

    return { meals: dayMeals, moments: dayMoments };
  }, [selectedDate, currentMonth, currentYear, meals, gutMoments]);

  // Format time from timestamp
  const formatTime = (timestamp: string | Date) => {
    const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  // Get Bristol color based on type
  const getBristolColor = (type: number) => {
    if (type <= 2) return colors.yellow;
    if (type <= 4) return colors.green;
    return colors.pink;
  };

  const hasLogs = selectedDateLogs.meals.length > 0 || selectedDateLogs.moments.length > 0;

  return (
    <ScreenWrapper edges={['top']} style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        {/* Header */}
        <Animated.View
          entering={FadeIn.delay(100)}
          style={styles.header}
        >
          <Typography variant="h3">History</Typography>
          <BoxButton
            icon="add"
            onPress={() => navigation.navigate('AddEntry')}
            size={44}
            color={colors.pink}
          />
        </Animated.View>

        {/* Month Stats Row */}
        <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: colors.green + '10' }]}>
            <Ionicons name="restaurant" size={16} color={colors.green} />
            <Typography variant="bodyBold" color={colors.black} style={{ fontSize: 18, marginTop: 2 }}>
              {monthStats.meals}
            </Typography>
            <Typography variant="caption" color={colors.black + 'AA'} style={{ fontSize: 10 }}>
              Meals
            </Typography>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.blue + '10' }]}>
            <Ionicons name="analytics" size={16} color={colors.blue} />
            <Typography variant="bodyBold" color={colors.black} style={{ fontSize: 18, marginTop: 2 }}>
              {monthStats.movements}
            </Typography>
            <Typography variant="caption" color={colors.black + 'AA'} style={{ fontSize: 10 }}>
              Movements
            </Typography>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.pink + '10' }]}>
            <Ionicons name="calendar" size={16} color={colors.pink} />
            <Typography variant="bodyBold" color={colors.black} style={{ fontSize: 18, marginTop: 2 }}>
              {monthStats.daysLogged}
            </Typography>
            <Typography variant="caption" color={colors.black + 'AA'} style={{ fontSize: 10 }}>
              Days
            </Typography>
          </View>
        </Animated.View>

        {/* Calendar */}
        <Animated.View entering={FadeInDown.delay(150).springify()}>
          <Card variant="white" padding="sm" style={styles.calendarCard}>
            <CalendarHeader
              month={currentMonth}
              year={currentYear}
              onPrevMonth={() => {
                if (currentMonth === 0) {
                  setCurrentMonth(11);
                  setCurrentYear(currentYear - 1);
                } else {
                  setCurrentMonth(currentMonth - 1);
                }
              }}
              onNextMonth={() => {
                if (currentMonth === 11) {
                  setCurrentMonth(0);
                  setCurrentYear(currentYear + 1);
                } else {
                  setCurrentMonth(currentMonth + 1);
                }
              }}
            />
            <CalendarGrid
              days={calendarDays}
              month={currentMonth}
              year={currentYear}
              selectedDate={selectedDate}
              onDayPress={setSelectedDate}
            />
            {/* Legend */}
            <View style={styles.legendRow}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: colors.green }]} />
                <Typography variant="caption" color={colors.black + 'AA'} style={{ fontSize: 10 }}>
                  Complete
                </Typography>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: colors.yellow }]} />
                <Typography variant="caption" color={colors.black + 'AA'} style={{ fontSize: 10 }}>
                  Meals Only
                </Typography>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: colors.pink }]} />
                <Typography variant="caption" color={colors.black + 'AA'} style={{ fontSize: 10 }}>
                  Symptoms
                </Typography>
              </View>
            </View>
          </Card>
        </Animated.View>

        {/* Selected Date Section Label */}
        <View style={styles.dateLabel}>
          <Typography variant="bodyBold" color={colors.black}>
            {new Date(currentYear, currentMonth, selectedDate).toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'short',
              day: 'numeric',
            })}
          </Typography>
        </View>

        {/* Selected Date Details */}
        {hasLogs ? (
          <Animated.View entering={FadeIn.delay(100)}>
            {/* Timeline layout */}
            <View style={styles.timelineContainer}>
              {/* Meals */}
              {selectedDateLogs.meals.map((meal, idx) => (
                <View key={`meal-${idx}`} style={styles.timelineEntry}>
                  {/* Timeline connector */}
                  <View style={styles.timelineTrack}>
                    <View style={[styles.timelineDot, { backgroundColor: colors.green }]} />
                    {(idx < selectedDateLogs.meals.length - 1 || selectedDateLogs.moments.length > 0) && (
                      <View style={styles.timelineLine} />
                    )}
                  </View>

                  {/* Log row */}
                  <View style={[styles.logRow, { backgroundColor: colors.green + '08' }]}>
                    <View style={[styles.logIcon, { backgroundColor: colors.green }]}>
                      <Ionicons name="restaurant" size={18} color={colors.white} />
                    </View>
                    <View style={{ flex: 1, marginLeft: spacing.md }}>
                      <Typography variant="bodyBold" color={colors.black} style={{ fontSize: 14 }}>
                        {meal.name}
                      </Typography>
                      <Typography variant="caption" color={colors.black + 'AA'} style={{ fontSize: 11, marginTop: 1 }}>
                        {formatTime(meal.timestamp)}
                      </Typography>
                      {meal.nutrition?.calories && (
                        <View style={styles.chipRow}>
                          <Typography variant="caption" color={colors.black + 'AA'} style={{ fontSize: 11 }}>
                            {Math.round(meal.nutrition.calories)} cal
                          </Typography>
                          {meal.nutrition?.protein && (
                            <Typography variant="caption" color={colors.black + 'AA'} style={{ fontSize: 11 }}>
                              · {meal.nutrition.protein}g pro
                            </Typography>
                          )}
                        </View>
                      )}
                    </View>
                  </View>
                </View>
              ))}

              {/* Bowel Movements */}
              {selectedDateLogs.moments.map((moment, idx) => {
                const bristolType = moment.bristolType || 3;
                const bristolColor = getBristolColor(bristolType);
                const activeSymptoms = Object.entries(moment.symptoms || {})
                  .filter(([_, v]) => v)
                  .map(([k]) => k);

                return (
                  <View key={`moment-${idx}`} style={styles.timelineEntry}>
                    {/* Timeline connector */}
                    <View style={styles.timelineTrack}>
                      <View style={[styles.timelineDot, { backgroundColor: bristolColor }]} />
                      {idx < selectedDateLogs.moments.length - 1 && (
                        <View style={styles.timelineLine} />
                      )}
                    </View>

                    {/* Log row */}
                    <View style={[styles.logRow, { backgroundColor: bristolColor + '08' }]}>
                      <View style={[styles.bristolCircle, { backgroundColor: bristolColor }]}>
                        <Typography variant="bodyBold" color={colors.white} style={{ fontSize: 16 }}>
                          {bristolType}
                        </Typography>
                      </View>
                      <View style={{ flex: 1, marginLeft: spacing.md }}>
                        <Typography variant="bodyBold" color={colors.black} style={{ fontSize: 14 }}>
                          Type {bristolType}
                        </Typography>
                        <Typography variant="caption" color={colors.black + 'AA'} style={{ fontSize: 11, marginTop: 1 }}>
                          {formatTime(moment.timestamp)}
                        </Typography>
                        {activeSymptoms.length > 0 && (
                          <View style={styles.chipRow}>
                            {activeSymptoms.map(s => (
                              <Typography key={s} variant="caption" color={colors.pink} style={{ fontSize: 11 }}>
                                {s}
                              </Typography>
                            ))}
                          </View>
                        )}
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          </Animated.View>
        ) : (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Ionicons name="calendar-outline" size={32} color={colors.blue + '60'} />
            </View>
            <Typography variant="bodyBold" color={colors.black + '40'} style={{ marginTop: spacing.md }}>
              No entries for this date
            </Typography>
            <Typography variant="caption" color={colors.black + '30'} style={{ marginTop: 4 }}>
              Tap + to add a log
            </Typography>
          </View>
        )}

        {/* Bottom padding */}
        <View style={styles.bottomPadding} />
      </ScrollView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  bottomPadding: {
    height: 120,
  },
  calendarCard: {
    marginBottom: spacing.lg,
  },
  container: {
    flex: 1,
    backgroundColor: colors.backgroundTint,
  },
  dateLabel: {
    paddingVertical: spacing.sm,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.blue + '08',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing['3xl'],
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: spacing.lg,
    paddingTop: spacing.md,
  },
  legendDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.lg,
    paddingVertical: spacing.sm,
    paddingBottom: spacing.md,
  },
  logRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radii.lg,
    padding: spacing.md,
    marginLeft: spacing.md,
  },
  logIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bristolCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 3,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
  },
  scrollView: {
    flex: 1,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderRadius: radii.lg,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  timelineContainer: {
    // Timeline entries stack vertically
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 14,
  },
  timelineEntry: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: colors.black + '10',
    alignSelf: 'center',
    marginTop: 4,
  },
  timelineTrack: {
    width: 20,
    alignItems: 'center',
  },
});
