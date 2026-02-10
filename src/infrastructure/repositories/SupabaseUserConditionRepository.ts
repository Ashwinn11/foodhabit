/**
 * SupabaseUserConditionRepository
 * Infrastructure implementation of IUserConditionRepository
 *
 * Located in INFRASTRUCTURE layer
 * Depends on domain interfaces, not the other way around
 * Easy to replace with another implementation (test, in-memory, etc.)
 */

import { IUserConditionRepository } from '../../domain/repositories/IUserConditionRepository';
import { Condition } from '../../domain/value-objects/Condition';
import { Result, Ok, Err } from '../../shared/types/Result';
import { supabase } from '../../config/supabase';

export class SupabaseUserConditionRepository implements IUserConditionRepository {
  async getCondition(userId: string): Promise<Result<Condition, Error>> {
    try {
      const { data, error } = await supabase
        .from('user_condition_preferences')
        .select('condition')
        .eq('user_id', userId)
        .single();

      if (error) {
        return Err(new Error(`Failed to fetch condition: ${error.message}`));
      }

      if (!data) {
        return Err(new Error('User condition not found'));
      }

      try {
        const condition = Condition.fromString(data.condition);
        return Ok(condition);
      } catch (e) {
        return Err(new Error(`Invalid condition from database: ${(e as Error).message}`));
      }
    } catch (e) {
      return Err(new Error(`Database error: ${(e as Error).message}`));
    }
  }

  async setCondition(userId: string, condition: Condition): Promise<Result<void, Error>> {
    try {
      const { error } = await supabase
        .from('user_condition_preferences')
        .upsert({
          user_id: userId,
          condition: condition.getType(),
          updated_at: new Date().toISOString()
        });

      if (error) {
        return Err(new Error(`Failed to save condition: ${error.message}`));
      }

      return Ok(undefined);
    } catch (e) {
      return Err(new Error(`Database error: ${(e as Error).message}`));
    }
  }

  async hasCondition(userId: string): Promise<Result<boolean, Error>> {
    try {
      const { data, error } = await supabase
        .from('user_condition_preferences')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        // PGRST116 = no rows returned (expected case)
        return Err(new Error(`Database error: ${error.message}`));
      }

      return Ok(!!data);
    } catch (e) {
      return Err(new Error(`Database error: ${(e as Error).message}`));
    }
  }
}
