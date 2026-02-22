import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface OnboardingAnswers {
    goal: string;
    condition: string;
    symptoms: string[];
    knownTriggers: string[];
}

interface AppState {
    isOnboardingCompleted: boolean;
    onboardingAnswers: OnboardingAnswers;

    setOnboardingCompleted: (val: boolean) => void;
    updateOnboardingAnswers: (answers: Partial<OnboardingAnswers>) => void;
    resetOnboarding: () => void;
}

const defaultAnswers: OnboardingAnswers = {
    goal: '',
    condition: '',
    symptoms: [],
    knownTriggers: [],
};

export const useAppStore = create<AppState>()(
    persist(
        (set) => ({
            isOnboardingCompleted: false,
            onboardingAnswers: defaultAnswers,

            setOnboardingCompleted: (val) => set({ isOnboardingCompleted: val }),
            updateOnboardingAnswers: (answers) =>
                set((state) => ({
                    onboardingAnswers: { ...state.onboardingAnswers, ...answers },
                })),
            resetOnboarding: () =>
                set({ onboardingAnswers: defaultAnswers, isOnboardingCompleted: false }),
        }),
        {
            name: 'gutbuddy-store',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
