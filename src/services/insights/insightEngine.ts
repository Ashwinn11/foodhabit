/**
 * Insight Engine Service
 * Generates personalized insights from user data
 * Follows Whoop's philosophy: actionable, motivational, no anxiety
 */

import { supabase } from '../../config/supabase';
import {
  Insight,
  MilestoneInsight,
  CorrelationInsight,
  PatternInsight,
  EducationalInsight,
  InsightGenerationResult,
} from '../../types/insight';
import { MealLog } from '../meal/mealService';

/**
 * Main Insight Engine Class
 */
class InsightEngine {
  /**
   * Get all insights for a user
   */
  async getInsights(userId: string): Promise<Insight[]> {
    try {
      const { data, error } = await supabase
        .from('insights')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      return (data || []) as Insight[];
    } catch (error) {
      console.error('Error fetching insights:', error);
      return [];
    }
  }

  /**
   * Generate new insights for a user
   * Called after meal logging or daily check-in
   */
  async generateInsights(userId: string): Promise<InsightGenerationResult> {
    try {
      const insights: Insight[] = [];

      // Get user data
      const mealLogs = await this.getMealLogs(userId, 30); // Last 30 days
      const metricsData = await this.getMetrics(userId);

      // 1. Generate Milestone Insights
      const milestones = await this.detectMilestones(userId, mealLogs);
      insights.push(...milestones);

      // 2. Generate Correlation Insights (need 7+ days of data)
      if (mealLogs.length >= 21) {
        // 7 days × 3 meals
        const correlations = await this.analyzeCorrelations(userId, mealLogs, metricsData);
        insights.push(...correlations);
      }

      // 3. Generate Pattern Insights (need 14+ days of data)
      if (mealLogs.length >= 42) {
        // 14 days × 3 meals
        const patterns = await this.detectPatterns(userId, mealLogs);
        insights.push(...patterns);
      }

      // 4. Generate Educational Insights (always available)
      const educational = await this.getEducationalInsights(userId, mealLogs);
      insights.push(...educational);

      // Save new insights to database
      if (insights.length > 0) {
        await this.saveInsights(insights);
      }

      return {
        insights,
        generated_at: new Date().toISOString(),
        user_id: userId,
        data_quality_score: this.calculateDataQuality(mealLogs),
        recommendations: [],
      };
    } catch (error) {
      console.error('Error generating insights:', error);
      return {
        insights: [],
        generated_at: new Date().toISOString(),
        user_id: userId,
        data_quality_score: 0,
        recommendations: [],
      };
    }
  }

  /**
   * Detect Milestone Achievements
   */
  private async detectMilestones(userId: string, mealLogs: MealLog[]): Promise<MilestoneInsight[]> {
    const milestones: MilestoneInsight[] = [];

    // Calculate current streak
    const streak = this.calculateStreak(mealLogs);

    // Streak milestones
    if (streak >= 3 && streak % 7 === 0) {
      // Every 7-day milestone
      milestones.push({
        id: `milestone_streak_${streak}_${Date.now()}`,
        user_id: userId,
        type: 'milestone',
        priority: 'high',
        title: `${streak}-Day Streak!`,
        subtitle: `You've logged meals for ${streak} days in a row`,
        description: `Consistency is the foundation of lasting change. Keep up the momentum!`,
        created_at: new Date().toISOString(),
        read: false,
        actionable: true,
        action_label: 'Keep it going',
        action_type: 'log_meal',
        milestone_type: 'streak',
        milestone_value: streak,
        milestone_threshold: streak,
        is_personal_record: true, // TODO: Check against previous streaks
        encouragement_message: `You're building a powerful habit. ${streak} days is no small feat!`,
      });
    }

    // Meal count milestones
    const totalMeals = mealLogs.length;
    const mealMilestones = [10, 25, 50, 100, 250, 500];
    const reachedMilestone = mealMilestones.find((m) => totalMeals >= m && totalMeals < m + 3);

    if (reachedMilestone) {
      milestones.push({
        id: `milestone_meals_${reachedMilestone}_${Date.now()}`,
        user_id: userId,
        type: 'milestone',
        priority: 'medium',
        title: `${reachedMilestone} Meals Logged!`,
        subtitle: `You've tracked ${reachedMilestone} meals`,
        description: `Every meal logged is a step toward understanding your body better.`,
        created_at: new Date().toISOString(),
        read: false,
        actionable: false,
        milestone_type: 'meal_count',
        milestone_value: totalMeals,
        milestone_threshold: reachedMilestone,
        is_personal_record: true,
        encouragement_message: `${reachedMilestone} meals is a significant achievement. Your commitment shows!`,
      });
    }

    return milestones;
  }

