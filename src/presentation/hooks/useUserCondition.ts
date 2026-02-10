/**
 * useUserCondition Hook
 * Presentation layer hook that bridges domain + infrastructure
 *
 * Provides user condition to screens
 * Orchestrates: Repository → Domain Service → Presentation
 */

import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Condition } from '../../domain/value-objects/Condition';
import { SupabaseUserConditionRepository } from '../../infrastructure/repositories/SupabaseUserConditionRepository';
import { SetUserConditionApplicationService } from '../../application/services/SetUserConditionApplicationService';

export interface UseUserConditionResult {
  condition: Condition | null;
  loading: boolean;
  error: string | null;
  setCondition: (conditionType: string) => Promise<boolean>;
}

/**
 * Hook that provides user condition from database
 * Automatically fetches when user logs in
 */
export const useUserCondition = (): UseUserConditionResult => {
  const { session } = useAuth();
  const [condition, setConditionState] = useState<Condition | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch user condition on mount or when user changes
  useEffect(() => {
    const fetchCondition = async () => {
      if (!session?.user?.id) {
        setConditionState(null);
        return;
      }

      setLoading(true);
      try {
        const repository = new SupabaseUserConditionRepository();
        const result = await repository.getCondition(session.user.id);

        if (result.isSuccess()) {
          setConditionState(result.getValueOrThrow());
          setError(null);
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

  /**
   * Set user condition
   * Uses application service for use case orchestration
   */
  const setCondition = async (conditionType: string): Promise<boolean> => {
    if (!session?.user?.id) {
      setError('User not authenticated');
      return false;
    }

    setLoading(true);
    try {
      const repository = new SupabaseUserConditionRepository();
      const service = new SetUserConditionApplicationService(repository);

      const result = await service.execute({
        userId: session.user.id,
        condition: conditionType as any
      });

      if (result.isSuccess()) {
        const newCondition = Condition.create(conditionType as any);
        setConditionState(newCondition);
        setError(null);
        return true;
      } else {
        setError(result.getErrorOrThrow().message);
        return false;
      }
    } catch (e) {
      const errorMsg = (e as Error).message;
      setError(errorMsg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    condition,
    loading,
    error,
    setCondition
  };
};
