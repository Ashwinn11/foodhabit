/**
 * SupabaseUserRepository
 * Concrete implementation of IUserRepository using Supabase
 */
import { SupabaseClient } from '@supabase/supabase-js';
import { User } from '../../domain';
import { IUserRepository, OnboardingData } from '../../application/ports/repositories';
import { UserMapper } from '../mappers';
import { DatabaseError } from '../errors';

export class SupabaseUserRepository implements IUserRepository {
    private readonly TABLE_NAME = 'users';

    constructor(private readonly supabase: SupabaseClient) { }

    async findById(userId: string): Promise<User | null> {
        const { data, error } = await this.supabase
            .from(this.TABLE_NAME)
            .select('*')
            .eq('id', userId)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null; // Not found
            throw new DatabaseError(`Failed to find user: ${error.message}`, error);
        }

        return data ? UserMapper.toDomain(data) : null;
    }

    async upsert(user: User & { id: string }): Promise<void> {
        const row = UserMapper.toPersistence(user);

        const { error } = await this.supabase
            .from(this.TABLE_NAME)
            .upsert(row, { onConflict: 'id' });

        if (error) {
            throw new DatabaseError(`Failed to upsert user: ${error.message}`, error);
        }
    }

    async updateName(userId: string, name: string): Promise<void> {
        const { error } = await this.supabase
            .from(this.TABLE_NAME)
            .update({ full_name: name, updated_at: new Date().toISOString() })
            .eq('id', userId);

        if (error) {
            throw new DatabaseError(`Failed to update user name: ${error.message}`, error);
        }
    }

    async isOnboardingComplete(userId: string): Promise<boolean> {
        const { data, error } = await this.supabase
            .from(this.TABLE_NAME)
            .select('onboarding_completed')
            .eq('id', userId)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return false;
            throw new DatabaseError(`Failed to check onboarding status: ${error.message}`, error);
        }

        return data?.onboarding_completed || false;
    }

    async completeOnboarding(userId: string, data: OnboardingData): Promise<void> {
        const { error } = await this.supabase
            .from(this.TABLE_NAME)
            .upsert({
                id: userId,
                onboarding_completed: true,
                onboarding_data: data,
                updated_at: new Date().toISOString()
            }, {
                onConflict: 'id'
            });

        if (error) {
            throw new DatabaseError(`Failed to complete onboarding: ${error.message}`, error);
        }
    }

    async getOnboardingData(userId: string): Promise<OnboardingData | null> {
        const { data, error } = await this.supabase
            .from(this.TABLE_NAME)
            .select('onboarding_data')
            .eq('id', userId)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            throw new DatabaseError(`Failed to get onboarding data: ${error.message}`, error);
        }

        return data?.onboarding_data || null;
    }
}
