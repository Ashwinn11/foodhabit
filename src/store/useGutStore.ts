import { Alert } from 'react-native';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Types for gut tracking
export type BristolType = 1 | 2 | 3 | 4 | 5 | 6 | 7;
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'drink';

export interface GutMoment {
    id: string;
    timestamp: Date;
    bristolType?: BristolType;
    notes?: string;
    photoUri?: string;
    symptoms: {
        bloating: boolean;
        gas: boolean;
        cramping: boolean;
        nausea: boolean;
    };
    tags?: ('strain' | 'blood' | 'mucus' | 'urgency')[];
}

export interface MealEntry {
    id: string;
    timestamp: Date;
    mealType: MealType;
    name: string;
    description?: string;
    foods: string[];
    photoUri?: string;
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

    // Gut moments (poop logs)
    gutMoments: GutMoment[];
    addGutMoment: (moment: Omit<GutMoment, 'id'>) => void;
    updateGutMoment: (id: string, moment: Partial<GutMoment>) => void;
    deleteGutMoment: (id: string) => void;

    // Meals
    meals: MealEntry[];
    addMeal: (meal: Omit<MealEntry, 'id'>) => void;
    updateMeal: (id: string, meal: Partial<MealEntry>) => void;
    deleteMeal: (id: string) => void;

    // Daily tasks
    dailyTasks: DailyTask[];
    toggleTask: (id: string) => void;
    resetDailyTasks: () => void;
    getDynamicTasks: () => DailyTask[];

    // Water tracking
    waterLogs: WaterLog[];
    addWater: () => void;
    getTodayWater: () => number;

    // Fiber tracking
    fiberLogs: { date: string; grams: number }[];
    addFiber: (grams: number) => void;
    getTodayFiber: () => number;

    // Probiotic tracking
    probioticLogs: { date: string; servings: number }[];
    addProbiotic: () => void;
    getTodayProbiotics: () => number;

    // Exercise tracking
    exerciseLogs: { date: string; minutes: number }[];
    addExercise: (minutes: number) => void;
    getTodayExercise: () => number;

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
    getPotentialTriggers: () => { food: string; count: number; symptoms: string[] }[];
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

    // Quick log helpers
    quickLogPoop: (bristolType?: BristolType) => void;

    // Camera photo capture (temporary storage)
    capturedPhotoUri: string | null;
    setCapturedPhotoUri: (uri: string | null) => void;
}

