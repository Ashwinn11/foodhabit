/**
 * useGutActions Hook
 * Provides clean architecture actions using use cases
 * This hook replaces direct store mutations with use case execution
 */
import { useState, useCallback } from 'react';
import { container } from '../../infrastructure/di';
import { useAuth } from '../../hooks/useAuth';
import { useGutStore } from '../../store';

export interface LogGutMomentInput {
    bristolType?: number;
    symptoms?: {
        bloating?: boolean;
        gas?: boolean;
        cramping?: boolean;
        nausea?: boolean;
    };
    tags?: string[];
    urgency?: 'none' | 'mild' | 'severe';
    painScore?: number;
    notes?: string;
    duration?: number;
    incompleteEvacuation?: boolean;
}

export interface LogMealInput {
    mealType: string;
    name: string;
    foods: string[];
    description?: string;
    portionSize?: string;
    foodTags?: string[];
    normalizedFoods?: string[];
    nutrition?: {
        calories?: number;
        protein?: number;
        carbs?: number;
        fat?: number;
        fiber?: number;
        sugar?: number;
        sodium?: number;
    };
}

export interface UseGutActionsReturn {
    // Gut moment actions
    logGutMoment: (input: LogGutMomentInput) => Promise<boolean>;
    deleteGutMoment: (momentId: string) => Promise<boolean>;

    // Meal actions
    logMeal: (input: LogMealInput) => Promise<boolean>;

    // Loading states
    isLogging: boolean;
    error: string | null;
}

/**
 * Hook that provides clean architecture actions
 * Uses use cases for business logic and maintains store sync
 */
export function useGutActions(): UseGutActionsReturn {
    const { session } = useAuth();
    const userId = session?.user?.id ?? null;

    // Get use cases from container
    const logGutMomentUseCase = container.logGutMomentUseCase;
    const deleteGutMomentUseCase = container.deleteGutMomentUseCase;
    const logMealUseCase = container.logMealUseCase;


    // Get store for local state sync
    const {
        addGutMoment,
        deleteGutMoment: storeDeleteGutMoment,
        addMeal,
    } = useGutStore();

    const [isLogging, setIsLogging] = useState(false);
    const [error, setError] = useState<string | null>(null);

    /**
     * Log a gut moment using the use case
     */
    const logGutMoment = useCallback(async (input: LogGutMomentInput): Promise<boolean> => {
        setIsLogging(true);
        setError(null);

        try {
            // First update local store (optimistic update)
            // Cast bristolType to store's expected type
            addGutMoment({
                timestamp: new Date(),
                bristolType: input.bristolType as any,
                symptoms: {
                    bloating: input.symptoms?.bloating ?? false,
                    gas: input.symptoms?.gas ?? false,
                    cramping: input.symptoms?.cramping ?? false,
                    nausea: input.symptoms?.nausea ?? false,
                },
                tags: input.tags as any,
                urgency: input.urgency,
                painScore: input.painScore,
                notes: input.notes,
                duration: input.duration,
                incompleteEvacuation: input.incompleteEvacuation,
            });

            // If user is authenticated, also persist via use case
            if (userId) {
                await logGutMomentUseCase.execute(userId, {
                    bristolType: input.bristolType,
                    symptoms: {
                        bloating: input.symptoms?.bloating ?? false,
                        gas: input.symptoms?.gas ?? false,
                        cramping: input.symptoms?.cramping ?? false,
                        nausea: input.symptoms?.nausea ?? false,
                    },
                    tags: [],
                    urgency: input.urgency || 'none',
                    painScore: input.painScore,
                    notes: input.notes,
                    duration: input.duration,
                    incompleteEvacuation: input.incompleteEvacuation,
                });
            }

            return true;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to log gut moment');
            return false;
        } finally {
            setIsLogging(false);
        }
    }, [userId, addGutMoment, logGutMomentUseCase]);

    /**
     * Delete a gut moment using the use case
     */
    const deleteGutMoment = useCallback(async (momentId: string): Promise<boolean> => {
        setIsLogging(true);
        setError(null);

        try {
            // Update local store first
            storeDeleteGutMoment(momentId);

            // If user is authenticated, also delete via use case
            if (userId) {
                await deleteGutMomentUseCase.execute(userId, momentId);
            }

            return true;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete gut moment');
            return false;
        } finally {
            setIsLogging(false);
        }
    }, [userId, storeDeleteGutMoment, deleteGutMomentUseCase]);

    /**
     * Log a meal using the use case
     */
    const logMeal = useCallback(async (input: LogMealInput): Promise<boolean> => {
        setIsLogging(true);
        setError(null);

        try {
            // Update local store first
            addMeal({
                timestamp: new Date(),
                mealType: input.mealType as any,
                name: input.name,
                foods: input.foods,
                description: input.description,
                portionSize: input.portionSize as any,
                foodTags: input.foodTags,
                normalizedFoods: input.normalizedFoods,
                nutrition: input.nutrition,
            });

            // If user is authenticated, also persist via use case
            if (userId) {
                await logMealUseCase.execute(userId, input);
            }

            return true;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to log meal');
            return false;
        } finally {
            setIsLogging(false);
        }
    }, [userId, addMeal, logMealUseCase]);

    return {
        logGutMoment,
        deleteGutMoment,
        logMeal,
        isLogging,
        error,
    };
}

export default useGutActions;
