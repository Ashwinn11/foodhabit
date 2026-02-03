/**
 * useTriggers Hook
 * React hook for trigger detection
 */
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Trigger, CombinationTrigger, GutMoment, Meal, TriggerFeedback } from '../../domain';
import { container } from '../../infrastructure/di';

interface UseTriggersReturn {
    triggers: Trigger[];
    combinationTriggers: CombinationTrigger[];
    loading: boolean;
    refresh: () => Promise<void>;
    saveFeedback: (foodName: string, confirmed: boolean | null, notes?: string) => Promise<void>;
}

/**
 * Hook for trigger detection
 */
export function useTriggers(userId: string | null): UseTriggersReturn {
    const [triggers, setTriggers] = useState<Trigger[]>([]);
    const [combinationTriggers, setCombinationTriggers] = useState<CombinationTrigger[]>([]);
    const [loading, setLoading] = useState(true);

    const detectUseCase = container.detectTriggersUseCase;
    const detectComboUseCase = container.detectCombinationTriggersUseCase;
    const saveFeedbackUseCase = container.saveTriggerFeedbackUseCase;

    const fetchTriggers = useCallback(async () => {
        if (!userId) {
            setTriggers([]);
            setCombinationTriggers([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const [detected, combos] = await Promise.all([
                detectUseCase.execute(userId),
                detectComboUseCase.execute(userId),
            ]);
            setTriggers(detected);
            setCombinationTriggers(combos);
        } catch (error) {
            console.error('Failed to detect triggers:', error);
        } finally {
            setLoading(false);
        }
    }, [userId, detectUseCase, detectComboUseCase]);

    useEffect(() => {
        fetchTriggers();
    }, [fetchTriggers]);

    const saveFeedback = useCallback(async (
        foodName: string,
        confirmed: boolean | null,
        notes?: string
    ) => {
        if (!userId) throw new Error('User not authenticated');

        await saveFeedbackUseCase.execute(userId, foodName, confirmed, notes);

        // Refresh triggers to update with new feedback
        await fetchTriggers();
    }, [userId, saveFeedbackUseCase, fetchTriggers]);

    return {
        triggers,
        combinationTriggers,
        loading,
        refresh: fetchTriggers,
        saveFeedback,
    };
}

/**
 * Hook for detecting triggers from provided data (no DB call)
 */
export function useTriggersFromData(
    moments: GutMoment[],
    meals: Meal[],
    feedback: TriggerFeedback[] = []
): Trigger[] {
    const triggerService = container.triggerDetectionService;

    return useMemo(() => {
        return triggerService.detectTriggers({ moments, meals, feedback });
    }, [moments, meals, feedback, triggerService]);
}
