/**
 * Lifestyle Tracking Service
 * Handles stress, sleep, water, exercise, and medication tracking
 */

import { theme } from '../../theme';

export interface LifestyleData {
    stress_level?: number; // 1-10
    sleep_quality?: number; // 1-10
    sleep_hours?: number; // e.g., 7.5
    water_intake?: number; // ml
    exercise_minutes?: number;
    exercise_type?: string;
    medications?: string[];
}

export const STRESS_LEVELS = [
    { value: 1, label: 'Very Relaxed', icon: 'happy-outline', color: theme.colors.brand.secondary },
    { value: 2, label: 'Relaxed', icon: 'happy-outline', color: theme.colors.brand.secondary },
    { value: 3, label: 'Calm', icon: 'happy-outline', color: theme.colors.brand.secondary },
    { value: 4, label: 'Slightly Tense', icon: 'remove-circle-outline', color: theme.colors.brand.cream },
    { value: 5, label: 'Neutral', icon: 'remove-circle-outline', color: theme.colors.brand.cream },
    { value: 6, label: 'Somewhat Stressed', icon: 'sad-outline', color: theme.colors.brand.tertiary },
    { value: 7, label: 'Stressed', icon: 'sad-outline', color: theme.colors.brand.primary },
    { value: 8, label: 'Very Stressed', icon: 'warning-outline', color: theme.colors.brand.primary },
    { value: 9, label: 'Extremely Stressed', icon: 'warning-outline', color: theme.colors.brand.primary },
    { value: 10, label: 'Overwhelmed', icon: 'alert-circle-outline', color: theme.colors.brand.primary },
];

export const SLEEP_QUALITY = [
    { value: 1, label: 'Terrible', icon: 'close-circle-outline', color: theme.colors.brand.primary },
    { value: 2, label: 'Very Poor', icon: 'close-circle-outline', color: theme.colors.brand.primary },
    { value: 3, label: 'Poor', icon: 'sad-outline', color: theme.colors.brand.primary },
    { value: 4, label: 'Below Average', icon: 'remove-circle-outline', color: theme.colors.brand.tertiary },
    { value: 5, label: 'Average', icon: 'remove-circle-outline', color: theme.colors.brand.cream },
    { value: 6, label: 'Decent', icon: 'checkmark-circle-outline', color: theme.colors.brand.cream },
    { value: 7, label: 'Good', icon: 'checkmark-circle-outline', color: theme.colors.brand.secondary },
    { value: 8, label: 'Very Good', icon: 'happy-outline', color: theme.colors.brand.secondary },
    { value: 9, label: 'Excellent', icon: 'happy-outline', color: theme.colors.brand.secondary },
    { value: 10, label: 'Perfect', icon: 'star-outline', color: theme.colors.brand.secondary },
];

export const EXERCISE_TYPES = [
    { value: 'walking', label: 'Walking', icon: 'walk-outline' },
    { value: 'running', label: 'Running', icon: 'fitness-outline' },
    { value: 'yoga', label: 'Yoga', icon: 'body-outline' },
    { value: 'gym', label: 'Gym', icon: 'barbell-outline' },
    { value: 'cycling', label: 'Cycling', icon: 'bicycle-outline' },
    { value: 'swimming', label: 'Swimming', icon: 'water-outline' },
    { value: 'sports', label: 'Sports', icon: 'football-outline' },
    { value: 'other', label: 'Other', icon: 'ellipsis-horizontal-outline' },
];

export const COMMON_MEDICATIONS = [
    'Imodium (Loperamide)',
    'Miralax (Polyethylene Glycol)',
    'Metamucil (Psyllium)',
    'Probiotics',
    'Antacids',
    'IBgard',
    'Bentyl (Dicyclomine)',
    'Amitriptyline',
    'Other',
];

/**
 * Get stress level description
 */
export const getStressDescription = (level: number) => {
    return STRESS_LEVELS.find(s => s.value === level) || STRESS_LEVELS[4];
};

/**
 * Get sleep quality description
 */
export const getSleepDescription = (quality: number) => {
    return SLEEP_QUALITY.find(s => s.value === quality) || SLEEP_QUALITY[4];
};

/**
 * Calculate recommended water intake based on weight (optional)
 * Formula: weight (kg) * 30-35 ml
 */
export const getRecommendedWaterIntake = (weightKg?: number): number => {
    if (!weightKg) return 2000; // Default 2L
    return Math.round(weightKg * 33); // 33ml per kg
};

/**
 * Analyze lifestyle impact on gut health
 */
export const analyzeLifestyleImpact = (data: {
    stress_level?: number;
    sleep_quality?: number;
    sleep_hours?: number;
    water_intake?: number;
    exercise_minutes?: number;
}): {
    score: number;
    insights: string[];
} => {
    let score = 50; // baseline
    const insights: string[] = [];

    // Stress impact (high stress = worse gut health)
    if (data.stress_level) {
        if (data.stress_level >= 8) {
            score -= 15;
            insights.push('High stress levels can trigger IBS symptoms');
        } else if (data.stress_level >= 6) {
            score -= 8;
            insights.push('Moderate stress may affect digestion');
        } else if (data.stress_level <= 3) {
            score += 10;
            insights.push('Low stress is great for gut health');
        }
    }

    // Sleep impact
    if (data.sleep_quality) {
        if (data.sleep_quality >= 8) {
            score += 10;
            insights.push('Excellent sleep supports gut health');
        } else if (data.sleep_quality <= 4) {
            score -= 10;
            insights.push('Poor sleep can worsen IBS symptoms');
        }
    }

    if (data.sleep_hours) {
        if (data.sleep_hours < 6) {
            score -= 8;
            insights.push('Insufficient sleep (aim for 7-9 hours)');
        } else if (data.sleep_hours >= 7 && data.sleep_hours <= 9) {
            score += 8;
            insights.push('Optimal sleep duration');
        }
    }

    // Hydration impact
    if (data.water_intake) {
        if (data.water_intake >= 2000) {
            score += 8;
            insights.push('Good hydration helps digestion');
        } else if (data.water_intake < 1000) {
            score -= 8;
            insights.push('Low water intake can cause constipation');
        }
    }

    // Exercise impact
    if (data.exercise_minutes) {
        if (data.exercise_minutes >= 30) {
            score += 10;
            insights.push('Regular exercise improves gut motility');
        } else if (data.exercise_minutes === 0) {
            score -= 5;
            insights.push('Light exercise can help digestion');
        }
    }

    return {
        score: Math.max(0, Math.min(100, score)),
        insights,
    };
};
