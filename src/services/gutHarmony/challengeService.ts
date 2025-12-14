import { supabase } from '../../config/supabase';

export interface WeeklyChallenge {
  id: string;
  user_id: string;
  challenge_week: string;
  challenge_type: string;
  challenge_description: string;
  trigger_food?: string;
  status: 'active' | 'completed' | 'failed' | 'skipped';
  start_date: string;
  end_date: string;
  completed_date?: string;
  violation_count: number;
  reward_points: number;
  created_at: string;
  updated_at: string;
}

const CHALLENGE_TEMPLATES = [
  {
    type: 'avoid_food',
    description: (food: string) => `Avoid ${food} this week`,
  },
  {
    type: 'test_food',
    description: (food: string) => `Test eating ${food} and track symptoms`,
  },
  {
    type: 'symptom_focus',
    description: () => 'Track triggers for your most common symptom',
  },
];

/**
 * Create a new weekly challenge for a user
 */
export const createWeeklyChallenge = async (
  userId: string,
  data: {
    challenge_type: string;
    challenge_description: string;
    trigger_food?: string;
  }
): Promise<WeeklyChallenge> => {
  const today = new Date();
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay());
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);

  const { data: result, error } = await supabase
    .from('weekly_challenges')
    .insert({
      user_id: userId,
      challenge_week: weekStart.toISOString().split('T')[0],
      challenge_type: data.challenge_type,
      challenge_description: data.challenge_description,
      trigger_food: data.trigger_food,
      status: 'active',
      start_date: weekStart.toISOString().split('T')[0],
      end_date: weekEnd.toISOString().split('T')[0],
      violation_count: 0,
      reward_points: 0,
    })
    .select()
    .single();

  if (error) throw error;
  return result as WeeklyChallenge;
};

/**
 * Get this week's challenge for a user
 */
export const getThisWeekChallenge = async (userId: string): Promise<WeeklyChallenge | null> => {
  const today = new Date();
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay());

  const { data, error } = await supabase
    .from('weekly_challenges')
    .select('*')
    .eq('user_id', userId)
    .eq('challenge_week', weekStart.toISOString().split('T')[0])
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data as WeeklyChallenge | null;
};

/**
 * Record a violation of the challenge (e.g., ate the forbidden food)
 */
export const recordViolation = async (challengeId: string): Promise<WeeklyChallenge> => {
  const { data: challenge, error: fetchError } = await supabase
    .from('weekly_challenges')
    .select('*')
    .eq('id', challengeId)
    .single();

  if (fetchError) throw fetchError;

  const { data: result, error } = await supabase
    .from('weekly_challenges')
    .update({
      violation_count: (challenge.violation_count || 0) + 1,
      updated_at: new Date().toISOString(),
    })
    .eq('id', challengeId)
    .select()
    .single();

  if (error) throw error;
  return result as WeeklyChallenge;
};

/**
 * Complete a challenge
 */
export const completeChallenge = async (challengeId: string): Promise<WeeklyChallenge> => {
  const { data: challenge, error: fetchError } = await supabase
    .from('weekly_challenges')
    .select('*')
    .eq('id', challengeId)
    .single();

  if (fetchError) throw fetchError;

  // Determine reward based on violations
  let rewardPoints = 0;
  if (challenge.violation_count === 0) {
    rewardPoints = 150; // Perfect completion
  } else if (challenge.violation_count <= 2) {
    rewardPoints = 50; // Partial completion
  }

  const { data: result, error } = await supabase
    .from('weekly_challenges')
    .update({
      status: 'completed',
      completed_date: new Date().toISOString(),
      reward_points: rewardPoints,
      updated_at: new Date().toISOString(),
    })
    .eq('id', challengeId)
    .select()
    .single();

  if (error) throw error;
  return result as WeeklyChallenge;
};

/**
 * Skip or fail a challenge
 */
export const failChallenge = async (challengeId: string): Promise<WeeklyChallenge> => {
  const { data: result, error } = await supabase
    .from('weekly_challenges')
    .update({
      status: 'failed',
      updated_at: new Date().toISOString(),
    })
    .eq('id', challengeId)
    .select()
    .single();

  if (error) throw error;
  return result as WeeklyChallenge;
};

/**
 * Get all challenges for a user
 */
export const getUserChallenges = async (userId: string): Promise<WeeklyChallenge[]> => {
  const { data, error } = await supabase
    .from('weekly_challenges')
    .select('*')
    .eq('user_id', userId)
    .order('challenge_week', { ascending: false });

  if (error) throw error;
  return data as WeeklyChallenge[];
};

/**
 * Calculate days remaining in current challenge
 */
export const getDaysRemaining = (challenge: WeeklyChallenge): number => {
  const endDate = new Date(challenge.end_date);
  const today = new Date();
  const daysLeft = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(0, daysLeft);
};

export const challengeService = {
  createWeeklyChallenge,
  getThisWeekChallenge,
  recordViolation,
  completeChallenge,
  failChallenge,
  getUserChallenges,
  getDaysRemaining,
  CHALLENGE_TEMPLATES,
};
