import { supabase } from '../../config/supabase';

export interface GutHarmonyUser {
  id: string;
  name: string;
  age?: number;
  condition: string;
  main_issue: string;
  personality_style: string;
  created_at: string;
  updated_at: string;
}

/**
 * Create or update user profile in gut_harmony users table
 */
export const createUserProfile = async (
  userId: string,
  data: {
    name: string;
    age?: number;
    condition: string;
    main_issue: string;
    personality_style?: string;
  }
): Promise<GutHarmonyUser> => {
  const { data: result, error } = await supabase
    .from('users')
    .upsert({
      id: userId,
      ...data,
      personality_style: data.personality_style || 'motivational_buddy',
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return result as GutHarmonyUser;
};

/**
 * Get user profile
 */
export const getUserProfile = async (userId: string): Promise<GutHarmonyUser | null> => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows found
  return data as GutHarmonyUser | null;
};

/**
 * Initialize user streak record
 */
export const initializeUserStreak = async (userId: string) => {
  const { error } = await supabase
    .from('user_streaks')
    .upsert({
      user_id: userId,
      current_streak: 0,
      longest_streak: 0,
      harmony_points: 0,
    })
    .select()
    .single();

  if (error && error.code !== '23505') throw error; // 23505 = unique violation (already exists)
};

/**
 * Check if user completed onboarding
 */
export const hasCompletedOnboarding = async (userId: string): Promise<boolean> => {
  const user = await getUserProfile(userId);
  return !!user && !!user.condition && !!user.main_issue;
};
