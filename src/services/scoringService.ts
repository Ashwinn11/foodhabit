/**
 * Simplified Scoring Service - Types only
 * AI calculates gut scores, we just store the types
 */

/**
 * Simplified food interface - AI provides the data we display
 */
export interface IdentifiedFood {
    name: string;
    confidence?: number;
    category?: string;
    // AI-calculated score
    gut_score?: number;
    // Display data
    gut_benefits?: string[];
    gut_warnings?: string[];
    // Nutrition
    estimated_calories?: number;
    protein_grams?: number;
    carbs_grams?: number;
    fat_grams?: number;
    fiber_grams?: number;
}

/**
 * Score breakdown structure (simplified for database storage)
 * All zeros now since AI handles scoring
 */
export interface ScoreBreakdown {
    fiber: number;
    plants: number;
    wholeFoods?: number;
    prebiotics?: number;
    probiotics?: number;
    antiInflammatory?: number;
    goodVerdict?: number;
    triggers: number;
    processed: number;
    warnings: number;
}
