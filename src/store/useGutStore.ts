import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Types for gut tracking
export type MoodType = 'amazing' | 'happy' | 'okay' | 'bloated' | 'constipated' | 'urgent';
export type BristolType = 1 | 2 | 3 | 4 | 5 | 6 | 7;
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'drink';

export interface GutMoment {
    id: string;
    timestamp: Date;
    mood: MoodType;
    bristolType?: BristolType;
    notes?: string;
    photoUri?: string;
    symptoms: {
        bloating: boolean;
        gas: boolean;
        cramping: boolean;
        nausea: boolean;
    };
}

export interface MealEntry {
    id: string;
    timestamp: Date;
    mealType: MealType;
    name: string;
    description?: string;
    foods: string[];
    mood?: MoodType;
    photoUri?: string;
}

export interface DailyTask {
    id: string;
    title: string;
    subtitle: string;
    completed: boolean;
    type: 'poop' | 'meal' | 'symptom' | 'water';
}

export interface WaterLog {
    date: string; // ISO date string YYYY-MM-DD
    glasses: number;
}

export interface UserProfile {
    name: string;
    avatarMood: MoodType;
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

    // Computed
    getRecentMoments: (count: number) => GutMoment[];
    getTodaysMeals: () => MealEntry[];
    getStats: () => {
        avgFrequency: number;
        longestStreak: number;
        lastPoopTime: Date | null;
        totalPoops: number;
    };
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
const createDailyTasks = (state: { gutMoments: GutMoment[]; meals: MealEntry[]; waterLogs: WaterLog[] }): DailyTask[] => {
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

    return tasks;
};

export const useGutStore = create<GutStore>()(
    persist(
        (set, get) => ({
            // User
            user: {
                name: 'Gut Buddy',
                avatarMood: 'okay',
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

            // Quick log poop with minimal friction
            quickLogPoop: (bristolType = 4) => set((state) => {
                const newMoment: GutMoment = {
                    id: generateId(),
                    timestamp: new Date(),
                    mood: 'happy',
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
                        avatarMood: 'happy', // Update mood on successful log
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

            // Daily tasks (dynamically generated)
            dailyTasks: [],
            getDynamicTasks: () => createDailyTasks({
                gutMoments: get().gutMoments,
                meals: get().meals,
                waterLogs: get().waterLogs,
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
