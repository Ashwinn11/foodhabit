/**
 * User Profile Types
 * Represents user onboarding data and profile information
 */

export interface UserProfile {
  id: string;

  // Body Basics
  age: number | null;
  gender: 'male' | 'female' | 'other' | 'prefer_not_to_say' | null;
  height: number | null; // cm
  weight: number | null; // kg

  // Lifestyle
  activity_level: 'sedentary' | 'moderate' | 'active' | null;
  sleep_hours: number | null;
  diet_type: 'veg' | 'non_veg' | 'vegan' | null;
  eating_window_start: string | null; // HH:MM format
  eating_window_end: string | null;

  // Symptom Baseline
  bloating_severity: number | null; // 0-10
  bloating_frequency: 'never' | 'rarely' | 'sometimes' | 'often' | 'daily' | null;
  abdominal_pain_severity: number | null; // 0-10
  bowel_movement_frequency: number | null; // times per day
  bowel_movement_quality: 1 | 2 | 3 | 4 | 5 | 6 | 7 | null; // Bristol scale
  has_constipation: boolean | null;
  has_diarrhea: boolean | null;
  gas_severity: number | null; // 0-10
  baseline_energy_level: number | null; // 0-10
  baseline_mood_quality: number | null; // 0-10
  has_brain_fog: boolean | null;
  digestive_impact_on_life: number | null; // 0-10

  // Medical Context
  diagnosed_conditions: string[] | null;
  food_allergies: string[] | null;
  restricts_food_severely: boolean | null;
  binges_regularly: boolean | null;

  // Goals
  focus_area: 'sugar' | 'energy' | 'gut' | 'weight' | null;
  water_intake: number | null;
  cooking_ratio: number | null; // 0-100

  onboarded_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface HealthMetrics {
  id: string;
  user_id: string;

  // Baseline/projected scores (from onboarding)
  metabolic_age: number;
  gut_health_score: number;
  nutrition_balance_score: number;

  // Real-time scores (from meal logs + daily check-ins)
  nutrition_score_real?: number | null;
  gut_health_score_real?: number | null;
  metabolism_score_real?: number | null;
  body_age_real?: number | null;

  // Metadata
  days_with_data?: number | null;
  last_meal_logged_at?: string | null;
  calculated_at: string;
  created_at: string;
}

export interface OnboardingData {
  // Body Basics
  age: number;
  gender: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  height: number;
  weight: number;

  // Lifestyle
  activity_level: 'sedentary' | 'moderate' | 'active';
  sleep_hours: number;
  diet_type: 'veg' | 'non_veg' | 'vegan';
  eating_window_start: string;
  eating_window_end: string;

  // Symptom Baseline
  bloating_severity: number; // 0-10
  bloating_frequency: 'never' | 'rarely' | 'sometimes' | 'often' | 'daily';
  abdominal_pain_severity: number; // 0-10
  bowel_movement_frequency: number; // times per day
  bowel_movement_quality: 1 | 2 | 3 | 4 | 5 | 6 | 7; // Bristol scale
  has_constipation: boolean;
  has_diarrhea: boolean;
  gas_severity: number; // 0-10
  baseline_energy_level: number; // 0-10
  baseline_mood_quality: number; // 0-10
  has_brain_fog: boolean;
  digestive_impact_on_life: number; // 0-10

  // Medical Context
  diagnosed_conditions: string[]; // ['ibs', 'gerd', etc]
  food_allergies: string[]; // ['dairy', 'gluten', etc]
  restricts_food_severely: boolean;
  binges_regularly: boolean;

  // Goals
  focus_area: 'sugar' | 'energy' | 'gut' | 'weight';
  water_intake: number;
  cooking_ratio: number;
}

export interface OnboardingState {
  step: number;
  totalSteps: number;
  data: Partial<OnboardingData>;
  ringProgress: number;
}

export interface MealLog {
  id: string;
  user_id: string;

  // Meal details
  meal_name: string;
  meal_size?: 'small' | 'normal' | 'large' | null;
  meal_time: string;

  // Auto-categorized food type
  is_high_sugar: boolean;
  is_high_fat: boolean;
  is_high_carb: boolean;
  is_high_fiber: boolean;
  is_high_protein: boolean;
  is_processed: boolean;

  // Post-meal symptom
  symptom: 'fine' | 'mild_discomfort' | 'bloating';

  // Metadata
  created_at: string;
  updated_at: string;
}

export interface DailyCheckIn {
  id: string;
  user_id: string;
  check_in_date: string;

  // Digestion
  had_bowel_movement: boolean;
  bristol_stool_type?: number | null; // 1-7
  has_bloating: boolean;
  has_constipation: boolean;

  // Hydration
  water_intake: 'low' | 'medium' | 'high';

  // Daily vitals
  energy_level: 'low' | 'normal' | 'high';
  mood_stress: 'low' | 'medium' | 'high';
  sleep_quality: 'bad' | 'ok' | 'good';
  appetite: 'low' | 'normal' | 'high';

  // Metadata
  created_at: string;
  updated_at: string;
}
