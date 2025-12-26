import { supabase } from '../../config/supabase';

export interface GutHarmonyUser {
  id: string;
  user_id: string;
  name: string;
  avatar_seed?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Create or update user profile in user_profiles table
 */
export const createUserProfile = async (
  userId: string,
  data: {
    name: string;
  }
): Promise<GutHarmonyUser> => {
  const { data: result, error } = await supabase
    .from('user_profiles')
    .upsert({
      user_id: userId,
      name: data.name,
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
    .from('user_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows found
  return data as GutHarmonyUser | null;
};

/**
 * Check if user completed onboarding (always true now - no onboarding)
 */
export const hasCompletedOnboarding = async (userId: string): Promise<boolean> => {
  return true; // No onboarding required anymore
};
