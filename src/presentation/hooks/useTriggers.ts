/**
 * useTriggers Hook
 * React hook for trigger detection
 */
import { useState, useEffect, useCallback } from 'react';
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
        // Don't fetch if no userId (user is logged out)
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
        } catch (error: any) {
            // Handle permission errors and auth issues gracefully
            const errorMessage = error?.message?.toLowerCase() || '';
            const status = error?.status;
            if (error?.code === 'PGRST116' || errorMessage.includes('permission') || errorMessage.includes('denied') || status === 403 || status === 500) {
                // Only log if user was actually authenticated (suppress on logout)
                if (userId) {
                    if (status === 500) {
                        console.warn('Server error fetching triggers - Supabase may be temporarily unavailable:', error);
                    } else {
                        console.debug('Permission denied detecting triggers - user session may have expired');
                    }
                }
                setTriggers([]);
                setCombinationTriggers([]);
            } else {
                console.error('Failed to detect triggers:', error);
            }
        } finally {
            setLoading(false);
        }
    }, [userId, detectUseCase, detectComboUseCase]);

    useEffect(() => {
        // Only fetch if user is authenticated
        if (userId) {
            fetchTriggers();
        } else {
            // Clear data on logout
            setTriggers([]);
            setCombinationTriggers([]);
            setLoading(false);
        }
    }, [fetchTriggers, userId]);

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
