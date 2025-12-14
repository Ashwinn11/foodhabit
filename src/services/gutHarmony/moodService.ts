import { supabase } from '../../config/supabase';

export interface MoodEntry {
  id: string;
  user_id: string;
  entry_date: string;
  mood_type: string;
  mood_description?: string;
  stress_level?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

const MOOD_TYPES = ['anxious', 'calm', 'stressed', 'energetic', 'tired', 'happy', 'peaceful'];

/**
 * Log a mood entry for today
 */
export const logMoodEntry = async (
  userId: string,
  data: {
    mood_type: string;
    stress_level?: number;
    notes?: string;
  }
): Promise<MoodEntry> => {
  const today = new Date().toISOString().split('T')[0];

  const { data: result, error } = await supabase
    .from('mood_entries')
    .upsert({
      user_id: userId,
      entry_date: today,
      mood_type: data.mood_type,
      stress_level: data.stress_level,
      notes: data.notes,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return result as MoodEntry;
};

/**
 * Get today's mood entry
 */
export const getTodayMood = async (userId: string): Promise<MoodEntry | null> => {
  const today = new Date().toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('mood_entries')
    .select('*')
    .eq('user_id', userId)
    .eq('entry_date', today)
    .single();

  if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows found
  return data as MoodEntry | null;
};

/**
 * Get mood entries for a date range
 */
export const getMoodsByDateRange = async (
  userId: string,
  startDate: Date | string,
  endDate: Date | string
): Promise<MoodEntry[]> => {
  const startStr = typeof startDate === 'string'
    ? startDate
    : startDate.toISOString().split('T')[0];
  const endStr = typeof endDate === 'string'
    ? endDate
    : endDate.toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('mood_entries')
    .select('*')
    .eq('user_id', userId)
    .gte('entry_date', startStr)
    .lte('entry_date', endStr)
    .order('entry_date', { ascending: false });

  if (error) throw error;
  return data as MoodEntry[];
};

/**
 * Get recent moods (last N days)
 */
export const getRecentMoods = async (userId: string, days = 7): Promise<MoodEntry[]> => {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  return getMoodsByDateRange(userId, startDate, endDate);
};

/**
 * Get mood statistics for a date range
 */
export const getMoodStats = async (
  userId: string,
  days = 7
): Promise<{ primaryMood: string; avgStress: number; entryCount: number }> => {
  const moods = await getRecentMoods(userId, days);

  if (moods.length === 0) {
    return { primaryMood: 'unknown', avgStress: 0, entryCount: 0 };
  }

  const moodCounts = moods.reduce(
    (acc, mood) => {
      acc[mood.mood_type] = (acc[mood.mood_type] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const primaryMood = Object.entries(moodCounts).sort(([, a], [, b]) => b - a)[0][0];

  const totalStress = moods.reduce((sum, mood) => sum + (mood.stress_level || 0), 0);
  const avgStress = Math.round(totalStress / moods.length);

  return { primaryMood, avgStress, entryCount: moods.length };
};

export const moodService = {
  logMoodEntry,
  getTodayMood,
  getMoodsByDateRange,
  getRecentMoods,
  getMoodStats,
  MOOD_TYPES,
};
