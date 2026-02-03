/**
 * useHealthLogs Hook
 * React hook for health log operations (water, fiber, probiotic, exercise)
 */
import { useState, useEffect, useCallback } from 'react';
import { HealthLog, HealthLogType } from '../../domain';
import { container } from '../../infrastructure/di';

interface UseHealthLogsReturn {
    logs: HealthLog[];
    loading: boolean;
    todayWater: number;
    todayFiber: number;
    todayProbiotics: number;
    todayExercise: number;
    addWater: (showToast?: boolean) => Promise<void>;
    addFiber: (grams: number, showToast?: boolean) => Promise<void>;
    addProbiotic: () => Promise<void>;
    addExercise: (minutes: number) => Promise<void>;
    refresh: () => Promise<void>;
}

/**
 * Hook for managing health logs
 */
export function useHealthLogs(userId: string | null): UseHealthLogsReturn {
    const [logs, setLogs] = useState<HealthLog[]>([]);
    const [loading, setLoading] = useState(true);

    const getUseCase = container.getHealthLogsUseCase;
    const logWaterUseCase = container.logWaterUseCase;
    const logFiberUseCase = container.logFiberUseCase;
    const logProbioticUseCase = container.logProbioticUseCase;
    const logExerciseUseCase = container.logExerciseUseCase;

    const fetchLogs = useCallback(async () => {
        if (!userId) {
            setLogs([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const todayLogs = await getUseCase.getToday(userId);
            setLogs(todayLogs);
        } catch (error) {
            console.error('Failed to load health logs:', error);
        } finally {
            setLoading(false);
        }
    }, [userId, getUseCase]);

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    // Helper to get today's value for a type
    const getTodayValue = (type: HealthLogType): number => {
        const log = logs.find(l => l.type === type);
        return log?.value ?? 0;
    };

    const addWater = useCallback(async (showToast: boolean = true) => {
        if (!userId) throw new Error('User not authenticated');
        const result = await logWaterUseCase.execute(userId, showToast);
        setLogs(prev => {
            const filtered = prev.filter(l => l.type !== 'water');
            return [...filtered, result.log];
        });
    }, [userId, logWaterUseCase]);

    const addFiber = useCallback(async (grams: number, showToast: boolean = true) => {
        if (!userId) throw new Error('User not authenticated');
        const result = await logFiberUseCase.execute(userId, grams, showToast);
        setLogs(prev => {
            const filtered = prev.filter(l => l.type !== 'fiber');
            return [...filtered, result.log];
        });
    }, [userId, logFiberUseCase]);

    const addProbiotic = useCallback(async () => {
        if (!userId) throw new Error('User not authenticated');
        const result = await logProbioticUseCase.execute(userId);
        setLogs(prev => {
            const filtered = prev.filter(l => l.type !== 'probiotic');
            return [...filtered, result.log];
        });
    }, [userId, logProbioticUseCase]);

    const addExercise = useCallback(async (minutes: number) => {
        if (!userId) throw new Error('User not authenticated');
        const result = await logExerciseUseCase.execute(userId, minutes);
        setLogs(prev => {
            const filtered = prev.filter(l => l.type !== 'exercise');
            return [...filtered, result.log];
        });
    }, [userId, logExerciseUseCase]);

    return {
        logs,
        loading,
        todayWater: getTodayValue('water'),
        todayFiber: getTodayValue('fiber'),
        todayProbiotics: getTodayValue('probiotic'),
        todayExercise: getTodayValue('exercise'),
        addWater,
        addFiber,
        addProbiotic,
        addExercise,
        refresh: fetchLogs,
    };
}
