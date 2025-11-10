import { supabase } from '../../config/supabase';
import { HealthMetrics } from '../../types/profile';

/**
 * Real-Time Scoring Service
 * Calculates actual Body Age, Gut Health, Metabolism, and Nutrition scores
 * based on daily meal logs and check-ins.
 *
 * All formulas use 0-100 scale and are medically logical.
 */

interface MealLogData {
  high_sugar_meals: number;
  high_fat_meals: number;
  high_carb_meals: number;
  fiber_meals: number;
  protein_meals: number;
  bloating_meals: number;
  late_meals: number; // after 9 PM
  large_meals: number;
}

interface DailyCheckInData {
  bad_bristol_stool: number; // 1-2 or 6-7
  high_hydration_day: number; // 1 if high, 0 otherwise
  poor_sleep: number; // 1 if bad, 0 otherwise
  activity_level: number; // 0 (sedentary), 5 (moderate), 10 (active)
  days_count: number; // how many days of data
}

/**
 * Clamp value between 0 and 100
 */
function clamp(value: number, min: number = 0, max: number = 100): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Formula 1: Nutrition Score (N)
 * Nutrition = quality of what was eaten today.
 *
 * N = 100
 *     – 20*(high_sugar_meals)
 *     – 15*(high_fat_meals)
 *     – 10*(high_carb_meals)
 *     + 10*(fiber_meals)
 *     + 10*(protein_meals)
 */
export function calculateNutritionScore(meals: MealLogData): number {
  let N = 100;
  N -= 20 * meals.high_sugar_meals;
  N -= 15 * meals.high_fat_meals;
  N -= 10 * meals.high_carb_meals;
  N += 10 * meals.fiber_meals;
  N += 10 * meals.protein_meals;

  return clamp(N, 0, 100);
}

/**
 * Formula 2: Gut Health Score (G)
 * Gut = digestion rhythm + symptoms.
 *
 * G = 100
 *     – 15*(bloating_meals)
 *     – 10*(late_meals)
 *     – 20*(bad_bristol_stool)
 *     + 10*(fiber_meals)
 *     + 10*(high_hydration_day)
 */
export function calculateGutHealthScore(meals: MealLogData, daily: DailyCheckInData): number {
  let G = 100;
  G -= 15 * meals.bloating_meals;
  G -= 10 * meals.late_meals;
  G -= 20 * daily.bad_bristol_stool;
  G += 10 * meals.fiber_meals;
  G += 10 * daily.high_hydration_day;

  return clamp(G, 0, 100);
}

/**
 * Formula 3: Metabolism Score (M)
 * Metabolism reflects energy rhythm, sugar load, and sleep quality.
 *
 * M = 100
 *     – 20*(high_sugar_meals)
 *     – 10*(large_meals)
 *     – 15*(poor_sleep)
 *     + 10*(activity_level)
 */
export function calculateMetabolismScore(meals: MealLogData, daily: DailyCheckInData): number {
  let M = 100;
  M -= 20 * meals.high_sugar_meals;
  M -= 10 * meals.large_meals;
  M -= 15 * daily.poor_sleep;
  M += daily.activity_level;

  return clamp(M, 0, 100);
}

/**
 * Formula 4: Body Age Score
 * Body Age = weighted average of the three subscores.
 * Metabolism and Gut have more physiological impact.
 *
 * BA_score = (0.4*M) + (0.35*G) + (0.25*N)
 *
 * Convert to years:
 * Delta_age = (80 – BA_score) / 5
 * BodyAge = RealAge + Delta_age
 */
export function calculateBodyAge(
  metabolismScore: number,
  gutScore: number,
  nutritionScore: number,
  realAge: number
): number {
  const BA_score = 0.4 * metabolismScore + 0.35 * gutScore + 0.25 * nutritionScore;
  const delta_age = (80 - BA_score) / 5;
  const bodyAge = Math.round(realAge + delta_age);

  // Clamp body age between 18 and 120
  return clamp(bodyAge, 18, 120);
}

/**
 * Aggregate meal logs for a 7-day window
 * Returns structured meal data for scoring
 */
async function aggregateMealLogs(userId: string): Promise<MealLogData> {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const { data: meals, error } = await supabase
    .from('meal_logs')
    .select('*')
    .eq('user_id', userId)
    .gte('created_at', sevenDaysAgo.toISOString())
    .order('created_at', { ascending: false });

  if (error) throw error;

  const mealData: MealLogData = {
    high_sugar_meals: 0,
    high_fat_meals: 0,
    high_carb_meals: 0,
    fiber_meals: 0,
    protein_meals: 0,
    bloating_meals: 0,
    late_meals: 0,
    large_meals: 0,
  };

  if (!meals || meals.length === 0) return mealData;

  // Aggregate meal categories
  meals.forEach((meal: any) => {
    if (meal.is_high_sugar) mealData.high_sugar_meals += 1;
    if (meal.is_high_fat) mealData.high_fat_meals += 1;
    if (meal.is_high_carb) mealData.high_carb_meals += 1;
    if (meal.is_high_fiber) mealData.fiber_meals += 1;
    if (meal.is_high_protein) mealData.protein_meals += 1;
    if (meal.symptom === 'bloating') mealData.bloating_meals += 1;

    // Check if meal is after 9 PM
    const mealHour = new Date(meal.meal_time).getHours();
    if (mealHour >= 21) mealData.late_meals += 1;

    // Check meal size
    if (meal.meal_size === 'large') mealData.large_meals += 1;
  });

  return mealData;
}

