/**
 * useMeals Hook
 * React hook for meal operations using the new architecture
 */
import { useState, useEffect, useCallback } from 'react';
import { Meal, CreateMealInput } from '../../domain';
import { container } from '../../infrastructure/di';

interface UseMealsState {
    meals: Meal[];
    loading: boolean;
    error: Error | null;
}

interface UseMealsReturn extends UseMealsState {
    logMeal: (input: CreateMealInput) => Promise<Meal>;
    deleteMeal: (id: string) => Promise<void>;
    refresh: () => Promise<void>;
    todaysMeals: Meal[];
}

/**
 * Hook for managing meals
 */
export function useMeals(userId: string | null): UseMealsReturn {
    const [state, setState] = useState<UseMealsState>({
        meals: [],
        loading: true,
        error: null,
    });

    const logUseCase = container.logMealUseCase;
    const getUseCase = container.getMealsUseCase;
    const deleteUseCase = container.deleteMealUseCase;

    // Fetch meals
    const fetchMeals = useCallback(async () => {
        if (!userId) {
            setState({ meals: [], loading: false, error: null });
            return;
        }

        setState(prev => ({ ...prev, loading: true, error: null }));

        try {
            const meals = await getUseCase.execute(userId);
            setState({ meals, loading: false, error: null });
        } catch (error) {
            setState(prev => ({
                ...prev,
                loading: false,
                error: error instanceof Error ? error : new Error('Failed to load meals')
            }));
        }
    }, [userId, getUseCase]);

    useEffect(() => {
        fetchMeals();
    }, [fetchMeals]);

    // Log a meal
    const logMeal = useCallback(async (input: CreateMealInput): Promise<Meal> => {
        if (!userId) throw new Error('User not authenticated');

        const result = await logUseCase.execute(userId, input);

        setState(prev => ({
            ...prev,
            meals: [result.meal, ...prev.meals],
        }));

        return result.meal;
    }, [userId, logUseCase]);

    // Delete a meal
    const deleteMeal = useCallback(async (id: string): Promise<void> => {
        if (!userId) throw new Error('User not authenticated');

        await deleteUseCase.execute(userId, id);

        setState(prev => ({
            ...prev,
            meals: prev.meals.filter(m => m.id !== id),
        }));
    }, [userId, deleteUseCase]);

    // Filter today's meals
    const todaysMeals = state.meals.filter(m => m.isToday);

    return {
        ...state,
        logMeal,
        deleteMeal,
        refresh: fetchMeals,
        todaysMeals,
    };
}

/**
 * Hook for today's meals only
 */
export function useTodayMeals(userId: string | null) {
    const [meals, setMeals] = useState<Meal[]>([]);
    const [loading, setLoading] = useState(true);

    const getUseCase = container.getMealsUseCase;

    useEffect(() => {
        if (!userId) {
            setMeals([]);
            setLoading(false);
            return;
        }

        getUseCase.getToday(userId)
            .then(setMeals)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [userId, getUseCase]);

    return { meals, loading };
}
