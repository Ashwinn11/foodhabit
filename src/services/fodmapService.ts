import { supabase } from '../config/supabase';
import { FODMAPCategory, FODMAPLevel } from '../types/fodmap';

/**
 * FODMAP Service - Analyzes foods for FODMAP content and provides insights
 * Uses AI-powered analysis exclusively - no local database
 */

/**
 * AI-Powered Analysis (Remote)
 * Always uses AI for analysis - no local DB fallback
 */
export const analyzeFoodWithAI = async (food: string): Promise<any | null> => {
    try {
        const { data, error } = await supabase.functions.invoke('analyze-food', {
            body: { food }
        });

        if (error || !data) {
            console.warn('AI Analysis failed:', error);
            return null;
        }

        // Check if AI returned "not_food" error (gibberish/non-food input)
        if (data.error === 'not_food') {
            console.log('AI rejected input as non-food:', food);
            return null;
        }

        // Return ONLY essential data we actually use in the UI
        const essentialResult = {
            level: data.level,
            categories: data.categories,
            culprits: data.culprits,
            normalizedName: data.normalizedName,
            // Nutrition data - all fields for display
            nutrition: {
                calories: data.nutrition?.calories || 0,
                protein: data.nutrition?.protein || 0,
                carbs: data.nutrition?.carbs || 0,
                fat: data.nutrition?.fat || 0,
                fiber: data.nutrition?.fiber || 0,
                sugar: data.nutrition?.sugar || 0,
                sodium: data.nutrition?.sodium || 0,
            },
            // Nutrition score from AI
            nutritionScore: data.nutritionScore || 5,
            // Single explanation - AI chooses most relevant (history or personalized)
            explanation: data.explanation,
        };

        console.log('--- AI ANALYSIS DEBUG ---');
        console.log('Food Input:', food);
        console.log('Essential Data:', JSON.stringify(essentialResult, null, 2));
        console.log('-------------------------');

        return essentialResult;
    } catch (e) {
        console.error('Edge Function Error:', e);
        return null;
    }
};

/**
 * Enhanced AI-Powered Analysis with Personalization
 * Includes user condition, personal triggers, and symptom patterns
 *
 * @param food - Food name to analyze
 * @param userCondition - User's IBS type (ibs-d, ibs-c, bloating, etc.)
 * @param personalTriggers - Foods that previously caused symptoms for this user
 * @param symptomPatterns - User's symptom co-occurrence patterns
 * @returns Enhanced food analysis with personalized explanation, nutrition, and risk assessment
 */
export const analyzeFoodWithPersonalization = async (
    food: string,
    userCondition?: string,
    personalTriggers?: Array<{ food: string; symptoms: string[]; count: number; latency: string }>,
    symptomPatterns?: Array<{ symptoms: string[]; frequency: number }>
): Promise<any | null> => {
    try {
        const { data, error } = await supabase.functions.invoke('analyze-food', {
            body: {
                food,
                userCondition: userCondition || undefined,
                personalTriggers: personalTriggers || undefined,
                symptomPatterns: symptomPatterns || undefined
            }
        });

        if (error || !data) {
            console.warn('Personalized AI Analysis failed:', error);
            return null;
        }

        // Check if AI returned "not_food" error
        if (data.error === 'not_food') {
            console.log('AI rejected input as non-food:', food);
            return null;
        }

        // Return ONLY essential data we actually use in the UI
        const essentialResult = {
            // FODMAP Analysis
            level: data.level || 'moderate',
            categories: data.categories || [],
            culprits: data.culprits || [],
            normalizedName: data.normalizedName || food.toLowerCase(),

            // Nutrition Data - all fields for display
            nutrition: {
                calories: data.nutrition?.calories || 0,
                protein: data.nutrition?.protein || 0,
                carbs: data.nutrition?.carbs || 0,
                fat: data.nutrition?.fat || 0,
                fiber: data.nutrition?.fiber || 0,
                sugar: data.nutrition?.sugar || 0,
                sodium: data.nutrition?.sodium || 0,
            },

            // Nutrition score from AI
            nutritionScore: data.nutritionScore || 5,

            // Single explanation - AI chooses most relevant (history or personalized)
            explanation: data.explanation || 'Analysis complete',
        };

        console.log('--- PERSONALIZED ANALYSIS DEBUG ---');
        console.log('Food Input:', food);
        console.log('User Condition:', userCondition);
        console.log('Essential Data:', JSON.stringify(essentialResult, null, 2));
        console.log('-----------------------------------');

        return essentialResult;
    } catch (e) {
        console.error('Edge Function Error:', e);
        return null;
    }
};

