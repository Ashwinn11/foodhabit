/**
 * Onboarding State Store
 * Manages quiz answers and onboarding completion state
 */
import { create } from 'zustand';
import { useGutStore } from './useGutStore';
import { OnboardingAnswers } from '../domain';

export interface GutCheckAnswers {
    selectedGoal?: string;      // User's #1 gut goal
    stoolConsistency?: number;  // 0-4 (Hard...Watery) -> Bristol Scale
    symptomFrequency?: number;  // 0-2 (Rarely...Daily)
    bowelRegularity?: number;   // 0-2 (Regular...Unpredictable)
    medicalFlags?: boolean;     // true/false
    userCondition?: string;     // ibs-d, ibs-c, ibs-m, ibs-u, bloating
    age?: number;               // User's age in years
    height?: number;            // User's height in inches
    weight?: number;            // User's weight in lbs
    gender?: 'male' | 'female'; // For calorie calculation
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
    totalSteps: 13, // Welcome + Goal + Symptoms + ValueInterrupt + Stool + Regularity + Demographics + Condition + Medical + Processing + Results + Value + Paywall

    setGutCheckAnswer: (key, value) => {
        set((state) => ({
            gutCheckAnswers: { ...state.gutCheckAnswers, [key]: value },
        }));
    },

    calculateScore: () => {
        const { gutCheckAnswers } = get();
        const answers = OnboardingAnswers.create(gutCheckAnswers as any);
        const totalScore = answers.calculateScore();
        set({ calculatedScore: totalScore });
    },

    setCurrentStep: (step: number) =>
        set({ currentStep: step }),

    completeOnboarding: async () => {
        console.log('📝 completeOnboarding called');
        const state = get();

        // Calculate calorie goal if age, height, weight, and gender are available
        let calorieGoal = 2000; // default
        if (state.gutCheckAnswers.age && state.gutCheckAnswers.height && state.gutCheckAnswers.weight && state.gutCheckAnswers.gender) {
            const { calculateDailyCalories } = await import('../utils/calorieCalculator');
            calorieGoal = calculateDailyCalories({
                age: state.gutCheckAnswers.age,
                height: state.gutCheckAnswers.height,
                weight: state.gutCheckAnswers.weight,
                gender: state.gutCheckAnswers.gender,
                activityLevel: 'moderate' // default to moderate
            });
        }

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
                            score: state.calculatedScore,
                            calorieGoal
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

                // Update baseline score, regularity, and calorie goal in gut store
                useGutStore.getState().setBaselineScore(state.calculatedScore);
                if (state.gutCheckAnswers.bowelRegularity !== undefined) {
                    useGutStore.getState().setBaselineRegularity(state.gutCheckAnswers.bowelRegularity);
                }
                // Set calorie goal immediately so it's available on HomeScreen
                useGutStore.getState().setCalorieGoal(calorieGoal);
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
