import { supabase } from '../../config/supabase';

/**
 * Meal Service
 * Handles meal logging, categorization, and real-time score updates
 */

export interface MealLog {
  id: string;
  user_id: string;
  meal_name: string;
  meal_size: 'small' | 'normal' | 'large';
  meal_time: string;
  is_high_sugar: boolean;
  is_high_fat: boolean;
  is_high_carb: boolean;
  is_high_fiber: boolean;
  is_high_protein: boolean;
  is_processed: boolean;
  symptom: 'fine' | 'mild_discomfort' | 'bloating';
  created_at: string;
  updated_at: string;
}

/**
 * Auto-categorize meal based on keywords in meal name
 * Uses simple keyword matching for MVP
 */
export function categorizeMeal(mealName: string): {
  is_high_sugar: boolean;
  is_high_fat: boolean;
  is_high_carb: boolean;
  is_high_fiber: boolean;
  is_high_protein: boolean;
  is_processed: boolean;
} {
  const name = mealName.toLowerCase();

  // Keywords for each category
  const highSugarKeywords = ['dessert', 'candy', 'soda', 'juice', 'cake', 'donut', 'chocolate', 'ice cream', 'sweet', 'sugar'];
  const highFatKeywords = ['fried', 'butter', 'cheese', 'oil', 'cream', 'mayo', 'dressing'];
  const highCarbKeywords = ['bread', 'rice', 'pasta', 'potato', 'noodles', 'pizza', 'bagel'];
  const highFiberKeywords = ['salad', 'vegetable', 'fruit', 'berries', 'broccoli', 'spinach', 'kale'];
  const highProteinKeywords = ['meat', 'chicken', 'beef', 'fish', 'salmon', 'egg', 'tofu', 'protein', 'steak'];
  const processedKeywords = ['packaged', 'processed', 'instant', 'fast food', 'frozen', 'mcdonald', 'burger king', 'chips', 'crackers'];

  const hasKeyword = (keywords: string[]) => keywords.some(kw => name.includes(kw));

  return {
    is_high_sugar: hasKeyword(highSugarKeywords),
    is_high_fat: hasKeyword(highFatKeywords),
    is_high_carb: hasKeyword(highCarbKeywords),
    is_high_fiber: hasKeyword(highFiberKeywords),
    is_high_protein: hasKeyword(highProteinKeywords),
    is_processed: hasKeyword(processedKeywords),
  };
}

