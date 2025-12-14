import { supabase } from '../../config/supabase';
import { getStoolEntries, getRecentEntries } from './entryService';

export interface UserScores {
  id: string;
  user_id: string;
  gut_health_score: number;
  bloating_index: number;
  last_updated: string;
  created_at: string;
  updated_at: string;
}

export interface ScoreBreakdown {
  gutHealthScore: number;
  bloatingIndex: number;
  symptomFreeDays: number;
  avgEnergy: number;
  loggingStreak: number;
  bloatingDays: number;
  lastUpdated: string;
}

/**
 * Calculate Gut Health Score based on:
 * - Baseline: 50%
 * - Symptom-free days: +2% per day (max +20%)
 * - Average energy level: +1% per point above 5 (max +10%)
 * - Logging consistency: +1% per consecutive logging day (max +20%)
 */
const calculateGutHealthScore = (breakdown: {
  symptomFreeDays: number;
  avgEnergy: number;
  loggingStreak: number;
}): number => {
  let score = 50; // baseline

  // Symptom-free days bonus (max +20%)
  score += Math.min(breakdown.symptomFreeDays * 2, 20);

  // Energy bonus (max +10%)
  const energyAboveBaseline = Math.max(breakdown.avgEnergy - 5, 0);
  score += Math.min(Math.floor(energyAboveBaseline), 10);

  // Logging consistency bonus (max +20%)
  score += Math.min(breakdown.loggingStreak, 20);

  return Math.min(Math.max(score, 0), 100);
};

/**
 * Calculate Bloating Index based on:
 * - 0% = No bloating days this week
 * - 100% = Every day has bloating logged
 * - Scales based on bloating frequency in last 7 days
 */
const calculateBloatingIndex = (breakdown: {
  bloatingDays: number;
}): number => {
  const bloatingPercentage = Math.min((breakdown.bloatingDays / 7) * 100, 100);
  return Math.round(bloatingPercentage);
};

/**
 * Get symptom-free days in last 7 days
 */
const getSymptomFreeDays = async (userId: string): Promise<number> => {
  const entries = await getRecentEntries(userId, 7);

  const symptomFreeDays = entries.filter((entry) => {
    const symptoms = entry.symptoms || {};
    const hasSymptoms = Object.values(symptoms).some((symptom) => symptom === true);
    return !hasSymptoms;
  }).length;

  return symptomFreeDays;
};

/**
 * Get average energy level from last 7 days
 */
const getAverageEnergy = async (userId: string): Promise<number> => {
  const entries = await getRecentEntries(userId, 7);

  if (entries.length === 0) return 5;

  const energySum = entries.reduce((sum, entry) => sum + (entry.energy_level || 0), 0);
  return Math.round(energySum / entries.length);
};

/**
 * Get bloating days in last 7 days
 */
const getBloatingDays = async (userId: string): Promise<number> => {
  const entries = await getRecentEntries(userId, 7);

  const bloatingDays = entries.filter((entry) => {
    const symptoms = entry.symptoms || {};
    return symptoms.bloating === true;
  }).length;

  return bloatingDays;
};

/**
 * Get current logging streak
 */
const getLoggingStreak = async (userId: string): Promise<number> => {
  const entries = await getStoolEntries(userId, 30); // Get last 30 entries

  if (entries.length === 0) return 0;

  // Sort by entry date, most recent first
  const sortedEntries = [...entries].sort(
    (a, b) => new Date(b.entry_time).getTime() - new Date(a.entry_time).getTime()
  );

  let streak = 0;
  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  for (const entry of sortedEntries) {
    const entryDate = new Date(entry.entry_time);
    entryDate.setHours(0, 0, 0, 0);

    if (entryDate.getTime() === currentDate.getTime()) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else if (entryDate.getTime() < currentDate.getTime()) {
      break;
    }
  }

  return streak;
};

/**
 * Calculate and update user scores
 */
export const calculateAndUpdateScores = async (userId: string): Promise<ScoreBreakdown> => {
  const [symptomFreeDays, avgEnergy, loggingStreak, bloatingDays] = await Promise.all([
    getSymptomFreeDays(userId),
    getAverageEnergy(userId),
    getLoggingStreak(userId),
    getBloatingDays(userId),
  ]);

  const breakdown: ScoreBreakdown = {
    gutHealthScore: calculateGutHealthScore({
      symptomFreeDays,
      avgEnergy,
      loggingStreak,
    }),
    bloatingIndex: calculateBloatingIndex({ bloatingDays }),
    symptomFreeDays,
    avgEnergy,
    loggingStreak,
    bloatingDays,
    lastUpdated: new Date().toISOString(),
  };

  // Update scores in database
  const { error } = await supabase
    .from('user_scores')
    .upsert(
      {
        user_id: userId,
        gut_health_score: breakdown.gutHealthScore,
        bloating_index: breakdown.bloatingIndex,
        last_updated: breakdown.lastUpdated,
        updated_at: breakdown.lastUpdated,
      },
      { onConflict: 'user_id' }
    );

  if (error) throw error;

  return breakdown;
};

/**
 * Get user's current scores
 */
export const getUserScores = async (userId: string): Promise<UserScores | null> => {
  const { data, error } = await supabase
    .from('user_scores')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data as UserScores | null;
};

/**
 * Get score breakdown with explanation
 */
export const getScoreBreakdown = async (userId: string): Promise<ScoreBreakdown> => {
  return calculateAndUpdateScores(userId);
};

export const scoringService = {
  calculateAndUpdateScores,
  getUserScores,
  getScoreBreakdown,
};
