/**
 * useUserCondition Hook
 * Provides user condition from onboarding_data
 *
 * Reads condition from users.onboarding_data JSONB field
 * (where it's stored during onboarding)
 */

import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Condition } from '../../domain/value-objects/Condition';
import { supabase } from '../../config/supabase';

export interface UseUserConditionResult {
  condition: Condition | null;
  loading: boolean;
  error: string | null;
}

/**
 * Hook that provides user condition from onboarding_data
 * Automatically fetches when user logs in
 */
export const useUserCondition = (): UseUserConditionResult => {
  const { session } = useAuth();
  const [condition, setConditionState] = useState<Condition | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch user condition from onboarding_data
  useEffect(() => {
    const fetchCondition = async () => {
      if (!session?.user?.id) {
        setConditionState(null);
        return;
      }

      setLoading(true);
      try {
        const { data: userProfile, error: fetchError } = await supabase
          .from('users')
          .select('onboarding_data')
          .eq('id', session.user.id)
          .maybeSingle();

        if (fetchError) {
          setError(fetchError.message);
          setConditionState(null);
        } else if (userProfile?.onboarding_data?.answers?.userCondition) {
          try {
            const conditionType = userProfile.onboarding_data.answers.userCondition;
            const newCondition = Condition.create(conditionType);
            setConditionState(newCondition);
            setError(null);
          } catch (e) {
            // Invalid condition stored
            setConditionState(null);
            setError(null); // Don't show error, just no condition yet
          }
        } else {
          // No condition set yet (expected for new users)
          setConditionState(null);
          setError(null);
        }
      } catch (e) {
        setError((e as Error).message);
        setConditionState(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCondition();
  }, [session?.user?.id]);

  return {
    condition,
    loading,
    error,
  };
};
