import { IGutMomentRepository, IMealRepository } from '../ports/repositories';
import { useGutStore } from '../../store';
import { GutMoment, Meal } from '../../domain';

export interface SyncResult {
    success: boolean;
    syncedMoments: number;
    syncedMeals: number;
    errors: string[];
}

export interface SyncOptions {
    forceRefresh?: boolean;
    syncFromCloud?: boolean;
}

/**
 * Sync service for bidirectional data synchronization
 */
export class StoreSyncService {
    private lastSyncTime: Date | null = null;
    private isSyncing = false;

    constructor(
        private momentRepo: IGutMomentRepository,
        private mealRepo: IMealRepository
    ) { }

    /**
     * Sync store data to repositories (push local changes to cloud)
     */
    async pushToCloud(userId: string): Promise<SyncResult> {
        if (this.isSyncing) {
            return { success: false, syncedMoments: 0, syncedMeals: 0, errors: ['Sync already in progress'] };
        }

        this.isSyncing = true;
        const errors: string[] = [];
        let syncedMoments = 0;
        let syncedMeals = 0;

        try {
            const store = useGutStore.getState();

            // Sync gut moments
            for (const storeMoment of store.gutMoments) {
                try {
                    // Convert store format to domain entity
                    const domainMoment = this.convertStoreMomentToDomain(storeMoment);
                    await this.momentRepo.save(userId, domainMoment);
                    syncedMoments++;
                } catch (err) {
                    errors.push(`Failed to sync moment ${storeMoment.id}: ${err}`);
                }
            }

            // Sync meals
            for (const storeMeal of store.meals) {
                try {
                    // Convert store format to domain entity
                    const domainMeal = this.convertStoreMealToDomain(storeMeal);
                    await this.mealRepo.save(userId, domainMeal);
                    syncedMeals++;
                } catch (err) {
                    errors.push(`Failed to sync meal ${storeMeal.id}: ${err}`);
                }
            }

            this.lastSyncTime = new Date();
            return { success: errors.length === 0, syncedMoments, syncedMeals, errors };
        } finally {
            this.isSyncing = false;
        }
    }

    /**
     * Sync repository data to store (pull cloud changes to local)
     */
    async pullFromCloud(userId: string): Promise<SyncResult> {
        if (this.isSyncing) {
            return { success: false, syncedMoments: 0, syncedMeals: 0, errors: ['Sync already in progress'] };
        }

        this.isSyncing = true;
        const errors: string[] = [];
        let syncedMoments = 0;
        let syncedMeals = 0;

        try {
            // Fetch from cloud
            const [cloudMoments, cloudMeals] = await Promise.all([
                this.momentRepo.findByUserId(userId),
                this.mealRepo.findByUserId(userId),
            ]);

            // Update store with cloud data
            useGutStore.setState((state) => {
                // Merge cloud moments (cloud is source of truth)
                const mergedMoments = this.mergeMoments(state.gutMoments, cloudMoments);
                syncedMoments = cloudMoments.length;

                // Merge cloud meals
                const mergedMeals = this.mergeMeals(state.meals, cloudMeals);
                syncedMeals = cloudMeals.length;

                return {
                    ...state,
                    gutMoments: mergedMoments,
                    meals: mergedMeals,
                };
            });

            this.lastSyncTime = new Date();
            return { success: errors.length === 0, syncedMoments, syncedMeals, errors };
        } catch (err) {
            errors.push(`Pull failed: ${err}`);
            return { success: false, syncedMoments, syncedMeals, errors };
        } finally {
            this.isSyncing = false;
        }
    }

    /**
     * Full bidirectional sync
     */
    async fullSync(userId: string, _options: SyncOptions = {}): Promise<SyncResult> {
        const errors: string[] = [];
        let totalMoments = 0;
        let totalMeals = 0;

        // First push local changes
        const pushResult = await this.pushToCloud(userId);
        errors.push(...pushResult.errors);

        // Then pull cloud changes
        const pullResult = await this.pullFromCloud(userId);
        errors.push(...pullResult.errors);
        totalMoments = pullResult.syncedMoments;
        totalMeals = pullResult.syncedMeals;

        return {
            success: errors.length === 0,
            syncedMoments: totalMoments,
            syncedMeals: totalMeals,
            errors,
        };
    }

    /**
     * Get last sync time
     */
    getLastSyncTime(): Date | null {
        return this.lastSyncTime;
    }

    /**
     * Check if sync is in progress
     */
    getIsSyncing(): boolean {
        return this.isSyncing;
    }

    /**
     * Convert store moment format to domain entity
     */
    private convertStoreMomentToDomain(storeMoment: any): GutMoment {
        return GutMoment.create({
            timestamp: storeMoment.timestamp,
            bristolType: storeMoment.bristolType,
            symptoms: storeMoment.symptoms,
            tags: storeMoment.tags || [],
            urgency: storeMoment.urgency || 'none',
            painScore: storeMoment.painScore,
            notes: storeMoment.notes,
            duration: storeMoment.duration,
            incompleteEvacuation: storeMoment.incompleteEvacuation,
        });
    }

    /**
     * Convert store meal format to domain entity
     */
    private convertStoreMealToDomain(storeMeal: any): Meal {
        return Meal.create({
            timestamp: storeMeal.timestamp,
            mealType: storeMeal.mealType,
            name: storeMeal.name,
            foods: storeMeal.foods,
            description: storeMeal.description,
            portionSize: storeMeal.portionSize,
            foodTags: storeMeal.foodTags,
            normalizedFoods: storeMeal.normalizedFoods,
        });
    }

    /**
     * Merge local and cloud moments (cloud wins on conflicts)
     */
    private mergeMoments(local: any[], cloud: GutMoment[]): any[] {
        const merged = new Map<string, any>();

        // Add all local moments
        for (const moment of local) {
            merged.set(moment.id, moment);
        }

        // Override with cloud moments (cloud is source of truth)
        for (const moment of cloud) {
            merged.set(moment.id, this.convertDomainMomentToStore(moment));
        }

        return Array.from(merged.values());
    }

    /**
     * Merge local and cloud meals (cloud wins on conflicts)
     */
    private mergeMeals(local: any[], cloud: Meal[]): any[] {
        const merged = new Map<string, any>();

        // Add all local meals
        for (const meal of local) {
            merged.set(meal.id, meal);
        }

        // Override with cloud meals
        for (const meal of cloud) {
            merged.set(meal.id, this.convertDomainMealToStore(meal));
        }

        return Array.from(merged.values());
    }

    /**
     * Convert domain moment to store format
     */
    private convertDomainMomentToStore(moment: GutMoment): any {
        return {
            id: moment.id,
            timestamp: moment.timestamp,
            bristolType: moment.bristolType?.getValue(),
            symptoms: moment.symptoms,
            tags: moment.tags,
            urgency: moment.urgency?.getValue(),
            painScore: moment.painScore?.getValue(),
            notes: moment.notes,
            duration: moment.duration,
            incompleteEvacuation: moment.incompleteEvacuation,
        };
    }

    /**
     * Convert domain meal to store format
     */
    private convertDomainMealToStore(meal: Meal): any {
        return {
            id: meal.id,
            timestamp: meal.timestamp,
            mealType: meal.mealType.getValue(),
            name: meal.name,
            foods: meal.foods,
            description: meal.description,
            portionSize: meal.portionSize?.getValue(),
            foodTags: meal.foodTags,
            normalizedFoods: meal.normalizedFoods,
        };
    }
}
