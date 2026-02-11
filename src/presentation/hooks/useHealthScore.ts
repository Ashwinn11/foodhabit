/**
 * useHealthScore Hook
 * React hook for health score calculation
 */
import { useState, useEffect, useCallback, useMemo } from 'react';
import { HealthScore, GutMoment } from '../../domain';
import { container } from '../../infrastructure/di';

interface UseHealthScoreReturn {
    score: HealthScore | null;
    loading: boolean;
    refresh: () => Promise<void>;
}

/**
 * Hook for calculating health score
 */
export function useHealthScore(
    userId: string | null,
    baselineScore: number = 50
): UseHealthScoreReturn {
    const [score, setScore] = useState<HealthScore | null>(null);
    const [loading, setLoading] = useState(true);

    const calculateUseCase = container.calculateHealthScoreUseCase;

    const fetchScore = useCallback(async () => {
        if (!userId) {
            setScore(HealthScore.fromBaseline(baselineScore));
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const result = await calculateUseCase.execute(userId, baselineScore);
            setScore(result);
        } catch (error: any) {
            // Handle permission errors, auth issues, and server errors gracefully
            const errorMessage = error?.message?.toLowerCase() || '';
            const status = error?.status;
            if (error?.code === 'PGRST116' || errorMessage.includes('permission') || errorMessage.includes('denied') || status === 403 || status === 500) {
                console.warn('Unable to calculate health score:', error);
            } else {
                console.error('Failed to calculate health score:', error);
            }
            setScore(HealthScore.fromBaseline(baselineScore));
        } finally {
            setLoading(false);
        }
    }, [userId, baselineScore, calculateUseCase]);

    useEffect(() => {
        fetchScore();
    }, [fetchScore]);

    return { score, loading, refresh: fetchScore };
}

/**
 * Hook for calculating health score from provided moments (no DB call)
 */
export function useHealthScoreFromMoments(
    moments: GutMoment[],
    baselineScore: number = 50
): HealthScore {
    const healthScoreService = container.healthScoreService;

    return useMemo(() => {
        return healthScoreService.calculateScore({ moments, baselineScore });
    }, [moments, baselineScore, healthScoreService]);
}
