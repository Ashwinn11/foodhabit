/**
 * Onboarding State Store
 * Manages quiz answers and onboarding completion state
 */
import { create } from 'zustand';
import { useGutStore } from './useGutStore';

export interface GutCheckAnswers {
    stoolConsistency?: number; // 0-2 (Hard, Normal, Loose) -> Mapped to score
    symptomFrequency?: number; // 0-3 (Rarely...Daily)
    bowelRegularity?: number;  // 0-2 (Regular...Unpredictable)
    medicalFlags?: boolean;    // true/false
}

interface OnboardingState {
    isOnboardingComplete: boolean;
    gutCheckAnswers: GutCheckAnswers;
    calculatedScore: number;
    currentStep: number;
    totalSteps: number;

    // Actions
    setGutCheckAnswer: <K extends keyof GutCheckAnswers>(key: K, value: GutCheckAnswers[K]) => void;
    calculateScore: () => void;
    setCurrentStep: (step: number) => void;
    completeOnboarding: () => Promise<void>;
    setIsOnboardingComplete: (complete: boolean) => void;
    resetOnboarding: () => void;
}

export const useOnboardingStore = create<OnboardingState>()((set, get) => ({
    isOnboardingComplete: false,
    gutCheckAnswers: {},
    calculatedScore: 0,
    currentStep: 0,
    totalSteps: 6, // Hook + Quiz + Results + Solution + Reviews + Plan

    setGutCheckAnswer: (key, value) => {
        set((state) => ({
            gutCheckAnswers: { ...state.gutCheckAnswers, [key]: value },
        }));
    },

    calculateScore: () => {
        const { gutCheckAnswers } = get();
        let totalScore = 0;

        // 1. Bristol/Stool Consistency (40pts)
        // Mapped from UI: 0=Hard(10), 1=SlightHard(25), 2=Normal(40), 3=Loose(25), 4=Watery(10)
        const stoolScores = [10, 25, 40, 25, 10];
        totalScore += stoolScores[gutCheckAnswers.stoolConsistency ?? 2] || 20;

        // 2. Symptom Frequency (30pts)
        // 0=Rarely(30), 1=1-2x(20), 2=3-5x(10), 3=Daily(0)
        const symptomScores = [30, 20, 10, 0];
        totalScore += symptomScores[gutCheckAnswers.symptomFrequency ?? 1] || 15;

        // 3. Regularity (20pts)
        // 0=Regular(20), 1=So-so(15), 2=Unpredictable(5)
        const regularityScores = [20, 15, 5];
        totalScore += regularityScores[gutCheckAnswers.bowelRegularity ?? 1] || 10;

        // 4. Medical Flags (10pts)
        // false=10, true=0
        totalScore += gutCheckAnswers.medicalFlags ? 0 : 10;

        set({ calculatedScore: totalScore });
    },

    setCurrentStep: (step: number) =>
        set({ currentStep: step }),

    completeOnboarding: async () => {
        console.log('📝 completeOnboarding called');
        const state = get();
        set({ isOnboardingComplete: true });

        // Directly update database
        const { supabase } = await import('../config/supabase');
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user?.id) {
            const { error } = await supabase
                .from('users')
                .upsert({
                    id: session.user.id,
                    onboarding_completed: true,
                    onboarding_data: {
                        answers: state.gutCheckAnswers,
                        score: state.calculatedScore
                    }
                });

            if (error) {
                console.error('❌ Database update error:', error);
            } else {
                // Update baseline score in gut store immediately
                useGutStore.getState().setBaselineScore(state.calculatedScore);
            }
        } else {
            // Even if not logged in, update local state for consistency
            useGutStore.getState().setBaselineScore(state.calculatedScore);
        }
    },

    setIsOnboardingComplete: (complete: boolean) =>
        set({ isOnboardingComplete: complete }),

    resetOnboarding: () =>
        set({
            isOnboardingComplete: false,
            gutCheckAnswers: {},
            calculatedScore: 0,
            currentStep: 0,
        }),
}));
