import { BloatingType, DebloatAction, DebloatSuggestion } from '../types/fodmap';
import { GutMoment, BristolType } from '../store/useGutStore';

/**
 * Debloating Service - Analyzes symptoms and provides personalized debloating recommendations
 */

/**
 * Identify the type of bloating based on symptoms and gut moments
 */
export const identifyBloatingType = (
    recentMoments: GutMoment[],
    currentSymptoms: { bloating: boolean; gas: boolean; cramping: boolean; nausea: boolean }
): BloatingType => {
    const signals: string[] = [];
    let gasScore = 0;
    let waterRetentionScore = 0;
    let constipationScore = 0;

    // Analyze current symptoms
    if (currentSymptoms.bloating) {
        signals.push('Bloating reported');
    }

    if (currentSymptoms.gas) {
        gasScore += 30;
        signals.push('Gas present');
    }

    if (currentSymptoms.cramping) {
        gasScore += 10;
        constipationScore += 10;
        signals.push('Cramping present');
    }

    if (currentSymptoms.nausea) {
        gasScore += 5;
        signals.push('Nausea present');
    }

    // Analyze recent gut moments (last 24 hours)
    const last24Hours = recentMoments.filter(m => {
        const hoursSince = (Date.now() - new Date(m.timestamp).getTime()) / (1000 * 60 * 60);
        return hoursSince <= 24;
    });

    if (last24Hours.length === 0) {
        constipationScore += 20;
        signals.push('No bowel movements in 24 hours');
    }

    // Check Bristol types
    const recentBristol = last24Hours
        .filter(m => m.bristolType)
        .map(m => m.bristolType as BristolType);

    if (recentBristol.some(b => b === 1 || b === 2)) {
        constipationScore += 30;
        signals.push('Hard stools (Bristol 1-2)');
    }

    if (recentBristol.some(b => b === 6 || b === 7)) {
        gasScore += 15;
        signals.push('Loose stools (Bristol 6-7)');
    }

    // Check for relief patterns
    const hasReliefAfterBM = last24Hours.some(m =>
        !Object.values(m.symptoms).some(v => v)
    );

    if (hasReliefAfterBM) {
        gasScore += 10;
        signals.push('Relief after bowel movement');
    }

    // Time-based patterns (evening bloating suggests water retention)
    const currentHour = new Date().getHours();
    if (currentHour >= 18 && currentSymptoms.bloating) {
        waterRetentionScore += 15;
        signals.push('Evening bloating');
    }

    // Determine bloating type based on scores
    const scores = [
        { type: 'gas' as const, score: gasScore },
        { type: 'water-retention' as const, score: waterRetentionScore },
        { type: 'constipation' as const, score: constipationScore }
    ];

    scores.sort((a, b) => b.score - a.score);

    const topType = scores[0];
    const confidence = Math.min(topType.score / 50, 1); // Normalize to 0-1

    return {
        type: topType.type,
        confidence,
        signals
    };
};

/**
 * Get immediate debloating actions based on bloating type
 */
export const getImmediateActions = (bloatingType: BloatingType['type']): DebloatAction[] => {
    const actions: Record<BloatingType['type'], DebloatAction[]> = {
        'gas': [
            {
                id: 'walk',
                title: 'Take a Gentle Walk',
                description: 'Walk for 5-10 minutes to help move gas through your system',
                category: 'immediate',
                timeframe: '5-10 minutes',
                icon: 'walk'
            },
            {
                id: 'breathing',
                title: 'Diaphragmatic Breathing',
                description: 'Inhale for 4 seconds, exhale for 6-8 seconds. Repeat 5 times.',
                category: 'immediate',
                timeframe: '2-3 minutes',
                icon: 'fitness'
            },
            {
                id: 'position',
                title: 'Knees-to-Chest Position',
                description: 'Lie on your left side and bring knees to chest for 5 minutes',
                category: 'immediate',
                timeframe: '5 minutes',
                icon: 'bed'
            },
            {
                id: 'warm-drink',
                title: 'Sip Warm Water',
                description: 'Drink warm (not hot) water slowly to aid digestion',
                category: 'immediate',
                timeframe: '10 minutes',
                icon: 'water'
            }
        ],
        'water-retention': [
            {
                id: 'hydrate',
                title: 'Drink More Water',
                description: 'Paradoxically, drinking water helps reduce water retention',
                category: 'immediate',
                timeframe: 'Throughout day',
                icon: 'water'
            },
            {
                id: 'reduce-salt',
                title: 'Avoid Salty Foods',
                description: 'Skip high-sodium foods for the rest of the day',
                category: 'dietary',
                timeframe: 'Next 24 hours',
                icon: 'close-circle'
            },
            {
                id: 'elevate',
                title: 'Elevate Your Legs',
                description: 'Lie down with legs elevated for 15 minutes',
                category: 'immediate',
                timeframe: '15 minutes',
                icon: 'bed'
            },
            {
                id: 'potassium',
                title: 'Eat Potassium-Rich Foods',
                description: 'Banana, spinach, or sweet potato can help balance fluids',
                category: 'dietary',
                timeframe: 'Next meal',
                icon: 'nutrition'
            }
        ],
        'constipation': [
            {
                id: 'warm-liquid',
                title: 'Warm Lemon Water',
                description: 'Drink a glass of warm water with lemon to stimulate digestion',
                category: 'immediate',
                timeframe: '5 minutes',
                icon: 'water'
            },
            {
                id: 'movement',
                title: 'Gentle Exercise',
                description: 'Light walking or yoga to encourage bowel movement',
                category: 'immediate',
                timeframe: '10-15 minutes',
                icon: 'fitness'
            },
            {
                id: 'fiber',
                title: 'Add Soluble Fiber',
                description: 'Eat oats, chia seeds, or psyllium with plenty of water',
                category: 'dietary',
                timeframe: 'Next meal',
                icon: 'leaf'
            },
            {
                id: 'squat-position',
                title: 'Proper Toilet Posture',
                description: 'Use a footstool to elevate feet while on toilet',
                category: 'behavioral',
                timeframe: 'When needed',
                icon: 'fitness'
            }
        ]
    };

    return actions[bloatingType];
};