/**
 * Analyze a list of foods and return FODMAP breakdown (AI-powered)
 */
export const analyzeFODMAPs = async (foods: string[]): Promise<{
    highFODMAPs: Array<{ food: string; categories: FODMAPCategory[]; level: FODMAPLevel }>;
    moderateFODMAPs: Array<{ food: string; categories: FODMAPCategory[]; level: FODMAPLevel }>;
    lowFODMAPs: string[];
    unknownFoods: string[];
    totalFODMAPLoad: number;
    categoryBreakdown: Record<FODMAPCategory, number>;
}> => {
    const highFODMAPs: Array<{ food: string; categories: FODMAPCategory[]; level: FODMAPLevel }> = [];
    const moderateFODMAPs: Array<{ food: string; categories: FODMAPCategory[]; level: FODMAPLevel }> = [];
    const lowFODMAPs: string[] = [];
    const unknownFoods: string[] = [];
    const categoryBreakdown: Record<FODMAPCategory, number> = {
        'fructans': 0,
        'gos': 0,
        'lactose': 0,
        'excess-fructose': 0,
        'polyols': 0
    };

    let totalFODMAPLoad = 0;

    // Fetch all food analyses in parallel using Promise.all()
    const analysisResults = await Promise.all(foods.map(food => analyzeFoodWithAI(food)));

    foods.forEach((food, index) => {
        const fodmapInfo = analysisResults[index];

        if (!fodmapInfo) {
            unknownFoods.push(food);
            return;
        }

        // Categorize by level
        if (fodmapInfo.level === 'high') {
            highFODMAPs.push({ food, categories: fodmapInfo.categories, level: fodmapInfo.level });
            totalFODMAPLoad += 3;
            fodmapInfo.categories.forEach((cat: FODMAPCategory) => categoryBreakdown[cat]++);
        } else if (fodmapInfo.level === 'moderate') {
            moderateFODMAPs.push({ food, categories: fodmapInfo.categories, level: fodmapInfo.level });
            totalFODMAPLoad += 1.5;
            fodmapInfo.categories.forEach((cat: FODMAPCategory) => categoryBreakdown[cat] += 0.5);
        } else {
            lowFODMAPs.push(food);
        }
    });

    return {
        highFODMAPs,
        moderateFODMAPs,
        lowFODMAPs,
        unknownFoods,
        totalFODMAPLoad,
        categoryBreakdown
    };
};

/**
 * Check if a meal has FODMAP stacking (multiple high-FODMAP foods)
 */
export const checkFODMAPStacking = async (foods: string[]): Promise<{
    hasStacking: boolean;
    stackedCategories: FODMAPCategory[];
    riskLevel: 'low' | 'moderate' | 'high';
    explanation: string;
}> => {
    const analysis = await analyzeFODMAPs(foods);
    const stackedCategories: FODMAPCategory[] = [];

    // Check which categories have multiple foods
    Object.entries(analysis.categoryBreakdown).forEach(([category, count]) => {
        if (count >= 2) {
            stackedCategories.push(category as FODMAPCategory);
        }
    });

    const hasStacking = stackedCategories.length > 0 || analysis.highFODMAPs.length >= 3;

    let riskLevel: 'low' | 'moderate' | 'high' = 'low';
    let explanation = '';

    if (analysis.totalFODMAPLoad >= 9) {
        riskLevel = 'high';
        explanation = 'High FODMAP load detected. Multiple high-FODMAP foods may trigger symptoms.';
    } else if (analysis.totalFODMAPLoad >= 4.5 || stackedCategories.length >= 2) {
        riskLevel = 'moderate';
        explanation = 'Moderate FODMAP load. Watch for symptoms in the next 2-8 hours.';
    } else if (analysis.highFODMAPs.length > 0) {
        riskLevel = 'low';
        explanation = 'Some high-FODMAP foods present, but overall load is manageable.';
    } else {
        explanation = 'Low FODMAP meal. Should be well-tolerated.';
    }

    return {
        hasStacking,
        stackedCategories,
        riskLevel,
        explanation
    };
};

/**
 * Get low-FODMAP alternatives for a high-FODMAP food
 */
