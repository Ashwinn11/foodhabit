/**
 * SupabaseTriggerFeedbackRepository
 * Concrete implementation of ITriggerFeedbackRepository using Supabase
 */
import { SupabaseClient } from '@supabase/supabase-js';
import { TriggerFeedback } from '../../domain';
import { ITriggerFeedbackRepository } from '../../application/ports/repositories';
import { TriggerFeedbackMapper } from '../mappers';
import { DatabaseError } from '../errors';

export class SupabaseTriggerFeedbackRepository implements ITriggerFeedbackRepository {
    private readonly TABLE_NAME = 'trigger_foods';

    constructor(private readonly supabase: SupabaseClient) { }

    async upsert(userId: string, feedback: TriggerFeedback): Promise<void> {
        const row = TriggerFeedbackMapper.toPersistence(userId, feedback);

        const { error } = await this.supabase
            .from(this.TABLE_NAME)
            .upsert(row, { onConflict: 'user_id,food_name' });

        if (error) {
            throw new DatabaseError(`Failed to upsert trigger feedback: ${error.message}`, error);
        }
    }

    async findByFood(userId: string, foodName: string): Promise<TriggerFeedback | null> {
        const normalizedName = foodName.toLowerCase().trim();

        const { data, error } = await this.supabase
            .from(this.TABLE_NAME)
            .select('*')
            .eq('user_id', userId)
            .eq('food_name', normalizedName)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            throw new DatabaseError(`Failed to find trigger feedback: ${error.message}`, error);
        }

        return data ? TriggerFeedbackMapper.toDomain(data) : null;
    }

    async findByUserId(userId: string): Promise<TriggerFeedback[]> {
        const { data, error } = await this.supabase
            .from(this.TABLE_NAME)
            .select('*')
            .eq('user_id', userId)
            .order('updated_at', { ascending: false });

        if (error) {
            throw new DatabaseError(`Failed to fetch trigger feedback: ${error.message}`, error);
        }

        return (data || []).map(row => TriggerFeedbackMapper.toDomain(row));
    }

    async delete(userId: string, foodName: string): Promise<void> {
        const normalizedName = foodName.toLowerCase().trim();

        const { error } = await this.supabase
            .from(this.TABLE_NAME)
            .delete()
            .eq('user_id', userId)
            .eq('food_name', normalizedName);

        if (error) {
            throw new DatabaseError(`Failed to delete trigger feedback: ${error.message}`, error);
        }
    }
}
