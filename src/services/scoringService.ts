/**
 * Gut Health Scoring Service - Medically Accurate Version
 * Based on 2025 medical research on gut microbiome health
 * 
 * Key research sources:
 * - 13th Gut Microbiota for Health World Summit (March 2025)
 * - Japanese study on dietary fiber supplementation (Microorganisms, 2025)
 * - 2025 CKD study: 30+ plant foods/week improves gut microbiome
 * - American Gut Project findings on plant diversity
 * 
 * Key factors from research:
 * 1. Fiber - Most critical (feeds beneficial bacteria, produces SCFAs)
 * 2. Plant diversity - 30+ different plants per week is optimal
 * 3. Ultra-processed foods - Harm gut microbiome, increase inflammation
 * 4. Fermented foods - Provide probiotics
 * 5. Anti-inflammatory foods - Reduce gut inflammation
 * 6. Glycemic impact - High GI foods can feed harmful bacteria
 * 7. Saturated fats - Can damage gut barrier
 */

export interface IdentifiedFood {
    name: string;
    confidence?: number;
    category?: string;
    fiber_score?: number; // 0-10 from Gemini
    trigger_risk?: number;
    is_plant?: boolean;
    common_triggers?: string[];
    gut_benefits?: string[];
    gut_warnings?: string[];
    prebiotic_score?: number; // 0-10 from Gemini
    probiotic_score?: number; // 0-10 from Gemini
    anti_inflammatory?: boolean;
    fermentable?: boolean;
    processing_level?: 'whole' | 'minimally_processed' | 'processed' | 'ultra_processed';
    gut_health_verdict?: 'good' | 'neutral' | 'bad';
}

export interface ScoreBreakdown {
    fiber: number;
    plants: number;
    wholeFoods?: number; // NEW
    prebiotics?: number;
    probiotics?: number;
    antiInflammatory?: number; // NEW
    goodVerdict?: number; // NEW
    triggers: number;
    processed: number;
    warnings: number;
}

export interface FoodImpact {
    food: string;
    confidence: number;
    impact: 'positive' | 'neutral' | 'warning';
    benefits: string[];
    warnings: string[];
    personalizedWarning?: string;
}

export interface GutHealthScore {
    score: number;
    breakdown: ScoreBreakdown;
    emotion: 'happy' | 'neutral' | 'sad';
    message: string;
    foodImpacts: FoodImpact[];
    tips?: string[];
}

/**
 * Calculate gut health score based on identified foods
 * Uses medically-backed criteria for accuracy
 */
