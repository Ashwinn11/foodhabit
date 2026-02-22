import { supabase } from '../config/supabase';

// Note: Ensure `expo-apple-authentication` and Google sign-in libraries are cleanly connected here.

export const authService = {
    signInWithApple: async (identityToken: string) => {
        return await supabase.auth.signInWithIdToken({
            provider: 'apple',
            token: identityToken,
        });
    },

    signInWithGoogle: async (idToken: string) => {
        return await supabase.auth.signInWithIdToken({
            provider: 'google',
            token: idToken,
        });
    },

    completeOnboarding: async (answers: any) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("No user logged in");

        return await supabase
            .from('users')
            .update({
                onboarding_data: answers,
                updated_at: new Date().toISOString()
            })
            .eq('id', user.id);
    },

    signOut: async () => {
        return await supabase.auth.signOut();
    }
};
