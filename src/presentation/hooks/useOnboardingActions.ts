/**
 * useOnboardingActions Hook
 * Provides clean architecture actions for onboarding
 */
import { useState, useCallback } from 'react';
import { container } from '../../infrastructure/di';
import { useAuth } from '../../hooks/useAuth';
import { useOnboardingStore } from '../../store/onboardingStore';
import { OnboardingAnswers } from '../../domain';

export interface UseOnboardingActionsReturn {
    completeOnboarding: () => Promise<boolean>;
    isCompleting: boolean;
    error: string | null;
}

export function useOnboardingActions(): UseOnboardingActionsReturn {
    const { session } = useAuth();
    const userId = session?.user?.id ?? null;

    const completeOnboardingUseCase = container.completeOnboardingUseCase;
    const { gutCheckAnswers, completeOnboarding: storeCompleteOnboarding } = useOnboardingStore();

    const [isCompleting, setIsCompleting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const completeOnboarding = useCallback(async (): Promise<boolean> => {
        setIsCompleting(true);
        setError(null);

        try {
            // 1. Create domain entity from store data
            const answers = OnboardingAnswers.create(gutCheckAnswers);

            // 2. Local store update (bridging current architecture)
            await storeCompleteOnboarding();

            // 3. Persist via use case if authenticated
            if (userId) {
                await completeOnboardingUseCase.execute(userId, answers);
            }

            return true;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to complete onboarding');
            return false;
        } finally {
            setIsCompleting(false);
        }
    }, [userId, gutCheckAnswers, storeCompleteOnboarding, completeOnboardingUseCase]);

    return {
        completeOnboarding,
        isCompleting,
        error,
    };
}
