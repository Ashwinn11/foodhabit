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
        // Use maybeSingle() to avoid PGRST116 error if user is new
        let { data: userProfile, error: profileError } = await supabase
            .from('users')
            .select('id, onboarding_completed, onboarding_data, created_at')
            .eq('id', userId)
            .maybeSingle();

        if (profileError) {
            console.error('Failed to load user profile:', profileError);
            return false;
        }

        // If no profile exists, create a default one
        if (!userProfile) {
            console.log('No user profile found, creating default...');
            const { data: newProfile, error: insertError } = await supabase
                .from('users')
                .insert([
                    {
                        id: userId,
                        onboarding_completed: false,
                        onboarding_data: { score: 50 },
                        created_at: new Date().toISOString()
                    }
                ])
                .select()
                .maybeSingle();

            if (insertError) {
                console.error('Failed to create default user profile:', insertError);
                // Continue anyway so the user isn't stuck, they'll just have default local state
            } else {
                userProfile = newProfile;
            }
        }

        // Set onboarding status and baseline score
        if (userProfile) {
            const onboardingStore = useOnboardingStore.getState();
            const gutStore = useGutStore.getState();

            if (userProfile.onboarding_completed) {
                onboardingStore.setIsOnboardingComplete(true);
            }

            // Load onboarding data: baseline score, regularity, and calorie goal
            const onboardingData = userProfile.onboarding_data as { score?: number; calorieGoal?: number; answers?: any } | null;
            if (onboardingData?.score) {
                gutStore.setBaselineScore(onboardingData.score);
            }
            if (onboardingData?.answers?.bowelRegularity !== undefined) {
                gutStore.setBaselineRegularity(onboardingData.answers.bowelRegularity);
            }

            // Load or recalculate calorie goal
            let calorieGoal = onboardingData?.calorieGoal;
            if (!calorieGoal && onboardingData?.answers?.age && onboardingData?.answers?.height && onboardingData?.answers?.weight && onboardingData?.answers?.gender) {
                // Recalculate if missing
                const { calculateDailyCalories } = await import('../utils/calorieCalculator');
                calorieGoal = calculateDailyCalories({
                    age: onboardingData.answers.age,
                    height: onboardingData.answers.height,
                    weight: onboardingData.answers.weight,
                    gender: onboardingData.answers.gender,
                    activityLevel: 'moderate'
                });
            }
            if (calorieGoal) {
                gutStore.setCalorieGoal(calorieGoal);
            }
        }

        // Parallelize all independent data loads
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const [gutLogsResult, mealsResult, triggerFoodsResult, healthLogsResult, dismissedAlertsResult] = await Promise.all([
            // Load recent gut logs (last 30 days)
            supabase
                .from('gut_logs')
                .select('*')
                .eq('user_id', userId)
                .gte('timestamp', thirtyDaysAgo.toISOString())
                .order('timestamp', { ascending: false })
                .limit(100),
            // Load recent meals (last 30 days)
            supabase
                .from('meals')
                .select('*')
                .eq('user_id', userId)
                .gte('timestamp', thirtyDaysAgo.toISOString())
                .order('timestamp', { ascending: false })
                .limit(100),
            // Load trigger foods
            supabase
                .from('trigger_foods')
                .select('*')
                .eq('user_id', userId),
            // Load health logs (water, fiber, probiotic, exercise) - last 30 days
            supabase
                .from('health_logs')
                .select('*')
                .eq('user_id', userId)
                .gte('date', thirtyDaysAgo.toISOString().split('T')[0])
                .order('date', { ascending: false }),
            // Load dismissed alerts from AsyncStorage
            AsyncStorage.getItem('dismissedAlerts').catch(error => {
                console.error('Failed to load dismissed alerts:', error);
                return null;
            })
        ]);

        // Process gut logs
        const { data: gutLogs, error: logsError } = gutLogsResult;
        if (logsError) {
            console.error('Failed to load gut logs:', logsError);
        } else if (gutLogs && gutLogs.length > 0) {
            const gutStore = useGutStore.getState();

            // Separate bowel movements from standalone symptom logs
            const bowelMovements = gutLogs
                .filter(log => log.bristol_type !== null)
                .map((log) => ({
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
                    duration: log.duration,
                    incompleteEvacuation: log.incomplete_evacuation,
                }));

            const standaloneSymptoms = gutLogs
                .filter(log => log.bristol_type === null)
                .map((log) => {
                    // Extract the primary symptom from JSONB
                    const symptomTypes = Object.keys(log.symptoms || {}) as any[];
                    return {
                        id: log.id,
                        timestamp: new Date(log.timestamp),
                        type: symptomTypes[0] || 'bloating', // Default fallback
                        severity: log.pain_score || 0,
                        notes: log.notes,
                    };
                });

            gutStore.setGutMoments(bowelMovements);
            gutStore.setSymptomLogs(standaloneSymptoms);
        }

        // Process meals
        const { data: meals, error: mealsError } = mealsResult;
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
                normalizedFoods: meal.normalized_foods || [],
                nutrition: meal.nutrition || {},
            }));
            gutStore.setMeals(mealEntries);
        }

        // Process trigger foods
        const { data: triggerFoods, error: triggersError } = triggerFoodsResult;
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

        // Process health logs
        const { data: healthLogs, error: healthLogsError } = healthLogsResult;
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
            gutStore.setWaterLogs(waterLogs);
            gutStore.setFiberLogs(fiberLogs);
            gutStore.setProbioticLogs(probioticLogs);
            gutStore.setExerciseLogs(exerciseLogs);
        }

        // Process dismissed alerts
        try {
            if (dismissedAlertsResult) {
                const dismissedAlerts = JSON.parse(dismissedAlertsResult);
                const gutStore = useGutStore.getState();
                gutStore.dismissedAlerts = dismissedAlerts;
            }
        } catch (error) {
            console.error('Failed to parse dismissed alerts:', error);
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
