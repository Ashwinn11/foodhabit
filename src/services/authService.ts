import { supabase } from '../config/supabase';

export const authService = {
    signInWithApple: async (identityToken: string) => {
        return await supabase.auth.signInWithIdToken({ provider: 'apple', token: identityToken });
    },
    signInWithGoogle: async (idToken: string) => {
        return await supabase.auth.signInWithIdToken({ provider: 'google', token: idToken });
    },
    completeOnboarding: async (answers: any) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("No user logged in");
        return await supabase.from('users').update({ onboarding_data: answers, updated_at: new Date().toISOString() }).eq('id', user.id);
    },
    signOut: async () => supabase.auth.signOut(),
    deleteAccount: async (): Promise<void> => {
        const { data, error } = await supabase.functions.invoke('delete-account', { body: { confirmed: true } });
        if (error) throw error;
        if (!data?.success) throw new Error(data?.error || 'Delete failed');
        await supabase.auth.signOut();
    },
};
