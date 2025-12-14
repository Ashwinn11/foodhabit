import { getRecentEntries } from './entryService';
import { getMealEntries } from './entryService';
import { getRecentMoods } from './moodService';

export interface PatternInsight {
  type: 'food_symptom' | 'mood_symptom' | 'food_mood';
  description: string;
  confidence: number; // 0-1
  data: {
    firstItem: string;
    secondItem: string;
    frequency: number;
    percentage: number;
  };
}

/**
 * Find correlations between foods and symptoms in last 7 days
 */
const findFoodSymptomPatterns = async (userId: string): Promise<PatternInsight[]> => {
  const stoolEntries = await getRecentEntries(userId, 7);
  const meals = await getMealEntries(userId, 50);

  const patterns: Record<string, { count: number; symptomDays: number }> = {};

  for (const entry of stoolEntries) {
    const entryDate = new Date(entry.entry_time).toISOString().split('T')[0];
    const hasSymptoms = entry.symptoms && Object.values(entry.symptoms).some((s) => s === true);

    // Find meals from that day or previous day
    const relevantMeals = meals.filter((meal) => {
      const mealDate = new Date(meal.meal_time).toISOString().split('T')[0];
      return mealDate === entryDate || mealDate === new Date(new Date(entryDate).getTime() - 86400000).toISOString().split('T')[0];
    });

    for (const meal of relevantMeals) {
      const foods = meal.foods || [];
      for (const food of foods) {
        if (!patterns[food]) {
          patterns[food] = { count: 0, symptomDays: 0 };
        }
        patterns[food].count++;
        if (hasSymptoms) {
          patterns[food].symptomDays++;
        }
      }
    }
  }

  // Generate insights from patterns
  const insights: PatternInsight[] = [];

  for (const [food, data] of Object.entries(patterns)) {
    const percentage = Math.round((data.symptomDays / Math.max(data.count, 1)) * 100);
    if (data.count >= 2 && percentage >= 60) {
      // Confident pattern
      insights.push({
        type: 'food_symptom',
        description: `${food.charAt(0).toUpperCase() + food.slice(1)} appears in ${data.symptomDays}/${data.count} symptom days (${percentage}%)`,
        confidence: Math.min(percentage / 100, 1),
        data: {
          firstItem: food,
          secondItem: 'symptoms',
          frequency: data.symptomDays,
          percentage,
        },
      });
    }
  }

  return insights.sort((a, b) => b.confidence - a.confidence).slice(0, 3); // Top 3
};

/**
 * Find correlations between moods and symptoms
 */
const findMoodSymptomPatterns = async (userId: string): Promise<PatternInsight[]> => {
  const stoolEntries = await getRecentEntries(userId, 7);
  const moods = await getRecentMoods(userId, 7);

  const moodSymptomMap: Record<string, { count: number; symptomDays: number }> = {};

  for (const entry of stoolEntries) {
    const entryDate = new Date(entry.entry_time).toISOString().split('T')[0];
    const hasSymptoms = entry.symptoms && Object.values(entry.symptoms).some((s) => s === true);

    const dayMood = moods.find((m) => m.entry_date === entryDate);
    if (dayMood) {
      if (!moodSymptomMap[dayMood.mood_type]) {
        moodSymptomMap[dayMood.mood_type] = { count: 0, symptomDays: 0 };
      }
      moodSymptomMap[dayMood.mood_type].count++;
      if (hasSymptoms) {
        moodSymptomMap[dayMood.mood_type].symptomDays++;
      }
    }
  }

  const insights: PatternInsight[] = [];

  for (const [mood, data] of Object.entries(moodSymptomMap)) {
    const percentage = Math.round((data.count - data.symptomDays) / Math.max(data.count, 1) * 100);
    if (data.count >= 2 && percentage >= 60) {
      // Days without symptoms when in this mood
      insights.push({
        type: 'mood_symptom',
        description: `You felt great on ${percentage}% of ${mood} days`,
        confidence: Math.min(percentage / 100, 1),
        data: {
          firstItem: mood,
          secondItem: 'wellbeing',
          frequency: data.count - data.symptomDays,
          percentage,
        },
      });
    }
  }

  return insights.sort((a, b) => b.confidence - a.confidence).slice(0, 3);
};

/**
 * Get top insights for dashboard display
 */
export const getTopInsights = async (userId: string): Promise<PatternInsight[]> => {
  const [foodPatterns, moodPatterns] = await Promise.all([
    findFoodSymptomPatterns(userId),
    findMoodSymptomPatterns(userId),
  ]);

  // Combine and sort by confidence
  const allInsights = [...foodPatterns, ...moodPatterns].sort((a, b) => b.confidence - a.confidence);

  return allInsights.slice(0, 3); // Return top 3 insights
};

/**
 * Get all patterns for detailed analysis
 */
export const getAllPatterns = async (userId: string): Promise<{
  foodSymptoms: PatternInsight[];
  moodSymptoms: PatternInsight[];
}> => {
  const [foodSymptoms, moodSymptoms] = await Promise.all([
    findFoodSymptomPatterns(userId),
    findMoodSymptomPatterns(userId),
  ]);

  return { foodSymptoms, moodSymptoms };
};

export const patternService = {
  getTopInsights,
  getAllPatterns,
};