export const mealService = {
  /**
   * Log a new meal and trigger real-time score calculation
   */
  async logMeal(
    userId: string,
    mealName: string,
    mealSize: 'small' | 'normal' | 'large',
    mealTime: string,
    symptom: 'fine' | 'mild_discomfort' | 'bloating',
    userAge: number
  ): Promise<MealLog> {
    try {
      // Auto-categorize the meal
      const categories = categorizeMeal(mealName);

      // Insert meal log
      const { data: mealLog, error: insertError } = await supabase
        .from('meal_logs')
        .insert({
          user_id: userId,
          meal_name: mealName,
          meal_size: mealSize,
          meal_time: mealTime,
          symptom,
          ...categories,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Trigger real-time score recalculation
      try {
        const { calculateAndSaveRealTimeMetrics } = await import('./realTimeScoring');
        await calculateAndSaveRealTimeMetrics(userId, userAge);
      } catch (scoringError) {
        console.warn('Real-time scoring failed, but meal was logged:', scoringError);
        // Don't fail meal logging if scoring fails
      }

      // Trigger insight generation
      try {
        const { insightEngine } = await import('../insights/insightEngine');
        await insightEngine.generateInsights(userId);
      } catch (insightError) {
        console.warn('Insight generation failed, but meal was logged:', insightError);
        // Don't fail meal logging if insight generation fails
      }

      return mealLog;
    } catch (error) {
      console.error('Error logging meal:', error);
      throw error;
    }
  },

  /**
   * Get today's meals for a user
   */
  async getTodayMeals(userId: string): Promise<MealLog[]> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const nextDay = new Date(Date.now() + 86400000).toISOString().split('T')[0];

      const { data: meals, error } = await supabase
        .from('meal_logs')
        .select('*')
        .eq('user_id', userId)
        .gte('meal_time', `${today}T00:00:00Z`)
        .lt('meal_time', `${nextDay}T00:00:00Z`)
        .order('meal_time', { ascending: false });

      if (error) throw error;
      return meals || [];
    } catch (error) {
      console.error('Error fetching today meals:', error);
      throw error;
    }
  },

  /**
   * Get meals for a specific date range
   */
  async getMealsInRange(userId: string, startDate: string, endDate: string): Promise<MealLog[]> {
    try {
      const { data: meals, error } = await supabase
        .from('meal_logs')
        .select('*')
        .eq('user_id', userId)
        .gte('meal_time', `${startDate}T00:00:00Z`)
        .lte('meal_time', `${endDate}T23:59:59Z`)
        .order('meal_time', { ascending: false });

      if (error) throw error;
      return meals || [];
    } catch (error) {
      console.error('Error fetching meals in range:', error);
      throw error;
    }
  },

  /**
   * Get all meals for last 7 days
   */
  async getLast7DaysMeals(userId: string): Promise<MealLog[]> {
    try {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data: meals, error } = await supabase
        .from('meal_logs')
        .select('*')
        .eq('user_id', userId)
        .gte('meal_time', sevenDaysAgo.toISOString())
        .order('meal_time', { ascending: false });

      if (error) throw error;
      return meals || [];
    } catch (error) {
      console.error('Error fetching 7-day meals:', error);
      throw error;
    }
  },

  /**
   * Get meal count for today
   */
  async getTodayMealCount(userId: string): Promise<number> {
    try {
      const meals = await this.getTodayMeals(userId);
      return meals.length;
    } catch (error) {
      console.error('Error getting meal count:', error);
      return 0;
    }
  },

  /**
   * Update an existing meal
   */
  async updateMeal(
    mealId: string,
    updates: Partial<Omit<MealLog, 'id' | 'user_id' | 'created_at'>>,
    userId: string,
    userAge: number
  ): Promise<MealLog> {
    try {
      const { data: meal, error: updateError } = await supabase
        .from('meal_logs')
        .update(updates)
        .eq('id', mealId)
        .eq('user_id', userId)
        .select()
        .single();

      if (updateError) throw updateError;

      // Trigger real-time score recalculation
      try {
        const { calculateAndSaveRealTimeMetrics } = await import('./realTimeScoring');
        await calculateAndSaveRealTimeMetrics(userId, userAge);
      } catch (scoringError) {
        console.warn('Real-time scoring failed after update:', scoringError);
      }

      return meal;
    } catch (error) {
      console.error('Error updating meal:', error);
      throw error;
    }
  },

  /**
   * Delete a meal
   */
  async deleteMeal(mealId: string, userId: string, userAge: number): Promise<void> {
    try {
      const { error: deleteError } = await supabase
        .from('meal_logs')
        .delete()
        .eq('id', mealId)
        .eq('user_id', userId);

      if (deleteError) throw deleteError;

      // Trigger real-time score recalculation
      try {
        const { calculateAndSaveRealTimeMetrics } = await import('./realTimeScoring');
        await calculateAndSaveRealTimeMetrics(userId, userAge);
      } catch (scoringError) {
        console.warn('Real-time scoring failed after deletion:', scoringError);
      }
    } catch (error) {
      console.error('Error deleting meal:', error);
      throw error;
    }
  },

  /**
   * Get meal statistics for a user
   */
  async getMealStats(userId: string): Promise<{
    totalMeals: number;
    highSugarCount: number;
    highFatCount: number;
    processedCount: number;
  }> {
    try {
      const meals = await this.getLast7DaysMeals(userId);

      return {
        totalMeals: meals.length,
        highSugarCount: meals.filter(m => m.is_high_sugar).length,
        highFatCount: meals.filter(m => m.is_high_fat).length,
        processedCount: meals.filter(m => m.is_processed).length,
      };
    } catch (error) {
      console.error('Error calculating meal stats:', error);
      throw error;
    }
  },
};
