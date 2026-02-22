import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface OnboardingAnswers {
  goal: string;
  condition: string;
  symptoms: string[];
  knownTriggers: string[];
  safeFoods: string[];   // AI-confirmed safe foods from onboarding analysis
  avoidFoods: string[];  // AI-confirmed avoid foods from onboarding analysis
}

interface AppState {
  isOnboardingCompleted: boolean;
  onboardingAnswers: OnboardingAnswers;

  // Confirmed trigger_foods loaded from DB — merged into every scan's AI context
  learnedTriggers: string[];

  // Avoid-level foods from the most recent scan — used for gut log correlation hint
  recentScanAvoidFoods: string[];

  setOnboardingCompleted: (val: boolean) => void;
  updateOnboardingAnswers: (answers: Partial<OnboardingAnswers>) => void;
  resetOnboarding: () => void;
  setLearnedTriggers: (foods: string[]) => void;
  setRecentScanAvoidFoods: (foods: string[]) => void;
}

const defaultAnswers: OnboardingAnswers = {
  goal: '',
  condition: '',
  symptoms: [],
  knownTriggers: [],
  safeFoods: [],
  avoidFoods: [],
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      isOnboardingCompleted: false,
      onboardingAnswers: defaultAnswers,
      learnedTriggers: [],
      recentScanAvoidFoods: [],

      setOnboardingCompleted: (val) => set({ isOnboardingCompleted: val }),
      updateOnboardingAnswers: (answers) =>
        set((state) => ({
          onboardingAnswers: { ...state.onboardingAnswers, ...answers },
        })),
      resetOnboarding: () =>
        set({
          onboardingAnswers: defaultAnswers,
          isOnboardingCompleted: false,
          learnedTriggers: [],
          recentScanAvoidFoods: [],
        }),
      setLearnedTriggers: (foods) => set({ learnedTriggers: foods }),
      setRecentScanAvoidFoods: (foods) => set({ recentScanAvoidFoods: foods }),
    }),
    {
      name: 'gutbuddy-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
