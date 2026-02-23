import { supabase } from '../config/supabase';
import { useAppStore } from '../store/useAppStore';

export interface AnalysisResult {
  normalizedName: string;
  level: 'safe' | 'caution' | 'avoid';
  explanation: string;
}

export interface AnalysisResponse {
  results: AnalysisResult[];
  recommendedPick: string | null;
}

export const fodmapService = {
  analyzeFoods: async (
    foods: string[],
    imageBase64?: string,
    extractFoodsOnly?: boolean
  ): Promise<AnalysisResponse | string[]> => {
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

    if (error) throw error;

    // extractFoodsOnly=true → returns string[]
    // normal mode → returns AnalysisResponse { results, recommendedPick }
    if (extractFoodsOnly) {
      return (data.foods ?? []) as string[];
    }
    return {
      results: (data.results ?? []) as AnalysisResult[],
      recommendedPick: (data.recommendedPick ?? null) as string | null,
    };
  },
};
