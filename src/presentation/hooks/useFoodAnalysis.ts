/**
 * useFoodAnalysis Hook
 * Presentation layer hook for food analysis
 *
 * Orchestrates: Repository → Domain Services → AI Analysis → Presentation
 */

import { useCallback, useState } from 'react';
import { useUserCondition } from './useUserCondition';
import { analyzeFoodWithPersonalization } from '../../services/fodmapService';

export interface FoodAnalysisResult {
  food: string;
  level: 'high' | 'moderate' | 'low';
  nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    sugar: number;
    sodium: number;
  };
  personalizedExplanation: string;
  portionAdvice?: string | null;
  personalHistory?: {
    everEaten: boolean;
    symptoms: string[];
    occurrenceCount: number;
    latency?: string | null;
  };
  compoundRiskWarning?: string | null;
  alternatives?: string[];
  categories?: string[];
}

export interface UseFoodAnalysisResult {
  analyze: (food: string) => Promise<FoodAnalysisResult | null>;
  loading: boolean;
  error: string | null;
}

/**
 * Hook that analyzes food with user's condition
 * Gets condition from domain, calls personalized API
 */
export const useFoodAnalysis = (): UseFoodAnalysisResult => {
  const { condition } = useUserCondition();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyze = useCallback(
    async (food: string): Promise<FoodAnalysisResult | null> => {
      if (!food.trim()) {
        setError('Food name cannot be empty');
        return null;
      }

      setLoading(true);
      setError(null);

      try {
        const result = await analyzeFoodWithPersonalization(
          food,
          condition?.getType(), // Pass user's condition to AI
          undefined, // TODO: Pass personal triggers from TriggerDetectionService
          undefined  // TODO: Pass symptom patterns from SymptomPatternService
        );

        if (!result) {
          setError('Failed to analyze food. Please try again.');
          return null;
        }

        return result;
      } catch (e) {
        const errorMsg = (e as Error).message;
        setError(errorMsg);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [condition]
  );

  return {
    analyze,
    loading,
    error
  };
};
