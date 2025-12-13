import { supabase } from '../../config/supabase';

export interface StoolEntry {
  id: string;
  user_id: string;
  entry_time: string;
  logged_at: string;
  stool_type: number;
  energy_level?: number;
  strain_level?: number;
  duration_minutes?: number;
  color?: string;
  symptoms: Record<string, boolean>;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface MealEntry {
  id: string;
  user_id: string;
  meal_time: string;
  logged_at: string;
  meal_name: string;
  meal_type?: string;
  foods: string[];
  portion_size?: string;
  allergens: string[];
  notes?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Log a stool entry
 */
export const logStoolEntry = async (
  userId: string,
  data: {
    entry_time: string; // ISO timestamp
    stool_type: number; // 1-7 Bristol scale
    energy_level?: number;
    strain_level?: number;
    duration_minutes?: number;
    color?: string;
    symptoms: Record<string, boolean>;
    notes?: string;
  }
): Promise<StoolEntry> => {
  const { data: result, error } = await supabase
    .from('stool_entries')
    .insert({
      user_id: userId,
      ...data,
    })
    .select()
    .single();

  if (error) throw error;
  return result as StoolEntry;
};

/**
 * Log a meal entry
 */
export const logMealEntry = async (
  userId: string,
  data: {
    meal_time: string; // ISO timestamp
    meal_name: string;
    meal_type?: string;
    foods: string[];
    portion_size?: string;
    allergens?: string[];
    notes?: string;
  }
): Promise<MealEntry> => {
  const { data: result, error } = await supabase
    .from('meal_entries')
    .insert({
      user_id: userId,
      ...data,
      allergens: data.allergens || [],
    })
    .select()
    .single();

  if (error) throw error;
  return result as MealEntry;
};

/**
 * Get user's stool entries
 */
export const getStoolEntries = async (
  userId: string,
  limit = 100
): Promise<StoolEntry[]> => {
  const { data, error } = await supabase
    .from('stool_entries')
    .select('*')
    .eq('user_id', userId)
    .order('entry_time', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data as StoolEntry[];
};

/**
 * Get user's meal entries
 */
export const getMealEntries = async (
  userId: string,
  limit = 100
): Promise<MealEntry[]> => {
  const { data, error } = await supabase
    .from('meal_entries')
    .select('*')
    .eq('user_id', userId)
    .order('meal_time', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data as MealEntry[];
};

/**
 * Count user's entries
 */
export const getEntryCount = async (userId: string): Promise<number> => {
  const { count, error } = await supabase
    .from('stool_entries')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  if (error) throw error;
  return count || 0;
};

/**
 * Get entries for a specific date range
 */
export const getEntriesByDateRange = async (
  userId: string,
  startDate: Date | string,
  endDate: Date | string
): Promise<StoolEntry[]> => {
  const startStr = typeof startDate === 'string' ? startDate : startDate.toISOString();
  const endStr = typeof endDate === 'string' ? endDate : endDate.toISOString();

  const { data, error } = await supabase
    .from('stool_entries')
    .select('*')
    .eq('user_id', userId)
    .gte('entry_time', startStr)
    .lte('entry_time', endStr)
    .order('entry_time', { ascending: false });

  if (error) throw error;
  return data as StoolEntry[];
};

/**
 * Get recent entries (last N days)
 */
export const getRecentEntries = async (
  userId: string,
  days = 7
): Promise<StoolEntry[]> => {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  return getEntriesByDateRange(userId, startDate, endDate);
};

export const entryService = {
  logStoolEntry,
  logMealEntry,
  getStoolEntries,
  getMealEntries,
  getEntryCount,
  getEntriesByDateRange,
  getRecentEntries,
};
