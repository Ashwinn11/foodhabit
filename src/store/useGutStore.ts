import { Alert, Platform } from 'react-native';
import SharedGroupPreferences from 'react-native-shared-group-preferences';
import { ExtensionStorage } from '@bacons/apple-targets';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { supabase } from '../config/supabase';
import { useUIStore } from './useUIStore';
import { useNotificationStore } from './useNotificationStore';
import { analyzeFoodWithAI, getLowFODMAPAlternatives } from '../services/fodmapService';

import { colors } from '../theme/theme';
import { Trigger, CombinationTrigger } from '../domain/entities';

// Types for gut tracking
export type BristolType = 1 | 2 | 3 | 4 | 5 | 6 | 7;
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'drink';
export type UrgencyLevel = 'none' | 'mild' | 'severe';
export type PortionSize = 'small' | 'medium' | 'large';
export type SymptomType = 'bloating' | 'gas' | 'cramping' | 'nausea' | 'reflux' | 'diarrhea' | 'constipation';

export interface GutMoment {
    id: string;
    timestamp: Date;
    bristolType?: BristolType;
    notes?: string;
    symptoms: {
        bloating: boolean;
        gas: boolean;
        cramping: boolean;
        nausea: boolean;
    };
    tags?: ('strain' | 'blood' | 'mucus' | 'urgency')[];
    // Enhanced fields
    urgency?: UrgencyLevel;
    painScore?: number; // 0-10
    incompleteEvacuation?: boolean;
    duration?: number; // minutes
}

export interface MealEntry {
    id: string;
    timestamp: Date;
    mealType: MealType;
    name: string;
    description?: string;
    foods: string[];
    // Enhanced fields
    portionSize?: PortionSize;
    foodTags?: string[]; // spicy, dairy, gluten, fried, caffeine, alcohol, high-fat
    // AI-normalized foods for trigger detection (corrected spelling + base ingredients)
    normalizedFoods?: string[];
    // Nutrition data from AI analysis
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

// Standalone symptom logging (not tied to bowel movements)
export interface SymptomLog {
    id: string;
    timestamp: Date;
    type: SymptomType;
    severity: number; // 0-10
    duration?: number; // minutes
    notes?: string;
}

// Trigger feedback from users
export interface TriggerFeedback {
    foodName: string;
    userConfirmed: boolean | null; // true = yes, false = no, null = not answered
    timestamp: Date;
    notes?: string;
}

export interface DailyTask {
    id: string;
    title: string;
    subtitle: string;
    completed: boolean;
    type: 'poop' | 'meal' | 'symptom' | 'water' | 'fiber' | 'probiotic' | 'exercise';
}

export interface WaterLog {
    date: string; // ISO date string YYYY-MM-DD
    glasses: number;
}

export interface UserProfile {
    name: string;
    streak: number;
    totalLogs: number;
}

interface GutStore {
    // User
    user: UserProfile;
    setUser: (user: Partial<UserProfile>) => void;

    // Baseline score from onboarding (used for blended scoring)
    baselineScore: number;
    setBaselineScore: (score: number) => void;

    // Baseline regularity from onboarding (0=Regular, 1=Somewhat, 2=Unpredictable)
    baselineRegularity: number;
    setBaselineRegularity: (regularity: number) => void;

    // Daily calorie goal from onboarding demographics
    calorieGoal: number;
    setCalorieGoal: (goal: number) => void;

    // Gut moments (poop logs)
    gutMoments: GutMoment[];
    addGutMoment: (moment: Omit<GutMoment, 'id'>) => void;
    updateGutMoment: (id: string, moment: Partial<GutMoment>) => void;
    deleteGutMoment: (id: string) => void;
    setGutMoments: (moments: GutMoment[]) => void;

    // Meals
    meals: MealEntry[];
    addMeal: (meal: Omit<MealEntry, 'id'>) => void;
    updateMeal: (id: string, meal: Partial<MealEntry>) => void;
    deleteMeal: (id: string) => void;
    setMeals: (meals: MealEntry[]) => void;

    // Daily tasks
    dailyTasks: DailyTask[];
    resetDailyTasks: () => void;
    getDynamicTasks: () => DailyTask[];

    // Water tracking
    waterLogs: WaterLog[];
    addWater: (showToast?: boolean) => void;
    getTodayWater: () => number;

    // Fiber tracking
    fiberLogs: { date: string; grams: number }[];
    addFiber: (grams: number, showToast?: boolean) => void;
    getTodayFiber: () => number;

    // Probiotic tracking
    probioticLogs: { date: string; servings: number }[];
    addProbiotic: () => void;
    getTodayProbiotics: () => number;

    // Exercise tracking
    exerciseLogs: { date: string; minutes: number }[];
    addExercise: (minutes: number) => void;
    getTodayExercise: () => number;

    // Standalone symptom logs
    symptomLogs: SymptomLog[]; // Standalone symptom logs
    addSymptomLog: (log: Omit<SymptomLog, 'id'>) => void;
    deleteSymptomLog: (id: string) => void;
    setSymptomLogs: (logs: SymptomLog[]) => void;

    // Mission Tracking
    completedTasks: string[]; // IDs of daily missions completed by user
    lastTasksUpdateDate: string; // YYYY-MM-DD
    toggleTask: (id: string) => void;
    loadCompletedTasks: () => Promise<void>;

    // Setters for health logs
    setWaterLogs: (logs: WaterLog[]) => void;
    setFiberLogs: (logs: { date: string; grams: number }[]) => void;
    setProbioticLogs: (logs: { date: string; servings: number }[]) => void;
    setExerciseLogs: (logs: { date: string; minutes: number }[]) => void;

    // Trigger feedback
    triggerFeedback: TriggerFeedback[];
    addTriggerFeedback: (feedback: TriggerFeedback) => void;
    setTriggerFeedback: (feedback: TriggerFeedback[]) => void;
    getTriggerFeedback: (foodName: string) => TriggerFeedback | undefined;

    // Detected Triggers (Cached for performance)
    detectedTriggers: Trigger[];
    combinationTriggers: CombinationTrigger[];
    setDetectedTriggers: (triggers: Trigger[]) => void;
    setCombinationTriggers: (triggers: CombinationTrigger[]) => void;
    refreshTriggers: () => Promise<void>;

    // Computed
    getRecentMoments: (count: number) => GutMoment[];
    getTodaysMeals: () => MealEntry[];
    getStats: () => {
        avgFrequency: number;
        longestStreak: number;
        lastPoopTime: Date | null;
        totalPoops: number;
    };
    // Pattern detection
    getPotentialTriggers: () => {
        food: string;
        count: number;
        probability: number;
        symptoms: string[];
        frequencyText: string;
    }[];
    getEnhancedTriggers: () => Promise<{
        food: string;
        occurrences: number;
        symptomOccurrences: number;
        confidence: 'Low' | 'Medium' | 'High';
        frequencyText: string;
        avgLatencyHours: number;
        symptoms: string[];
        userFeedback?: boolean | null;
        fodmapIssues?: {
            level: 'high' | 'moderate' | 'low';
            categories: string[];
        };
        alternatives?: string[];
    }[]>;
    getCombinationTriggers: () => {
        foods: string[];
        occurrences: number;
        symptomOccurrences: number;
        confidence: 'Low' | 'Medium' | 'High';
        frequencyText: string;
    }[];
    checkMedicalAlerts: () => {
        hasAlerts: boolean;
        alerts: { type: string; message: string; severity: 'warning' | 'critical' }[];
    };
    getPoopHistoryData: () => { date: string; count: number }[];
    getGutHealthScore: () => {
        score: number;
        grade: string;
        breakdown?: {
            bristol: number;
            symptoms: number;
            regularity: number;
            medical: number;
        };
    };
    exportData: () => Promise<void>;

