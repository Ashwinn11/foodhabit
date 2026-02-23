import { supabase } from '../config/supabase';
import { purchasesService } from './purchasesService';

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
        const { error } = await supabase.from('users').upsert({
            id: user.id,
            email: user.email,
            onboarding_completed: true,
            onboarding_data: answers,
            updated_at: new Date().toISOString(),
        }, { onConflict: 'id' });
        if (error) throw error;
    },
    signOut: async () => {
        await purchasesService.logOut();
        await supabase.auth.signOut();
    },
    deleteAccount: async (): Promise<void> => {
        const { data, error } = await supabase.functions.invoke('delete-account', { body: { confirmed: true } });
        if (error) throw error;
        if (!data?.success) throw new Error(data?.error || 'Delete failed');
        await purchasesService.logOut();
        await supabase.auth.signOut();
    },
};
