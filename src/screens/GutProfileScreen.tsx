import React, { useMemo } from 'react';

import {
  View,
  StyleSheet,
  ScrollView,
} from 'react-native';
import Animated, {
  FadeIn,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radii, shadows } from '../theme';
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

        {/* Calendar Navigation */}
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

        {/* Calendar Grid with generated days */}
        <View style={styles.calendarContainer}>
          <CalendarGrid
            days={calendarDays}
            month={currentMonth}
            year={currentYear}
            selectedDate={selectedDate}
            onDayPress={setSelectedDate}
          />
        </View>

        {/* Legend */}
        <View style={styles.legendCompact}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.green }]} />
            <Typography variant="caption">Complete</Typography>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.yellow }]} />
            <Typography variant="caption">Meals Only</Typography>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.pink }]} />
            <Typography variant="caption">Symptoms</Typography>
          </View>
        </View>

        {/* Selected Date Details */}
        {selectedDateLogs.meals.length > 0 || selectedDateLogs.moments.length > 0 ? (
          <Animated.View entering={FadeIn.delay(100)}>
            {/* Meals for selected date */}
            {selectedDateLogs.meals.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="restaurant" size={20} color={colors.blue} />
                  <Typography variant="bodyBold" style={{ marginLeft: spacing.xs }}>
                    Meals ({selectedDateLogs.meals.length})
                  </Typography>
                </View>
                {selectedDateLogs.meals.map((meal, idx) => (
                  <Card key={`${meal.name}-${idx}`} style={[styles.mealCard, { borderLeftColor: colors.blue }]}>
                    <View style={styles.mealHeader}>
                      <View style={[styles.mealIconBadge, { backgroundColor: colors.blue + '15' }]}>
                        <Ionicons name="restaurant" size={16} color={colors.blue} />
                      </View>
                      <View style={{ flex: 1, marginLeft: spacing.sm }}>
                        <Typography variant="bodyBold">{meal.name}</Typography>
                        <View style={styles.mealMeta}>
                          <Ionicons name="time-outline" size={12} color={colors.black + '60'} />
                          <Typography variant="caption" color={colors.black + '60'} style={{ marginLeft: 4 }}>
                            {formatTime(meal.timestamp)}
                          </Typography>
                          {meal.nutrition?.calories && (
                            <>
                              <View style={styles.dot} />
                              <Typography variant="caption" color={colors.black + '60'}>
                                {Math.round(meal.nutrition.calories)} cal
                              </Typography>
                            </>
                          )}
                        </View>
                      </View>
                    </View>
                  </Card>
                ))}
              </View>
            )}

            {/* Bowel movements for selected date */}
            {selectedDateLogs.moments.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="analytics" size={20} color={colors.pink} />
                  <Typography variant="bodyBold" style={{ marginLeft: spacing.xs }}>
                    Bowel Movements ({selectedDateLogs.moments.length})
                  </Typography>
                </View>
                {selectedDateLogs.moments.map((moment, idx) => {
                  const bristolType = moment.bristolType || 3;
                  const bristolColor = getBristolColor(bristolType);
                  return (
                    <Card
                    key={`${moment.id}-${idx}`}
                    style={[styles.logCard, { borderLeftColor: bristolColor }]}
                  >
                    <View style={styles.logHeader}>
                      <View style={[styles.logIconBadge, { backgroundColor: bristolColor + '15' }]}>
                        <Typography variant="bodyBold" color={bristolColor}>
                          {bristolType}
                        </Typography>
                      </View>
                      <View style={{ flex: 1, marginLeft: spacing.sm }}>
                        <Typography variant="bodyBold">Type {bristolType}</Typography>
                        <View style={styles.logMeta}>
                          <Ionicons name="time-outline" size={12} color={colors.black + '60'} />
                          <Typography variant="caption" color={colors.black + '60'} style={{ marginLeft: 4 }}>
                            {formatTime(moment.timestamp)}
                          </Typography>
                          {Object.values(moment.symptoms || {}).some(Boolean) && (
                            <>
                              <View style={styles.dot} />
                              <Typography variant="caption" color={colors.pink}>
                                {Object.entries(moment.symptoms || {})
                                  .filter(([_, v]) => v)
                                  .map(([k]) => k)
                                  .join(', ')}
                              </Typography>
                            </>
                          )}
                        </View>
                      </View>
                    </View>
                    </Card>
                  );
                })}
              </View>
            )}
          </Animated.View>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={48} color={colors.black + '40'} />
            <Typography variant="body" color={colors.black + '60'} style={{ marginTop: spacing.sm }}>
              No entries for this date
            </Typography>
            <Typography variant="caption" color={colors.black + '40'}>
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
  avatarSection: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  bottomPadding: {
    height: 120,
  },
  calendarContainer: {
    marginBottom: spacing.md,
  },
  container: {
    flex: 1,
  },
  dot: {
    width: 2,
    height: 2,
    borderRadius: 1,
    backgroundColor: colors.black + '60',
    marginHorizontal: 6,
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
    paddingHorizontal: 0,
    paddingTop: spacing.md,
  },
  legendCompact: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  logCard: {
    marginBottom: spacing.sm,
    ...shadows.sm,
    borderLeftWidth: 3,
  },
  logHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  mealCard: {
    marginBottom: spacing.sm,
    ...shadows.sm,
    borderLeftWidth: 3,
  },
  mealHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mealIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mealMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  statCard: {
    flex: 1,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  statsSection: {
    marginBottom: spacing['2xl'],
  },
  timelineContainer: {
    paddingTop: spacing.md,
  },
  timelineSection: {
    marginBottom: spacing['2xl'],
  },
});
