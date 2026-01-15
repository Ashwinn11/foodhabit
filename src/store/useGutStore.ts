import { create } from 'zustand';

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

    // Computed
    getRecentMoments: (count: number) => GutMoment[];
    getTodaysMeals: () => MealEntry[];
    getStats: () => {
        avgFrequency: number;
        longestStreak: number;
        lastPoopTime: Date | null;
    };
}

const generateId = () => Math.random().toString(36).substring(2, 15);

// Sample data for demo
const sampleGutMoments: GutMoment[] = [
    {
        id: '1',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        mood: 'happy',
        bristolType: 4,
        symptoms: { bloating: false, gas: false, cramping: false, nausea: false },
    },
    {
        id: '2',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // Yesterday
        mood: 'okay',
        bristolType: 3,
        symptoms: { bloating: true, gas: false, cramping: false, nausea: false },
    },
    {
        id: '3',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48), // 2 days ago
        mood: 'amazing',
        bristolType: 4,
        symptoms: { bloating: false, gas: false, cramping: false, nausea: false },
    },
];

const sampleMeals: MealEntry[] = [
    {
        id: '1',
        timestamp: new Date(),
        mealType: 'breakfast',
        name: 'Morning Oatmeal',
        foods: ['oatmeal', 'berries', 'honey'],
        mood: 'happy',
    },
    {
        id: '2',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6),
        mealType: 'dinner',
        name: 'Evening Feast',
        foods: ['pasta', 'salad', 'bread'],
        mood: 'okay',
    },
];

const defaultDailyTasks: DailyTask[] = [
    { id: '1', title: 'Log Poop', subtitle: '7:30 AM • Track it!', completed: true, type: 'poop' },
    { id: '2', title: 'Add Breakfast', subtitle: 'Morning meal', completed: false, type: 'meal' },
    { id: '3', title: 'Note Bloat?', subtitle: 'Evening check', completed: false, type: 'symptom' },
    { id: '4', title: 'Drink Water', subtitle: '8 glasses goal', completed: false, type: 'water' },
];

export const useGutStore = create<GutStore>((set, get) => ({
    // User
    user: {
        name: 'Gut Buddy',
        avatarMood: 'happy',
        streak: 7,
        totalLogs: 42,
    },
    setUser: (userData) => set((state) => ({ user: { ...state.user, ...userData } })),

    // Gut moments
    gutMoments: sampleGutMoments,
    addGutMoment: (moment) => set((state) => ({
        gutMoments: [{ ...moment, id: generateId() }, ...state.gutMoments],
    })),
    updateGutMoment: (id, moment) => set((state) => ({
        gutMoments: state.gutMoments.map((m) =>
            m.id === id ? { ...m, ...moment } : m
        ),
    })),
    deleteGutMoment: (id) => set((state) => ({
        gutMoments: state.gutMoments.filter((m) => m.id !== id),
    })),

    // Meals
    meals: sampleMeals,
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

    // Daily tasks
    dailyTasks: defaultDailyTasks,
    toggleTask: (id) => set((state) => ({
        dailyTasks: state.dailyTasks.map((t) =>
            t.id === id ? { ...t, completed: !t.completed } : t
        ),
    })),
    resetDailyTasks: () => set({ dailyTasks: defaultDailyTasks.map(t => ({ ...t, completed: false })) }),

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
            longestStreak: get().user.streak,
            lastPoopTime: lastPoop,
        };
    },
}));