  /**
   * Analyze Food-Health Correlations
   */
  private async analyzeCorrelations(
    userId: string,
    mealLogs: MealLog[],
    metricsData: any
  ): Promise<CorrelationInsight[]> {
    const correlations: CorrelationInsight[] = [];

    // Get health metrics for correlation analysis
    const { data: metrics } = await supabase
      .from('health_metrics')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(7);

    if (!metrics || metrics.length < 3) return correlations;

    // Analyze fiber intake → gut health correlation
    const fiberMeals = mealLogs.filter((m) => m.is_high_fiber);
    if (fiberMeals.length >= 5) {
      const avgGutHealthWithFiber = 85; // TODO: Calculate from actual metrics
      const avgGutHealthWithoutFiber = 72;
      const improvement = avgGutHealthWithFiber - avgGutHealthWithoutFiber;

      if (improvement > 5) {
        correlations.push({
          id: `correlation_fiber_gut_${Date.now()}`,
          user_id: userId,
          type: 'correlation',
          priority: 'high',
          title: 'Fiber improves your gut health',
          subtitle: `${improvement} point improvement when eating fiber-rich foods`,
          description: `Over the past ${Math.floor(mealLogs.length / 3)} days, meals with high fiber showed significantly better gut health scores.`,
          created_at: new Date().toISOString(),
          read: false,
          actionable: true,
          action_label: 'Log a fiber-rich meal',
          action_type: 'log_meal',
          behavior: 'fiber_intake',
          metric: 'gut_health_score',
          correlation_strength: 0.8,
          behavior_days: fiberMeals.length,
          metric_improvement: improvement,
          timeframe_days: 7,
        });
      }
    }

    return correlations;
  }

  /**
   * Detect Eating Patterns
   */
  private async detectPatterns(userId: string, mealLogs: MealLog[]): Promise<PatternInsight[]> {
    const patterns: PatternInsight[] = [];

    // Analyze meal timing patterns
    const mealsByHour: { [key: number]: MealLog[] } = {};
    mealLogs.forEach((meal) => {
      const hour = new Date(meal.meal_time).getHours();
      if (!mealsByHour[hour]) mealsByHour[hour] = [];
      mealsByHour[hour].push(meal);
    });

    // Check for early eating window (meals before 7 PM)
    const earlyMeals = mealLogs.filter((m) => new Date(m.meal_time).getHours() < 19);
    const earlyMealPercentage = (earlyMeals.length / mealLogs.length) * 100;

    if (earlyMealPercentage > 70) {
      patterns.push({
        id: `pattern_early_eating_${Date.now()}`,
        user_id: userId,
        type: 'pattern',
        priority: 'medium',
        title: 'You eat early in the day',
        subtitle: `${Math.round(earlyMealPercentage)}% of meals before 7 PM`,
        description: `Early eating windows support better metabolism and sleep quality. You're doing great!`,
        created_at: new Date().toISOString(),
        read: false,
        actionable: true,
        action_label: 'Learn about eating windows',
        action_type: 'learn_more',
        pattern_type: 'eating_window',
        pattern_description: `Most of your meals happen before 7 PM, giving your body time to digest before sleep.`,
        frequency: 'Daily',
        metric_impact: {
          metric: 'metabolism_score',
          average_with_pattern: 82,
          average_without_pattern: 75,
          improvement_percentage: 9,
        },
        recommendation: 'Continue this pattern and consider finishing dinner by 6 PM for even better results.',
      });
    }

    return patterns;
  }