/**
 * Aggregate daily check-ins for a 7-day window
 * Returns structured daily data for scoring
 */
async function aggregateDailyCheckIns(userId: string): Promise<DailyCheckInData> {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];

  const { data: checkIns, error } = await supabase
    .from('daily_check_ins')
    .select('*')
    .eq('user_id', userId)
    .gte('check_in_date', sevenDaysAgoStr)
    .order('check_in_date', { ascending: false });

  if (error) throw error;

  const dailyData: DailyCheckInData = {
    bad_bristol_stool: 0,
    high_hydration_day: 0,
    poor_sleep: 0,
    activity_level: 0,
    days_count: checkIns?.length || 0,
  };

  if (!checkIns || checkIns.length === 0) return dailyData;

  checkIns.forEach((checkIn: any) => {
    // Bad bristol stool: types 1-2 (constipation) or 6-7 (diarrhea)
    if (checkIn.bristol_stool_type && (checkIn.bristol_stool_type <= 2 || checkIn.bristol_stool_type >= 6)) {
      dailyData.bad_bristol_stool += 1;
    }

    // High hydration day
    if (checkIn.water_intake === 'high') {
      dailyData.high_hydration_day += 1;
    }

    // Poor sleep
    if (checkIn.sleep_quality === 'bad') {
      dailyData.poor_sleep += 1;
    }
  });

  // Calculate average activity level from profile (will be added via context)
  // For now, use 5 (moderate) as default
  dailyData.activity_level = 5;

  return dailyData;
}

/**
 * Calculate and save all real-time scores for a user
 * This is the main function called after each meal log or daily check-in
 */
export async function calculateAndSaveRealTimeMetrics(userId: string, realAge: number): Promise<HealthMetrics> {
  try {
    // Aggregate meal and daily data
    const mealData = await aggregateMealLogs(userId);
    const dailyData = await aggregateDailyCheckIns(userId);

    // Calculate the four scores
    const nutritionScore = calculateNutritionScore(mealData);
    const gutScore = calculateGutHealthScore(mealData, dailyData);
    const metabolismScore = calculateMetabolismScore(mealData, dailyData);
    const bodyAge = calculateBodyAge(metabolismScore, gutScore, nutritionScore, realAge);

    // Get the latest meal logged time
    const { data: lastMeal } = await supabase
      .from('meal_logs')
      .select('created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    // Save to health_metrics table
    const { data, error } = await supabase
      .from('health_metrics')
      .insert({
        user_id: userId,
        nutrition_score_real: nutritionScore,
        gut_health_score_real: gutScore,
        metabolism_score_real: metabolismScore,
        body_age_real: bodyAge,
        days_with_data: dailyData.days_count,
        last_meal_logged_at: lastMeal?.created_at || null,
        calculated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error calculating real-time metrics:', error);
    throw error;
  }
}

/**
 * Get latest real-time metrics for user
 * Returns null if no data available
 */
export async function getLatestRealTimeMetrics(userId: string): Promise<HealthMetrics | null> {
  try {
    const { data, error } = await supabase
      .from('health_metrics')
      .select('*')
      .eq('user_id', userId)
      .order('calculated_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = no rows returned
      throw error;
    }

    return data || null;
  } catch (error) {
    console.error('Error fetching real-time metrics:', error);
    return null;
  }
}

/**
 * Check if user has enough data to show real-time scores
 * Requires at least 3 days of meal logs and daily check-ins
 */
export async function hasEnoughDataForRealScores(userId: string): Promise<boolean> {
  try {
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    const { data: meals } = await supabase
      .from('meal_logs')
      .select('id', { count: 'exact' })
      .eq('user_id', userId)
      .gte('created_at', threeDaysAgo.toISOString());

    const { data: checkIns } = await supabase
      .from('daily_check_ins')
      .select('id', { count: 'exact' })
      .eq('user_id', userId)
      .gte('check_in_date', threeDaysAgo.toISOString().split('T')[0]);

    // Need at least 3 meals and 3 check-ins
    return (meals?.length || 0) >= 3 && (checkIns?.length || 0) >= 3;
  } catch (error) {
    console.error('Error checking data availability:', error);
    return false;
  }
}
