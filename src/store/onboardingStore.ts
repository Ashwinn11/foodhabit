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
    totalSteps: 8, // Quiz + Results + Symptoms + Solution + Reviews + Features + Commitment + Plan

    setGutCheckAnswer: (key, value) => {
        set((state) => ({
            gutCheckAnswers: { ...state.gutCheckAnswers, [key]: value },
        }));
    },

    calculateScore: () => {
        const { gutCheckAnswers } = get();
        let totalScore = 100; // Start with a perfect Gut Score

        // 1. Consistency Penalties (Bristol Scale)
        // 0=Hard, 1=SlightHard, 2=Normal(0 penalty), 3=Loose, 4=Watery
        const consistencyPenalties = [25, 10, 0, 15, 30];
        totalScore -= consistencyPenalties[gutCheckAnswers.stoolConsistency ?? 2] || 15;

        // 2. Frequency Penalties
        // 0=Rarely(0 penalty), 1=Weekly, 2=Daily
        const frequencyPenalties = [0, 15, 30];
        totalScore -= frequencyPenalties[gutCheckAnswers.symptomFrequency ?? 1] || 15;

        // 3. Regularity Penalties
        // 0=Regular(0 penalty), 1=So-so, 2=Unpredictable
        const regularityPenalties = [0, 10, 20];
        totalScore -= regularityPenalties[gutCheckAnswers.bowelRegularity ?? 1] || 10;

        // 4. THE RED FLAG (Alarm Symptoms)
        // Medically, blood/mucus is a massive clinical penalty.
        if (gutCheckAnswers.medicalFlags) {
            totalScore -= 60; // Huge drop for blood/mucus

            // 5. SEVERITY CORRELATION
            // If blood is present AND consistency is watery/hard, health risk doubles.
            if ((gutCheckAnswers.stoolConsistency ?? 2) === 4 || (gutCheckAnswers.stoolConsistency ?? 2) === 0) {
                totalScore -= 10; // Extra clinical urgency
            }
        }

        // Final Floor: Cannot be less than 5 (to show it's "critical" but not 0)
        // Ceiling: Cannot be more than 100
        totalScore = Math.max(5, Math.min(100, totalScore));

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
