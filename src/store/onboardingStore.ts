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
    totalSteps: 9, // Quiz(3) + Results + Symptoms + HowAppHelps + Reviews + Features + CustomPlan + Paywall

    setQuizAnswer: (key, value) =>
        set((state) => ({
            quizAnswers: { ...state.quizAnswers, [key]: value },
        })),

    setCurrentStep: (step: number) =>
        set({ currentStep: step }),

    completeOnboarding: () => {
        const state = useOnboardingStore.getState();
        set({ isOnboardingComplete: true });

        // Sync onboarding data to Supabase
        import('../services/syncService').then(({ syncService }) => {
            syncService.queueSync({
                type: 'onboarding',
                data: state.quizAnswers,
                priority: 'high',
                timestamp: new Date(),
            });
        });
    },

    resetOnboarding: () =>
        set({
            isOnboardingComplete: false,
            quizAnswers: {},
            currentStep: 0,
        }),
}));
