import { supabase } from '../../config/supabase';
import { UserProfile, HealthMetrics, OnboardingData } from '../../types/profile';

/**
 * Health Metrics Service
 * Calculates and manages user health metrics based on profile data
 */

export const metricsService = {
  /**
   * Calculate metabolic age based on profile
   * Formula considers: age, height, weight, activity level, sleep
   * Returns age between 18-70
   */
  calculateMetabolicAge(data: OnboardingData | UserProfile): number {
    const age = data.age || 30;
    const height = data.height || 170; // cm
    const weight = data.weight || 70; // kg
    const activityLevel = data.activity_level || 'moderate';
    const sleepHours = data.sleep_hours || 7;

    // Base metabolic age calculation
    let metabolicAge = age;

    // Adjust for activity level
    const activityMultiplier = {
      sedentary: 1.08,
      moderate: 0.98,
      active: 0.88,
    }[activityLevel];

    metabolicAge *= activityMultiplier;

    // Adjust for sleep quality (7-8 hours is optimal)
    if (sleepHours < 6) {
      metabolicAge *= 1.05;
    } else if (sleepHours >= 7 && sleepHours <= 8) {
      metabolicAge *= 0.95;
    } else if (sleepHours > 9) {
      metabolicAge *= 1.02;
    }

    // Adjust for BMI
    const bmi = weight / ((height / 100) ** 2);
    if (bmi < 18.5 || bmi > 30) {
      metabolicAge *= 1.03;
    } else if (bmi >= 18.5 && bmi <= 25) {
      metabolicAge *= 0.97;
    }

    // Clamp between 18 and 70
    return Math.max(18, Math.min(70, Math.round(metabolicAge)));
  },

  /**
   * Calculate gut health score (0-100)
   * Based on: diet type, eating window, water intake, cooking ratio
   */
  calculateGutHealthScore(data: OnboardingData | UserProfile): number {
    let score = 50; // Base score

    // Diet diversity bonus
    const dietBonus = {
      veg: 12,
      'non_veg': 8,
      vegan: 15,
    }[data.diet_type || 'non_veg'] || 8;
    score += dietBonus;

    // Eating window consistency bonus
    if (data.eating_window_start && data.eating_window_end) {
      const windowScore = this._calculateEatingWindowScore(
        data.eating_window_start,
        data.eating_window_end
      );
      score += windowScore;
    }

    // Water intake bonus
    const waterIntake = data.water_intake || 6;
    if (waterIntake >= 8) {
      score += 10;
    } else if (waterIntake >= 6) {
      score += 5;
    }

    // Cooking ratio bonus (home cooking is better)
    const cookingRatio = data.cooking_ratio || 50;
    if (cookingRatio >= 70) {
      score += 15;
    } else if (cookingRatio >= 50) {
      score += 8;
    }

    // Clamp to 0-100
    return Math.max(0, Math.min(100, score));
  },

  /**
   * Calculate nutrition balance score (0-100)
   * Based on: diet type, eating window, water intake, activity level
   */
  calculateNutritionBalance(data: OnboardingData | UserProfile): number {
    let score = 50; // Base score

    // Eating window regularity
    if (data.eating_window_start && data.eating_window_end) {
      const windowScore = this._calculateEatingWindowScore(
        data.eating_window_start,
        data.eating_window_end
      );
      score += windowScore / 2; // Less weight than gut health
    }

    // Activity level balance
    const activityBonus = {
      sedentary: 5,
      moderate: 12,
      active: 18,
    }[data.activity_level || 'moderate'] || 12;
    score += activityBonus;

    // Diet diversity
    const dietBonus = {
      veg: 10,
      'non_veg': 8,
      vegan: 12,
    }[data.diet_type || 'non_veg'] || 8;
    score += dietBonus;

    // Water intake
    const waterIntake = data.water_intake || 6;
    if (waterIntake >= 8) {
      score += 8;
    } else if (waterIntake >= 6) {
      score += 4;
    }

    // Clamp to 0-100
    return Math.max(0, Math.min(100, score));
  },

  /**
   * Calculate eating window consistency score (0-20)
   * Considers window duration and timing
   */
  _calculateEatingWindowScore(startTime: string, endTime: string): number {
    const start = this._timeToMinutes(startTime);
    const end = this._timeToMinutes(endTime);
    const windowDuration = end - start;

    let score = 10; // Base score

    // Optimal window is 8-10 hours
    if (windowDuration >= 480 && windowDuration <= 600) {
      score += 8;
    } else if (windowDuration >= 420 && windowDuration < 480) {
      score += 6;
    } else if (windowDuration > 600 && windowDuration <= 720) {
      score += 4;
    }

    // Reasonable start time (8am-12pm) and end time (6pm-8pm)
    if (start >= 480 && start <= 720 && end >= 1080 && end <= 1200) {
      score += 2;
    }

    return Math.min(20, score);
  },

  /**
   * Convert HH:MM to minutes since midnight
   */
  _timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  },

  /**
   * Save health metrics to database
   */
  async saveHealthMetrics(
    userId: string,
    metrics: Omit<HealthMetrics, 'id' | 'user_id' | 'created_at' | 'calculated_at'>
  ): Promise<HealthMetrics> {
    const { data, error } = await supabase
      .from('health_metrics')
      .insert({
        user_id: userId,
        ...metrics,
        calculated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Get latest health metrics for user
   */
  async getLatestMetrics(userId: string): Promise<HealthMetrics | null> {
    const { data: metrics, error } = await supabase
      .from('health_metrics')
      .select('*')
      .eq('user_id', userId)
      .order('calculated_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return metrics || null;
  },

  /**
   * Calculate and save all metrics for user after onboarding
   */
  async calculateAndSaveMetrics(userId: string, onboardingData: OnboardingData): Promise<HealthMetrics> {
    const metabolicAge = this.calculateMetabolicAge(onboardingData);
    const gutHealthScore = this.calculateGutHealthScore(onboardingData);
    const nutritionBalanceScore = this.calculateNutritionBalance(onboardingData);

    return this.saveHealthMetrics(userId, {
      metabolic_age: metabolicAge,
      gut_health_score: gutHealthScore,
      nutrition_balance_score: nutritionBalanceScore,
    });
  },
};
