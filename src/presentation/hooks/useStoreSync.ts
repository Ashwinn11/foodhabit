/**
 * useStoreSync Hook
 * Provides store synchronization functionality
 */
import { useState, useCallback, useEffect } from 'react';
import { SyncResult, SyncOptions } from '../../application/services/StoreSyncService';
import { container } from '../../infrastructure/di';
import { useAuth } from '../../hooks/useAuth';

export interface UseStoreSyncReturn {
    // Sync actions
    pushToCloud: () => Promise<SyncResult>;
    pullFromCloud: () => Promise<SyncResult>;
    fullSync: (options?: SyncOptions) => Promise<SyncResult>;

    // State
    isSyncing: boolean;
    lastSyncTime: Date | null;
    lastSyncResult: SyncResult | null;
    error: string | null;
}

/**
 * Hook for synchronizing local store with cloud
 */
export function useStoreSync(): UseStoreSyncReturn {
    const { session } = useAuth();
    const userId = session?.user?.id ?? null;

    const [isSyncing, setIsSyncing] = useState(false);
    const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
    const [lastSyncResult, setLastSyncResult] = useState<SyncResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    /**
     * Push local changes to cloud
     */
    const pushToCloud = useCallback(async (): Promise<SyncResult> => {
        if (!userId) {
            const result: SyncResult = {
                success: false,
                syncedMoments: 0,
                syncedMeals: 0,
                errors: ['User not authenticated'],
            };
            setLastSyncResult(result);
            return result;
        }

        setIsSyncing(true);
        setError(null);

        try {
            const result = await container.storeSyncService.pushToCloud(userId);
            setLastSyncResult(result);
            setLastSyncTime(new Date());

            if (!result.success && result.errors.length > 0) {
                setError(result.errors[0]);
            }

            return result;
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Sync failed';
            setError(errorMsg);

            const result: SyncResult = {
                success: false,
                syncedMoments: 0,
                syncedMeals: 0,
                errors: [errorMsg],
            };
            setLastSyncResult(result);
            return result;
        } finally {
            setIsSyncing(false);
        }
    }, [userId]);

    /**
     * Pull cloud changes to local
     */
    const pullFromCloud = useCallback(async (): Promise<SyncResult> => {
        if (!userId) {
            const result: SyncResult = {
                success: false,
                syncedMoments: 0,
                syncedMeals: 0,
                errors: ['User not authenticated'],
            };
            setLastSyncResult(result);
            return result;
        }

        setIsSyncing(true);
        setError(null);

        try {
            const result = await container.storeSyncService.pullFromCloud(userId);
            setLastSyncResult(result);
            setLastSyncTime(new Date());

            if (!result.success && result.errors.length > 0) {
                setError(result.errors[0]);
            }

            return result;
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Sync failed';
            setError(errorMsg);

            const result: SyncResult = {
                success: false,
                syncedMoments: 0,
                syncedMeals: 0,
                errors: [errorMsg],
            };
            setLastSyncResult(result);
            return result;
        } finally {
            setIsSyncing(false);
        }
    }, [userId]);

    /**
     * Full bidirectional sync
     */
    const fullSync = useCallback(async (options: SyncOptions = {}): Promise<SyncResult> => {
        if (!userId) {
            const result: SyncResult = {
                success: false,
                syncedMoments: 0,
                syncedMeals: 0,
                errors: ['User not authenticated'],
            };
            setLastSyncResult(result);
            return result;
        }

        setIsSyncing(true);
        setError(null);

        try {
            const result = await container.storeSyncService.fullSync(userId, options);
            setLastSyncResult(result);
            setLastSyncTime(new Date());

            if (!result.success && result.errors.length > 0) {
                setError(result.errors[0]);
            }

            return result;
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Sync failed';
            setError(errorMsg);

            const result: SyncResult = {
                success: false,
                syncedMoments: 0,
                syncedMeals: 0,
                errors: [errorMsg],
            };
            setLastSyncResult(result);
            return result;
        } finally {
            setIsSyncing(false);
        }
    }, [userId]);

    // Auto-sync when user authenticates
    useEffect(() => {
        if (userId) {
            // Pull latest data when user logs in
            pullFromCloud();
        }
    }, [userId]);

    return {
        pushToCloud,
        pullFromCloud,
        fullSync,
        isSyncing,
        lastSyncTime,
        lastSyncResult,
        error,
    };
}

export default useStoreSync;
