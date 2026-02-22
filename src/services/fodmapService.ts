import { supabase } from '../config/supabase';
import { useAppStore } from '../store/useAppStore';

export interface AnalysisResult {
    normalizedName: string;
    level: 'safe' | 'caution' | 'avoid';
    explanation: string;
}

export const fodmapService = {
    analyzeFoods: async (foods: string[], imageBase64?: string, extractFoodsOnly?: boolean): Promise<AnalysisResult[]> => {

        // Attempt to pull user context, usually from zustand or db fallback
        const { onboardingAnswers } = useAppStore.getState();
        const context = {
            userCondition: onboardingAnswers.condition,
            userSymptoms: onboardingAnswers.symptoms.join(', '),
            userTriggers: onboardingAnswers.knownTriggers.join(', '),
        };

        const payload = {
            foods,
            imageBase64,
            extractFoodsOnly,
            ...context
        };

        const { data, error } = await supabase.functions.invoke('analyze-food', {
            body: payload
        });

        if (error) {
            console.error('Edge Function error:', error);
            throw error;
        }

        // Returns { results: AnalysisResult[] } or { foods: string[] } for vision mode
        return data.results || data.foods || [];
    }
};
