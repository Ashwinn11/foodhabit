import { supabase } from '../config/supabase';
import { useOnboardingStore } from '../store/onboardingStore';
import { useGutStore } from '../store/useGutStore';

/**
 * Load user data from Supabase on app start
 * This replaces AsyncStorage as the source of truth
 */
export const loadUserDataFromDatabase = async () => {
    try {
        const {
            data: { session },
        } = await supabase.auth.getSession();

        if (!session?.user?.id) {
            console.log('No user session, skipping data load');
            return false;
        }

        const userId = session.user.id;

        // Load user profile and onboarding status
        const { data: userProfile, error: profileError } = await supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();

        if (profileError) {
            console.error('Failed to load user profile:', profileError);
            return false;
        }

        // Set onboarding status
        if (userProfile) {
            const onboardingStore = useOnboardingStore.getState();
            if (userProfile.onboarding_completed) {
                onboardingStore.completeOnboarding();
            }
            // Note: We don't restore quiz answers since onboarding is one-time
        }

        // Load recent gut logs (last 30 days of significant logs)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const { data: gutLogs, error: logsError } = await supabase
            .from('gut_logs')
            .select('*')
            .eq('user_id', userId)
            .gte('timestamp', thirtyDaysAgo.toISOString())
            .order('timestamp', { ascending: false })
            .limit(100);

        if (logsError) {
            console.error('Failed to load gut logs:', logsError);
        } else if (gutLogs && gutLogs.length > 0) {
            // Convert database format to app format
            const gutStore = useGutStore.getState();
            gutLogs.forEach((log) => {
                gutStore.addGutMoment({
                    timestamp: new Date(log.timestamp),
                    bristolType: log.bristol_type,
                    symptoms: log.symptoms || {
                        bloating: false,
                        gas: false,
                        cramping: false,
                        nausea: false,
                    },
                    tags: log.tags || [],
                    urgency: log.urgency,
                    painScore: log.pain_score,
                    notes: log.notes,
                });
            });
        }

        // Load trigger foods
        const { data: triggerFoods, error: triggersError } = await supabase
            .from('trigger_foods')
            .select('*')
            .eq('user_id', userId);

        if (triggersError) {
            console.error('Failed to load trigger foods:', triggersError);
        } else if (triggerFoods && triggerFoods.length > 0) {
            const gutStore = useGutStore.getState();
            triggerFoods.forEach((trigger) => {
                gutStore.addTriggerFeedback({
                    foodName: trigger.food_name,
                    userConfirmed: trigger.user_confirmed,
                    timestamp: new Date(trigger.created_at),
                });
            });
        }

        console.log('✅ User data loaded from database successfully');
        return true;
    } catch (error) {
        console.error('Failed to load user data from database:', error);
        return false;
    }
};
