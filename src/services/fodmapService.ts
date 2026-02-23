import { supabase } from '../config/supabase';
import { useAppStore } from '../store/useAppStore';

export interface AnalysisResult {
  normalizedName: string;
  level: 'safe' | 'caution' | 'avoid';
  explanation: string;
}

export const fodmapService = {
  analyzeFoods: async (
    foods: string[],
    imageBase64?: string,
    extractFoodsOnly?: boolean
  ): Promise<AnalysisResult[] | string[]> => {
    const { onboardingAnswers, learnedTriggers } = useAppStore.getState();

    const allTriggers = [
      ...onboardingAnswers.knownTriggers,
      ...learnedTriggers,
    ].filter(Boolean).join(', ');

    const context = {
      userCondition: onboardingAnswers.condition,
      userSymptoms:  onboardingAnswers.symptoms.join(', '),
      userTriggers:  allTriggers,
    };

    const { data, error } = await supabase.functions.invoke('analyze-food', {
      body: { foods, imageBase64, extractFoodsOnly, ...context },
    });

    if (error) {
      console.error('Edge Function error:', error);
      throw error;
    }

    // extractFoodsOnly=true → returns { foods: string[] }
    // normal mode        → returns { results: AnalysisResult[] }
    return data.results ?? data.foods ?? [];
  },
};
