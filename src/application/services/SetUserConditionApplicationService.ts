/**
 * SetUserConditionApplicationService
 * Application layer - Use Case for setting user's gut condition
 *
 * Orchestrates domain objects and repositories
 * Implements business workflow, not business rules (those are in domain)
 * Follows: Dependency Inversion Principle
 */

import { IUserConditionRepository } from '../../domain/repositories/IUserConditionRepository';
import { Condition, ConditionType } from '../../domain/value-objects/Condition';
import { Result, Ok, Err } from '../../shared/types/Result';

/**
 * Request DTO (Data Transfer Object)
 */
export interface SetUserConditionRequest {
  userId: string;
  condition: ConditionType;
}

/**
 * Response DTO
 */
export interface SetUserConditionResponse {
  userId: string;
  condition: string;
  displayName: string;
}

/**
 * Application Service
 */
export class SetUserConditionApplicationService {
  /**
   * Constructor receives interface, not concrete class
   * Enables dependency injection and testing
   */
  constructor(
    private readonly userConditionRepository: IUserConditionRepository
  ) {}

  /**
   * Execute the use case
   */
  async execute(
    request: SetUserConditionRequest
  ): Promise<Result<SetUserConditionResponse, Error>> {
    // Validate input
    if (!request.userId || !request.condition) {
      return Err(new Error('User ID and condition are required'));
    }

    // Create domain value object (validates condition type)
    let condition: Condition;
    try {
      condition = Condition.create(request.condition);
    } catch (e) {
      return Err(new Error(`Invalid condition: ${(e as Error).message}`));
    }

    // Use repository to persist (depends on abstraction)
    const saveResult = await this.userConditionRepository.setCondition(
      request.userId,
      condition
    );

    if (saveResult.isFailure()) {
      return Err(saveResult.getErrorOrThrow());
    }

    // Return DTO (not domain object)
    return Ok({
      userId: request.userId,
      condition: condition.getType(),
      displayName: condition.getDisplayName()
    });
  }
}
