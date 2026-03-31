import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import type { Session, User } from '@supabase/supabase-js';
import type { Profile } from '@/lib/database.types';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as Crypto from 'expo-crypto';
import { makeRedirectUri } from 'expo-auth-session';
import { openAuthSessionAsync } from 'expo-web-browser';

interface AuthState {
    session: Session | null;
    user: User | null;
    profile: Profile | null;
    isLoading: boolean;
    isInitialized: boolean;

    initialize: () => Promise<void>;
    fetchProfile: (userId: string) => Promise<Profile | null>;
    signInWithGoogle: () => Promise<void>;
    signInWithApple: () => Promise<void>;
    signOut: () => Promise<void>;
    deleteAccount: () => Promise<void>;
    updateProfile: (updates: Partial<Profile>) => Promise<void>;
    setSession: (session: Session | null) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
    session: null,
    user: null,
    profile: null,
    isLoading: true,
    isInitialized: false,

    initialize: async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                const profile = await get().fetchProfile(session.user.id);
                set({ session, user: session.user, profile, isLoading: false, isInitialized: true });
            } else {
                set({ session: null, user: null, profile: null, isLoading: false, isInitialized: true });
            }
        } catch (error) {
            console.error('Auth initialize error:', error);
            throw error;
        }
    },

    fetchProfile: async (userId: string) => {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (error || !data) return null;
        return data;
    },

    setSession: async (session: Session | null) => {
        if (session?.user) {
            const profile = await get().fetchProfile(session.user.id);
            set({ session, user: session.user, profile, isLoading: false });
        } else {
            set({ session: null, user: null, profile: null, isLoading: false });
        }
    },

    signInWithGoogle: async () => {
        set({ isLoading: true });
        try {
            const redirectUrl = makeRedirectUri({
                scheme: 'foodhabit',
                path: 'auth/callback',
            });

            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: redirectUrl,
                    skipBrowserRedirect: true,
                },
            });

            if (error) throw error;

            if (data?.url) {
                // Open the OAuth URL in the system browser
                const result = await openAuthSessionAsync(data.url, redirectUrl);

                if (result.type === 'success' && result.url) {
                    const url = new URL(result.url);
                    // Extract tokens from the URL fragment
                    const params = new URLSearchParams(url.hash.substring(1));
                    const accessToken = params.get('access_token');
                    const refreshToken = params.get('refresh_token');

                    if (accessToken && refreshToken) {
                        const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
                            access_token: accessToken,
                            refresh_token: refreshToken,
                        });
                        if (sessionError) throw sessionError;
                        if (sessionData.session) {
                            await get().setSession(sessionData.session);
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Google sign in error:', error);
            set({ isLoading: false });
            throw error;
        }
    },

    signInWithApple: async () => {
        set({ isLoading: true });
        try {
            const nonce = Crypto.randomUUID();
            const hashedNonce = await Crypto.digestStringAsync(
                Crypto.CryptoDigestAlgorithm.SHA256,
                nonce
            );

            const credential = await AppleAuthentication.signInAsync({
                requestedScopes: [
                    AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
                    AppleAuthentication.AppleAuthenticationScope.EMAIL,
                ],
                nonce: hashedNonce,
            });

            if (!credential.identityToken) {
                throw new Error('No identity token from Apple');
            }

            const { data, error } = await supabase.auth.signInWithIdToken({
                provider: 'apple',
                token: credential.identityToken,
                nonce,
            });

            if (error) throw error;

            // Update the full name if provided by Apple
            if (credential.fullName && data.session) {
                const fullName = [credential.fullName.givenName, credential.fullName.familyName]
                    .filter(Boolean)
                    .join(' ');
                if (fullName) {
                    await supabase
                        .from('profiles')
                        .update({ full_name: fullName })
                        .eq('id', data.session.user.id);
                }
                await get().setSession(data.session);
            } else if (data.session) {
                await get().setSession(data.session);
            }
        } catch (error: any) {
            if (error?.code !== 'ERR_REQUEST_CANCELED') {
                console.error('Apple sign in error:', error);
            }
            set({ isLoading: false });
            throw error;
        }
    },

    signOut: async () => {
        set({ isLoading: true });
        try {
            await supabase.auth.signOut();
            set({ session: null, user: null, profile: null, isLoading: false });
        } catch (error) {
            set({ isLoading: false });
            throw error;
        }
    },

    deleteAccount: async () => {
        set({ isLoading: true });
        try {
            const session = get().session;

            if (!session?.access_token) {
                throw new Error('No active session');
            }

            const { data, error } = await supabase.functions.invoke('delete-account', {
                headers: {
                    Authorization: `Bearer ${session.access_token}`,
                },
                body: { confirmed: true },
            });

            if (error) throw new Error(error.message);
            if (data?.error) throw new Error(data.error);

            await supabase.auth.signOut();
            set({ session: null, user: null, profile: null, isLoading: false });
        } catch (error) {
            set({ isLoading: false });
            throw error;
        }
    },

    updateProfile: async (updates: Partial<Profile>) => {
        const userId = get().user?.id;
        if (!userId) throw new Error('Not authenticated');

        const { data, error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', userId)
            .select()
            .single();

        if (error) throw error;
        if (data) {
            set({ profile: data });
        }
    },
}));
