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
    // New gut health fields
    gut_benefits?: string[];
    gut_warnings?: string[];
    prebiotic_score?: number;
    probiotic_score?: number;
    anti_inflammatory?: boolean;
    fermentable?: boolean;
}

export interface ScoreBreakdown {
    fiber: number;
    plants: number;
    triggers: number;
    processed: number;
    prebiotics?: number;
    probiotics?: number;
}

export interface FoodImpact {
    food: string;
    confidence: number;
    impact: 'positive' | 'neutral' | 'warning';
    benefits: string[];
    warnings: string[];
    personalizedWarning?: string; // If matches user's triggers
}

export interface GutHealthScore {
    score: number;
    breakdown: ScoreBreakdown;
    emotion: 'happy' | 'neutral' | 'sad';
    message: string;
    foodImpacts: FoodImpact[]; // Detailed per-food analysis
    tips?: string[]; // Educational tips
}

/**
 * Calculate gut health score based on identified foods
 */
export function calculateGutHealthScore(
    foods: IdentifiedFood[],
    userTriggers: string[] = []
): GutHealthScore {
    let baseScore = 50; // Start neutral
    const foodImpacts: FoodImpact[] = [];
    const tips: string[] = [];

    // Analyze each food for gut health impact
    for (const food of foods) {
        const benefits: string[] = food.gut_benefits || [];
        const warnings: string[] = food.gut_warnings || [];
        const foodTriggers = food.common_triggers || [];

        // Check for personalized warnings
        const matchingTriggers = foodTriggers.filter(t =>
            userTriggers.some(ut => ut.toLowerCase() === t.toLowerCase())
        );

        let personalizedWarning: string | undefined;
        if (matchingTriggers.length > 0) {
            personalizedWarning = `⚠️ Contains ${matchingTriggers.join(', ')} - you marked this as a trigger`;
        }

        // Determine impact level
        let impact: 'positive' | 'neutral' | 'warning' = 'neutral';
        if (benefits.length > 0 && warnings.length === 0) {
            impact = 'positive';
        } else if (warnings.length > 0 || matchingTriggers.length > 0) {
            impact = 'warning';
        }

        foodImpacts.push({
            food: food.name,
            confidence: food.confidence || 0,
            impact,
            benefits,
            warnings,
            personalizedWarning
        });
    }

    // 1. Fiber bonus (+0 to +30)
    const fiberScore = foods.reduce((sum, food) => sum + (food.fiber_score || 0), 0);
    const fiberBonus = Math.min(fiberScore * 3, 30);

    // 2. Plant diversity bonus (+0 to +20)
    const uniquePlants = new Set(
        foods.filter(f => f.is_plant).map(f => f.name.toLowerCase())
    ).size;
    const plantBonus = Math.min(uniquePlants * 4, 20);

    // 3. Prebiotic bonus (+0 to +15) - NEW
    const prebioticScore = foods.reduce((sum, food) => sum + (food.prebiotic_score || 0), 0);
    const prebioticBonus = Math.min(prebioticScore * 1.5, 15);

    // 4. Probiotic bonus (+0 to +10) - NEW
    const probioticScore = foods.reduce((sum, food) => sum + (food.probiotic_score || 0), 0);
    const probioticBonus = Math.min(probioticScore * 1.5, 10);

    // 5. Anti-inflammatory bonus (+0 to +10) - NEW
    const antiInflammatoryCount = foods.filter(f => f.anti_inflammatory).length;
    const antiInflammatoryBonus = Math.min(antiInflammatoryCount * 5, 10);

    // 6. Trigger penalty (-0 to -40)
    const triggerPenalty = foods.reduce((sum, food) => {
        const foodTriggers = food.common_triggers || [];
        const matchingTriggers = foodTriggers.filter(t =>
            userTriggers.some(ut => ut.toLowerCase() === t.toLowerCase())
        );
        const triggerRisk = food.trigger_risk || 0;
        return sum + (matchingTriggers.length * triggerRisk * 2);
    }, 0);

    // 7. Processed food penalty (-0 to -20)
    const processedFoods = foods.filter(f => f.category === 'processed').length;
    const processedPenalty = processedFoods * 10;

    // Calculate final score
    const finalScore = Math.max(
        0,
        Math.min(100, baseScore + fiberBonus + plantBonus + prebioticBonus +
            probioticBonus + antiInflammatoryBonus - triggerPenalty - processedPenalty)
    );

    // Generate educational tips
    if (prebioticScore > 0) {
        tips.push("🌱 Prebiotics feed your beneficial gut bacteria!");
    }
    if (probioticScore > 0) {
        tips.push("🦠 Probiotics add beneficial bacteria to your gut!");
    }
    if (uniquePlants >= 3) {
        tips.push("🌈 Great plant diversity! Aim for 30+ different plants per week.");
    }
    if (triggerPenalty > 10) {
        tips.push("⚠️ This meal contains foods you've marked as triggers. Monitor how you feel.");
    }
    if (processedFoods > 0) {
        tips.push("💡 Processed foods may disrupt your gut microbiome. Choose whole foods when possible.");
    }

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
            prebiotics: Math.round(prebioticBonus),
            probiotics: Math.round(probioticBonus),
            triggers: -Math.round(triggerPenalty),
            processed: -Math.round(processedPenalty),
        },
        emotion,
        message,
        foodImpacts,
        tips
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
