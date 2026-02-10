/**
 * IFODMAPService
 * Port for FODMAP analysis
 */

export type FODMAPLevel = 'low' | 'moderate' | 'high';
export type FODMAPCategory = 'fructose' | 'lactose' | 'fructans' | 'galactans' | 'polyols';

export interface FODMAPInfo {
    level: FODMAPLevel;
    categories: FODMAPCategory[];
}

export interface FODMAPAnalysis {
    highFODMAPs: Array<{ food: string; categories: FODMAPCategory[]; level: FODMAPLevel }>;
    moderateFODMAPs: Array<{ food: string; categories: FODMAPCategory[]; level: FODMAPLevel }>;
    lowFODMAPs: string[];
    unknownFoods: string[];
    totalFODMAPLoad: number;
    categoryBreakdown: Record<FODMAPCategory, number>;
}

export interface FODMAPStackingResult {
    hasStacking: boolean;
    stackedCategories: FODMAPCategory[];
    riskLevel: 'low' | 'moderate' | 'high';
    explanation: string;
}

export interface FODMAPLatency {
    minHours: number;
    maxHours: number;
    peakHours: number;
}

export interface AIFODMAPResult extends FODMAPInfo {
    alternatives?: string[];
    normalizedName?: string;
    baseIngredients?: string[];
}

export interface IFODMAPService {
    /**
     * Analyze food with AI (remote)
     */
    analyzeFoodWithAI(food: string): Promise<AIFODMAPResult | null>;

    /**
     * Analyze a list of foods
     */
    analyzeFODMAPs(foods: string[]): Promise<FODMAPAnalysis>;

    /**
     * Check for FODMAP stacking in a meal
     */
    checkFODMAPStacking(foods: string[]): Promise<FODMAPStackingResult>;

    /**
     * Get low-FODMAP alternatives for a food
     */
    getLowFODMAPAlternatives(food: string): string[];

    /**
     * Get symptom latency for a FODMAP category
     */
    getFODMAPLatency(category: FODMAPCategory): FODMAPLatency;
}