const generateId = () => Math.random().toString(36).substring(2, 15);

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
}): DailyTask[] => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if user has logged poop today
    const hasPoopToday = state.gutMoments.some(m => {
        const mDate = new Date(m.timestamp);
        mDate.setHours(0, 0, 0, 0);
        return mDate.getTime() === today.getTime();
    });

    // Check today's meals
    const todayMeals = state.meals.filter(m => {
        const mDate = new Date(m.timestamp);
        mDate.setHours(0, 0, 0, 0);
        return mDate.getTime() === today.getTime();
    });
    const hasBreakfast = todayMeals.some(m => m.mealType === 'breakfast');
    const hasLunch = todayMeals.some(m => m.mealType === 'lunch');
    const hasDinner = todayMeals.some(m => m.mealType === 'dinner');

    // Get today's water count
    const todayWater = state.waterLogs.find(w => w.date === getTodayString())?.glasses || 0;
    const waterGoal = 8;

    const hour = new Date().getHours();

    const tasks: DailyTask[] = [
        {
            id: 'poop',
            title: 'Log Poop',
            subtitle: hasPoopToday ? 'Done today! 🎉' : 'Track your gut',
            completed: hasPoopToday,
            type: 'poop',
        },
    ];

    // Add meal tasks based on time of day
    if (hour >= 6) {
        tasks.push({
            id: 'breakfast',
            title: 'Log Breakfast',
            subtitle: hasBreakfast ? 'Logged! ☀️' : 'Morning fuel',
            completed: hasBreakfast,
            type: 'meal',
        });
    }

    if (hour >= 11) {
        tasks.push({
            id: 'lunch',
            title: 'Log Lunch',
            subtitle: hasLunch ? 'Logged! 🥗' : 'Midday meal',
            completed: hasLunch,
            type: 'meal',
        });
    }

    if (hour >= 17) {
        tasks.push({
            id: 'dinner',
            title: 'Log Dinner',
            subtitle: hasDinner ? 'Logged! 🍽️' : 'Evening meal',
            completed: hasDinner,
            type: 'meal',
        });
    }

    // Water task
    tasks.push({
        id: 'water',
        title: 'Drink Water',
        subtitle: `${todayWater}/${waterGoal} glasses`,
        completed: todayWater >= waterGoal,
        type: 'water',
    });

    // Fiber task
    const fiberGoal = 25; // grams
    const todayFiber = state.fiberLogs?.find(f => f.date === getTodayString())?.grams || 0;
    tasks.push({
        id: 'fiber',
        title: 'Log Fiber',
        subtitle: `${todayFiber}/${fiberGoal}g`,
        completed: todayFiber >= fiberGoal,
        type: 'fiber',
    });

    // Probiotic task
    const probioticGoal = 1; // servings
    const todayProbiotics = state.probioticLogs?.find(p => p.date === getTodayString())?.servings || 0;
    tasks.push({
        id: 'probiotic',
        title: 'Take Probiotic',
        subtitle: todayProbiotics >= probioticGoal ? 'Done! 🦠' : 'Good bacteria',
        completed: todayProbiotics >= probioticGoal,
        type: 'probiotic',
    });

    // Exercise task
    const exerciseGoal = 30; // minutes
    const todayExercise = state.exerciseLogs?.find(e => e.date === getTodayString())?.minutes || 0;
    tasks.push({
        id: 'exercise',
        title: 'Exercise',
        subtitle: `${todayExercise}/${exerciseGoal} min`,
        completed: todayExercise >= exerciseGoal,
        type: 'exercise',
    });

    return tasks;
};

