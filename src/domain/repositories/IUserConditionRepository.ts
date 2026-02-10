/**
 * IUserConditionRepository
 * Domain interface for user condition persistence
 *
 * Located in DOMAIN layer (not infrastructure)
 * Implementations in INFRASTRUCTURE layer
 * Follows DIP: Domain depends on abstractions, not concretions
 */

import { Result } from '../../shared/types/Result';
import { Condition } from '../value-objects/Condition';

export interface IUserConditionRepository {
  /**
   * Get user's condition preference
   * Returns Condition if set, Failure if not found
   */
  getCondition(userId: string): Promise<Result<Condition, Error>>;

  /**
   * Save or update user's condition preference
   */
  setCondition(userId: string, condition: Condition): Promise<Result<void, Error>>;

  /**
   * Check if user has set a condition
   */
  hasCondition(userId: string): Promise<Result<boolean, Error>>;
}
