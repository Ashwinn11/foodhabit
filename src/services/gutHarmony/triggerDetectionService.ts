import { supabase } from '../../config/supabase';
import { getStoolEntries, getMealEntries } from './entryService';

export interface FoodTrigger {
  id: string;
  user_id: string;
  food_name: string;
  total_logged: number;
  had_symptoms: number;
  confidence: number; // 0-1
  likely_symptoms: string[];
  last_updated: string;
}

/**
 * Get foods eaten around a stool entry (6-hour window before entry)
 */
const getFoodsBeforeStool = (
  mealEntries: any[],
  stoolEntryTime: Date
): string[] => {
  const sixHoursBefore = new Date(stoolEntryTime.getTime() - 6 * 60 * 60 * 1000);

  const relevantMeals = mealEntries.filter((meal) => {
    const mealTime = new Date(meal.meal_time);
    return mealTime >= sixHoursBefore && mealTime <= stoolEntryTime;
  });

  const foods: string[] = [];
  relevantMeals.forEach((meal) => {
    if (Array.isArray(meal.foods)) {
      foods.push(...meal.foods);
    }
  });

  return foods;
};

/**
 * Categorize stool entries as "bad" (has symptoms or loose) or "good"
 */
const categorizeStool = (entry: any): 'bad' | 'good' => {
  const hasSymptoms = entry.symptoms && Object.values(entry.symptoms).some((v) => v);
  const isLoose = entry.stool_type >= 5; // Type 5-7 are loose/liquid
  const isBad = entry.stool_type <= 2 || isLoose || hasSymptoms;

  return isBad ? 'bad' : 'good';
};

/**
 * Get dominant symptom from bad stool entries
 */
// Helper to get dominant symptom (unused for now)
/*
const getDominantSymptom = (badEntries: any[]): string => {
  const symptomCounts: Record<string, number> = {};

  badEntries.forEach((entry) => {
    if (entry.symptoms) {
      Object.entries(entry.symptoms).forEach(([symptom, present]) => {
        if (present) {
          symptomCounts[symptom] = (symptomCounts[symptom] || 0) + 1;
        }
      });
    }
  });

  let dominant = 'bloating';
  let maxCount = 0;

  Object.entries(symptomCounts).forEach(([symptom, count]) => {
    if (count > maxCount) {
      maxCount = count;
      dominant = symptom;
    }
  });

  return dominant;
};
*/

/**
 * Analyze food triggers based on user's entries
 * Returns list of detected triggers with confidence scores
 */
export const analyzeTriggers = async (userId: string): Promise<FoodTrigger[]> => {
  try {
    // Get all stool and meal entries
    const stoolEntries = await getStoolEntries(userId);
    const mealEntries = await getMealEntries(userId);

    if (stoolEntries.length < 3) {
      return []; // Need at least 3 entries for meaningful analysis
    }

    // Separate bad and good stools
    const badStools = stoolEntries.filter((entry) => categorizeStool(entry) === 'bad');
    const goodStools = stoolEntries.filter((entry) => categorizeStool(entry) === 'good');

    // Get foods associated with each
    const badFoods: string[] = [];
    const goodFoods: string[] = [];

    badStools.forEach((stool) => {
      const foods = getFoodsBeforeStool(mealEntries, new Date(stool.entry_time));
      badFoods.push(...foods);
    });

    goodStools.forEach((stool) => {
      const foods = getFoodsBeforeStool(mealEntries, new Date(stool.entry_time));
      goodFoods.push(...foods);
    });

    // Calculate correlations
    const correlations: Record<string, FoodTrigger> = {};
    const allFoods = new Set([...badFoods, ...goodFoods]);

    allFoods.forEach((food) => {
      const badCount = badFoods.filter((f) => f.toLowerCase() === food.toLowerCase()).length;
      const goodCount = goodFoods.filter((f) => f.toLowerCase() === food.toLowerCase()).length;
      const totalCount = badCount + goodCount;

      // Only include foods that appear at least twice
      if (totalCount >= 2) {
        const confidence = badCount / totalCount;

        // Get dominant symptom for bad entries
        const likelySymptomsSet = new Set<string>();
        badStools.forEach((stool) => {
          const foods = getFoodsBeforeStool(mealEntries, new Date(stool.entry_time));
          if (foods.some((f) => f.toLowerCase() === food.toLowerCase())) {
            if (stool.symptoms) {
              Object.entries(stool.symptoms).forEach(([symptom, present]) => {
                if (present) {
                  likelySymptomsSet.add(symptom);
                }
              });
            }
          }
        });

        correlations[food.toLowerCase()] = {
          id: '', // Will be set by DB
          user_id: userId,
          food_name: food,
          total_logged: totalCount,
          had_symptoms: badCount,
          confidence,
          likely_symptoms: Array.from(likelySymptomsSet),
          last_updated: new Date().toISOString(),
        };
      }
    });

    // Save correlations to database
    const triggers: FoodTrigger[] = [];
    for (const [, trigger] of Object.entries(correlations)) {
      const { data } = await supabase
        .from('food_triggers')
        .upsert({
          user_id: userId,
          food_name: trigger.food_name,
          total_logged: trigger.total_logged,
          had_symptoms: trigger.had_symptoms,
          confidence: trigger.confidence,
          likely_symptoms: trigger.likely_symptoms,
          last_updated: new Date().toISOString(),
        })
        .select()
        .single();

      if (data) {
        triggers.push(data as FoodTrigger);
      }
    }

    // Sort by confidence (highest first)
    return triggers.sort((a, b) => b.confidence - a.confidence);
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
export const getTopTriggers = async (userId: string, limit = 3): Promise<FoodTrigger[]> => {
  const triggers = await getUserTriggers(userId);
  return triggers.slice(0, limit);
};
