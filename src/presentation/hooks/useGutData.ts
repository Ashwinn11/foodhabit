/**
 * useGutData Hook
 * Bridge hook that combines data from new clean architecture with existing store
 * This allows gradual migration of screens
 */
import { useMemo } from 'react';
import { useGutStore } from '../../store';
import { useAuth } from '../../hooks/useAuth';
import { container } from '../../infrastructure/di';
import { GutMoment as DomainGutMoment, BristolType, createSymptoms } from '../../domain';

/**
 * Hook that provides computed values using the new architecture services
 * while still reading from the existing store for data
 */
export function useGutData() {
    const { session } = useAuth();
    const userId = session?.user?.id ?? null;

    // Get data from existing store
    const {
        gutMoments,
        meals,
        baselineScore,
        user,
        waterLogs,
        fiberLogs,
        probioticLogs,
        exerciseLogs,
        dismissedAlerts,
    } = useGutStore();

    // Get services from DI container
    const healthScoreService = container.healthScoreService;
    const medicalAlertService = container.medicalAlertService;
    const streakService = container.streakService;

    // Convert store moments to domain entities for computation
    const domainMoments = useMemo(() => {
        return gutMoments.map(m => DomainGutMoment.reconstitute({
            id: m.id,
            timestamp: new Date(m.timestamp),
            bristolType: m.bristolType ? BristolType.create(m.bristolType) : undefined,
            symptoms: createSymptoms({
                bloating: m.symptoms?.bloating ?? false,
                gas: m.symptoms?.gas ?? false,
                cramping: m.symptoms?.cramping ?? false,
                nausea: m.symptoms?.nausea ?? false,
            }),
            tags: (m.tags || []) as any,
            urgency: undefined,
            painScore: undefined,
            notes: m.notes,
            duration: m.duration,
            incompleteEvacuation: m.incompleteEvacuation,
        }));
    }, [gutMoments]);

    // Calculate health score using new service
    const healthScore = useMemo(() => {
        return healthScoreService.calculateScore({
            moments: domainMoments,
            baselineScore: baselineScore || 50,
        });
    }, [domainMoments, baselineScore, healthScoreService]);

    // Calculate streak using new service
    const streak = useMemo(() => {
        return streakService.calculateCurrentStreak(domainMoments);
    }, [domainMoments, streakService]);

    // Check medical alerts using new service
    const medicalAlerts = useMemo(() => {
        return medicalAlertService.checkAlerts(domainMoments, dismissedAlerts || {});
    }, [domainMoments, dismissedAlerts, medicalAlertService]);

    // Get today's health values
    const todayStr = new Date().toISOString().split('T')[0];

    const todayWater = useMemo(() => {
        const log = waterLogs?.find(l => l.date === todayStr);
        return log?.glasses ?? 0;
    }, [waterLogs, todayStr]);

    const todayFiber = useMemo(() => {
        const log = fiberLogs?.find(l => l.date === todayStr);
        return log?.grams ?? 0;
    }, [fiberLogs, todayStr]);

    const todayProbiotics = useMemo(() => {
        const log = probioticLogs?.find(l => l.date === todayStr);
        return log?.servings ?? 0;
    }, [probioticLogs, todayStr]);

    const todayExercise = useMemo(() => {
        const log = exerciseLogs?.find(l => l.date === todayStr);
        return log?.minutes ?? 0;
    }, [exerciseLogs, todayStr]);

    return {
        // User data
        userId,
        user,

        // Health score (from new service)
        healthScore: {
            score: healthScore.value,
            grade: healthScore.grade,
            breakdown: healthScore.breakdown,
        },

        // Streak (from new service)
        streak,

        // Medical alerts (from new service)
        medicalAlerts,

        // Today's values
        todayWater,
        todayFiber,
        todayProbiotics,
        todayExercise,

        // Raw data for components that need it
        moments: gutMoments,
        meals,

        // Domain entities for new components
        domainMoments,
    };
}

export default useGutData;
