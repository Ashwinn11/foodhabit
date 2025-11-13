/**
 * Insight Types
 * Data models for the Insights tab feature
 * Follows Whoop's philosophy of actionable, personalized insights
 */

/**
 * Insight Categories
 */
export type InsightType = 'correlation' | 'milestone' | 'pattern' | 'educational';

/**
 * Insight Priority/Impact Level
 */
export type InsightPriority = 'high' | 'medium' | 'low';

/**
 * Base Insight Interface
 * All insight types extend this base
 */
export interface BaseInsight {
  id: string;
  user_id: string;
  type: InsightType;
  priority: InsightPriority;
  title: string;
  subtitle: string;
  description: string;
  created_at: string;
  read: boolean;
  actionable: boolean;
  action_label?: string;
  action_type?: 'log_meal' | 'join_challenge' | 'view_trend' | 'learn_more';
  action_data?: Record<string, unknown>;
}

/**
 * Correlation Insight
 * Shows relationship between behaviors and health metrics
 * Example: "Your gut health improved 12 points when you ate fermented foods"
 */
export interface CorrelationInsight extends BaseInsight {
  type: 'correlation';
  behavior: string; // e.g., "fermented_foods", "eating_window", "fiber_intake"
  metric: string; // e.g., "gut_health_score", "body_age", "nutrition_score"
  correlation_strength: number; // -1 to 1 (0.7+ is strong)
  behavior_days: number; // days with the behavior
  metric_improvement: number; // change in metric (positive or negative)
  timeframe_days: number; // analysis period (7, 14, 30 days)
  chart_data?: {
    labels: string[];
    with_behavior: number[];
    without_behavior: number[];
  };
}

/**
 * Milestone Insight
 * Celebrates achievements and progress
 * Example: "7-Day Streak!", "100 Meals Logged"
 */
export interface MilestoneInsight extends BaseInsight {
  type: 'milestone';
  milestone_type: 'streak' | 'meal_count' | 'body_age' | 'score_improvement' | 'days_tracked';
  milestone_value: number; // e.g., 7 (days), 100 (meals), -5 (body age change)
  milestone_threshold: number; // threshold that was crossed
  previous_best?: number; // for personal records
  is_personal_record: boolean;
  encouragement_message: string;
  badge_unlocked?: {
    id: string;
    name: string;
    icon: string;
    rarity: 'common' | 'rare' | 'legendary';
  };
}

/**
 * Pattern Insight
 * Identifies eating patterns and habits
 * Example: "You eat better meals on Sundays"
 */
export interface PatternInsight extends BaseInsight {
  type: 'pattern';
  pattern_type: 'weekday' | 'meal_timing' | 'food_frequency' | 'eating_window';
  pattern_description: string; // detailed pattern explanation
  frequency: string; // e.g., "Sundays", "Before 6 PM", "Every 3 days"
  metric_impact: {
    metric: string; // affected metric
    average_with_pattern: number;
    average_without_pattern: number;
    improvement_percentage: number;
  };
  chart_data?: {
    labels: string[];
    values: number[];
    highlight_indices: number[]; // indices of labels that match pattern
  };
  recommendation: string;
}

/**
 * Educational Insight
 * Provides health tips and knowledge
 * Example: "Did you know? Fiber before carbs reduces blood sugar spikes"
 */
export interface EducationalInsight extends BaseInsight {
  type: 'educational';
  category: 'nutrition' | 'gut_health' | 'metabolism' | 'meal_timing' | 'general';
  fact: string; // the educational fact
  explanation: string; // detailed explanation
  sources?: string[]; // scientific sources (optional)
  relevance_score: number; // 0-100, how relevant to user's current data
  try_it_suggestion?: string; // actionable suggestion
  related_challenge_id?: string; // link to relevant challenge
}

/**
 * Union type for all insight types
 */
export type Insight = CorrelationInsight | MilestoneInsight | PatternInsight | EducationalInsight;

/**
 * Insight Filter Options
 */
export type InsightFilter = 'all' | 'correlation' | 'milestone' | 'pattern' | 'educational';

/**
 * Insight Generation Config
 */
export interface InsightConfig {
  min_days_for_correlation: number; // minimum days needed (default: 7)
  min_correlation_strength: number; // minimum correlation (default: 0.5)
  max_insights_per_day: number; // rate limit (default: 3)
  educational_frequency_days: number; // how often to show tips (default: 3)
  priority_weights: {
    correlation: number;
    milestone: number;
    pattern: number;
    educational: number;
  };
}

/**
 * Insight Generation Result
 */
export interface InsightGenerationResult {
  insights: Insight[];
  generated_at: string;
  user_id: string;
  data_quality_score: number; // 0-100, based on data completeness
  recommendations: string[];
}

/**
 * User Insight Stats
 */
export interface InsightStats {
  total_insights: number;
  unread_insights: number;
  insights_by_type: {
    correlation: number;
    milestone: number;
    pattern: number;
    educational: number;
  };
  last_generated: string;
  next_generation: string;
}
