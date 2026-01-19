import { supabase } from '../config/supabase';

export interface SyncQueueItem {
    type: 'onboarding' | 'gut_log' | 'health_insight' | 'trigger_food';
    data: any;
    priority: 'high' | 'medium' | 'low';
    timestamp: Date;
}

class SyncService {
    private syncQueue: SyncQueueItem[] = [];
    private isSyncing = false;
    private syncInterval: NodeJS.Timeout | null = null;

    /**
     * Initialize background sync (every 5 minutes for low-priority items)
     */
    initialize() {
        // Sync high-priority items immediately
        this.processSyncQueue();

        // Background sync for batched items
        this.syncInterval = setInterval(() => {
            this.processSyncQueue();
        }, 5 * 60 * 1000); // 5 minutes
    }

    /**
     * Stop background sync
     */
    stop() {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
            this.syncInterval = null;
        }
    }

    /**
     * Sync onboarding data immediately after completion
     */
    async syncOnboarding(userId: string, onboardingData: any): Promise<boolean> {
        try {
            const { error } = await supabase
                .from('users')
                .update({
                    onboarding_completed: true,
                    onboarding_data: onboardingData,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', userId);

            if (error) {
                console.error('Failed to sync onboarding:', error);
                return false;
            }

            console.log('✅ Onboarding synced successfully');
            return true;
        } catch (error) {
            console.error('Onboarding sync error:', error);
            return false;
        }
    }

    /**
     * Sync a gut log if it has medical significance
     * Only syncs if: has symptoms, red flags, or extreme bristol types (1, 7)
     */
    async syncGutLog(userId: string, log: any): Promise<boolean> {
        // Check if log is medically significant
        const hasSymptoms = Object.values(log.symptoms || {}).some((v) => v === true);
        const hasRedFlags = log.tags && log.tags.length > 0;
        const isExtremeBristol = log.bristolType === 1 || log.bristolType === 7;

        if (!hasSymptoms && !hasRedFlags && !isExtremeBristol) {
            console.log('⏭️  Skipping non-significant gut log');
            return true; // Not an error, just not worth syncing
        }

        try {
            const { error } = await supabase.from('gut_logs').insert({
                user_id: userId,
                timestamp: log.timestamp,
                bristol_type: log.bristolType,
                symptoms: log.symptoms || {},
                tags: log.tags || [],
                urgency: log.urgency,
                pain_score: log.painScore,
                notes: log.notes,
            });

            if (error) {
                console.error('Failed to sync gut log:', error);
                return false;
            }

            console.log('✅ Gut log synced (medically significant)');
            return true;
        } catch (error) {
            console.error('Gut log sync error:', error);
            return false;
        }
    }

    /**
     * Sync weekly health insights
     */
    async syncHealthInsight(userId: string, insight: any): Promise<boolean> {
        try {
            const { error } = await supabase.from('health_insights').upsert(
                {
                    user_id: userId,
                    week_start: insight.weekStart,
                    avg_bristol_type: insight.avgBristolType,
                    total_logs: insight.totalLogs,
                    symptom_count: insight.symptomCount,
                    health_score: insight.healthScore,
                    red_flags: insight.redFlags || {},
                },
                {
                    onConflict: 'user_id,week_start',
                }
            );

            if (error) {
                console.error('Failed to sync health insight:', error);
                return false;
            }

            console.log('✅ Health insight synced');
            return true;
        } catch (error) {
            console.error('Health insight sync error:', error);
            return false;
        }
    }

    /**
     * Sync trigger food when user provides feedback
     */
    async syncTriggerFood(userId: string, trigger: any): Promise<boolean> {
        try {
            const { error } = await supabase.from('trigger_foods').upsert(
                {
                    user_id: userId,
                    food_name: trigger.foodName,
                    user_confirmed: trigger.userConfirmed,
                    occurrences: trigger.occurrences,
                    confidence: trigger.confidence,
                    symptoms: trigger.symptoms || {},
                    updated_at: new Date().toISOString(),
                },
                {
                    onConflict: 'user_id,food_name',
                }
            );

            if (error) {
                console.error('Failed to sync trigger food:', error);
                return false;
            }

            console.log('✅ Trigger food synced');
            return true;
        } catch (error) {
            console.error('Trigger food sync error:', error);
            return false;
        }
    }

    /**
     * Add item to sync queue for background processing
     */
    queueSync(item: SyncQueueItem) {
        this.syncQueue.push(item);

        // Process immediately if high priority
        if (item.priority === 'high') {
            this.processSyncQueue();
        }
    }

    /**
     * Process the sync queue
     */
    private async processSyncQueue() {
        if (this.isSyncing || this.syncQueue.length === 0) {
            return;
        }

        this.isSyncing = true;

        try {
            // Get user ID from current session
            const {
                data: { session },
            } = await supabase.auth.getSession();
            const userId = session?.user?.id;

            if (!userId) {
                console.warn('No user session, skipping sync');
                this.syncQueue = []; // Clear queue if no user
                return;
            }

            // Process queue items
            const itemsToProcess = [...this.syncQueue];
            this.syncQueue = [];

            for (const item of itemsToProcess) {
                try {
                    switch (item.type) {
                        case 'onboarding':
                            await this.syncOnboarding(userId, item.data);
                            break;
                        case 'gut_log':
                            await this.syncGutLog(userId, item.data);
                            break;
                        case 'health_insight':
                            await this.syncHealthInsight(userId, item.data);
                            break;
                        case 'trigger_food':
                            await this.syncTriggerFood(userId, item.data);
                            break;
                    }
                } catch (error) {
                    console.error(`Failed to sync ${item.type}:`, error);
                    // Re-queue failed items (with lower priority)
                    if (item.priority === 'high') {
                        this.syncQueue.push({ ...item, priority: 'medium' });
                    }
                }
            }
        } finally {
            this.isSyncing = false;
        }
    }

    /**
     * Generate weekly health insight from local data
     */
    generateWeeklyInsight(gutMoments: any[]): any {
        const now = new Date();
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay()); // Start of week (Sunday)
        weekStart.setHours(0, 0, 0, 0);

        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 7);

        const weekLogs = gutMoments.filter((log) => {
            const logDate = new Date(log.timestamp);
            return logDate >= weekStart && logDate < weekEnd;
        });

        if (weekLogs.length === 0) {
            return null;
        }

        const bristolTypes = weekLogs
            .filter((log) => log.bristolType)
            .map((log) => log.bristolType);
        const avgBristol =
            bristolTypes.length > 0
                ? bristolTypes.reduce((a, b) => a + b, 0) / bristolTypes.length
                : null;

        const symptomCount = weekLogs.filter((log) =>
            Object.values(log.symptoms || {}).some((v) => v === true)
        ).length;

        const redFlags = weekLogs
            .filter((log) => log.tags && log.tags.length > 0)
            .map((log) => ({
                timestamp: log.timestamp,
                tags: log.tags,
            }));

        // Calculate health score (simplified version)
        let healthScore = 50;
        if (avgBristol && avgBristol >= 3 && avgBristol <= 5) healthScore += 20;
        if (symptomCount === 0) healthScore += 20;
        if (redFlags.length === 0) healthScore += 10;

        return {
            weekStart: weekStart.toISOString().split('T')[0],
            avgBristolType: avgBristol,
            totalLogs: weekLogs.length,
            symptomCount,
            healthScore: Math.min(100, healthScore),
            redFlags: redFlags.length > 0 ? { flags: redFlags } : {},
        };
    }

    /**
     * Fetch user's synced data from Supabase
     */
    async fetchUserData(userId: string) {
        try {
            const [userProfile, gutLogs, healthInsights, triggerFoods] = await Promise.all([
                supabase.from('users').select('*').eq('id', userId).single(),
                supabase
                    .from('gut_logs')
                    .select('*')
                    .eq('user_id', userId)
                    .order('timestamp', { ascending: false })
                    .limit(100),
                supabase
                    .from('health_insights')
                    .select('*')
                    .eq('user_id', userId)
                    .order('week_start', { ascending: false })
                    .limit(12),
                supabase.from('trigger_foods').select('*').eq('user_id', userId),
            ]);

            return {
                profile: userProfile.data,
                gutLogs: gutLogs.data || [],
                healthInsights: healthInsights.data || [],
                triggerFoods: triggerFoods.data || [],
            };
        } catch (error) {
            console.error('Failed to fetch user data:', error);
            return null;
        }
    }
}

export const syncService = new SyncService();