export const getLowFODMAPAlternatives = (food: string): string[] => {
    const normalizedFood = food.toLowerCase().trim();

    const alternatives: Record<string, string[]> = {
        // Grains & Carbs
        'wheat': ['Rice', 'Quinoa', 'Oats (gluten-free)', 'Sourdough (spelt)', 'Corn tortillas'],
        'bread': ['Sourdough (spelt)', 'Gluten-free bread', 'Rice cakes', 'Cornbread'],
        'pasta': ['Rice noodles', 'Quinoa pasta', 'Gluten-free pasta', 'Soba noodles (100% buckwheat)'],
        'pizza': ['Sourdough base', 'Gluten-free base', 'Polenta base'],
        'couscous': ['Quinoa', 'Rice', 'Millet'],

        // Vegetables
        'onion': ['Green onion tops', 'Chives', 'Garlic-infused oil', 'Asafoetida'],
        'garlic': ['Garlic-infused oil', 'Asafoetida powder', 'Chives'],
        'mushroom': ['Oyster mushrooms', 'Canned champignons', 'Zucchini', 'Eggplant'],
        'cauliflower': ['Broccoli heads (small amount)', 'Green beans', 'Bok choy'],
        'asparagus': ['Green beans', 'Bok choy', 'Spinach'],
        'artichoke': ['Green beans', 'Cucumber', 'Carrot'],

        // Dairy
        'milk': ['Lactose-free milk', 'Almond milk', 'Coconut milk', 'Rice milk'],
        'yogurt': ['Lactose-free yogurt', 'Coconut yogurt', 'Almond yogurt'],
        'cheese': ['Cheddar', 'Parmesan', 'Feta', 'Mozzarella', 'Swiss'],
        'cream': ['Lactose-free cream', 'Coconut cream'],
        'ice cream': ['Lactose-free ice cream', 'Sorbet', 'Gelato (fruit based)'],

        // Fruits
        'apple': ['Banana', 'Blueberries', 'Strawberries', 'Orange', 'Kiwi'],
        'pear': ['Orange', 'Mandarin', 'Pineapple', 'Grapes'],
        'mango': ['Papaya', 'Pineapple', 'Cantaloupe'],
        'watermelon': ['Cantaloupe', 'Honeydew melon', 'Pineapple'],
        'peach': ['Orange', 'Strawberry', 'Pineapple'],

        // Legumes
        'beans': ['Canned chickpeas (rinsed)', 'Canned lentils (rinsed)', 'Tofu', 'Tempeh'],
        'chickpeas': ['Canned chickpeas (rinsed)', 'Tofu'],
        'lentils': ['Canned lentils (rinsed)', 'Tempeh'],
        'hummus': ['Homemade hummus (no garlic)', 'Eggplant dip'],

        // Sweeteners
        'honey': ['Maple syrup', 'Rice malt syrup', 'Stevia'],
        'high fructose corn syrup': ['Maple syrup', 'Sugar', 'Stevia'],
        'agave': ['Maple syrup', 'Rice malt syrup'],

        // Nuts
        'cashews': ['Peanuts', 'Walnuts', 'Macadamia nuts', 'Pecans'],
        'pistachios': ['Peanuts', 'Walnuts', 'Pumpkin seeds', 'Sunflower seeds'],

        // Proteins
        'sausages': ['Plain meat', 'Eggs', 'Tofu', 'Fish'],
        'processed meat': ['Fresh meat', 'Chicken', 'Turkey'],
    };

    // Check for direct match or partial match
    for (const [key, alts] of Object.entries(alternatives)) {
        if (normalizedFood.includes(key) || key.includes(normalizedFood)) {
            return alts;
        }
    }

    return [];
};

/**
 * Calculate FODMAP symptom latency (time window for symptoms to appear)
 */
export const getFODMAPLatency = (category: FODMAPCategory): {
    minHours: number;
    maxHours: number;
    peakHours: number;
} => {
    const latencyMap: Record<FODMAPCategory, { minHours: number; maxHours: number; peakHours: number }> = {
        'fructans': { minHours: 2, maxHours: 8, peakHours: 4 },
        'gos': { minHours: 2, maxHours: 12, peakHours: 6 },
        'lactose': { minHours: 0.5, maxHours: 4, peakHours: 2 },
        'excess-fructose': { minHours: 1, maxHours: 6, peakHours: 3 },
        'polyols': { minHours: 1, maxHours: 8, peakHours: 4 },
    };

    return latencyMap[category];
};
