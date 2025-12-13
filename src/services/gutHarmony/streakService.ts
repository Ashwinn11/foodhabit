import { supabase } from '../../config/supabase';

export interface UserStreak {
  id: string;
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_logged_date: string | null;
  harmony_points: number;
  created_at: string;
  updated_at: string;
}

/**
 * Get user's streak info
 */
export const getUserStreak = async (userId: string): Promise<UserStreak | null> => {
  const { data, error } = await supabase
    .from('user_streaks')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data as UserStreak | null;
};

/**
 * Update streak after user logs an entry
 * Returns true if streak was maintained/extended, false if restarted
 */
export const updateStreak = async (userId: string): Promise<boolean> => {
  const today = new Date().toISOString().split('T')[0];
  const streak = await getUserStreak(userId);

  if (!streak) {
    // Create initial streak
    await supabase
      .from('user_streaks')
      .insert({
        user_id: userId,
        current_streak: 1,
        longest_streak: 1,
        last_logged_date: today,
        harmony_points: 50, // First entry bonus
      });
    return true;
  }

  // Check if already logged today
  if (streak.last_logged_date === today) {
    return true; // Already logged today, no streak update needed
  }

  // Check if logged yesterday (streak continues)
  const yesterday = new Date(new Date().setDate(new Date().getDate() - 1))
    .toISOString()
    .split('T')[0];

  let newStreak = streak.current_streak;
  if (streak.last_logged_date === yesterday) {
    newStreak = streak.current_streak + 1; // Continue streak
  } else {
    newStreak = 1; // Restart streak
  }

  const newLongestStreak = Math.max(newStreak, streak.longest_streak);
  const points = newStreak % 7 === 0 ? 100 : 50; // Bonus at 7-day milestones

  const { error } = await supabase
    .from('user_streaks')
    .update({
      current_streak: newStreak,
      longest_streak: newLongestStreak,
      last_logged_date: today,
      harmony_points: streak.harmony_points + points,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId);

  if (error) throw error;

  return newStreak > streak.current_streak || streak.last_logged_date === yesterday;
};

/**
 * Add harmony points (for achievements, milestones, etc)
 */
export const addHarmonyPoints = async (
  userId: string,
  points: number
): Promise<void> => {
  const streak = await getUserStreak(userId);
  if (!streak) return;

  const { error } = await supabase
    .from('user_streaks')
    .update({
      harmony_points: streak.harmony_points + points,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId);

  if (error) throw error;
};

/**
 * Unlock an achievement
 */
export const unlockAchievement = async (
  userId: string,
  achievementType: string,
  name: string,
  description?: string
): Promise<void> => {
  const { error } = await supabase
    .from('achievements')
    .insert({
      user_id: userId,
      achievement_type: achievementType,
      achievement_name: name,
      description,
    });

  if (error && error.code !== '23505') throw error; // 23505 = duplicate

  // Award points for achievement
  await addHarmonyPoints(userId, 25);
};

/**
 * Get user's achievements
 */
export const getAchievements = async (userId: string) => {
  const { data, error } = await supabase
    .from('achievements')
    .select('*')
    .eq('user_id', userId)
    .order('unlocked_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

/**
 * Check if user has achievement
 */
export const hasAchievement = async (
  userId: string,
  achievementType: string
): Promise<boolean> => {
  const { data, error } = await supabase
    .from('achievements')
    .select('id')
    .eq('user_id', userId)
    .eq('achievement_type', achievementType)
    .limit(1);

  if (error) throw error;
  return data && data.length > 0;
};

/**
 * Get current streak count
 */
export const getStreakCount = async (userId: string): Promise<number> => {
  const streak = await getUserStreak(userId);
  return streak?.current_streak || 0;
};

export const streakService = {
  getUserStreak,
  updateStreak,
  addHarmonyPoints,
  unlockAchievement,
  getAchievements,
  hasAchievement,
  getStreakCount,
};