    // Notifications
    notificationSettings: {
        enabled: boolean;
        reminderTime: { hour: number; minute: number };
    };
    setNotificationSettings: (settings: Partial<{ enabled: boolean; reminderTime: { hour: number; minute: number } }>) => void;

    // Alert Management
    dismissedAlerts: Record<string, string>; // type -> timestamp string of the latest log that was dimissed (or dismissal time for state-based)
    dismissAlert: (type: string) => void;

    // Quick log helpers
    quickLogPoop: (bristolType?: BristolType) => void;

    // Widget Sync
    syncWidget: () => Promise<void>;
}

const APP_GROUP_IDENTIFIER = 'group.com.foodhabit.app';

const generateId = () => Math.random().toString(36).substring(2, 15);

// Helper to calculate the current consecutive poop streak
const calculateCurrentStreak = (moments: GutMoment[]) => {
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 365; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(checkDate.getDate() - i);

        const hasPoopOnDate = moments.some(m => {
            const mDate = new Date(m.timestamp);
            mDate.setHours(0, 0, 0, 0);
            return mDate.getTime() === checkDate.getTime();
        });

        if (hasPoopOnDate) {
            streak++;
        } else if (i > 0) {
            // Allow today to be empty (user might not have pooped yet)
            break;
        }
    }
    return streak;
};

// Helper to get today's date string
const getTodayString = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
};

// Generate dynamic daily tasks based on current state
const createDailyTasks = (state: {
    gutMoments: GutMoment[];
    meals: MealEntry[];
    waterLogs: WaterLog[];
    fiberLogs?: { date: string; grams: number }[];
    probioticLogs?: { date: string; servings: number }[];
    exerciseLogs?: { date: string; minutes: number }[];
    healthScore: number;
    completedTasks?: string[];
}): DailyTask[] => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const completedIds = state.completedTasks || [];

    // 1. Check for recent symptoms (Last 24 hours)
    const recentMoments = state.gutMoments.filter(m => {
        const diff = Date.now() - new Date(m.timestamp).getTime();
        return diff < 24 * 60 * 60 * 1000;
    });

    const isBloated = recentMoments.some(m => m.symptoms.bloating || m.symptoms.gas);
    const isConstipated = recentMoments.some(m => m.bristolType === 1 || m.bristolType === 2);
    const isDiarrhea = recentMoments.some(m => m.bristolType === 6 || m.bristolType === 7);
    const isLowScore = state.healthScore < 70;

    // Check if user has logged poop today
    const hasPoopToday = recentMoments.some(m => {
        const mDate = new Date(m.timestamp);
        mDate.setHours(0, 0, 0, 0);
        return mDate.getTime() === today.getTime();
    });

    const tasks: DailyTask[] = [];

    // --- PRIORITY 1: RECOVERY MISSIONS (Triggered by Symptoms) ---

    if (isBloated) {
        tasks.push({
            id: 'tea',
            title: 'Drink Peppermint Tea',
            subtitle: 'Soothe that bloat 🍵',
            completed: completedIds.includes('tea'),
            type: 'water',
        });
    }

    if (isConstipated) {
        tasks.push({
            id: 'kiwi',
            title: 'Eat a Kiwi 🥝',
            subtitle: "Nature's laxative",
            completed: completedIds.includes('kiwi'),
            type: 'fiber',
        });
    }

    if (isDiarrhea) {
        tasks.push({
            id: 'brat',
            title: 'Eat Plain Rice/Toast',
            subtitle: 'Go easy on the gut',
            completed: false,
            type: 'meal',
        });
    }

    // --- PRIORITY 2: CORE MAINTENANCE (Triggered by Needs) ---

    // Anchor Habit: Always track poop (unless already done? No, keep it as a button to log *another* one if needed, but maybe not as a 'todo' if done)
    // Actually, for strict personalization: "Log Poop" is always relevant.
    tasks.push({
        id: 'poop',
        title: 'Log Poop',
        subtitle: hasPoopToday ? 'Mission Accomplished!' : 'Track your gut',
        completed: hasPoopToday,
        type: 'poop',
    });

    // Hydration: Only if issues or low score
    if (isConstipated || isDiarrhea || isLowScore) {
        const todayWater = state.waterLogs.find(w => w.date === getTodayString())?.glasses || 0;
        const waterGoal = 8;
        tasks.push({
            id: 'water',
            title: 'Hydrate (Recovery)',
            subtitle: todayWater >= waterGoal ? 'Hydrated!' : `${todayWater}/${waterGoal} glasses`,
            completed: todayWater >= waterGoal,
            type: 'water',
        });
    }

    // Fiber: Only if constipated or low score
    if (isConstipated || isLowScore) {
        const fiberGoal = 25;
        const todayFiber = state.fiberLogs?.find(f => f.date === getTodayString())?.grams || 0;
        tasks.push({
            id: 'fiber',
            title: 'Boost Fiber',
            subtitle: todayFiber >= fiberGoal ? 'Fiber Power!' : `${todayFiber}/${fiberGoal}g needed`,
            completed: todayFiber >= fiberGoal,
            type: 'fiber',
        });
    }

    return tasks;
};

