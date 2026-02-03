/**
 * ITriggerFeedbackRepository
 * Port for trigger feedback data access
 */
import { TriggerFeedback } from '../../../domain';

export interface ITriggerFeedbackRepository {
    /**
     * Save or update trigger feedback
     */
    upsert(userId: string, feedback: TriggerFeedback): Promise<void>;

    /**
     * Find feedback for a specific food
     */
    findByFood(userId: string, foodName: string): Promise<TriggerFeedback | null>;

    /**
     * Find all feedback for a user
     */
    findByUserId(userId: string): Promise<TriggerFeedback[]>;

    /**
     * Delete feedback for a specific food
     */
    delete(userId: string, foodName: string): Promise<void>;
}
