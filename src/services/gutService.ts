import { supabase } from '../config/supabase';

export interface GutMomentPayload {
    mood: 'sad' | 'neutral' | 'happy';
    symptoms: string[];
}

export const gutService = {
    logMoment: async (payload: GutMomentPayload) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("No user logged in to log moment.");

        const { error } = await supabase
            .from('gut_moments')
            .insert({
                user_id: user.id,
                emoji: payload.mood,
                symptoms: payload.symptoms,
                timestamp: new Date().toISOString()
            });

        if (error) throw error;
        return true;
    },

    getRecentLogs: async (limit = 10) => {
        const { data, error } = await supabase
            .from('gut_moments')
            .select('*')
            .order('timestamp', { ascending: false })
            .limit(limit);

        if (error) throw error;
        return data;
    }
};
