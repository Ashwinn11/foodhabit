/**
 * useMedicalAlerts Hook
 * React hook for medical alert detection
 */
import { useState, useEffect, useCallback, useMemo } from 'react';
import { GutMoment } from '../../domain';
import { MedicalAlertResult, DismissedAlerts } from '../../application/services';
import { container } from '../../infrastructure/di';

interface UseMedicalAlertsReturn {
    alerts: MedicalAlertResult;
    loading: boolean;
    refresh: () => Promise<void>;
    dismissAlert: (type: string) => void;
    dismissedAlerts: DismissedAlerts;
}

/**
 * Hook for medical alert detection
 */
export function useMedicalAlerts(
    userId: string | null,
    persistedDismissedAlerts: DismissedAlerts = {}
): UseMedicalAlertsReturn {
    const [alerts, setAlerts] = useState<MedicalAlertResult>({ hasAlerts: false, alerts: [] });
    const [dismissedAlerts, setDismissedAlerts] = useState<DismissedAlerts>(persistedDismissedAlerts);
    const [loading, setLoading] = useState(true);

    const checkUseCase = container.checkMedicalAlertsUseCase;
    const storageService = container.storageService;

    const fetchAlerts = useCallback(async () => {
        if (!userId) {
            setAlerts({ hasAlerts: false, alerts: [] });
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const result = await checkUseCase.execute(userId, dismissedAlerts);
            setAlerts(result);
        } catch (error) {
            console.error('Failed to check medical alerts:', error);
        } finally {
            setLoading(false);
        }
    }, [userId, dismissedAlerts, checkUseCase]);

    useEffect(() => {
        fetchAlerts();
    }, [fetchAlerts]);

    // Load persisted dismissed alerts
    useEffect(() => {
        storageService.get<DismissedAlerts>('dismissedAlerts')
            .then(persisted => {
                if (persisted) {
                    setDismissedAlerts(persisted);
                }
            });
    }, [storageService]);

    const dismissAlert = useCallback((type: string) => {
        const newDismissed = {
            ...dismissedAlerts,
            [type]: new Date().toISOString(),
        };

        setDismissedAlerts(newDismissed);
        storageService.set('dismissedAlerts', newDismissed);

        // Remove the dismissed alert from current alerts
        setAlerts(prev => ({
            ...prev,
            alerts: prev.alerts.filter(a => a.type !== type),
            hasAlerts: prev.alerts.filter(a => a.type !== type).length > 0,
        }));
    }, [dismissedAlerts, storageService]);

    return {
        alerts,
        loading,
        refresh: fetchAlerts,
        dismissAlert,
        dismissedAlerts,
    };
}

/**
 * Hook for checking alerts from provided moments (no DB call)
 */
export function useMedicalAlertsFromMoments(
    moments: GutMoment[],
    dismissedAlerts: DismissedAlerts = {}
): MedicalAlertResult {
    const medicalAlertService = container.medicalAlertService;

    return useMemo(() => {
        return medicalAlertService.checkAlerts(moments, dismissedAlerts);
    }, [moments, dismissedAlerts, medicalAlertService]);
}
