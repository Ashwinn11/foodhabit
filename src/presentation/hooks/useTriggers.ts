/**
 * useTriggers Hook
 * React hook for trigger detection
 */
import { useState, useCallback, useEffect } from 'react';
import { Trigger, CombinationTrigger, GutMoment, Meal, TriggerFeedback } from '../../domain';
import { container } from '../../infrastructure/di';
import { useGutStore } from '../../store';

interface UseTriggersReturn {
    triggers: Trigger[];
    combinationTriggers: CombinationTrigger[];
    loading: boolean;
    refresh: () => Promise<void>;
    saveFeedback: (foodName: string, confirmed: boolean | null, notes?: string) => Promise<void>;
}

/**
 * Hook for trigger detection - Reads from global store
 */
export function useTriggers(userId: string | null): UseTriggersReturn {
    const {
        detectedTriggers,
        combinationTriggers,
        refreshTriggers
    } = useGutStore();

    const [refreshing, setRefreshing] = useState(false);
    const saveFeedbackUseCase = container.saveTriggerFeedbackUseCase;

    const refresh = useCallback(async () => {
        if (!userId) return;
        setRefreshing(true);
        try {
            await refreshTriggers();
        } finally {
            setRefreshing(false);
        }
    }, [userId, refreshTriggers]);

    const saveFeedback = useCallback(async (
        foodName: string,
        confirmed: boolean | null,
        notes?: string
    ) => {
        if (!userId) throw new Error('User not authenticated');

        await saveFeedbackUseCase.execute(userId, foodName, confirmed, notes);

        // Refresh triggers to update with new feedback
        await refresh();
    }, [userId, saveFeedbackUseCase, refresh]);

    return {
        triggers: detectedTriggers,
        combinationTriggers,
        loading: refreshing,
        refresh,
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
    const [triggers, setTriggers] = useState<Trigger[]>([]);
    const triggerService = container.triggerDetectionService;

    useEffect(() => {
        const detectTriggers = async () => {
            try {
                const detected = await triggerService.detectTriggers({ moments, meals, feedback });
                setTriggers(detected);
            } catch (error) {
                console.error('Failed to detect triggers from data:', error);
            }
        };

        detectTriggers();
    }, [moments, meals, feedback, triggerService]);

    return triggers;
}
