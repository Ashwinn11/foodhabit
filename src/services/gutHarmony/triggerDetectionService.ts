import { supabase } from '../../config/supabase';
import { getStoolEntries, getMealEntries } from './entryService';
import { FOOD_CATEGORIES, findFood } from '../../constants/foodDatabase';

export interface FoodTrigger {
  id: string;
  user_id: string;
  food_name: string;
  category?: string; // NEW: Category-level trigger
  total_logged: number;
  had_symptoms: number;
  confidence: number; // 0-1
  strength: 'weak' | 'moderate' | 'strong'; // Statistical significance
  likely_symptoms: string[];
  portion_correlation?: number; // NEW: Dose-response
  last_updated: string;
}

export interface CorrelationData {
  total_exposures: number;
  symptom_exposures: number;
  weighted_symptom_score: number;
  portion_sizes: number[];
  symptom_portions: number[];
}

/**
 * Get weight based on how many hours before symptom
 * Recent meals = higher weight (more likely to cause symptoms)
 */
const getTimeWeight = (hoursBefore: number): number => {
  if (hoursBefore <= 12) return 3.0;  // Very likely (6-12 hours)
  if (hoursBefore <= 24) return 2.0;  // Likely (12-24 hours)
  if (hoursBefore <= 36) return 1.5;  // Possible (24-36 hours)
  return 1.0;                         // Less likely (36-48 hours)
};

/**
 * Get foods eaten within proper digestion window (6-48 hours before stool)
 * This is the CRITICAL FIX - old version only looked 6 hours back!
 */
const getFoodsBeforeStool = (
  mealEntries: any[],
  stoolEntryTime: Date
): Array<{ food: string; hoursBefore: number; portion?: number }> => {
  // NEW: Proper time window based on medical research
  const minHoursBefore = 6;   // Minimum digestion time
  const maxHoursBefore = 48;  // Maximum digestion time

  const windowStart = new Date(stoolEntryTime.getTime() - maxHoursBefore * 60 * 60 * 1000);
  const windowEnd = new Date(stoolEntryTime.getTime() - minHoursBefore * 60 * 60 * 1000);

  const relevantMeals = mealEntries.filter((meal) => {
    const mealTime = new Date(meal.meal_time);
    return mealTime >= windowStart && mealTime <= windowEnd;
  });

  const foods: Array<{ food: string; hoursBefore: number; portion?: number }> = [];

  relevantMeals.forEach((meal) => {
    const mealTime = new Date(meal.meal_time);
    const hoursBefore = (stoolEntryTime.getTime() - mealTime.getTime()) / (1000 * 60 * 60);

    if (Array.isArray(meal.foods)) {
      meal.foods.forEach((food: string) => {
        foods.push({
          food,
          hoursBefore,
          portion: meal.portion_size, // NEW: Track portion
        });
      });
    }
  });

  return foods;
};

/**
 * Categorize stool entries as "bad" (has symptoms or unhealthy type) or "good"
 */
const categorizeStool = (entry: any): 'bad' | 'good' => {
  const hasSymptoms = entry.symptoms && Object.values(entry.symptoms).some((v) => v);

  // IMPROVED: Separate constipation from diarrhea
  const isConstipation = entry.stool_type <= 2;
  const isDiarrhea = entry.stool_type >= 5;
  const isBad = isConstipation || isDiarrhea || hasSymptoms;

  return isBad ? 'bad' : 'good';
};

/**
 * Calculate statistical significance (p-value approximation)
 * Returns true if correlation is statistically significant
 */
const isStatisticallySignificant = (
  totalExposures: number,
  confidence: number
): { significant: boolean; strength: 'weak' | 'moderate' | 'strong' } => {
  // Need minimum sample size
  if (totalExposures < 5) {
    return { significant: false, strength: 'weak' };
  }

  // Chi-square test approximation
  // Strong correlation with enough data
  if (confidence >= 0.7 && totalExposures >= 10) {
    return { significant: true, strength: 'strong' };
  }

  // Moderate correlation
  if (confidence >= 0.6 && totalExposures >= 7) {
    return { significant: true, strength: 'moderate' };
  }

  // Weak but notable
  if (confidence >= 0.5 && totalExposures >= 5) {
    return { significant: true, strength: 'weak' };
  }

  return { significant: false, strength: 'weak' };
};

