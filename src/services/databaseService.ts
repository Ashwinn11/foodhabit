/**
 * Supabase Database Service
 * Handles all database operations for food scans, streaks, and user data
 */

import { supabase } from '../config/supabase';
import { IdentifiedFood, ScoreBreakdown } from './scoringService';

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
}

/**
 * Save a food scan to the database
 */
export async function saveFoodScan(
    imageUrl: string | null,
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
                image_url: imageUrl,
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
            .select('id, full_name, email, gigi_level, total_scans, known_triggers')
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
                    known_triggers: []
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
 * Upload image to Supabase Storage
 */
export async function uploadScanImage(uri: string): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: 'Not authenticated' };
        }

        // Convert URI to ArrayBuffer (more reliable than Blob on web)
        const response = await fetch(uri);
        const arrayBuffer = await response.arrayBuffer();

        console.log('Original URI:', uri);
        console.log('Buffer size:', arrayBuffer.byteLength);

        if (arrayBuffer.byteLength === 0) {
            console.error('Empty buffer detected');
            return { success: false, error: 'Could not process image file' };
        }

        // Detect file type
        let fileExtension = 'jpg';
        let contentType = 'image/jpeg';

        if (uri.includes('webp') || uri.startsWith('data:image/webp')) {
            fileExtension = 'webp';
            contentType = 'image/webp';
        } else if (uri.includes('png') || uri.startsWith('data:image/png')) {
            fileExtension = 'png';
            contentType = 'image/png';
        }

        const filename = `${user.id}/${Date.now()}.${fileExtension}`;

        // Upload to Supabase Storage
        const { error } = await supabase.storage
            .from('scan-images')
            .upload(filename, arrayBuffer, {
                contentType: contentType,
                upsert: false,
            });

        if (error) {
            console.error('Error uploading image:', error);
            return { success: false, error: error.message };
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from('scan-images')
            .getPublicUrl(filename);

        console.log('✅ Uploaded to:', publicUrl);
        return { success: true, url: publicUrl };
    } catch (error) {
        console.error('Error uploading image:', error);
        return { success: false, error: 'Failed to upload image' };
    }
}

/**
 * Delete image from Supabase Storage
 */
export async function deleteImage(imageUrl: string): Promise<{ success: boolean; error?: string }> {
    try {
        // Extract the file path from the public URL
        // URL format: https://<project>.supabase.co/storage/v1/object/public/scan-images/<filepath>
        const urlParts = imageUrl.split('/scan-images/');
        if (urlParts.length < 2) {
            return { success: false, error: 'Invalid image URL format' };
        }

        const filePath = urlParts[1];

        const { error } = await supabase.storage
            .from('scan-images')
            .remove([filePath]);

        if (error) {
            console.error('Error deleting image:', error);
            return { success: false, error: error.message };
        }

        return { success: true };
    } catch (error) {
        console.error('Error deleting image:', error);
        return { success: false, error: 'Failed to delete image' };
    }
}

/**
 * Update an existing food scan (when user edits foods)
 */
export async function updateFoodScan(
    scanId: string,
    identifiedFoods: IdentifiedFood[],
    score: number,
    breakdown: ScoreBreakdown,
    emotion: 'happy' | 'neutral' | 'sad',
    message: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const { error } = await supabase
            .from('food_scans')
            .update({
                identified_foods: identifiedFoods,
                gut_health_score: score,
                score_factors: breakdown,
                gigi_emotion: emotion,
                gigi_message: message,
            })
            .eq('id', scanId);

        if (error) {
            console.error('Error updating scan:', error);
            return { success: false, error: error.message };
        }

        return { success: true };
    } catch (error) {
        console.error('Error updating scan:', error);
        return { success: false, error: 'Failed to update scan' };
    }
}
