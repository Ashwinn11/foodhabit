import { FODMAP_FOODS, FODMAPCategory, FODMAPLevel, FODMAPTag } from '../types/fodmap';

/**
 * FODMAP Service - Analyzes foods for FODMAP content and provides insights
 */

/**
 * Get FODMAP information for a specific food
 */
export const getFODMAPInfo = (food: string): FODMAPTag | null => {
    const normalizedFood = food.toLowerCase().trim();

    // Direct match
    if (FODMAP_FOODS[normalizedFood]) {
        return FODMAP_FOODS[normalizedFood];
    }

    // Partial match - check if food contains any known FODMAP food
    for (const [key, value] of Object.entries(FODMAP_FOODS)) {
        if (normalizedFood.includes(key) || key.includes(normalizedFood)) {
            return value;
        }
    }

    return null;
};

/**
 * Analyze a list of foods and return FODMAP breakdown
 */
export const analyzeFODMAPs = (foods: string[]): {
    highFODMAPs: Array<{ food: string; categories: FODMAPCategory[]; level: FODMAPLevel }>;
    moderateFODMAPs: Array<{ food: string; categories: FODMAPCategory[]; level: FODMAPLevel }>;
    lowFODMAPs: string[];
    unknownFoods: string[];
    totalFODMAPLoad: number;
    categoryBreakdown: Record<FODMAPCategory, number>;
} => {
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

    foods.forEach(food => {
        const fodmapInfo = getFODMAPInfo(food);

        if (!fodmapInfo) {
            unknownFoods.push(food);
            return;
        }

        // Categorize by level
        if (fodmapInfo.level === 'high') {
            highFODMAPs.push({ food, categories: fodmapInfo.categories, level: fodmapInfo.level });
            totalFODMAPLoad += 3;
            fodmapInfo.categories.forEach(cat => categoryBreakdown[cat]++);
        } else if (fodmapInfo.level === 'moderate') {
            moderateFODMAPs.push({ food, categories: fodmapInfo.categories, level: fodmapInfo.level });
            totalFODMAPLoad += 1.5;
            fodmapInfo.categories.forEach(cat => categoryBreakdown[cat] += 0.5);
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
export const checkFODMAPStacking = (foods: string[]): {
    hasStacking: boolean;
    stackedCategories: FODMAPCategory[];
    riskLevel: 'low' | 'moderate' | 'high';
    explanation: string;
} => {
    const analysis = analyzeFODMAPs(foods);
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
        'wheat': ['Rice', 'Quinoa', 'Oats (gluten-free)', 'Corn tortillas'],
        'bread': ['Sourdough (spelt)', 'Gluten-free bread', 'Rice cakes'],
        'pasta': ['Rice noodles', 'Quinoa pasta', 'Gluten-free pasta'],
        'onion': ['Green onion tops', 'Chives', 'Garlic-infused oil'],
        'garlic': ['Garlic-infused oil', 'Asafoetida powder'],
        'milk': ['Lactose-free milk', 'Almond milk', 'Coconut milk'],
        'yogurt': ['Lactose-free yogurt', 'Coconut yogurt'],
        'apple': ['Banana', 'Blueberries', 'Strawberries', 'Orange'],
        'beans': ['Tofu', 'Tempeh', 'Canned lentils (rinsed)'],
        'mushroom': ['Zucchini', 'Eggplant', 'Bell peppers'],
        'cauliflower': ['Broccoli (small portions)', 'Green beans', 'Bok choy'],
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
