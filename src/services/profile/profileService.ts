import { supabase } from '../../config/supabase';
import { UserProfile, OnboardingData } from '../../types/profile';

/**
 * Profile Service
 * Handles all profile CRUD operations and onboarding status
 */

export const profileService = {
  /**
   * Create a new user profile with onboarding data
   */
  async createProfile(userId: string, data: OnboardingData): Promise<UserProfile> {
    const { data: profile, error } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        // Body Basics
        age: data.age,
        gender: data.gender,
        height: data.height,
        weight: data.weight,
        // Lifestyle
        activity_level: data.activity_level,
        sleep_hours: data.sleep_hours,
        diet_type: data.diet_type,
        eating_window_start: data.eating_window_start,
        eating_window_end: data.eating_window_end,
        // Symptom Baseline
        bloating_severity: data.bloating_severity,
        bloating_frequency: data.bloating_frequency,
        abdominal_pain_severity: data.abdominal_pain_severity,
        bowel_movement_frequency: data.bowel_movement_frequency,
        bowel_movement_quality: data.bowel_movement_quality,
        has_constipation: data.has_constipation,
        has_diarrhea: data.has_diarrhea,
        gas_severity: data.gas_severity,
        baseline_energy_level: data.baseline_energy_level,
        baseline_mood_quality: data.baseline_mood_quality,
        has_brain_fog: data.has_brain_fog,
        digestive_impact_on_life: data.digestive_impact_on_life,
        // Medical Context
        diagnosed_conditions: data.diagnosed_conditions,
        food_allergies: data.food_allergies,
        restricts_food_severely: data.restricts_food_severely,
        binges_regularly: data.binges_regularly,
        // Goals
        focus_area: data.focus_area,
        water_intake: data.water_intake,
        cooking_ratio: data.cooking_ratio,
        onboarded_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return profile;
  },

  /**
   * Get user profile
   */
  async getProfile(userId: string): Promise<UserProfile | null> {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = no rows returned
      throw error;
    }

    return profile || null;
  },

  /**
   * Update user profile
   */
  async updateProfile(userId: string, data: Partial<OnboardingData>): Promise<UserProfile> {
    const { data: profile, error } = await supabase
      .from('profiles')
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return profile;
  },

  /**
   * Check if user has completed onboarding
   */
  async hasCompletedOnboarding(userId: string): Promise<boolean> {
    const profile = await this.getProfile(userId);
    return profile !== null && profile.onboarded_at !== null;
  },

  /**
   * Mark onboarding as complete
   */
  async completeOnboarding(userId: string): Promise<void> {
    const { error } = await supabase
      .from('profiles')
      .update({
        onboarded_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (error) throw error;
  },

  /**
   * Delete user profile (on account deletion)
   */
  async deleteProfile(userId: string): Promise<void> {
    const { error } = await supabase.from('profiles').delete().eq('id', userId);

    if (error) throw error;
  },
};
