/**
 * Onboarding State Store
 * Manages quiz answers and onboarding completion state
 */
import { create } from 'zustand';

export interface QuizAnswers {
    healthGoal?: string;
    gutIssues?: string[];
    dietType?: string;
    stressLevel?: string;
    sleepQuality?: string;
}

interface OnboardingState {
    isOnboardingComplete: boolean;
    quizAnswers: QuizAnswers;
    currentStep: number;
    totalSteps: number;

    // Actions
    setQuizAnswer: <K extends keyof QuizAnswers>(key: K, value: QuizAnswers[K]) => void;
    setCurrentStep: (step: number) => void;
    completeOnboarding: () => void;
    resetOnboarding: () => void;
}

export const useOnboardingStore = create<OnboardingState>()((set) => ({
    isOnboardingComplete: false,
    quizAnswers: {},
    currentStep: 0,
    totalSteps: 5, // Quiz(3) + Analysis + Social Proof + Custom Plan

    setQuizAnswer: (key, value) =>
        set((state) => ({
            quizAnswers: { ...state.quizAnswers, [key]: value },
        })),

    setCurrentStep: (step: number) =>
        set({ currentStep: step }),

    completeOnboarding: async () => {
        console.log('📝 completeOnboarding called');
        const state = useOnboardingStore.getState();
        set({ isOnboardingComplete: true });
        console.log('✅ Store updated: isOnboardingComplete = true');

        // Directly update database
        const { supabase } = await import('../config/supabase');
        const { data: { session } } = await supabase.auth.getSession();

        console.log('👤 Session user ID:', session?.user?.id);

        if (session?.user?.id) {
            const { data, error } = await supabase
                .from('users')
                .update({
                    onboarding_completed: true,
                    onboarding_data: state.quizAnswers
                })
                .eq('id', session.user.id);

            if (error) {
                console.error('❌ Database update error:', error);
            } else {
                console.log('✅ Database updated successfully:', data);
            }
        } else {
            console.warn('⚠️ No session found, skipping database update');
        }
    },

    resetOnboarding: () =>
        set({
            isOnboardingComplete: false,
            quizAnswers: {},
            currentStep: 0,
        }),
}));
