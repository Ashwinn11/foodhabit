/**
 * Onboarding State Store
 * Manages quiz answers and onboarding completion state
 */
import { create } from 'zustand';
import { useGutStore } from './useGutStore';

export interface GutCheckAnswers {
    selectedGoal?: string;      // User's #1 gut goal
    stoolConsistency?: number;  // 0-4 (Hard...Watery) -> Bristol Scale
    symptomFrequency?: number;  // 0-2 (Rarely...Daily)
    bowelRegularity?: number;   // 0-2 (Regular...Unpredictable)
    medicalFlags?: boolean;     // true/false
    userCondition?: string;     // NEW: ibs-d, ibs-c, ibs-m, ibs-u, bloating
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
    totalSteps: 12, // Welcome + Goal + Symptoms + ValueInterrupt + Stool + Regularity + Medical + Processing + Results + Condition + Value + Paywall

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

        // Get session first
        const { supabase } = await import('../config/supabase');
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user?.id) {
            try {
                // Use upsert to insert or update in one operation
                const { data, error } = await supabase
                    .from('users')
                    .upsert({
                        id: session.user.id,
                        onboarding_completed: true,
                        onboarding_data: {
                            answers: state.gutCheckAnswers,
                            score: state.calculatedScore
                        },
                        updated_at: new Date().toISOString()
                    }, {
                        onConflict: 'id'
                    })
                    .select()
                    .single();

                if (error) {
                    console.error('❌ Database upsert error:', error);
                    throw error;
                }

                console.log('✅ Onboarding completed in database:', data);

                // Only update local state after successful database update
                set({ isOnboardingComplete: true });

                // Update baseline score and regularity in gut store
                useGutStore.getState().setBaselineScore(state.calculatedScore);
                if (state.gutCheckAnswers.bowelRegularity !== undefined) {
                    useGutStore.getState().setBaselineRegularity(state.gutCheckAnswers.bowelRegularity);
                }
            } catch (error) {
                console.error('❌ Failed to complete onboarding:', error);
                // Don't update local state if database update failed
                throw error;
            }
        } else {
            console.warn('⚠️ No session found, updating local state only');
            set({ isOnboardingComplete: true });
            useGutStore.getState().setBaselineScore(state.calculatedScore);
            if (state.gutCheckAnswers.bowelRegularity !== undefined) {
                useGutStore.getState().setBaselineRegularity(state.gutCheckAnswers.bowelRegularity);
            }
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
