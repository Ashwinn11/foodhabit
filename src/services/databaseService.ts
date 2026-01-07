/**
 * Supabase Database Service
 * Handles all database operations for food scans, streaks, and user data
 */

import { supabase } from '../config/supabase';
import { IdentifiedFood, ScoreBreakdown } from './scoringService';
import type { GutFeeling } from '../components/GutFeelingModal';

export interface FoodScan {
    id: string;
    user_id: string;
    image_url: string | null;
    identified_foods: IdentifiedFood[];
    gut_health_score: number;
    score_factors: ScoreBreakdown;
    gigi_emotion: 'happy' | 'neutral' | 'sad';
    gigi_message: string;
    scanned_at: string;
    created_at: string;
}

export interface UserStreak {
    current_streak: number;
    longest_streak: number;
    last_scan_date: string | null;
}

export interface UserProfile {
    id: string;
    full_name: string | null;
    email: string | null;
    gigi_level: number;
    total_scans: number;
    known_triggers: string[];
    onboarding_complete: boolean;
}

export interface GutFeelingEntry {
    id: string;
    user_id: string;
    feeling: GutFeeling;
    logged_at: string;
    created_at: string;
}


/**
 * Save a food scan to the database
 */
export async function saveFoodScan(
    identifiedFoods: IdentifiedFood[],
    score: number,
    breakdown: ScoreBreakdown,
    emotion: 'happy' | 'neutral' | 'sad',
    message: string
): Promise<{ success: boolean; error?: string; scan?: FoodScan }> {
    try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: 'Not authenticated' };
        }

        const { data, error } = await supabase
            .from('food_scans')
            .insert({
                user_id: user.id,
                identified_foods: identifiedFoods,
                gut_health_score: score,
                score_factors: breakdown,
                gigi_emotion: emotion,
                gigi_message: message,
            })
            .select()
            .single();

        if (error) {
            console.error('Error saving scan:', error);
            return { success: false, error: error.message };
        }

        return { success: true, scan: data };
    } catch (error) {
        console.error('Error saving scan:', error);
        return { success: false, error: 'Failed to save scan' };
    }
}

/**
 * Get user's current streak
 */
export async function getUserStreak(): Promise<UserStreak | null> {
    try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return null;

        const { data, error } = await supabase
            .from('user_streaks')
            .select('current_streak, longest_streak, last_scan_date')
            .eq('user_id', user.id)
            .maybeSingle();

        if (error) {
            console.error('Error fetching streak:', error);
            return null;
        }

        if (!data) {
            return { current_streak: 0, longest_streak: 0, last_scan_date: null };
        }

        return data;
    } catch (error) {
        console.error('Error fetching streak:', error);
        return null;
    }
}

/**
 * Get user's scans for today
 */
export async function getTodayScans(): Promise<FoodScan[]> {
    try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return [];

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const { data, error } = await supabase
            .from('food_scans')
            .select('*')
            .eq('user_id', user.id)
            .gte('scanned_at', today.toISOString())
            .order('scanned_at', { ascending: false });

        if (error) {
            console.error('Error fetching today scans:', error);
            return [];
        }

        return data || [];
    } catch (error) {
        console.error('Error fetching today scans:', error);
        return [];
    }
}

/**
 * Get user's average score for today
 */
export async function getTodayAverageScore(): Promise<number> {
    const scans = await getTodayScans();

    if (scans.length === 0) return 0;

    const total = scans.reduce((sum, scan) => sum + scan.gut_health_score, 0);
    const avg = Math.round(total / scans.length);



    return avg;
}

/**
 * Get user profile with Gigi level
 */
export async function getUserProfile(): Promise<UserProfile | null> {
    try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return null;

        let { data, error } = await supabase
            .from('user_profiles')
            .select('id, full_name, email, gigi_level, total_scans, known_triggers, onboarding_complete')
            .eq('id', user.id)
            .maybeSingle();

        if (error) {
            console.error('Error fetching profile:', error);
            return null;
        }

        if (!data) {
            const { data: newProfile, error: insertError } = await supabase
                .from('user_profiles')
                .insert([{
                    id: user.id,
                    full_name: user.user_metadata?.full_name || null,
                    email: user.email,
                    gigi_level: 1,
                    total_scans: 0,
                    known_triggers: [],
                    onboarding_complete: false
                }])
                .select()
                .single();

            if (insertError) {
                console.error('Error creating profile:', insertError);
                return null;
            }

            data = newProfile;
        }

        return data;
    } catch (error) {
        console.error('Error fetching profile:', error);
        return null;
    }
}

/**
 * Update onboarding complete status
 */
export async function setOnboardingComplete(complete: boolean = true): Promise<boolean> {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return false;

        const { error } = await supabase
            .from('user_profiles')
            .update({ onboarding_complete: complete })
            .eq('id', user.id);

        if (error) {
            console.error('Error updating onboarding status:', error);
            return false;
        }

        return true;
    } catch (error) {
        console.error('Error updating onboarding status:', error);
        return false;
    }
}

/**
 * Get recent scans (last 10)
 */
export async function getRecentScans(limit: number = 10): Promise<FoodScan[]> {
    try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return [];

        const { data, error } = await supabase
            .from('food_scans')
            .select('*')
            .eq('user_id', user.id)
            .order('scanned_at', { ascending: false })
            .limit(limit);

        if (error) {
            console.error('Error fetching recent scans:', error);
            return [];
        }

        return data || [];
    } catch (error) {
        console.error('Error fetching recent scans:', error);
        return [];
    }
}

/**
 * Save a gut feeling entry
 */
export async function saveGutFeeling(feeling: GutFeeling): Promise<{ success: boolean; error?: string }> {
    try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: 'Not authenticated' };
        }

        const { error } = await supabase
            .from('gut_feelings')
            .insert({
                user_id: user.id,
                feeling: feeling,
                logged_at: new Date().toISOString(),
            });

        if (error) {
            console.error('Error saving gut feeling:', error);
            return { success: false, error: error.message };
        }

        return { success: true };
    } catch (error) {
        console.error('Error saving gut feeling:', error);
        return { success: false, error: 'Failed to save gut feeling' };
    }
}

/**
 * Get the most recent gut feeling
 */
export async function getCurrentGutFeeling(): Promise<GutFeelingEntry | null> {
    try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return null;

        const { data, error } = await supabase
            .from('gut_feelings')
            .select('*')
            .eq('user_id', user.id)
            .order('logged_at', { ascending: false })
            .limit(1)
            .maybeSingle();

        if (error) {
            console.error('Error fetching gut feeling:', error);
            return null;
        }

        return data;
    } catch (error) {
        console.error('Error fetching gut feeling:', error);
        return null;
    }
}

