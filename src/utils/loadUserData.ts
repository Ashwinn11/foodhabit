import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../config/supabase';
import { useOnboardingStore } from '../store/onboardingStore';
import { useGutStore } from '../store/useGutStore';

/**
 * Load user data from Supabase on app start
 * This replaces AsyncStorage as the source of truth
 */
export const loadUserDataFromDatabase = async () => {
    try {
        const {
            data: { session },
        } = await supabase.auth.getSession();

        if (!session?.user?.id) {
            console.log('No user session, skipping data load');
            return false;
        }

        const userId = session.user.id;

        // Load user profile and onboarding status
        const { data: userProfile, error: profileError } = await supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();

        if (profileError) {
            console.error('Failed to load user profile:', profileError);
            return false;
        }

        // Set onboarding status
        if (userProfile) {
            const onboardingStore = useOnboardingStore.getState();
            if (userProfile.onboarding_completed) {
                onboardingStore.completeOnboarding();
            }
            // Note: We don't restore quiz answers since onboarding is one-time
        }

        // Load recent gut logs (last 30 days of significant logs)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const { data: gutLogs, error: logsError } = await supabase
            .from('gut_logs')
            .select('*')
            .eq('user_id', userId)
            .gte('timestamp', thirtyDaysAgo.toISOString())
            .order('timestamp', { ascending: false })
            .limit(100);

        if (logsError) {
            console.error('Failed to load gut logs:', logsError);
        } else if (gutLogs && gutLogs.length > 0) {
            // Convert database format to app format
            const gutStore = useGutStore.getState();
            const moments = gutLogs.map((log) => ({
                id: log.id,
                timestamp: new Date(log.timestamp),
                bristolType: log.bristol_type,
                symptoms: log.symptoms || {
                    bloating: false,
                    gas: false,
                    cramping: false,
                    nausea: false,
                },
                tags: log.tags || [],
                urgency: log.urgency,
                painScore: log.pain_score,
                notes: log.notes,
            }));
            gutStore.setGutMoments(moments);
        }

        // Load recent meals (last 30 days)
        const { data: meals, error: mealsError } = await supabase
            .from('meals')
            .select('*')
            .eq('user_id', userId)
            .gte('timestamp', thirtyDaysAgo.toISOString())
            .order('timestamp', { ascending: false })
            .limit(100);

        if (mealsError) {
            console.error('Failed to load meals:', mealsError);
        } else if (meals && meals.length > 0) {
            const gutStore = useGutStore.getState();
            const mealEntries = meals.map((meal) => ({
                id: meal.id,
                timestamp: new Date(meal.timestamp),
                mealType: meal.meal_type,
                name: meal.name,
                foods: meal.foods || [],
                portionSize: meal.portion_size,
                description: meal.description,
                foodTags: meal.food_tags || [],
            }));
            gutStore.setMeals(mealEntries);
        }
        // Load trigger foods
        const { data: triggerFoods, error: triggersError } = await supabase
            .from('trigger_foods')
            .select('*')
            .eq('user_id', userId);

        if (triggersError) {
            console.error('Failed to load trigger foods:', triggersError);
        } else if (triggerFoods && triggerFoods.length > 0) {
            const gutStore = useGutStore.getState();
            const triggers = triggerFoods.map((trigger) => ({
                foodName: trigger.food_name,
                userConfirmed: trigger.user_confirmed,
                timestamp: new Date(trigger.created_at),
            }));
            gutStore.setTriggerFeedback(triggers);
        }

        // Load health logs (water, fiber, probiotic, exercise) - last 30 days
        const { data: healthLogs, error: healthLogsError } = await supabase
            .from('health_logs')
            .select('*')
            .eq('user_id', userId)
            .gte('date', thirtyDaysAgo.toISOString().split('T')[0])
            .order('date', { ascending: false });

        if (healthLogsError) {
            console.error('Failed to load health logs:', healthLogsError);
        } else if (healthLogs && healthLogs.length > 0) {
            const gutStore = useGutStore.getState();

            // Group by log type
            const waterLogs: { date: string; glasses: number }[] = [];
            const fiberLogs: { date: string; grams: number }[] = [];
            const probioticLogs: { date: string; servings: number }[] = [];
            const exerciseLogs: { date: string; minutes: number }[] = [];

            healthLogs.forEach((log) => {
                const date = log.date;
                const value = parseFloat(log.value);

                switch (log.log_type) {
                    case 'water':
                        waterLogs.push({ date, glasses: value });
                        break;
                    case 'fiber':
                        fiberLogs.push({ date, grams: value });
                        break;
                    case 'probiotic':
                        probioticLogs.push({ date, servings: value });
                        break;
                    case 'exercise':
                        exerciseLogs.push({ date, minutes: value });
                        break;
                }
            });

            // Update store with loaded data
            gutStore.waterLogs = waterLogs;
            gutStore.fiberLogs = fiberLogs;
            gutStore.probioticLogs = probioticLogs;
            gutStore.exerciseLogs = exerciseLogs;
        }

        // Load dismissed alerts from AsyncStorage
        try {
            const dismissedAlertsJson = await AsyncStorage.getItem('dismissedAlerts');
            if (dismissedAlertsJson) {
                const dismissedAlerts = JSON.parse(dismissedAlertsJson);
                const gutStore = useGutStore.getState();
                gutStore.dismissedAlerts = dismissedAlerts;
            }
        } catch (error) {
            console.error('Failed to load dismissed alerts:', error);
        }

        // Sync widget after all data is loaded (fixes widget showing 0/no data)
        // This ensures the widget shows correct gut score and poop history
        // even for new users (default score of 50) or after app restart
        try {
            const gutStore = useGutStore.getState();
            await gutStore.syncWidget();
        } catch (error) {
            console.error('Failed to sync widget after data load:', error);
        }

        console.log('✅ User data loaded from database successfully');
        return true;
    } catch (error) {
        console.error('Failed to load user data from database:', error);
        return false;
    }
};