/**
 * Get prevention tips based on bloating type
 */
export const getPreventionTips = (bloatingType: BloatingType['type']): string[] => {
    const tips: Record<BloatingType['type'], string[]> = {
        'gas': [
            'Eat smaller, more frequent meals instead of large portions',
            'Chew food thoroughly and eat slowly',
            'Avoid carbonated drinks and drinking through straws',
            'Limit high-FODMAP food combinations in one meal',
            'Stay upright for 30 minutes after eating'
        ],
        'water-retention': [
            'Maintain consistent water intake throughout the day',
            'Reduce sodium intake, especially processed foods',
            'Increase potassium-rich foods (bananas, spinach)',
            'Avoid sitting or standing for long periods',
            'Track if bloating correlates with menstrual cycle'
        ],
        'constipation': [
            'Increase soluble fiber gradually (oats, chia seeds)',
            'Drink water consistently, especially with fiber',
            'Establish a regular bathroom routine (same time daily)',
            'Exercise regularly to promote gut motility',
            'Don\'t ignore the urge to have a bowel movement'
        ]
    };

    return tips[bloatingType];
};

/**
 * Generate complete debloat suggestion
 */
export const generateDebloatSuggestion = (
    recentMoments: GutMoment[],
    currentSymptoms: { bloating: boolean; gas: boolean; cramping: boolean; nausea: boolean }
): DebloatSuggestion => {
    const bloatingType = identifyBloatingType(recentMoments, currentSymptoms);
    const immediateActions = getImmediateActions(bloatingType.type);
    const preventionTips = getPreventionTips(bloatingType.type);

    const explanations: Record<BloatingType['type'], string> = {
        'gas': 'Your symptoms suggest gas-related bloating. This is often caused by fermentation of certain foods in your gut. The good news: it usually resolves within a few hours with the right actions.',
        'water-retention': 'Your bloating appears to be related to water retention. This can be influenced by salt intake, hydration levels, or hormonal changes. Focus on fluid balance.',
        'constipation': 'Your symptoms indicate constipation-related bloating. This happens when stool builds up in your colon. Gentle movement and hydration can help restore regularity.'
    };

    return {
        bloatingType,
        immediateActions,
        preventionTips,
        explanation: explanations[bloatingType.type],
        confidence: bloatingType.confidence
    };
};

/**
 * Check if medical attention is needed
 */
export const checkMedicalFlags = (
    recentMoments: GutMoment[]
): { needsAttention: boolean; reasons: string[] } => {
    const reasons: string[] = [];

    // Check for blood or mucus
    const hasBlood = recentMoments.some(m => m.tags?.includes('blood'));
    const hasMucus = recentMoments.some(m => m.tags?.includes('mucus'));

    if (hasBlood) {
        reasons.push('Blood in stool detected');
    }

    if (hasMucus) {
        reasons.push('Mucus in stool detected');
    }

    // Check for persistent severe symptoms
    const last2Weeks = recentMoments.filter(m => {
        const daysSince = (Date.now() - new Date(m.timestamp).getTime()) / (1000 * 60 * 60 * 24);
        return daysSince <= 14;
    });

    const symptomaticDays = last2Weeks.filter(m =>
        Object.values(m.symptoms).some(v => v)
    ).length;

    if (symptomaticDays >= 10) {
        reasons.push('Persistent symptoms for over 2 weeks');
    }

    // Check for severe constipation
    const last3Days = recentMoments.filter(m => {
        const daysSince = (Date.now() - new Date(m.timestamp).getTime()) / (1000 * 60 * 60 * 24);
        return daysSince <= 3;
    });

    if (last3Days.length === 0) {
        reasons.push('No bowel movements in 3+ days');
    }

    return {
        needsAttention: reasons.length > 0,
        reasons
    };
};
