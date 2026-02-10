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
    height: 120, // Enough room for tab bar
  },
  container: {
    flex: 1,
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
