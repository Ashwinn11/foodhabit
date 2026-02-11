/**
 * Trigger Feedback Data Mapper
 */
import { TriggerFeedback } from '../../domain';

export interface TriggerFeedbackRow {
    id?: string;
    user_id: string;
    food_name: string;
    user_confirmed: boolean | null;
    updated_at: string;
    notes?: string | null;
}

export class TriggerFeedbackMapper {
    static toDomain(row: TriggerFeedbackRow): TriggerFeedback {
        return TriggerFeedback.create({
            foodName: row.food_name,
            userConfirmed: row.user_confirmed,
            timestamp: new Date(row.updated_at),
            notes: row.notes || undefined,
        });
    }

    static toPersistence(userId: string, feedback: TriggerFeedback): Omit<TriggerFeedbackRow, 'notes'> {
        return {
            user_id: userId,
            food_name: feedback.foodName,
            user_confirmed: feedback.userConfirmed,
            updated_at: feedback.timestamp.toISOString(),
        };
    }
}