export function calculateGutHealthScore(
    foods: IdentifiedFood[],
    userTriggers: string[] = []
): GutHealthScore {
    const foodImpacts: FoodImpact[] = [];
    const tips: string[] = [];

    // === ANALYZE EACH FOOD FOR UI DISPLAY ===
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

        // Determine impact level based on verdict
        let impact: 'positive' | 'neutral' | 'warning' = 'neutral';
        if (food.gut_health_verdict === 'good' && warnings.length === 0) {
            impact = 'positive';
        } else if (food.gut_health_verdict === 'bad' || warnings.length > 0 || matchingTriggers.length > 0) {
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

    // === SCORING ALGORITHM (Medically Accurate) ===

    // Start with a neutral baseline for real food
    const BASE_SCORE = 20;

    // 1. WHOLE FOOD BONUS (+0 to +20 points)
    // Reward unprocessed/minimally processed foods (Chicken, Eggs, Rice are good!)
    const wholeFoodsCount = foods.filter(f =>
        !f.processing_level ||
        f.processing_level === 'whole' ||
        f.processing_level === 'minimally_processed'
    ).length;
    const wholeFoodBonus = Math.min(wholeFoodsCount * 5, 20);

    // 2. FIBER SCORE (+0 to +20 points)
    // Research: Fiber is the most important factor for gut health
    // Produces short-chain fatty acids (SCFAs) that reduce inflammation
    const totalFiber = foods.reduce((sum, f) => sum + (f.fiber_score || 0), 0);
    const avgFiber = foods.length > 0 ? totalFiber / foods.length : 0;
    const fiberBonus = Math.min(Math.round(avgFiber * 2.5), 20);

    // 3. PLANT DIVERSITY (+0 to +15 points)
    // Research: American Gut Project shows 30+ plants/week is optimal
    // Each unique plant type contributes to microbiome diversity
    const uniquePlants = new Set(
        foods.filter(f => f.is_plant === true).map(f => f.name.toLowerCase())
    ).size;
    const plantBonus = Math.min(uniquePlants * 5, 15);

    // 4. PREBIOTIC FOODS (+0 to +15 points)
    // Research: Prebiotics specifically feed beneficial bacteria
    const totalPrebiotic = foods.reduce((sum, f) => sum + (f.prebiotic_score || 0), 0);
    const avgPrebiotic = foods.length > 0 ? totalPrebiotic / foods.length : 0;
    const prebioticBonus = Math.min(Math.round(avgPrebiotic * 1.5), 15);

    // 4. PROBIOTIC FOODS (+0 to +10 points)
    // Research: Fermented foods provide live beneficial bacteria
    const totalProbiotic = foods.reduce((sum, f) => sum + (f.probiotic_score || 0), 0);
    const avgProbiotic = foods.length > 0 ? totalProbiotic / foods.length : 0;
    const probioticBonus = Math.min(Math.round(avgProbiotic * 1.5), 10);

    // 5. ANTI-INFLAMMATORY FOODS (+0 to +15 points)
    // Research: Inflammation damages gut barrier and microbiome
    const antiInflammatoryCount = foods.filter(f => f.anti_inflammatory === true).length;
    const antiInflammatoryBonus = antiInflammatoryCount > 0
        ? Math.min(Math.round((antiInflammatoryCount / foods.length) * 15), 15)
        : 0;

    // 6. "GOOD" VERDICT FOODS (+0 to +20 points)
    // Uses Gemini's medical knowledge for overall assessment
    const goodFoods = foods.filter(f => f.gut_health_verdict === 'good').length;
    const goodFoodBonus = foods.length > 0
        ? Math.round((goodFoods / foods.length) * 20)
        : 0;

    // === PENALTIES ===

    // 7. PROCESSED FOOD PENALTY (-0 to -25 points)
    let processedPenalty = 0;
    foods.forEach(food => {
        if (food.processing_level === 'ultra_processed') {
            processedPenalty += 12;
        } else if (food.processing_level === 'processed') {
            processedPenalty += 6;
        } else if (food.processing_level === 'minimally_processed') {
            processedPenalty += 2;
        }
    });
    processedPenalty = Math.min(processedPenalty, 25);

    // 8. GUT WARNINGS PENALTY (-0 to -15 points)
    // Medical Correction: Only penalize "universal" negatives (high sugar, inflammitory oils).
    // Do NOT penalize specific sensitivities (FODMAP, Nightshades) unless they match user triggers.
    const universalNegatives = ['sugar', 'syrup', 'fried', 'hydrogenated', 'artificial', 'color', 'preservative', 'alcohol', 'nitrate'];

    let warningPenalty = 0;
    foods.forEach(food => {
        const warnings = food.gut_warnings || [];
        // Only count warnings that contain universal negative keywords
        const seriousWarnings = warnings.filter(w =>
            universalNegatives.some(neg => w.toLowerCase().includes(neg)) ||
            w.toLowerCase().includes('inflammatory') ||
            w.toLowerCase().includes('blood sugar')
        );
        warningPenalty += seriousWarnings.length * 3;
    });
    warningPenalty = Math.min(warningPenalty, 15);

    // 9. TRIGGER PENALTY (-0 to -20 points)
    // This is where we strictly penalize FODMAPs/Nightshades IF they match the user
    let triggerPenalty = 0;
    if (userTriggers.length > 0) {
        foods.forEach(food => {
            const foodTriggers = food.common_triggers || [];
            // Also check warnings for trigger keywords (e.g. "High FODMAP")
            const allFoodRisks = [...foodTriggers, ...(food.gut_warnings || [])].map(t => t.toLowerCase());

            const matches = userTriggers.filter(ut =>
                allFoodRisks.some(risk => risk.includes(ut.toLowerCase()))
            );
            triggerPenalty += matches.length * 8; // Heavy penalty for personal triggers
        });
    }
    triggerPenalty = Math.min(triggerPenalty, 20);

    // 10. "BAD" VERDICT PENALTY (-0 to -15 points)
    const badFoods = foods.filter(f => f.gut_health_verdict === 'bad').length;
    const badFoodPenalty = foods.length > 0
        ? Math.round((badFoods / foods.length) * 15)
        : 0;

    // === CALCULATE FINAL SCORE ===
    const totalBonuses = BASE_SCORE + wholeFoodBonus + fiberBonus + plantBonus + prebioticBonus + probioticBonus +
        antiInflammatoryBonus + goodFoodBonus;
    const totalPenalties = processedPenalty + warningPenalty + triggerPenalty + badFoodPenalty;

    // Final score: bonuses - penalties, scaled to 0-100
    const rawScore = totalBonuses - totalPenalties;
    // Scale: max bonuses ≈ 100, so this naturally fits 0-100
    const finalScore = Math.max(0, Math.min(100, rawScore));

    // === GENERATE TIPS ===
    if (avgFiber < 5) {
        tips.push("💡 Feed me more fiber! I love veggies, beans, and whole grains.");
    }
    if (uniquePlants < 3) {
        tips.push("🌱 I love variety! Can we add more different plants to my next meal?");
    }
    if (processedPenalty > 10) {
        tips.push("⚠️ Oof, these processed foods are a bit hard on my tummy.");
    }
    if (avgProbiotic > 0) {
        tips.push("🦠 Yay! Fermented foods make my good bacteria very happy!");
    }
    if (triggerPenalty > 0) {
        tips.push("⚠️ Ouch! This meal has something that really bothers me.");
    }

    // === DETERMINE EMOTION & MESSAGE ===
    let emotion: 'happy' | 'neutral' | 'sad';
    let message: string;

    if (finalScore >= 80) {
        emotion = 'happy';
        message = "Yay! This makes me feel amazing! Thank you for the yummy fuel! 🌟";
    } else if (finalScore >= 60) {
        emotion = 'happy';
        message = "Mmm! This is good stuff. I'm feeling happy and healthy! ✨";
    } else if (finalScore >= 40) {
        emotion = 'neutral';
        message = "It's okay, but I'd love more plants or fiber to really wiggle! 😶";
    } else if (finalScore >= 20) {
        emotion = 'sad';
        message = "Oof, this is a bit tough for me to handle. Can we add something fresh? 🤒";
    } else {
        emotion = 'sad';
        message = "Ouch! My tummy really doesn't like this. Please be gentle with me! 😢";
    }

    return {
        score: Math.round(finalScore),
        breakdown: {
            wholeFoods: wholeFoodBonus, // NEW
            fiber: fiberBonus,
            plants: plantBonus,
            prebiotics: prebioticBonus,
            probiotics: probioticBonus,
            antiInflammatory: antiInflammatoryBonus, // NEW
            goodVerdict: goodFoodBonus, // NEW
            triggers: -triggerPenalty,
            processed: -processedPenalty,
            warnings: -warningPenalty,
        },
        emotion,
        message,
        foodImpacts,
        tips
    };
}

/**
 * Get mock food data for testing
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
            gut_health_verdict: 'neutral',
            processing_level: 'minimally_processed',
        },
        {
            name: 'Brown Rice',
            category: 'grain',
            fiber_score: 6,
            trigger_risk: 1,
            is_plant: true,
            common_triggers: [],
            gut_health_verdict: 'good',
            processing_level: 'whole',
        },
        {
            name: 'Broccoli',
            category: 'vegetable',
            fiber_score: 9,
            trigger_risk: 3,
            is_plant: true,
            common_triggers: ['fodmap'],
            gut_health_verdict: 'good',
            processing_level: 'whole',
        },
    ];
}