export const useGutStore = create<GutStore>()((set, get) => ({
    // User
    user: {
        name: 'Gut Buddy',
        streak: 0,
        totalLogs: 0,
    },
    setUser: (userData) => set((state) => ({ user: { ...state.user, ...userData } })),

    // Baseline score from onboarding (default 50, updated when user completes onboarding)
    baselineScore: 50,
    setBaselineScore: (score) => set({ baselineScore: score }),

    // Baseline regularity from onboarding (default 1=Somewhat regular)
    baselineRegularity: 1,
    setBaselineRegularity: (regularity) => set({ baselineRegularity: regularity }),

    // Daily calorie goal from onboarding (default 2000)
    calorieGoal: 2000,
    setCalorieGoal: (goal) => set({ calorieGoal: goal }),

    // Notifications
    notificationSettings: {
        enabled: false,
        reminderTime: { hour: 19, minute: 0 },
    },
    setNotificationSettings: (settings) => set((state) => ({
        notificationSettings: { ...state.notificationSettings, ...settings }
    })),

    // Gut moments (start empty)
    gutMoments: [],
    detectedTriggers: [],
    combinationTriggers: [],

    setDetectedTriggers: (triggers) => set({ detectedTriggers: triggers }),
    setCombinationTriggers: (triggers) => set({ combinationTriggers: triggers }),
    refreshTriggers: async () => {
        try {
            const { supabase } = await import('../config/supabase');
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.user?.id) return;

            const { container } = await import('../infrastructure/di');
            const [triggers, combos] = await Promise.all([
                container.detectTriggersUseCase.execute(session.user.id),
                container.detectCombinationTriggersUseCase.execute(session.user.id),
            ]);

            set({
                detectedTriggers: triggers,
                combinationTriggers: combos,
            });
        } catch (error) {
            console.error('Failed to refresh triggers in store:', error);
        }
    },

    addGutMoment: (moment) => set((state) => {
        const newMoment = { ...moment, id: generateId() };
        const newMoments = [newMoment, ...state.gutMoments];

        // Check if this is the first poop today
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const poopsToday = state.gutMoments.filter(m => {
            const mDate = new Date(m.timestamp);
            mDate.setHours(0, 0, 0, 0);
            return mDate.getTime() === today.getTime();
        }).length;

        if (poopsToday === 0) {
            useUIStore.getState().showToast({
                message: 'Mission Plop-plete!',
                icon: '✨',
                iconColor: colors.white
            });
            useNotificationStore.getState().addNotification({
                title: 'Mission Plop-plete! 💩',
                body: "You've logged your first gut moment of the day. Keep it up!",
                type: 'achievement'
            });
        } else {
            useUIStore.getState().showToast({
                message: 'Poop logged!',
                icon: '💩',
                iconColor: colors.white
            });
        }

        // Sync to Supabase
        // Direct DB Write (Fire & Forget with Error Handling)
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user?.id) {
                supabase.from('gut_logs').insert({
                    user_id: session.user.id,
                    timestamp: newMoment.timestamp.toISOString(),
                    bristol_type: newMoment.bristolType,
                    symptoms: newMoment.symptoms || {},
                    tags: newMoment.tags || [],
                    urgency: newMoment.urgency,
                    pain_score: newMoment.painScore,
                    notes: newMoment.notes,
                    duration: newMoment.duration,
                    incomplete_evacuation: newMoment.incompleteEvacuation,
                }).then(({ error }) => {
                    if (error) {
                        console.error('DB Write Failed:', error.message, error.details || '');
                        // Optional: Show toast or handle offline persistence here if prompted in future
                    } else {

                    }
                });
            }
        });

        // Trigger widget sync after state update
        setTimeout(() => get().syncWidget(), 0);

        return {
            gutMoments: newMoments,
            user: {
                ...state.user,
                streak: calculateCurrentStreak(newMoments),
                totalLogs: newMoments.length,
            },
        };
    }),
    updateGutMoment: (id, moment) => {
        set((state) => ({
            gutMoments: state.gutMoments.map((m) =>
                m.id === id ? { ...m, ...moment } : m
            ),
        }));
        get().syncWidget();
    },
    deleteGutMoment: (id) => {
        set((state) => {
            const newMoments = state.gutMoments.filter((m) => m.id !== id);
            return {
                gutMoments: newMoments,
                user: {
                    ...state.user,
                    streak: calculateCurrentStreak(newMoments),
                    totalLogs: newMoments.length,
                },
            };
        });
        get().syncWidget();
    },
    setGutMoments: (moments) => {
        set((state) => ({
            gutMoments: moments,
            user: {
                ...state.user,
                streak: calculateCurrentStreak(moments),
                totalLogs: moments.length,
            },
        }));
        get().syncWidget();
    },

    quickLogPoop: (bristolType = 4) => set((state) => {
        const newMoment: GutMoment = {
            id: generateId(),
            timestamp: new Date(),
            bristolType: bristolType as BristolType,
            symptoms: { bloating: false, gas: false, cramping: false, nausea: false },
        };

        const newMoments = [newMoment, ...state.gutMoments];

        // Check if this is the first poop today
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const poopsToday = state.gutMoments.filter(m => {
            const mDate = new Date(m.timestamp);
            mDate.setHours(0, 0, 0, 0);
            return mDate.getTime() === today.getTime();
        }).length;

        if (poopsToday === 0) {
            useUIStore.getState().showToast({
                message: 'Mission Plop-plete!',
                icon: '✨',
                iconColor: colors.white
            });
        } else {
            useUIStore.getState().showToast({
                message: 'Quick plop logged!',
                icon: '💩',
                iconColor: colors.white
            });
        }

        // Direct DB Write
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user?.id) {
                supabase.from('gut_logs').insert({
                    user_id: session.user.id,
                    timestamp: newMoment.timestamp.toISOString(),
                    bristol_type: newMoment.bristolType,
                    symptoms: newMoment.symptoms || {},
                    tags: newMoment.tags || [],
                    urgency: newMoment.urgency,
                    pain_score: newMoment.painScore,
                    notes: newMoment.notes,
                    duration: newMoment.duration,
                    incomplete_evacuation: newMoment.incompleteEvacuation,
                }).then(({ error }) => {
                    if (error) console.error('Quick Log DB Write Failed:', error.message, error.details || '');
                });
            }
        });

        // Helper to trigger widget sync after state update
        setTimeout(() => get().syncWidget(), 0);

        return {
            gutMoments: newMoments,
            user: {
                ...state.user,
                streak: calculateCurrentStreak(newMoments),
                totalLogs: newMoments.length,
            },
        };
    }),

    // Meals (start empty)
    meals: [],
    addMeal: (meal) => set((state) => {
        // Check if this meal type was already logged today
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const mealTypeLogged = state.meals.some(m => {
            const mDate = new Date(m.timestamp);
            mDate.setHours(0, 0, 0, 0);
            return mDate.getTime() === today.getTime() && m.mealType === meal.mealType;
        });

        if (!mealTypeLogged) {
            useUIStore.getState().showToast({
                message: `${meal.mealType.charAt(0).toUpperCase() + meal.mealType.slice(1)} logged!`,
                icon: '🍽️',
                iconColor: colors.white
            });
        }

        const newMeal = { ...meal, id: generateId() };

        // Sync to Supabase
        // Direct DB Write
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user?.id) {
                supabase.from('meals').insert({
                    user_id: session.user.id,
                    timestamp: newMeal.timestamp.toISOString(),
                    meal_type: newMeal.mealType,
                    name: newMeal.name,
                    foods: newMeal.foods || [],
                    portion_size: newMeal.portionSize,
                    description: newMeal.description,
                    food_tags: newMeal.foodTags || [],
                    normalized_foods: newMeal.normalizedFoods || [],
                    nutrition: newMeal.nutrition || {},
                }).then(({ error }) => {
                    if (error) {
                        console.error('Meal DB Write Failed:', error.message, error.details || '');
                    } else {

                    }
                });
            }
        });

        return {
            meals: [newMeal, ...state.meals],
        };
    }),
    updateMeal: (id, meal) => set((state) => ({
        meals: state.meals.map((m) =>
            m.id === id ? { ...m, ...meal } : m
        ),
    })),
    deleteMeal: (id) => set((state) => ({
        meals: state.meals.filter((m) => m.id !== id),
    })),
    setMeals: (meals) => set({ meals }),

    // Water tracking
    waterLogs: [],
    addWater: (showToast = true) => set((state) => {
        const todayStr = getTodayString();
        const existingLog = state.waterLogs.find(w => w.date === todayStr);
        const waterGoal = 8;
        const currentGlasses = existingLog ? existingLog.glasses + 1 : 1;

        if (showToast) {
            // Show toast
            let icon: any = 'water';
            let message = `${currentGlasses}/${waterGoal} glasses. Gulp!`;

            if (currentGlasses === waterGoal) {
                icon = 'trophy';
                message = `Goal reached! Hydrated!`;
                useNotificationStore.getState().addNotification({
                    title: 'Hydration Hero! 💧',
                    body: "You've reached your water goal for today. Your gut will thank you!",
                    type: 'achievement'
                });
            } else if (currentGlasses > waterGoal) {
                icon = 'water';
                message = `Extra hydration logged!`;
            }

            useUIStore.getState().showToast({
                message,
                icon,
                iconColor: colors.white
            });
        }

        // Sync to Supabase
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user?.id) {
                supabase.from('health_logs').upsert({
                    user_id: session.user.id,
                    date: todayStr,
                    log_type: 'water',
                    value: currentGlasses,
                }, { onConflict: 'user_id,date,log_type' }).then(({ error }) => {
                    if (error) console.error('Water log DB write failed:', error.message, error.details || '');
                });
            }
        });

        if (existingLog) {
            return {
                waterLogs: state.waterLogs.map(w =>
                    w.date === todayStr ? { ...w, glasses: w.glasses + 1 } : w
                ),
            };
        } else {
            return {
                waterLogs: [...state.waterLogs, { date: todayStr, glasses: 1 }],
            };
        }
    }),
    getTodayWater: () => {
        const todayStr = getTodayString();
        return get().waterLogs.find(w => w.date === todayStr)?.glasses || 0;
    },

    // Fiber tracking
    fiberLogs: [],
    addFiber: (grams, showToast = true) => set((state) => {
        const todayStr = getTodayString();
        const existingLog = state.fiberLogs.find(f => f.date === todayStr);
        const fiberGoal = 25;
        const currentFiber = (existingLog ? existingLog.grams : 0) + grams;

        if (showToast) {
            useUIStore.getState().showToast({
                message: `+${grams}g Fiber logged!`,
                icon: 'leaf',
                iconColor: colors.white
            });

            if (currentFiber >= fiberGoal && (existingLog ? existingLog.grams : 0) < fiberGoal) {
                useUIStore.getState().showToast({
                    message: `Fiber goal met! Rockstar!`,
                    icon: 'happy',
                    iconColor: colors.white
                });
                useNotificationStore.getState().addNotification({
                    title: 'Fiber Power! 🌾',
                    body: "Fiber goal reached! You're giving your gut the fuel it needs.",
                    type: 'achievement'
                });
            } else if (currentFiber > fiberGoal) {
                useUIStore.getState().showToast({
                    message: `Fiber powerhouse!`,
                    icon: 'sparkles',
                    iconColor: colors.white
                });
            }
        }

        // Sync to Supabase
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user?.id) {
                supabase.from('health_logs').upsert({
                    user_id: session.user.id,
                    date: todayStr,
                    log_type: 'fiber',
                    value: currentFiber,
                }, { onConflict: 'user_id,date,log_type' }).then(({ error }) => {
                    if (error) console.error('Fiber log DB write failed:', error.message, error.details || '');
                });
            }
        });

        if (existingLog) {
            return {
                fiberLogs: state.fiberLogs.map(f =>
                    f.date === todayStr ? { ...f, grams: f.grams + grams } : f
                ),
            };
        } else {
            return {
                fiberLogs: [...state.fiberLogs, { date: todayStr, grams }],
            };
        }
    }),
    getTodayFiber: () => {
        const todayStr = getTodayString();
        return get().fiberLogs.find(f => f.date === todayStr)?.grams || 0;
    },

    // Probiotic tracking
    probioticLogs: [],
    addProbiotic: () => set((state) => {
        const todayStr = getTodayString();
        const existingLog = state.probioticLogs.find(p => p.date === todayStr);
        const currentProbiotics = existingLog ? existingLog.servings + 1 : 1;

        useUIStore.getState().showToast({
            message: currentProbiotics === 1 ? 'Probiotic logged!' : 'More probiotics logged!',
            icon: 'bug',
            iconColor: colors.white
        });

        // Sync to Supabase
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user?.id) {
                supabase.from('health_logs').upsert({
                    user_id: session.user.id,
                    date: todayStr,
                    log_type: 'probiotic',
                    value: currentProbiotics,
                }, { onConflict: 'user_id,date,log_type' }).then(({ error }) => {
                    if (error) console.error('Probiotic log DB write failed:', error.message, error.details || '');
                });
            }
        });

        if (existingLog) {
            return {
                probioticLogs: state.probioticLogs.map(p =>
                    p.date === todayStr ? { ...p, servings: p.servings + 1 } : p
                ),
            };
        } else {
            return {
                probioticLogs: [...state.probioticLogs, { date: todayStr, servings: 1 }],
            };
        }
    }),
    getTodayProbiotics: () => {
        const todayStr = getTodayString();
        return get().probioticLogs.find(p => p.date === todayStr)?.servings || 0;
    },

    // Exercise tracking
    exerciseLogs: [],
    addExercise: (minutes) => set((state) => {
        const todayStr = getTodayString();
        const existingLog = state.exerciseLogs.find(e => e.date === todayStr);
        const exerciseGoal = 30;
        const currentMinutes = (existingLog ? existingLog.minutes : 0) + minutes;

        useUIStore.getState().showToast({
            message: `+${minutes}m Exercise logged!`,
            icon: 'fitness',
            iconColor: colors.yellow
        });

        if (currentMinutes >= exerciseGoal && (existingLog ? existingLog.minutes : 0) < exerciseGoal) {
            useUIStore.getState().showToast({
                message: `Exercise goal reached!`,
                icon: 'medal',
                iconColor: colors.yellow
            });
            useNotificationStore.getState().addNotification({
                title: 'Active Gut! 🏃‍♂️',
                body: "Exercise goal reached! Movement is medicine for your digestion.",
                type: 'achievement'
            });
        }

        // Sync to Supabase
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user?.id) {
                supabase.from('health_logs').upsert({
                    user_id: session.user.id,
                    date: todayStr,
                    log_type: 'exercise',
                    value: currentMinutes,
                }, { onConflict: 'user_id,date,log_type' }).then(({ error }) => {
                    if (error) console.error('Exercise log DB write failed:', error.message, error.details || '');
                });
            }
        });

        if (existingLog) {
            return {
                exerciseLogs: state.exerciseLogs.map(e =>
                    e.date === todayStr ? { ...e, minutes: e.minutes + minutes } : e
                ),
            };
        } else {
            return {
                exerciseLogs: [...state.exerciseLogs, { date: todayStr, minutes }],
            };
        }
    }),
    getTodayExercise: () => {
        const todayStr = getTodayString();
        return get().exerciseLogs.find(e => e.date === todayStr)?.minutes || 0;
    },

    // Bulk setters for health logs
    setWaterLogs: (waterLogs) => set({ waterLogs }),
    setFiberLogs: (fiberLogs) => set({ fiberLogs }),
    setProbioticLogs: (probioticLogs) => set({ probioticLogs }),
    setExerciseLogs: (exerciseLogs) => set({ exerciseLogs }),

    // Standalone symptom logs
    symptomLogs: [],
    addSymptomLog: (log) => set((state) => {
        const newLog = { ...log, id: generateId() };

        // Standalone symptoms are saved to gut_logs with no bristolType
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user?.id) {
                supabase.from('gut_logs').insert({
                    user_id: session.user.id,
                    timestamp: newLog.timestamp.toISOString(),
                    symptoms: { [newLog.type]: true }, // Wrap single symptom in expected JSONB format
                    notes: newLog.notes,
                    pain_score: newLog.severity, // Map severity to pain_score
                    // Standalone logs don't have bristol_type
                }).then(({ error }) => {
                    if (error) console.error('Standalone Symptom DB Write Failed:', error.message, error.details || '');
                });
            }
        });

        return {
            symptomLogs: [newLog, ...state.symptomLogs],
        };
    }),
    deleteSymptomLog: (id) => set((state) => ({
        symptomLogs: state.symptomLogs.filter((s) => s.id !== id),
    })),
    setSymptomLogs: (symptomLogs) => set({ symptomLogs }),

    // Trigger feedback
    triggerFeedback: [],
    addTriggerFeedback: (feedback) => set((state) => {
        const normalizedFoodName = feedback.foodName.toLowerCase().trim();
        const updatedFeedback = { ...feedback, foodName: normalizedFoodName };

        // Remove existing feedback for this food (case-insensitive)
        const filtered = state.triggerFeedback.filter(f => f.foodName.toLowerCase().trim() !== normalizedFoodName);

        // Sync to Supabase when user provides feedback
        // Direct DB Write
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user?.id) {
                supabase.from('trigger_foods').upsert({
                    user_id: session.user.id,
                    food_name: normalizedFoodName,
                    user_confirmed: feedback.userConfirmed,
                    updated_at: new Date().toISOString(),
                }, { onConflict: 'user_id,food_name' }).then(({ error }) => {
                    if (error) console.error('Feedback DB Write Failed:', error);
                });
            }
        });

        return {
            triggerFeedback: [updatedFeedback, ...filtered],
        };
    }),
    setTriggerFeedback: (feedback) => set({ triggerFeedback: feedback }),
    getTriggerFeedback: (foodName) => {
        return get().triggerFeedback.find(f => f.foodName === foodName);
    },

    // Daily tasks (dynamically generated)
    dailyTasks: [],
    completedTasks: [],
    lastTasksUpdateDate: '',
    getDynamicTasks: () => {
        const todayStr = getTodayString();
        const state = get();

        // AUTO-RESET IF DATE CHANGED:
        // If the in-memory state is from a previous day, clear it before generating tasks
        if (state.lastTasksUpdateDate && state.lastTasksUpdateDate !== todayStr) {
            console.log('🌅 New day detected in getDynamicTasks, auto-resetting missions.');
            // We set it immediately to prevent multiple resets
            set({ completedTasks: [], lastTasksUpdateDate: todayStr });
        }

        return createDailyTasks({
            gutMoments: state.gutMoments,
            meals: state.meals,
            waterLogs: state.waterLogs,
            fiberLogs: state.fiberLogs,
            probioticLogs: state.probioticLogs,
            exerciseLogs: state.exerciseLogs,
            healthScore: state.getGutHealthScore().score,
            completedTasks: get().completedTasks,
        });
    },
    toggleTask: (id) => {
        const todayStr = getTodayString();
        set((state) => {
            // Check if date has changed during toggle
            if (state.lastTasksUpdateDate && state.lastTasksUpdateDate !== todayStr) {
                // It's a new day, clear and then add this task
                const newCompletedTasks = [id];
                AsyncStorage.setItem(`completedTasks_${todayStr}`, JSON.stringify(newCompletedTasks))
                    .catch(err => console.error('Failed to save tasks:', err));
                return { completedTasks: newCompletedTasks, lastTasksUpdateDate: todayStr };
            }

            // Normal toggle (one-way only)
            if (state.completedTasks.includes(id)) {
                return state; // One-way: Only mark as completed, never unmark
            }

            const newCompletedTasks = [...state.completedTasks, id];

            // Persist to AsyncStorage (with date prefix for daily reset)
            AsyncStorage.setItem(`completedTasks_${todayStr}`, JSON.stringify(newCompletedTasks))
                .catch(err => console.error('Failed to save tasks:', err));

            return { completedTasks: newCompletedTasks, lastTasksUpdateDate: todayStr };
        });
    },
    loadCompletedTasks: async () => {
        const todayStr = getTodayString();
        try {
            const stored = await AsyncStorage.getItem(`completedTasks_${todayStr}`);

            if (stored) {
                set({ completedTasks: JSON.parse(stored), lastTasksUpdateDate: todayStr });
            } else {
                set({ completedTasks: [], lastTasksUpdateDate: todayStr });
            }
        } catch (e) {
            console.error('Failed to load completed tasks:', e);
        }
    },
    resetDailyTasks: () => {
        // Tasks are now dynamically generated based on state, no manual reset needed
    },

    // Computed helpers
    getRecentMoments: (count) => get().gutMoments.slice(0, count),
    getTodaysMeals: () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return get().meals.filter((m) => new Date(m.timestamp) >= today);
    },
    getStats: () => {
        const moments = get().gutMoments;
        const lastPoop = moments.length > 0 ? moments[0].timestamp : null;

        // Calculate average frequency (times per day over last week)
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const weekMoments = moments.filter((m) => new Date(m.timestamp) >= weekAgo);
        const avgFrequency = weekMoments.length / 7;

        return {
            avgFrequency: Math.round(avgFrequency * 10) / 10,
            longestStreak: calculateCurrentStreak(moments),
            lastPoopTime: lastPoop,
            totalPoops: moments.length,
        };
    },

    // Gut Health Score (0-100) based on medical indicators with blended scoring
    getGutHealthScore: () => {
        const { gutMoments, symptomLogs, baselineScore, baselineRegularity } = get();

        // Single Source of Truth: HealthScoreService
        const { container } = require('../infrastructure/di');
        const healthScoreService = container.healthScoreService;
        const { GutMoment, BristolType, createSymptoms, SymptomLog, Severity } = require('../domain');

        // Get last 7 days of data
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const recentMoments = gutMoments.filter(m =>
            new Date(m.timestamp) >= sevenDaysAgo
        );

        const recentSymptomLogs = (symptomLogs || []).filter(s =>
            new Date(s.timestamp) >= sevenDaysAgo
        );

        if (recentMoments.length === 0 && recentSymptomLogs.length === 0) {
            let grade: string;
            if (baselineScore >= 90) grade = 'Excellent';
            else if (baselineScore >= 70) grade = 'Good';
            else if (baselineScore >= 50) grade = 'Fair';
            else grade = 'Poor';
            return { score: baselineScore || 50, grade };
        }

        const domainMoments = recentMoments.map(m => GutMoment.reconstitute({
            id: m.id,
            timestamp: new Date(m.timestamp),
            bristolType: m.bristolType ? BristolType.create(m.bristolType) : undefined,
            symptoms: createSymptoms(m.symptoms),
            tags: m.tags || [],
        }));

        const domainSymptomLogs = recentSymptomLogs.map(s => SymptomLog.reconstitute({
            id: s.id,
            timestamp: new Date(s.timestamp),
            type: s.type,
            severity: Severity.create(s.severity),
            duration: s.duration,
            notes: s.notes,
        }));

        // Get user condition from answers if available (from onboarding)
        const { gutCheckAnswers } = require('../store/onboardingStore').useOnboardingStore.getState?.() || {};
        const userCondition = gutCheckAnswers?.userCondition;

        const healthScore = healthScoreService.calculateScore({
            moments: domainMoments,
            symptomLogs: domainSymptomLogs,
            baselineScore: baselineScore || 50,
            baselineRegularity: baselineRegularity ?? 1,
            userCondition
        });

        return {
            score: healthScore.value,
            grade: healthScore.grade,
            breakdown: healthScore.breakdown
        };
    },

    // Advanced Pattern Detection: Relative Risk & Time Proximity
    getPotentialTriggers: () => {
        const { gutMoments, meals } = get();

        // Map to track food statistics
        const foodStats: {
            [food: string]: {
                total: number,
                symptomCount: number,
                weightedSymptomScore: number,
                associatedSymptoms: Set<string>
            }
        } = {};

        // 1. Process every meal to build a baseline of what was eaten
        meals.forEach(meal => {
            const mealTime = new Date(meal.timestamp).getTime();

            // 2. Check if a symptomatic moment occurred 2-24 hours AFTER this specific meal
            // Optimization: Calculate windows once per meal, not per food
            const symptomWindows = gutMoments.filter(moment => {
                const momentTime = new Date(moment.timestamp).getTime();
                const diffHours = (momentTime - mealTime) / (1000 * 60 * 60);

                const hasManualSymptoms = Object.values(moment.symptoms).some(v => v);
                const isUnhealthyStool = moment.bristolType && [1, 2, 6, 7].includes(moment.bristolType);
                const hasRedFlags = moment.tags?.some(t => ['blood', 'mucus'].includes(t));

                return (hasManualSymptoms || isUnhealthyStool || hasRedFlags) && diffHours >= 2 && diffHours <= 24;
            });

            // Use AI-normalized foods if available, otherwise fallback to raw foods
            const foodsToAnalyze = meal.normalizedFoods?.length ? meal.normalizedFoods : meal.foods;

            foodsToAnalyze.forEach(food => {
                const normalizedFood = food.toLowerCase().trim();
                if (!foodStats[normalizedFood]) {
                    foodStats[normalizedFood] = {
                        total: 0,
                        symptomCount: 0,
                        weightedSymptomScore: 0,
                        associatedSymptoms: new Set()
                    };
                }
                foodStats[normalizedFood].total++;

                if (symptomWindows.length > 0) {
                    foodStats[normalizedFood].symptomCount++;
                }

                // 3. Apply weights based on time proximity
                symptomWindows.forEach(moment => {
                    const momentTime = new Date(moment.timestamp).getTime();
                    const diffHours = (momentTime - mealTime) / (1000 * 60 * 60);

                    // Peak risk window (2-8h) gets 1.5x weight
                    const weight = (diffHours >= 2 && diffHours <= 8) ? 1.5 : 1.0;
                    foodStats[normalizedFood].weightedSymptomScore += weight;

                    // Record Manual Symptoms
                    Object.entries(moment.symptoms).forEach(([name, active]) => {
                        if (active) foodStats[normalizedFood].associatedSymptoms.add(name);
                    });

                    // Record Bristol Symptoms
                    if (moment.bristolType === 1 || moment.bristolType === 2) foodStats[normalizedFood].associatedSymptoms.add('constipation');
                    if (moment.bristolType === 6 || moment.bristolType === 7) foodStats[normalizedFood].associatedSymptoms.add('diarrhea');

                    // Record Medical Tags
                    if (moment.tags?.includes('blood')) foodStats[normalizedFood].associatedSymptoms.add('blood in stool');
                    if (moment.tags?.includes('mucus')) foodStats[normalizedFood].associatedSymptoms.add('mucus in stool');
                });
            });
        });

        // 4. Calculate final probability and filter results
        return Object.entries(foodStats)
            .map(([food, stats]) => ({
                food: food.charAt(0).toUpperCase() + food.slice(1),
                // Likelihood = (Weighted Symptom Count) / (Total times eaten)
                count: stats.total,
                probability: stats.total > 0 ? (stats.weightedSymptomScore / stats.total) : 0,
                symptoms: Array.from(stats.associatedSymptoms),
                frequencyText: `${stats.symptomCount} out of ${stats.total} times`
            }))
            // Only show foods eaten at least twice to avoid one-off noise
            // Filter for foods that have at least some symptomatic link
            .filter(item => item.count >= 2 && item.probability > 0.1)
            // Sort by highest probability first
            .sort((a, b) => b.probability - a.probability)
            .slice(0, 5);
    },

    // Enhanced trigger detection with confidence and frequency
    getEnhancedTriggers: async () => {
        const { gutMoments, meals, triggerFeedback } = get();

        const foodStats: {
            [food: string]: {
                total: number;
                symptomOccurrences: number;
                latencies: number[]; // hours
                associatedSymptoms: Set<string>;
            }
        } = {};

        meals.forEach(meal => {
            const mealTime = new Date(meal.timestamp).getTime();

            meal.foods.forEach(food => {
                const normalizedFood = food.toLowerCase().trim();
                if (!foodStats[normalizedFood]) {
                    foodStats[normalizedFood] = {
                        total: 0,
                        symptomOccurrences: 0,
                        latencies: [],
                        associatedSymptoms: new Set()
                    };
                }
                foodStats[normalizedFood].total++;

                const symptomWindows = gutMoments.filter(moment => {
                    const momentTime = new Date(moment.timestamp).getTime();
                    const diffHours = (momentTime - mealTime) / (1000 * 60 * 60);

                    const hasManualSymptoms = Object.values(moment.symptoms).some(v => v);
                    const isUnhealthyStool = moment.bristolType && [1, 2, 6, 7].includes(moment.bristolType);
                    const hasRedFlags = moment.tags?.some(t => ['blood', 'mucus'].includes(t));

                    return (hasManualSymptoms || isUnhealthyStool || hasRedFlags) && diffHours >= 2 && diffHours <= 24;
                });

                if (symptomWindows.length > 0) {
                    foodStats[normalizedFood].symptomOccurrences++;

                    symptomWindows.forEach(moment => {
                        const momentTime = new Date(moment.timestamp).getTime();
                        const diffHours = (momentTime - mealTime) / (1000 * 60 * 60);
                        foodStats[normalizedFood].latencies.push(diffHours);

                        Object.entries(moment.symptoms).forEach(([name, active]) => {
                            if (active) foodStats[normalizedFood].associatedSymptoms.add(name);
                        });

                        if (moment.bristolType === 1 || moment.bristolType === 2) foodStats[normalizedFood].associatedSymptoms.add('constipation');
                        if (moment.bristolType === 6 || moment.bristolType === 7) foodStats[normalizedFood].associatedSymptoms.add('diarrhea');
                        if (moment.tags?.includes('blood')) foodStats[normalizedFood].associatedSymptoms.add('blood in stool');
                        if (moment.tags?.includes('mucus')) foodStats[normalizedFood].associatedSymptoms.add('mucus in stool');
                    });
                }
            });
        });

        // Fetch FODMAP info for all foods in parallel
        const foodList = Object.keys(foodStats);
        const fodmapResults = await Promise.all(
            foodList.map(food => analyzeFoodWithAI(food))
        );

        return Object.entries(foodStats)
            .map(([food, stats], index) => {
                const capitalizedFood = food.charAt(0).toUpperCase() + food.slice(1);
                const occurrences = stats.total;
                const symptomOccurrences = stats.symptomOccurrences;

                // Confidence based on occurrences (aligned with clinical FODMAP reintroduction protocols)
                // Clinical standard: 3 challenges minimum, well-tested at 5+
                let confidence: 'Low' | 'Medium' | 'High' = 'Low';
                if (occurrences >= 5) confidence = 'High';      // Well-tested (5+ exposures)
                else if (occurrences >= 3) confidence = 'Medium'; // Clinical minimum (3 challenges)

                // Frequency text
                const frequencyText = `${symptomOccurrences} out of ${occurrences} times`;

                // Average latency
                const avgLatencyHours = stats.latencies.length > 0
                    ? stats.latencies.reduce((a, b) => a + b, 0) / stats.latencies.length
                    : 0;

                // User feedback
                const feedback = triggerFeedback.find(f => f.foodName.toLowerCase() === food);

                // Nutrition/FODMAP Analysis from AI
                const fodmapInfo = fodmapResults[index];
                const alternatives = getLowFODMAPAlternatives(food);

                return {
                    food: capitalizedFood,
                    occurrences,
                    symptomOccurrences,
                    confidence,
                    frequencyText,
                    avgLatencyHours: Math.round(avgLatencyHours * 10) / 10,
                    symptoms: Array.from(stats.associatedSymptoms),
                    userFeedback: feedback?.userConfirmed ?? null,
                    fodmapIssues: fodmapInfo && fodmapInfo.level !== 'low' ? {
                        level: fodmapInfo.level,
                        categories: fodmapInfo.categories
                    } : undefined,
                    alternatives: alternatives.length > 0 ? alternatives : undefined
                };
            })
            // Clinical threshold: 3 exposures minimum (FODMAP reintroduction standard), 2+ symptom events
            .filter(item => item.occurrences >= 3 && item.symptomOccurrences >= 2)
            .sort((a, b) => (b.symptomOccurrences / b.occurrences) - (a.symptomOccurrences / a.occurrences))
            .slice(0, 5);
    },

    // Combination trigger detection
    getCombinationTriggers: () => {
        const { gutMoments, meals } = get();

        const comboStats: {
            [combo: string]: {
                foods: string[];
                total: number;
                symptomOccurrences: number;
            }
        } = {};

        meals.forEach(meal => {
            if (meal.foods.length < 2) return; // Need at least 2 foods for combination

            const mealTime = new Date(meal.timestamp).getTime();

            // Create combinations of 2 foods
            for (let i = 0; i < meal.foods.length; i++) {
                for (let j = i + 1; j < meal.foods.length; j++) {
                    const foods = [meal.foods[i], meal.foods[j]].map(f => f.toLowerCase().trim()).sort();
                    const comboKey = foods.join(' + ');

                    if (!comboStats[comboKey]) {
                        comboStats[comboKey] = {
                            foods: foods.map(f => f.charAt(0).toUpperCase() + f.slice(1)),
                            total: 0,
                            symptomOccurrences: 0
                        };
                    }
                    comboStats[comboKey].total++;

                    const symptomWindows = gutMoments.filter(moment => {
                        const momentTime = new Date(moment.timestamp).getTime();
                        const diffHours = (momentTime - mealTime) / (1000 * 60 * 60);

                        const hasManualSymptoms = Object.values(moment.symptoms).some(v => v);
                        const isUnhealthyStool = moment.bristolType && [1, 2, 6, 7].includes(moment.bristolType);

                        return (hasManualSymptoms || isUnhealthyStool) && diffHours >= 2 && diffHours <= 24;
                    });

                    if (symptomWindows.length > 0) {
                        comboStats[comboKey].symptomOccurrences++;
                    }
                }
            }
        });

        return Object.values(comboStats)
            .map(stats => {
                // Confidence aligned with clinical FODMAP protocols
                let confidence: 'Low' | 'Medium' | 'High' = 'Low';
                if (stats.total >= 5) confidence = 'High';
                else if (stats.total >= 3) confidence = 'Medium';

                return {
                    foods: stats.foods,
                    occurrences: stats.total,
                    symptomOccurrences: stats.symptomOccurrences,
                    confidence,
                    frequencyText: `${stats.symptomOccurrences} out of ${stats.total} times`
                };
            })
            // Clinical threshold: 3 exposures minimum, 2+ symptom events
            .filter(item => item.occurrences >= 3 && item.symptomOccurrences >= 2)
            .sort((a, b) => (b.symptomOccurrences / b.occurrences) - (a.symptomOccurrences / a.occurrences))
            .slice(0, 3);
    },

    // Medical alert system
    checkMedicalAlerts: () => {
        const { gutMoments } = get();
        const alerts: { type: string; message: string; severity: 'warning' | 'critical' }[] = [];

        // Check for blood in stool
        const recentBlood = gutMoments.filter(m => {
            const daysSince = (Date.now() - new Date(m.timestamp).getTime()) / (1000 * 60 * 60 * 24);
            return daysSince <= 7 && m.tags?.includes('blood');
        });

        if (recentBlood.length > 0) {
            const latestLog = recentBlood[0]; // Assumes sorted new->old
            const dismissedAt = get().dismissedAlerts['blood'];

            // Show if never dismissed OR latest log is newer than dismissal reference
            if (!dismissedAt || new Date(latestLog.timestamp) > new Date(dismissedAt)) {
                alerts.push({
                    type: 'blood',
                    message: 'Blood in stool detected in the last 7 days. This may indicate a medical condition. Please consult a healthcare provider.',
                    severity: 'critical'
                });
            }
        }

        // Check for persistent mucus
        const recentMucus = gutMoments.filter(m => {
            const daysSince = (Date.now() - new Date(m.timestamp).getTime()) / (1000 * 60 * 60 * 24);
            return daysSince <= 14 && m.tags?.includes('mucus');
        });

        if (recentMucus.length >= 5) {
            const latestLog = recentMucus[0];
            const dismissedAt = get().dismissedAlerts['mucus'];

            if (!dismissedAt || new Date(latestLog.timestamp) > new Date(dismissedAt)) {
                alerts.push({
                    type: 'mucus',
                    message: 'Frequent mucus in stool detected. Consider consulting a healthcare provider.',
                    severity: 'warning'
                });
            }
        }

        // Check for severe constipation (no BM in 3+ days)
        const last3Days = gutMoments.filter(m => {
            const daysSince = (Date.now() - new Date(m.timestamp).getTime()) / (1000 * 60 * 60 * 24);
            return daysSince <= 3;
        });

        if (last3Days.length === 0 && gutMoments.length > 0) {
            const dismissedAt = get().dismissedAlerts['constipation'];
            // For constipation (state-based), we rely on a 24h snooze window from the dismissal timestamp
            const isSnoozed = dismissedAt && (Date.now() - new Date(dismissedAt).getTime()) < (24 * 60 * 60 * 1000);

            if (!isSnoozed) {
                alerts.push({
                    type: 'constipation',
                    message: 'No bowel movements in 3+ days. If this persists or causes discomfort, consult a healthcare provider.',
                    severity: 'warning'
                });
            }
        }

        // Check for persistent diarrhea (Bristol 6-7 for 3+ days)
        const last7Days = gutMoments.filter(m => {
            const daysSince = (Date.now() - new Date(m.timestamp).getTime()) / (1000 * 60 * 60 * 24);
            return daysSince <= 7;
        });

        const diarrheaDays = last7Days.filter(m => m.bristolType && [6, 7].includes(m.bristolType));
        if (diarrheaDays.length >= 5) { // Logic from previous code was length comparison
            const latestLog = diarrheaDays[0];
            const dismissedAt = get().dismissedAlerts['diarrhea'];

            if (!dismissedAt || new Date(latestLog.timestamp) > new Date(dismissedAt)) {
                alerts.push({
                    type: 'diarrhea',
                    message: 'Persistent diarrhea detected. Stay hydrated and consider consulting a healthcare provider if it continues.',
                    severity: 'warning'
                });
            }
        }

        return {
            hasAlerts: alerts.length > 0,
            alerts
        };
    },

    dismissedAlerts: {},
    dismissAlert: (type: string) => set((state) => {
        const { gutMoments } = state;
        let referenceTime = new Date().toISOString();

        // For event-based alerts (Blood, Mucus, Diarrhea), we anchor to the LATEST relevant log timestamp.
        // This ensures the alert stays dismissed until a NEWER log appears.
        if (type === 'blood') {
            const last = gutMoments.find(m => m.tags?.includes('blood'));
            if (last) referenceTime = new Date(last.timestamp).toISOString();
        } else if (type === 'mucus') {
            const last = gutMoments.find(m => m.tags?.includes('mucus'));
            if (last) referenceTime = new Date(last.timestamp).toISOString();
        } else if (type === 'diarrhea') {
            const last = gutMoments.find(m => m.bristolType && [6, 7].includes(m.bristolType));
            if (last) referenceTime = new Date(last.timestamp).toISOString();
        }
        // For state-based alerts (Constipation), we just use current time (snooze)

        const updatedDismissedAlerts = {
            ...state.dismissedAlerts,
            [type]: referenceTime
        };

        // Persist to AsyncStorage
        AsyncStorage.setItem('dismissedAlerts', JSON.stringify(updatedDismissedAlerts))
            .catch(error => console.error('Failed to save dismissed alerts:', error));

        return {
            dismissedAlerts: updatedDismissedAlerts
        };
    }),

    getPoopHistoryData: () => {
        const moments = get().gutMoments;
        const last7Days: { [date: string]: number } = {};

        // Initialize last 7 days
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            last7Days[d.toISOString().split('T')[0]] = 0;
        }

        moments.forEach(m => {
            const dateStr = new Date(m.timestamp).toISOString().split('T')[0];
            if (last7Days[dateStr] !== undefined) {
                last7Days[dateStr]++;
            }
        });

        return Object.entries(last7Days).map(([date, count]) => {
            const [y, m, d] = date.split('-').map(Number);
            const dateObj = new Date(y, m - 1, d);
            const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
            return {
                date: date.split('-').slice(1).join('/'), // MM/DD
                count,
                label: days[dateObj.getDay()]
            };
        });
    },

    exportData: async () => {
        try {
            const { gutMoments, meals, waterLogs, fiberLogs, probioticLogs, exerciseLogs, user } = get();
            const healthScore = get().getGutHealthScore();
            const stats = get().getStats();
            const triggers = get().getPotentialTriggers();

            const report = {
                user: user.name,
                generatedAt: new Date().toISOString(),
                summary: {
                    gutHealthScore: healthScore.score,
                    grade: healthScore.grade,
                    totalLogs: stats.totalPoops,
                    currentStreak: user.streak,
                    avgFrequency: stats.avgFrequency,
                },
                potentialTriggers: triggers,
                gutMoments: gutMoments.map(m => ({
                    ...m,
                    timestamp: m.timestamp.toISOString(),
                })),
                meals: meals.map(m => ({
                    ...m,
                    timestamp: m.timestamp.toISOString(),
                })),
                waterLogs,
                fiberLogs,
                probioticLogs,
                exerciseLogs,
            };

            // Create file name with timestamp
            const timestamp = new Date().toISOString().split('T')[0];
            const fileName = `gut-health-report-${timestamp}.json`;

            // Use the new File API from expo-file-system
            const file = new FileSystem.File(FileSystem.Paths.document, fileName);

            // Write the report to the file
            await file.write(JSON.stringify(report, null, 2));

            // Check if sharing is available
            const isAvailable = await Sharing.isAvailableAsync();
            if (isAvailable) {
                await Sharing.shareAsync(file.uri, {
                    mimeType: 'application/json',
                    dialogTitle: 'Share your gut health report',
                    UTI: 'public.json',
                });
            } else {
                Alert.alert(
                    'Export Complete',
                    `Your report has been saved to:\n${file.uri}`,
                    [{ text: 'OK' }]
                );
            }
        } catch (error) {
            console.error('Export error:', error);
            Alert.alert(
                'Export Failed',
                'There was an error exporting your data. Please try again.',
                [{ text: 'OK' }]
            );
        }
    },

    syncWidget: async () => {
        if (Platform.OS !== 'ios') return;

        try {
            const { getGutHealthScore, getStats } = get();
            const healthScore = getGutHealthScore();
            const stats = getStats();

            // Format last poop time and message to match HomeScreen
            let lastPoopTime = "Never";
            let statusMessage = "Log your first poop!";

            if (stats.lastPoopTime) {
                const now = new Date();
                const last = new Date(stats.lastPoopTime);
                const diffMinutes = Math.floor((now.getTime() - last.getTime()) / (1000 * 60));
                const diffHours = Math.floor(diffMinutes / 60);
                const diffDays = Math.floor(diffHours / 24);

                if (diffMinutes < 1) {
                    lastPoopTime = "Just now";
                    statusMessage = "Fresh!";
                } else if (diffMinutes < 60) {
                    lastPoopTime = `${diffMinutes}m ago`;
                    statusMessage = "Fresh!";
                } else if (diffHours < 24) {
                    lastPoopTime = `${diffHours}h ago`;
                    statusMessage = "All good";
                } else if (diffHours < 48) {
                    lastPoopTime = "1 day ago";
                    statusMessage = "Time soon?";
                } else {
                    lastPoopTime = `${diffDays}d ago`;
                    statusMessage = diffDays > 3 ? "Stalled!" : "Check in!";
                }
            }

            const widgetData = {
                score: healthScore.score,
                grade: healthScore.grade,
                lastPoopTime,
                statusMessage,
                breakdown: healthScore.breakdown,
                weeklyHistory: get().getPoopHistoryData()
            };

            await SharedGroupPreferences.setItem('gut_health_data', JSON.stringify(widgetData), APP_GROUP_IDENTIFIER);

            // Force immediate widget refresh (don't wait for 15-min timeline)
            ExtensionStorage.reloadWidget('GutHealthWidget');
        } catch (error) {
            console.error('Widget Sync Failed:', error);
        }
    },
}),
);
