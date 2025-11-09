import { useCallback, useState } from 'react';
import { profileService } from '../services/profile/profileService';
import { metricsService } from '../services/health/metricsService';
import { useAuth } from './useAuth';
import { OnboardingData, OnboardingState, HealthMetrics } from '../types/profile';

/**
 * useOnboarding Hook
 * Manages onboarding flow state and data persistence
 */

export const useOnboarding = () => {
  const { user } = useAuth();
  const [state, setState] = useState<OnboardingState>({
    step: 0,
    totalSteps: 9,
    data: {},
    ringProgress: 0,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<HealthMetrics | null>(null);

  /**
   * Update onboarding data for current step
   */
  const updateData = useCallback((stepData: Partial<OnboardingData>) => {
    setState((prev) => ({
      ...prev,
      data: { ...prev.data, ...stepData },
    }));
    setError(null);
  }, []);

  /**
   * Advance to next step and update ring progress
   */
  const nextStep = useCallback(() => {
    setState((prev) => {
      const nextStep = Math.min(prev.step + 1, prev.totalSteps);
      // Map step to ring progress (0-6 steps maps to 0-100%)
      const ringProgress = (nextStep / prev.totalSteps) * 100;

      return {
        ...prev,
        step: nextStep,
        ringProgress: Math.round(ringProgress),
      };
    });
  }, []);

  /**
   * Go back to previous step
   */
  const previousStep = useCallback(() => {
    setState((prev) => {
      const prevStep = Math.max(prev.step - 1, 0);
      const ringProgress = (prevStep / prev.totalSteps) * 100;

      return {
        ...prev,
        step: prevStep,
        ringProgress: Math.round(ringProgress),
      };
    });
  }, []);

  /**
   * Jump to specific step
   */
  const jumpToStep = useCallback((step: number) => {
    setState((prev) => {
      const boundedStep = Math.max(0, Math.min(step, prev.totalSteps));
      const ringProgress = (boundedStep / prev.totalSteps) * 100;

      return {
        ...prev,
        step: boundedStep,
        ringProgress: Math.round(ringProgress),
      };
    });
  }, []);

  /**
   * Update ring progress manually (for animations)
   */
  const setRingProgress = useCallback((progress: number) => {
    setState((prev) => ({
      ...prev,
      ringProgress: Math.max(0, Math.min(100, progress)),
    }));
  }, []);

  /**
   * Complete onboarding and save data
   */
  const completeOnboarding = useCallback(
    async (onboardingData: OnboardingData) => {
      if (!user?.id) {
        setError('User not authenticated');
        return null;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Create profile in database
        await profileService.createProfile(user.id, onboardingData);

        // Calculate and save health metrics
        const calculatedMetrics = await metricsService.calculateAndSaveMetrics(
          user.id,
          onboardingData
        );

        setMetrics(calculatedMetrics);

        // Mark as completed
        await profileService.completeOnboarding(user.id);

        // Set to final step (loading screen transition to summary)
        setState((prev) => ({
          ...prev,
          step: prev.totalSteps,
          ringProgress: 100,
        }));

        return calculatedMetrics;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to complete onboarding';
        setError(errorMessage);
        console.error('Onboarding error:', err);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [user?.id]
  );

  /**
   * Check if onboarding is complete
   */
  const checkOnboardingComplete = useCallback(
    async (userId: string) => {
      try {
        const isComplete = await profileService.hasCompletedOnboarding(userId);
        const userMetrics = await metricsService.getLatestMetrics(userId);
        if (userMetrics) {
          setMetrics(userMetrics);
        }
        return isComplete;
      } catch (err) {
        console.error('Error checking onboarding status:', err);
        return false;
      }
    },
    []
  );

  /**
   * Reset onboarding state
   */
  const reset = useCallback(() => {
    setState({
      step: 0,
      totalSteps: 9,
      data: {},
      ringProgress: 0,
    });
    setError(null);
    setMetrics(null);
  }, []);

  return {
    // State
    state,
    isLoading,
    error,
    metrics,

    // Actions
    updateData,
    nextStep,
    previousStep,
    jumpToStep,
    setRingProgress,
    completeOnboarding,
    checkOnboardingComplete,
    reset,
  };
};