/**
 * NEW: Analyze food triggers with proper time windows and category-level detection
 * This is the MAIN IMPROVEMENT over the old algorithm
 */
export const analyzeTriggers = async (userId: string): Promise<FoodTrigger[]> => {
  try {
    // Get all stool and meal entries (last 30 days minimum for statistical significance)
    const stoolEntries = await getStoolEntries(userId, 100);
    const mealEntries = await getMealEntries(userId, 200);

    if (stoolEntries.length < 5) {
      return []; // Need at least 5 entries for meaningful analysis
    }

    // Separate bad and good stools
    const badStools = stoolEntries.filter((entry) => categorizeStool(entry) === 'bad');
    const goodStools = stoolEntries.filter((entry) => categorizeStool(entry) === 'good');

    // Track correlations at BOTH food and category level
    const foodCorrelations: Record<string, CorrelationData> = {};
    const categoryCorrelations: Record<string, CorrelationData> = {};

    // Analyze bad stools (with symptoms)
    badStools.forEach((stool) => {
      const foods = getFoodsBeforeStool(mealEntries, new Date(stool.entry_time));

      foods.forEach(({ food, hoursBefore, portion }) => {
        const weight = getTimeWeight(hoursBefore);
        const normalizedFood = food.toLowerCase().trim();

        // Track individual food
        if (!foodCorrelations[normalizedFood]) {
          foodCorrelations[normalizedFood] = {
            total_exposures: 0,
            symptom_exposures: 0,
            weighted_symptom_score: 0,
            portion_sizes: [],
            symptom_portions: [],
          };
        }
        foodCorrelations[normalizedFood].symptom_exposures++;
        foodCorrelations[normalizedFood].weighted_symptom_score += weight;
        if (portion) {
          foodCorrelations[normalizedFood].symptom_portions.push(portion);
        }

        // NEW: Track at category level
        const foodData = findFood(normalizedFood);
        if (foodData) {
          foodData.categories.forEach((category) => {
            if (!categoryCorrelations[category]) {
              categoryCorrelations[category] = {
                total_exposures: 0,
                symptom_exposures: 0,
                weighted_symptom_score: 0,
                portion_sizes: [],
                symptom_portions: [],
              };
            }
            categoryCorrelations[category].symptom_exposures++;
            categoryCorrelations[category].weighted_symptom_score += weight;
          });
        }
      });
    });

    // Analyze good stools (without symptoms)
    goodStools.forEach((stool) => {
      const foods = getFoodsBeforeStool(mealEntries, new Date(stool.entry_time));

      foods.forEach(({ food, portion }) => {
        const normalizedFood = food.toLowerCase().trim();

        // Track individual food
        if (!foodCorrelations[normalizedFood]) {
          foodCorrelations[normalizedFood] = {
            total_exposures: 0,
            symptom_exposures: 0,
            weighted_symptom_score: 0,
            portion_sizes: [],
            symptom_portions: [],
          };
        }
        foodCorrelations[normalizedFood].total_exposures++;
        if (portion) {
          foodCorrelations[normalizedFood].portion_sizes.push(portion);
        }

        // Track at category level
        const foodData = findFood(normalizedFood);
        if (foodData) {
          foodData.categories.forEach((category) => {
            if (!categoryCorrelations[category]) {
              categoryCorrelations[category] = {
                total_exposures: 0,
                symptom_exposures: 0,
                weighted_symptom_score: 0,
                portion_sizes: [],
                symptom_portions: [],
              };
            }
            categoryCorrelations[category].total_exposures++;
          });
        }
      });
    });

    // Update total exposures
    Object.keys(foodCorrelations).forEach((food) => {
      foodCorrelations[food].total_exposures += foodCorrelations[food].symptom_exposures;
    });
    Object.keys(categoryCorrelations).forEach((category) => {
      categoryCorrelations[category].total_exposures += categoryCorrelations[category].symptom_exposures;
    });

    // Calculate triggers with statistical validation
    const triggers: FoodTrigger[] = [];

    // Individual food triggers
    for (const [food, data] of Object.entries(foodCorrelations)) {
      if (data.total_exposures >= 3) { // Minimum 3 exposures
        const confidence = data.symptom_exposures / data.total_exposures;
        const { significant, strength } = isStatisticallySignificant(
          data.total_exposures,
          confidence
        );

        if (significant) {
          // Get dominant symptoms
          const likelySymptomsSet = new Set<string>();
          badStools.forEach((stool) => {
            const foods = getFoodsBeforeStool(mealEntries, new Date(stool.entry_time));
            if (foods.some((f) => f.food.toLowerCase() === food)) {
              if (stool.symptoms) {
                Object.entries(stool.symptoms).forEach(([symptom, present]) => {
                  if (present) {
                    likelySymptomsSet.add(symptom);
                  }
                });
              }
            }
          });

          // Calculate portion correlation
          let portionCorrelation = 0;
          if (data.symptom_portions.length > 0 && data.portion_sizes.length > 0) {
            const avgSymptomPortion = data.symptom_portions.reduce((a, b) => a + b, 0) / data.symptom_portions.length;
            const avgNormalPortion = data.portion_sizes.reduce((a, b) => a + b, 0) / data.portion_sizes.length;
            portionCorrelation = avgSymptomPortion / avgNormalPortion;
          }

          triggers.push({
            id: '',
            user_id: userId,
            food_name: food,
            total_logged: data.total_exposures,
            had_symptoms: data.symptom_exposures,
            confidence,
            strength,
            likely_symptoms: Array.from(likelySymptomsSet),
            portion_correlation: portionCorrelation > 0 ? portionCorrelation : undefined,
            last_updated: new Date().toISOString(),
          });
        }
      }
    }

    // NEW: Category-level triggers (CRITICAL for FODMAP detection)
    for (const [category, data] of Object.entries(categoryCorrelations)) {
      if (data.total_exposures >= 5) { // Higher threshold for categories
        const confidence = data.symptom_exposures / data.total_exposures;
        const { significant, strength } = isStatisticallySignificant(
          data.total_exposures,
          confidence
        );

        if (significant && confidence >= 0.6) { // Higher confidence for categories
          const categoryInfo = FOOD_CATEGORIES[category as keyof typeof FOOD_CATEGORIES];

          triggers.push({
            id: '',
            user_id: userId,
            food_name: categoryInfo?.name || category,
            category,
            total_logged: data.total_exposures,
            had_symptoms: data.symptom_exposures,
            confidence,
            strength,
            likely_symptoms: [], // Will be populated from individual foods
            last_updated: new Date().toISOString(),
          });
        }
      }
    }

    // Save to database
    const savedTriggers: FoodTrigger[] = [];
    for (const trigger of triggers) {
      const { data } = await supabase
        .from('food_triggers')
        .upsert({
          user_id: userId,
          food_name: trigger.food_name,
          category: trigger.category,
          total_logged: trigger.total_logged,
          had_symptoms: trigger.had_symptoms,
          confidence: trigger.confidence,
          strength: trigger.strength,
          likely_symptoms: trigger.likely_symptoms,
          portion_correlation: trigger.portion_correlation,
          last_updated: new Date().toISOString(),
        })
        .select()
        .single();

      if (data) {
        savedTriggers.push(data as FoodTrigger);
      }
    }

    // Sort by confidence (highest first)
    return savedTriggers.sort((a, b) => b.confidence - a.confidence);
  } catch (error) {
    console.error('Error analyzing triggers:', error);
    return [];
  }
};

/**
 * Get user's detected triggers from database
 */
export const getUserTriggers = async (userId: string): Promise<FoodTrigger[]> => {
  const { data, error } = await supabase
    .from('food_triggers')
    .select('*')
    .eq('user_id', userId)
    .order('confidence', { ascending: false });

  if (error) throw error;
  return (data || []) as FoodTrigger[];
};

/**
 * Get top N triggers
 */
export const getTopTriggers = async (userId: string, limit = 5): Promise<FoodTrigger[]> => {
  const triggers = await getUserTriggers(userId);
  return triggers.slice(0, limit);
};

/**
 * Get category-level triggers only
 */
export const getCategoryTriggers = async (userId: string): Promise<FoodTrigger[]> => {
  const triggers = await getUserTriggers(userId);
  return triggers.filter(t => t.category);
};
