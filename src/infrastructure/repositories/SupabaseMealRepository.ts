/**
 * SupabaseMealRepository
 * Concrete implementation of IMealRepository using Supabase
 */
import { SupabaseClient } from '@supabase/supabase-js';
import { Meal } from '../../domain';
import { IMealRepository } from '../../application/ports/repositories';
import { MealMapper } from '../mappers';
import { DatabaseError } from '../errors';

export class SupabaseMealRepository implements IMealRepository {
    private readonly TABLE_NAME = 'meals';

    constructor(private readonly supabase: SupabaseClient) { }

    async save(userId: string, meal: Meal): Promise<void> {
        const row = MealMapper.toPersistence(userId, meal);

        const { error } = await this.supabase
            .from(this.TABLE_NAME)
            .insert(row);

        if (error) {
            throw new DatabaseError(`Failed to save meal: ${error.message}`, error);
        }
    }

    async update(userId: string, meal: Meal): Promise<void> {
        const row = MealMapper.toPersistence(userId, meal);

        const { error } = await this.supabase
            .from(this.TABLE_NAME)
            .update(row)
            .eq('id', meal.id)
            .eq('user_id', userId);

        if (error) {
            throw new DatabaseError(`Failed to update meal: ${error.message}`, error);
        }
    }

    async findById(userId: string, id: string): Promise<Meal | null> {
        const { data, error } = await this.supabase
            .from(this.TABLE_NAME)
            .select('*')
            .eq('id', id)
            .eq('user_id', userId)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            throw new DatabaseError(`Failed to find meal: ${error.message}`, error);
        }

        return data ? MealMapper.toDomain(data) : null;
    }

    async findByUserId(userId: string): Promise<Meal[]> {
        const { data, error } = await this.supabase
            .from(this.TABLE_NAME)
            .select('*')
            .eq('user_id', userId)
            .order('timestamp', { ascending: false });

        if (error) {
            throw new DatabaseError(`Failed to fetch meals: ${error.message}`, error);
        }

        return (data || []).map(row => MealMapper.toDomain(row));
    }

    async findByDateRange(userId: string, start: Date, end: Date): Promise<Meal[]> {
        const { data, error } = await this.supabase
            .from(this.TABLE_NAME)
            .select('*')
            .eq('user_id', userId)
            .gte('timestamp', start.toISOString())
            .lte('timestamp', end.toISOString())
            .order('timestamp', { ascending: false });

        if (error) {
            throw new DatabaseError(`Failed to fetch meals by date range: ${error.message}`, error);
        }

        return (data || []).map(row => MealMapper.toDomain(row));
    }

    async findRecentDays(userId: string, days: number): Promise<Meal[]> {
        const start = new Date();
        start.setDate(start.getDate() - days);
        start.setHours(0, 0, 0, 0);

        return this.findByDateRange(userId, start, new Date());
    }

    async findToday(userId: string): Promise<Meal[]> {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        return this.findByDateRange(userId, today, tomorrow);
    }

    async findByTypeAndDate(userId: string, mealType: string, date: Date): Promise<Meal[]> {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        const { data, error } = await this.supabase
            .from(this.TABLE_NAME)
            .select('*')
            .eq('user_id', userId)
            .eq('meal_type', mealType)
            .gte('timestamp', startOfDay.toISOString())
            .lte('timestamp', endOfDay.toISOString());

        if (error) {
            throw new DatabaseError(`Failed to fetch meals by type: ${error.message}`, error);
        }

        return (data || []).map(row => MealMapper.toDomain(row));
    }

    async delete(userId: string, id: string): Promise<void> {
        const { error } = await this.supabase
            .from(this.TABLE_NAME)
            .delete()
            .eq('id', id)
            .eq('user_id', userId);

        if (error) {
            throw new DatabaseError(`Failed to delete meal: ${error.message}`, error);
        }
    }
}
