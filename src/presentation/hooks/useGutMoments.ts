/**
 * useGutMoments Hook
 * React hook for gut moment operations using the new architecture
 */
import { useState, useEffect, useCallback } from 'react';
import { GutMoment, CreateGutMomentInput } from '../../domain';
import { container } from '../../infrastructure/di';

interface UseGutMomentsState {
    moments: GutMoment[];
    loading: boolean;
    error: Error | null;
}

interface UseGutMomentsReturn extends UseGutMomentsState {
    logMoment: (input: CreateGutMomentInput) => Promise<GutMoment>;
    quickLog: (bristolType?: number) => Promise<GutMoment>;
    deleteMoment: (id: string) => Promise<void>;
    refresh: () => Promise<void>;
    streak: number;
    totalLogs: number;
}

/**
 * Hook for managing gut moments
 */
export function useGutMoments(userId: string | null): UseGutMomentsReturn {
    const [state, setState] = useState<UseGutMomentsState>({
        moments: [],
        loading: true,
        error: null,
    });
    const [streak, setStreak] = useState(0);

    const logUseCase = container.logGutMomentUseCase;
    const quickLogUseCase = container.quickLogGutMomentUseCase;
    const getUseCase = container.getGutMomentsUseCase;
    const deleteUseCase = container.deleteGutMomentUseCase;
    const streakService = container.streakService;

    // Fetch moments
    const fetchMoments = useCallback(async () => {
        if (!userId) {
            setState({ moments: [], loading: false, error: null });
            return;
        }

        setState(prev => ({ ...prev, loading: true, error: null }));

        try {
            const moments = await getUseCase.execute(userId);
            const currentStreak = streakService.calculateCurrentStreak(moments);

            setState({ moments, loading: false, error: null });
            setStreak(currentStreak);
        } catch (error) {
            setState(prev => ({
                ...prev,
                loading: false,
                error: error instanceof Error ? error : new Error('Failed to load moments')
            }));
        }
    }, [userId, getUseCase, streakService]);

    // Initial fetch
    useEffect(() => {
        fetchMoments();
    }, [fetchMoments]);

    // Log a moment
    const logMoment = useCallback(async (input: CreateGutMomentInput): Promise<GutMoment> => {
        if (!userId) throw new Error('User not authenticated');

        const result = await logUseCase.execute(userId, input);

        // Optimistically update local state
        setState(prev => ({
            ...prev,
            moments: [result.moment, ...prev.moments],
        }));
        setStreak(result.newStreak);

        return result.moment;
    }, [userId, logUseCase]);

    // Quick log
    const quickLog = useCallback(async (bristolType: number = 4): Promise<GutMoment> => {
        if (!userId) throw new Error('User not authenticated');

        const result = await quickLogUseCase.execute(userId, bristolType);

        setState(prev => ({
            ...prev,
            moments: [result.moment, ...prev.moments],
        }));
        setStreak(result.newStreak);

        return result.moment;
    }, [userId, quickLogUseCase]);

    // Delete a moment
    const deleteMoment = useCallback(async (id: string): Promise<void> => {
        if (!userId) throw new Error('User not authenticated');

        const result = await deleteUseCase.execute(userId, id);

        setState(prev => ({
            ...prev,
            moments: prev.moments.filter(m => m.id !== id),
        }));
        setStreak(result.newStreak);
    }, [userId, deleteUseCase]);

    return {
        ...state,
        logMoment,
        quickLog,
        deleteMoment,
        refresh: fetchMoments,
        streak,
        totalLogs: state.moments.length,
    };
}

/**
 * Hook for getting recent moments only
 */
export function useRecentMoments(userId: string | null, days: number = 7) {
    const [moments, setMoments] = useState<GutMoment[]>([]);
    const [loading, setLoading] = useState(true);

    const getUseCase = container.getGutMomentsUseCase;

    useEffect(() => {
        if (!userId) {
            setMoments([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        getUseCase.getRecent(userId, days)
            .then(setMoments)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [userId, days, getUseCase]);

    return { moments, loading };
}

/**
 * Hook for today's moments
 */
export function useTodayMoments(userId: string | null) {
    const [moments, setMoments] = useState<GutMoment[]>([]);
    const [loading, setLoading] = useState(true);

    const getUseCase = container.getGutMomentsUseCase;

    useEffect(() => {
        if (!userId) {
            setMoments([]);
            setLoading(false);
            return;
        }

        getUseCase.getToday(userId)
            .then(setMoments)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [userId, getUseCase]);

    return { moments, loading, hasPoopedToday: moments.length > 0 };
}
