import { GutMoment, MealEntry } from '../store/useGutStore';

export type DayIndicator = 'green' | 'yellow' | 'red' | 'empty' | 'gray';

export interface DayData {
  date: number;
  indicator: DayIndicator;
  hasLogs: boolean;
}

/**
 * Generate calendar days for a given month with color indicators
 * based on gut moments and meals logged
 *
 * Color Logic:
 * - Red: Day has symptoms (bloating, gas, cramping, nausea) or bad bristol types
 * - Yellow: Day has meals but no symptoms
 * - Green: Day has poop logs but no symptoms
 * - Gray: Past days with no logs
 * - Empty: No data, blank day in calendar
 */
export function generateCalendarDays(
  month: number,
  year: number,
  gutMoments: GutMoment[] = [],
  meals: MealEntry[] = []
): DayData[] {
  const days: DayData[] = [];

  // Get first day of month (0 = Sunday, 1 = Monday, etc)
  const firstDay = new Date(year, month, 1).getDay();

  // Get number of days in month
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Get today for comparison
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Add padding for days before month starts
  for (let i = 0; i < firstDay; i++) {
    days.push({
      date: 0,
      indicator: 'empty',
      hasLogs: false,
    });
  }

  // Add days of the month
  for (let date = 1; date <= daysInMonth; date++) {
    const dayDate = new Date(year, month, date);
    dayDate.setHours(0, 0, 0, 0);

    // Check if this day is in the past
    const isPast = dayDate < today;

    // Get logs for this day
    const dayGutMoments = gutMoments.filter(moment => {
      const momentDate = new Date(moment.timestamp);
      momentDate.setHours(0, 0, 0, 0);
      return momentDate.getTime() === dayDate.getTime();
    });

    const dayMeals = meals.filter(meal => {
      const mealDate = new Date(meal.timestamp);
      mealDate.setHours(0, 0, 0, 0);
      return mealDate.getTime() === dayDate.getTime();
    });

    const hasLogs = dayGutMoments.length > 0 || dayMeals.length > 0;

    // Determine indicator color
    let indicator: DayIndicator = 'empty';

    if (hasLogs) {
      // Check for symptoms in gut moments
      const hasSymptoms = dayGutMoments.some(moment => {
        // Check for symptom array
        if (moment.symptoms && Array.isArray(moment.symptoms)) {
          return moment.symptoms.length > 0;
        }
        // Check for symptom fields
        const symptomFields = ['bloating', 'gas', 'cramping', 'nausea', 'diarrhea', 'constipation'];
        return symptomFields.some(field => moment[field as keyof GutMoment]);
      });

      // Check for bad bristol types (1, 2, 6, 7)
      const hasBadBristol = dayGutMoments.some(moment => {
        const bristol = (moment.bristol || moment.bristolType) as number;
        return [1, 2, 6, 7].includes(bristol);
      });

      if (hasSymptoms || hasBadBristol) {
        indicator = 'red';
      } else if (dayMeals.length > 0 && dayGutMoments.length === 0) {
        indicator = 'yellow'; // Meals but no poop logs = yellow
      } else {
        indicator = 'green'; // Poop logs but no symptoms = green
      }
    } else if (isPast) {
      indicator = 'gray'; // Past day with no logs
    }

    days.push({
      date,
      indicator,
      hasLogs,
    });
  }

  return days;
}

/**
 * Get the number of days in a month
 */
export function getDaysInMonth(month: number, year: number): number {
  return new Date(year, month + 1, 0).getDate();
}

/**
 * Format month/year for display
 */
export function formatMonthYear(month: number, year: number): string {
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return `${monthNames[month]} ${year}`;
}
