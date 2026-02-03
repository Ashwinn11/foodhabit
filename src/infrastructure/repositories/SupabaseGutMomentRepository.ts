/**
 * SupabaseGutMomentRepository
 * Concrete implementation of IGutMomentRepository using Supabase
 */
import { SupabaseClient } from '@supabase/supabase-js';
import { GutMoment } from '../../domain';
import { IGutMomentRepository } from '../../application/ports/repositories';
import { GutMomentMapper } from '../mappers';
import { DatabaseError } from '../errors';

export class SupabaseGutMomentRepository implements IGutMomentRepository {
    private readonly TABLE_NAME = 'gut_logs';

    constructor(private readonly supabase: SupabaseClient) { }

    async save(userId: string, moment: GutMoment): Promise<void> {
        const row = GutMomentMapper.toPersistence(userId, moment);

        const { error } = await this.supabase
            .from(this.TABLE_NAME)
            .insert(row);

        if (error) {
            throw new DatabaseError(`Failed to save gut moment: ${error.message}`, error);
        }
    }

    async update(userId: string, moment: GutMoment): Promise<void> {
        const row = GutMomentMapper.toPersistence(userId, moment);

        const { error } = await this.supabase
            .from(this.TABLE_NAME)
            .update(row)
            .eq('id', moment.id)
            .eq('user_id', userId);

        if (error) {
            throw new DatabaseError(`Failed to update gut moment: ${error.message}`, error);
        }
    }

    async findById(userId: string, id: string): Promise<GutMoment | null> {
        const { data, error } = await this.supabase
            .from(this.TABLE_NAME)
            .select('*')
            .eq('id', id)
            .eq('user_id', userId)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null; // Not found
            throw new DatabaseError(`Failed to find gut moment: ${error.message}`, error);
        }

        return data ? GutMomentMapper.toDomain(data) : null;
    }

    async findByUserId(userId: string): Promise<GutMoment[]> {
        const { data, error } = await this.supabase
            .from(this.TABLE_NAME)
            .select('*')
            .eq('user_id', userId)
            .order('timestamp', { ascending: false });

        if (error) {
            throw new DatabaseError(`Failed to fetch gut moments: ${error.message}`, error);
        }

        return (data || []).map(row => GutMomentMapper.toDomain(row));
    }

    async findByDateRange(userId: string, start: Date, end: Date): Promise<GutMoment[]> {
        const { data, error } = await this.supabase
            .from(this.TABLE_NAME)
            .select('*')
            .eq('user_id', userId)
            .gte('timestamp', start.toISOString())
            .lte('timestamp', end.toISOString())
            .order('timestamp', { ascending: false });

        if (error) {
            throw new DatabaseError(`Failed to fetch gut moments by date range: ${error.message}`, error);
        }

        return (data || []).map(row => GutMomentMapper.toDomain(row));
    }

    async findRecentDays(userId: string, days: number): Promise<GutMoment[]> {
        const start = new Date();
        start.setDate(start.getDate() - days);
        start.setHours(0, 0, 0, 0);

        return this.findByDateRange(userId, start, new Date());
    }

    async findToday(userId: string): Promise<GutMoment[]> {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        return this.findByDateRange(userId, today, tomorrow);
    }

    async delete(userId: string, id: string): Promise<void> {
        const { error } = await this.supabase
            .from(this.TABLE_NAME)
            .delete()
            .eq('id', id)
            .eq('user_id', userId);

        if (error) {
            throw new DatabaseError(`Failed to delete gut moment: ${error.message}`, error);
        }
    }

    async count(userId: string): Promise<number> {
        const { count, error } = await this.supabase
            .from(this.TABLE_NAME)
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId);

        if (error) {
            throw new DatabaseError(`Failed to count gut moments: ${error.message}`, error);
        }

        return count || 0;
    }
}
