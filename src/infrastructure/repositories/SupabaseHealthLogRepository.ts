/**
 * SupabaseHealthLogRepository
 * Concrete implementation of IHealthLogRepository using Supabase
 */
import { SupabaseClient } from '@supabase/supabase-js';
import { HealthLog, HealthLogType } from '../../domain';
import { IHealthLogRepository } from '../../application/ports/repositories';
import { HealthLogMapper } from '../mappers';
import { DatabaseError } from '../errors';

export class SupabaseHealthLogRepository implements IHealthLogRepository {
    private readonly TABLE_NAME = 'health_logs';

    constructor(private readonly supabase: SupabaseClient) { }

    async upsert(userId: string, log: HealthLog): Promise<void> {
        const row = HealthLogMapper.toPersistence(userId, log);

        const { error } = await this.supabase
            .from(this.TABLE_NAME)
            .upsert(row, { onConflict: 'user_id,date,log_type' });

        if (error) {
            throw new DatabaseError(`Failed to upsert health log: ${error.message}`, error);
        }
    }

    async findByDateAndType(userId: string, date: string, type: HealthLogType): Promise<HealthLog | null> {
        const { data, error } = await this.supabase
            .from(this.TABLE_NAME)
            .select('*')
            .eq('user_id', userId)
            .eq('date', date)
            .eq('log_type', type)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            throw new DatabaseError(`Failed to find health log: ${error.message}`, error);
        }

        return data ? HealthLogMapper.toDomain(data) : null;
    }

    async findByDate(userId: string, date: string): Promise<HealthLog[]> {
        const { data, error } = await this.supabase
            .from(this.TABLE_NAME)
            .select('*')
            .eq('user_id', userId)
            .eq('date', date);

        if (error) {
            throw new DatabaseError(`Failed to fetch health logs by date: ${error.message}`, error);
        }

        return (data || []).map(row => HealthLogMapper.toDomain(row));
    }

    async findByType(userId: string, type: HealthLogType): Promise<HealthLog[]> {
        const { data, error } = await this.supabase
            .from(this.TABLE_NAME)
            .select('*')
            .eq('user_id', userId)
            .eq('log_type', type)
            .order('date', { ascending: false });

        if (error) {
            throw new DatabaseError(`Failed to fetch health logs by type: ${error.message}`, error);
        }

        return (data || []).map(row => HealthLogMapper.toDomain(row));
    }

    async findByDateRange(userId: string, start: string, end: string): Promise<HealthLog[]> {
        const { data, error } = await this.supabase
            .from(this.TABLE_NAME)
            .select('*')
            .eq('user_id', userId)
            .gte('date', start)
            .lte('date', end)
            .order('date', { ascending: false });

        if (error) {
            throw new DatabaseError(`Failed to fetch health logs by date range: ${error.message}`, error);
        }

        return (data || []).map(row => HealthLogMapper.toDomain(row));
    }

    async findToday(userId: string): Promise<HealthLog[]> {
        const todayStr = new Date().toISOString().split('T')[0];
        return this.findByDate(userId, todayStr);
    }

    async delete(userId: string, date: string, type: HealthLogType): Promise<void> {
        const { error } = await this.supabase
            .from(this.TABLE_NAME)
            .delete()
            .eq('user_id', userId)
            .eq('date', date)
            .eq('log_type', type);

        if (error) {
            throw new DatabaseError(`Failed to delete health log: ${error.message}`, error);
        }
    }
}