export const useGutStore = create<GutStore>()(
    persist(
        (set, get) => ({
            // User
            user: {
                name: 'Gut Buddy',
                streak: 0,
                totalLogs: 0,
            },
            setUser: (userData) => set((state) => ({ user: { ...state.user, ...userData } })),

            // Gut moments (start empty)
            gutMoments: [],
            addGutMoment: (moment) => set((state) => {
                const newMoment = { ...moment, id: generateId() };
                return {
                    gutMoments: [newMoment, ...state.gutMoments],
                    user: {
                        ...state.user,
                        totalLogs: state.user.totalLogs + 1,
                    },
                };
            }),
            updateGutMoment: (id, moment) => set((state) => ({
                gutMoments: state.gutMoments.map((m) =>
                    m.id === id ? { ...m, ...moment } : m
                ),
            })),
            deleteGutMoment: (id) => set((state) => ({
                gutMoments: state.gutMoments.filter((m) => m.id !== id),
            })),

            quickLogPoop: (bristolType = 4) => set((state) => {
                const newMoment: GutMoment = {
                    id: generateId(),
                    timestamp: new Date(),
                    bristolType: bristolType as BristolType,
                    symptoms: { bloating: false, gas: false, cramping: false, nausea: false },
                };

                // Calculate new streak
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                yesterday.setHours(0, 0, 0, 0);

                const today = new Date();
                today.setHours(0, 0, 0, 0);

                const hadPoopYesterday = state.gutMoments.some(m => {
                    const mDate = new Date(m.timestamp);
                    mDate.setHours(0, 0, 0, 0);
                    return mDate.getTime() === yesterday.getTime();
                });

                const hadPoopToday = state.gutMoments.some(m => {
                    const mDate = new Date(m.timestamp);
                    mDate.setHours(0, 0, 0, 0);
                    return mDate.getTime() === today.getTime();
                });

                let newStreak = state.user.streak;
                if (!hadPoopToday) {
                    // First poop of the day
                    newStreak = hadPoopYesterday ? state.user.streak + 1 : 1;
                }

                return {
                    gutMoments: [newMoment, ...state.gutMoments],
                    user: {
                        ...state.user,
                        streak: newStreak,
                        totalLogs: state.user.totalLogs + 1,
                    },
                };
            }),

            // Meals (start empty)
            meals: [],
            addMeal: (meal) => set((state) => ({
                meals: [{ ...meal, id: generateId() }, ...state.meals],
            })),
            updateMeal: (id, meal) => set((state) => ({
                meals: state.meals.map((m) =>
                    m.id === id ? { ...m, ...meal } : m
                ),
            })),
            deleteMeal: (id) => set((state) => ({
                meals: state.meals.filter((m) => m.id !== id),
            })),

            // Water tracking
            waterLogs: [],
            addWater: () => set((state) => {
                const todayStr = getTodayString();
                const existingLog = state.waterLogs.find(w => w.date === todayStr);

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
            addFiber: (grams) => set((state) => {
                const todayStr = getTodayString();
                const existingLog = state.fiberLogs.find(f => f.date === todayStr);

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

            // Daily tasks (dynamically generated)
            dailyTasks: [],
            getDynamicTasks: () => createDailyTasks({
                gutMoments: get().gutMoments,
                meals: get().meals,
                waterLogs: get().waterLogs,
                fiberLogs: get().fiberLogs,
                probioticLogs: get().probioticLogs,
                exerciseLogs: get().exerciseLogs,
            }),
            toggleTask: (id) => {
                // Tasks are now dynamically generated, so toggling is handled by the actual actions
                // This is kept for backwards compatibility but redirects to actual actions
                const state = get();
                if (id === 'poop') {
                    state.quickLogPoop();
                } else if (id === 'water') {
                    state.addWater();
                }
                // Meal tasks should navigate to add entry screen
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

                // Calculate real streak (consecutive days with at least one poop)
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

                return {
                    avgFrequency: Math.round(avgFrequency * 10) / 10,
                    longestStreak: streak,
                    lastPoopTime: lastPoop,
                    totalPoops: moments.length,
                };
            },

            // Gut Health Score (0-100) based on medical indicators
            getGutHealthScore: () => {
                const { gutMoments } = get();

                if (gutMoments.length === 0) {
                    return { score: 50, grade: 'No Data' };
                }

                // Get last 7 days of data
                const sevenDaysAgo = new Date();
                sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

                const recentMoments = gutMoments.filter(m =>
                    new Date(m.timestamp) >= sevenDaysAgo
                );

                if (recentMoments.length === 0) {
                    return { score: 50, grade: 'No Recent Data' };
                }

                let totalScore = 0;

                // 1. Bristol Scale Score (40 points)
                const bristolScores = recentMoments
                    .filter(m => m.bristolType)
                    .map(m => {
                        const type = m.bristolType!;
                        if (type === 3 || type === 4) return 40; // Ideal
                        if (type === 2 || type === 5) return 30; // Acceptable
                        return 10; // Concerning (1, 6, 7)
                    });

                const avgBristolScore = bristolScores.length > 0
                    ? bristolScores.reduce((a, b) => a + b, 0) / bristolScores.length
                    : 20; // Default if no Bristol data

                totalScore += avgBristolScore;

                // 2. Symptom Frequency Score (30 points)
                const symptomCount = recentMoments.filter(m =>
                    Object.values(m.symptoms).some(v => v)
                ).length;

                let symptomScore = 30;
                if (symptomCount === 0) symptomScore = 30;
                else if (symptomCount <= 2) symptomScore = 20;
                else if (symptomCount <= 4) symptomScore = 10;
                else symptomScore = 0;

                totalScore += symptomScore;

                // 3. Regularity Score (20 points)
                const avgPerDay = recentMoments.length / 7;
                let regularityScore = 20;
                if (avgPerDay >= 1 && avgPerDay <= 3) regularityScore = 20; // Ideal
                else if (avgPerDay >= 0.5) regularityScore = 15; // Every 2 days
                else regularityScore = 5; // Less frequent

                totalScore += regularityScore;

                // 4. Medical Flags Score (10 points)
                const hasRedFlags = recentMoments.some(m =>
                    m.tags?.includes('blood') || m.tags?.includes('mucus')
                );

                const medicalScore = hasRedFlags ? 0 : 10;
                totalScore += medicalScore;

                // Determine grade based on score
                let grade: string;

                if (totalScore >= 90) {
                    grade = 'Excellent';
                } else if (totalScore >= 70) {
                    grade = 'Good';
                } else if (totalScore >= 50) {
                    grade = 'Fair';
                } else {
                    grade = 'Poor';
                }

                return {
                    score: Math.round(totalScore),
                    grade,
                    breakdown: {
                        bristol: Math.round(avgBristolScore),
                        symptoms: symptomScore,
                        regularity: regularityScore,
                        medical: medicalScore,
                    }
                };
            },

            // Pattern detection logic
            getPotentialTriggers: () => {
                const { gutMoments, meals } = get();
                const triggerMap: { [food: string]: { count: number; symptoms: Set<string> } } = {};

                // Look at moments with symptoms
                gutMoments.forEach(moment => {
                    const hasSymptoms = Object.values(moment.symptoms).some(v => v);
                    if (!hasSymptoms) return;

                    // Find meals eaten within 24 hours BEFORE this moment
                    const momentTime = new Date(moment.timestamp).getTime();
                    const dayBefore = momentTime - 24 * 60 * 60 * 1000;

                    const activeSymptoms = Object.entries(moment.symptoms)
                        .filter(([_, active]) => active)
                        .map(([name]) => name);

                    meals.forEach(meal => {
                        const mealTime = new Date(meal.timestamp).getTime();
                        if (mealTime >= dayBefore && mealTime < momentTime) {
                            // Associate all food items in this meal with these symptoms
                            meal.foods.forEach(food => {
                                const normalizedFood = food.toLowerCase().trim();
                                if (!triggerMap[normalizedFood]) {
                                    triggerMap[normalizedFood] = { count: 0, symptoms: new Set() };
                                }
                                triggerMap[normalizedFood].count++;
                                activeSymptoms.forEach(s => triggerMap[normalizedFood].symptoms.add(s));
                            });
                        }
                    });
                });

                // Sort and return top triggers
                return Object.entries(triggerMap)
                    .map(([food, data]) => ({
                        food: food.charAt(0).toUpperCase() + food.slice(1),
                        count: data.count,
                        symptoms: Array.from(data.symptoms)
                    }))
                    .sort((a, b) => b.count - a.count)
                    .slice(0, 5);
            },

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

                return Object.entries(last7Days).map(([date, count]) => ({
                    date: date.split('-').slice(1).join('/'), // MM/DD
                    count
                }));
            },

            exportData: async () => {
                const { gutMoments, meals, waterLogs, user } = get();
                const report = {
                    user: user.name,
                    generatedAt: new Date().toISOString(),
                    gutMoments,
                    meals,
                    waterLogs
                };

                console.log('Exporting data:', JSON.stringify(report, null, 2));
                // In a real app, we'd use expo-print or expo-sharing here
                Alert.alert('Report Exported', 'Success! Your health report has been generated for your doctor.');
            },

            // Camera photo capture (temporary storage - not persisted)
            capturedPhotoUri: null,
            setCapturedPhotoUri: (uri) => set({ capturedPhotoUri: uri }),
        }),
        {
            name: 'gut-buddy-storage',
            storage: createJSONStorage(() => AsyncStorage),
            partialize: (state) => ({
                user: state.user,
                gutMoments: state.gutMoments,
                meals: state.meals,
                waterLogs: state.waterLogs,
            }),
            onRehydrateStorage: () => (state) => {
                // Convert date strings back to Date objects after rehydration
                if (state) {
                    state.gutMoments = state.gutMoments.map(m => ({
                        ...m,
                        timestamp: new Date(m.timestamp),
                    }));
                    state.meals = state.meals.map(m => ({
                        ...m,
                        timestamp: new Date(m.timestamp),
                    }));
                }
            },
        }
    )
);