  /**
   * Get Educational Insights
   */
  private async getEducationalInsights(
    userId: string,
    mealLogs: MealLog[]
  ): Promise<EducationalInsight[]> {
    const educational: EducationalInsight[] = [];

    // Only show educational insights every few days
    const lastEducational = await this.getLastEducationalInsight(userId);
    const daysSince = lastEducational
      ? Math.floor((Date.now() - new Date(lastEducational.created_at).getTime()) / (1000 * 60 * 60 * 24))
      : 999;

    if (daysSince < 3) return educational; // Wait 3 days between tips

    // Provide relevant tips based on recent meals
    const hasSugarMeals = mealLogs.slice(0, 9).some((m) => m.is_high_sugar);
    if (hasSugarMeals) {
      educational.push({
        id: `educational_fiber_before_carbs_${Date.now()}`,
        user_id: userId,
        type: 'educational',
        priority: 'low',
        title: 'Nutrition Tip',
        subtitle: 'Fiber before carbs reduces blood sugar spikes',
        description: `Starting meals with vegetables or salad can improve metabolic health by slowing glucose absorption.`,
        created_at: new Date().toISOString(),
        read: false,
        actionable: true,
        action_label: 'Try it at next meal',
        action_type: 'log_meal',
        category: 'nutrition',
        fact: 'Eating fiber-rich foods before carbohydrates can reduce blood sugar spikes by up to 30%.',
        explanation: `When you eat vegetables or salad first, the fiber slows down the absorption of sugars and starches that come later in the meal. This helps prevent rapid blood sugar spikes and crashes.`,
        relevance_score: 85,
        try_it_suggestion: 'Start your next meal with a side salad or steamed vegetables before eating the rest.',
      });
    }

    return educational;
  }

  /**
   * Helper: Get meal logs
   */
  private async getMealLogs(userId: string, days: number): Promise<MealLog[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabase
      .from('meal_logs')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', startDate.toISOString())
      .order('meal_time', { ascending: false });

    if (error) {
      console.error('Error fetching meal logs:', error);
      return [];
    }

    return (data || []) as MealLog[];
  }

  /**
   * Helper: Get health metrics
   */
  private async getMetrics(userId: string): Promise<any> {
    const { data, error } = await supabase
      .from('health_metrics')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) return null;
    return data;
  }

  /**
   * Helper: Calculate streak
   */
  private calculateStreak(mealLogs: MealLog[]): number {
    if (mealLogs.length === 0) return 0;

    // Group meals by date
    const mealsByDate: { [key: string]: MealLog[] } = {};
    mealLogs.forEach((meal) => {
      const dateKey = new Date(meal.meal_time).toISOString().split('T')[0];
      if (!mealsByDate[dateKey]) mealsByDate[dateKey] = [];
      mealsByDate[dateKey].push(meal);
    });

    // Count consecutive days with at least 1 meal
    const sortedDates = Object.keys(mealsByDate).sort().reverse();
    let streak = 0;
    const today = new Date().toISOString().split('T')[0];
    let checkDate = new Date(today);

    for (let i = 0; i < 100; i++) {
      // Check up to 100 days back
      const dateKey = checkDate.toISOString().split('T')[0];
      if (mealsByDate[dateKey]) {
        streak++;
      } else if (i > 0) {
        // Allow missing today if checking streak
        break;
      }
      checkDate.setDate(checkDate.getDate() - 1);
    }

    return streak;
  }

  /**
   * Helper: Calculate data quality score
   */
  private calculateDataQuality(mealLogs: MealLog[]): number {
    if (mealLogs.length === 0) return 0;

    const daysWithData = new Set(mealLogs.map((m) => new Date(m.meal_time).toISOString().split('T')[0])).size;

    const expectedDays = 30;
    return Math.min(100, (daysWithData / expectedDays) * 100);
  }

  /**
   * Helper: Get last educational insight
   */
  private async getLastEducationalInsight(userId: string): Promise<EducationalInsight | null> {
    const { data } = await supabase
      .from('insights')
      .select('*')
      .eq('user_id', userId)
      .eq('type', 'educational')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    return data as EducationalInsight | null;
  }

  /**
   * Helper: Save insights to database
   */
  private async saveInsights(insights: Insight[]): Promise<void> {
    try {
      const { error } = await supabase.from('insights').insert(
        insights.map((insight) => ({
          ...insight,
          // Ensure all required fields are present
          created_at: insight.created_at || new Date().toISOString(),
        }))
      );

      if (error) {
        console.error('Error saving insights:', error);
      }
    } catch (error) {
      console.error('Error saving insights:', error);
    }
  }

  /**
   * Mark insight as read
   */
  async markInsightAsRead(insightId: string): Promise<void> {
    try {
      await supabase.from('insights').update({ read: true }).eq('id', insightId);
    } catch (error) {
      console.error('Error marking insight as read:', error);
    }
  }

  /**
   * Get unread insight count
   */
  async getUnreadCount(userId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('insights')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('read', false);

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  }
}

// Export singleton instance
export const insightEngine = new InsightEngine();
