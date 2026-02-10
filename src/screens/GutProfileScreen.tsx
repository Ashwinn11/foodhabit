import React, { useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
} from 'react-native';
import Animated, {
  FadeIn,
} from 'react-native-reanimated';
import { colors, spacing, radii, shadows, fonts } from '../theme';
import { useGutStore } from '../store';
import { generateCalendarDays } from '../utils/calendarUtils';
import {
  ScreenWrapper,
  BoxButton,
  Typography,
  CalendarHeader,
  CalendarGrid,
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
  

  
  return (
    <ScreenWrapper edges={['top']} style={styles.container}>
      <Animated.View 
        entering={FadeIn.delay(100)}
        style={styles.header}
      >
        <Typography variant="h2">History Book</Typography>
        
        <BoxButton 
          icon="add-circle" 
          onPress={() => navigation.navigate('AddEntry')}
          size={44}
          color={colors.pink}
        />
      </Animated.View>
      
      {/* NEW: Calendar Navigation */}
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
      <CalendarGrid
        days={calendarDays}
        month={currentMonth}
        year={currentYear}
        selectedDate={selectedDate}
        onDayPress={setSelectedDate}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Selected Date Details */}
        {selectedDateLogs.meals.length > 0 || selectedDateLogs.moments.length > 0 ? (
          <Animated.View entering={FadeIn.delay(100)}>
            {/* Meals for selected date */}
            {selectedDateLogs.meals.length > 0 && (
              <View style={styles.section}>
                <Typography variant="bodyBold" color={colors.black} style={{ marginBottom: spacing.md }}>
                  🍽️ Meals
                </Typography>
                {selectedDateLogs.meals.map((meal, idx) => (
                  <View key={`${meal.name}-${idx}`} style={styles.logEntry}>
                    <View style={{ flex: 1 }}>
                      <Typography variant="body" color={colors.black}>
                        {meal.name}
                      </Typography>
                      <Typography variant="bodySmall" color={colors.black + '66'}>
                        {meal.mealType}
                      </Typography>
                    </View>
                    {meal.nutrition?.calories && (
                      <Typography variant="bodyBold" color={colors.blue}>
                        {meal.nutrition.calories} cal
                      </Typography>
                    )}
                  </View>
                ))}
              </View>
            )}

            {/* Gut moments for selected date */}
            {selectedDateLogs.moments.length > 0 && (
              <View style={styles.section}>
                <Typography variant="bodyBold" color={colors.black} style={{ marginBottom: spacing.md }}>
                  💩 Poop Logs
                </Typography>
                {selectedDateLogs.moments.map((moment, idx) => (
                  <View key={`${moment.id}-${idx}`} style={styles.logEntry}>
                    <View style={{ flex: 1 }}>
                      <Typography variant="body" color={colors.black}>
                        Bristol Type: {moment.bristolType}
                      </Typography>
                      {Object.values(moment.symptoms || {}).some(Boolean) && (
                        <Typography variant="bodySmall" color={colors.pink}>
                          Symptoms: {Object.entries(moment.symptoms || {})
                            .filter(([_, v]) => v)
                            .map(([k]) => k)
                            .join(', ')}
                        </Typography>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            )}
          </Animated.View>
        ) : (
          <View style={styles.emptyState}>
            <Typography variant="body" color={colors.black + '66'}>
              No logs for this date
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
  container: {
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  logEntry: {
    backgroundColor: colors.white,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  section: {
    marginBottom: spacing.lg,
  },
  dateHeader: {
    alignSelf: 'flex-start',
    backgroundColor: colors.black,
    borderRadius: radii.sm,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    ...shadows.sm,
  },
  dateHeaderText: {
    fontFamily: fonts.bodyBold,
    fontSize: 10,
    letterSpacing: 1.5,
  },
  emptyIcon: {
    marginBottom: spacing.md,
  },
  emptyTimeline: {
    alignItems: 'center',
    paddingVertical: spacing['3xl'],
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  mainAvatarContainer: {
    marginBottom: spacing.md,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
  },
  scrollView: {
    flex: 1,
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
