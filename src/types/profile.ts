/**
 * User Profile Types
 * Represents user onboarding data and profile information
 */

export interface UserProfile {
  id: string;
  age: number | null;
  gender: 'male' | 'female' | 'other' | 'prefer_not_to_say' | null;
  height: number | null; // cm
  weight: number | null; // kg
  activity_level: 'sedentary' | 'moderate' | 'active' | null;
  sleep_hours: number | null;
  diet_type: 'veg' | 'non_veg' | 'vegan' | null;
  eating_window_start: string | null; // HH:MM format
  eating_window_end: string | null;
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
  metabolic_age: number;
  gut_health_score: number;
  nutrition_balance_score: number;
  calculated_at: string;
  created_at: string;
}

export interface OnboardingData {
  age: number;
  gender: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  height: number;
  weight: number;
  activity_level: 'sedentary' | 'moderate' | 'active';
  sleep_hours: number;
  diet_type: 'veg' | 'non_veg' | 'vegan';
  eating_window_start: string;
  eating_window_end: string;
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
