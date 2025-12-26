/**
 * Gut Health Scoring Service
 * Calculates gut health score (0-100) based on food composition
 */

export interface IdentifiedFood {
    name: string;
    confidence?: number;
    category?: string;
    fiber_score?: number;
    trigger_risk?: number;
    is_plant?: boolean;
    common_triggers?: string[];
}

export interface ScoreBreakdown {
    fiber: number;
    plants: number;
    triggers: number;
    processed: number;
}

export interface GutHealthScore {
    score: number;
    breakdown: ScoreBreakdown;
    emotion: 'happy' | 'neutral' | 'sad';
    message: string;
}

/**
 * Calculate gut health score based on identified foods
 */
export function calculateGutHealthScore(
    foods: IdentifiedFood[],
    userTriggers: string[] = []
): GutHealthScore {
    let baseScore = 50; // Start neutral

    // 1. Fiber bonus (+0 to +30)
    const fiberScore = foods.reduce((sum, food) => sum + (food.fiber_score || 0), 0);
    const fiberBonus = Math.min(fiberScore * 3, 30);

    // 2. Plant diversity bonus (+0 to +20)
    const uniquePlants = new Set(
        foods.filter(f => f.is_plant).map(f => f.name.toLowerCase())
    ).size;
    const plantBonus = Math.min(uniquePlants * 4, 20);

    // 3. Trigger penalty (-0 to -40)
    const triggerPenalty = foods.reduce((sum, food) => {
        const foodTriggers = food.common_triggers || [];
        const matchingTriggers = foodTriggers.filter(t =>
            userTriggers.includes(t.toLowerCase())
        );
        const triggerRisk = food.trigger_risk || 0;
        return sum + (matchingTriggers.length * triggerRisk * 2);
    }, 0);

    // 4. Processed food penalty (-0 to -20)
    const processedFoods = foods.filter(f => f.category === 'processed').length;
    const processedPenalty = processedFoods * 10;

    // Calculate final score
    const finalScore = Math.max(
        0,
        Math.min(100, baseScore + fiberBonus + plantBonus - triggerPenalty - processedPenalty)
    );

    // Determine emotion and message
    let emotion: 'happy' | 'neutral' | 'sad';
    let message: string;

    if (finalScore >= 80) {
        emotion = 'happy';
        message = "YES! This is what I'm talking about! 🌟";
    } else if (finalScore >= 60) {
        emotion = 'neutral';
        message = "Not bad! I can work with this.";
    } else {
        emotion = 'sad';
        message = "Oof... this might hurt us later 😢";
    }

    return {
        score: Math.round(finalScore),
        breakdown: {
            fiber: Math.round(fiberBonus),
            plants: Math.round(plantBonus),
            triggers: -Math.round(triggerPenalty),
            processed: -Math.round(processedPenalty),
        },
        emotion,
        message,
    };
}

/**
 * Get mock food data for testing (will be replaced by AI)
 */
export function getMockFoodData(): IdentifiedFood[] {
    return [
        {
            name: 'Grilled Chicken',
            category: 'protein',
            fiber_score: 0,
            trigger_risk: 2,
            is_plant: false,
            common_triggers: [],
        },
        {
            name: 'Brown Rice',
            category: 'grain',
            fiber_score: 6,
            trigger_risk: 1,
            is_plant: true,
            common_triggers: [],
        },
        {
            name: 'Broccoli',
            category: 'vegetable',
            fiber_score: 9,
            trigger_risk: 3,
            is_plant: true,
            common_triggers: ['fodmap'],
        },
    ];
}
