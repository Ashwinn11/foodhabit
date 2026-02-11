/**
 * Calculate daily calorie goal using Harris-Benedict formula
 * This determines baseline metabolic rate, then applies activity multiplier
 */

export interface CalorieInput {
  age: number;      // in years
  height: number;   // in inches
  weight: number;   // in lbs
  gender: 'male' | 'female';
  activityLevel?: 'sedentary' | 'light' | 'moderate' | 'very'; // defaults to 'moderate'
}

/**
 * Harris-Benedict Formula (Revised 1984)
 * Calculates Basal Metabolic Rate (BMR)
 */
function calculateBMR(age: number, height: number, weight: number, gender: 'male' | 'female'): number {
  const weightKg = weight * 0.453592; // Convert lbs to kg
  const heightCm = height * 2.54;    // Convert inches to cm

  if (gender === 'male') {
    // Males: 88.362 + (13.397 × weight in kg) + (4.799 × height in cm) − (5.677 × age in years)
    return 88.362 + (13.397 * weightKg) + (4.799 * heightCm) - (5.677 * age);
  } else {
    // Females: 447.593 + (9.247 × weight in kg) + (3.098 × height in cm) − (4.330 × age in years)
    return 447.593 + (9.247 * weightKg) + (3.098 * heightCm) - (4.330 * age);
  }
}

/**
 * Activity Level Multipliers (TDEE = BMR × multiplier)
 */
const ACTIVITY_MULTIPLIERS: Record<string, number> = {
  sedentary: 1.2,      // Little or no exercise
  light: 1.375,        // Light exercise 1-3 days/week
  moderate: 1.55,      // Moderate exercise 3-5 days/week
  very: 1.725,         // Very active (hard exercise 6-7 days/week)
};

/**
 * Calculate daily calorie goal
 * Returns Total Daily Energy Expenditure (TDEE)
 */
export function calculateDailyCalories(input: CalorieInput): number {
  const {
    age,
    height,
    weight,
    gender,
    activityLevel = 'moderate'
  } = input;

  // Validate inputs
  if (age < 13 || age > 120) {
    console.warn('Invalid age for calorie calculation, using default 2000');
    return 2000;
  }
  if (height < 36 || height > 84) {
    console.warn('Invalid height for calorie calculation, using default 2000');
    return 2000;
  }
  if (weight < 80 || weight > 500) {
    console.warn('Invalid weight for calorie calculation, using default 2000');
    return 2000;
  }

  const bmr = calculateBMR(age, height, weight, gender);
  const multiplier = ACTIVITY_MULTIPLIERS[activityLevel] || 1.55;
  const tdee = Math.round(bmr * multiplier);

  // Cap between 1200 (minimum safe) and 3500 (maximum realistic)
  return Math.max(1200, Math.min(3500, tdee));
}

/**
 * Get activity level display name
 */
export function getActivityLevelLabel(level: string): string {
  const labels: Record<string, string> = {
    sedentary: 'Sedentary (little/no exercise)',
    light: 'Light (1-3 days/week)',
    moderate: 'Moderate (3-5 days/week)',
    very: 'Very Active (6-7 days/week)',
  };
  return labels[level] || labels.moderate;
}
