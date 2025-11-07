import { useState, useEffect } from 'react';
import { Platform } from 'react-native';
import { Session, User } from '@supabase/supabase-js';
import * as AppleAuthentication from 'expo-apple-authentication';
import { supabase } from '../config/supabase';
import { signInWithApple as appleSignIn, signInWithGoogle as googleSignIn } from '../services/auth/supabaseAuth';

export interface UseAuthReturn {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signInWithApple: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  isAppleAuthAvailable: () => Promise<boolean>;
}

/**
 * Standard Supabase authentication hook
 * Follows official Supabase React Native pattern
 */
export const useAuth = (): UseAuthReturn => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session:', session ? 'exists' : 'none');
      if (session?.user) {
        console.log('User ID:', session.user.id);
        console.log('User email:', session.user.email);
      }
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes - this is the single source of truth
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('Auth state changed:', _event, session ? 'has session' : 'no session');
      if (session?.user) {
        console.log('User ID:', session.user.id);
        console.log('User email:', session.user.email);
      }
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const isAppleAuthAvailable = async () => {
    if (Platform.OS !== 'ios') return false;
    try {
      return await AppleAuthentication.isAvailableAsync();
    } catch {
      return false;
    }
  };

  // Just call the auth method - listener handles state
  const handleSignInWithApple = async () => {
    await appleSignIn();
  };

  const handleSignInWithGoogle = async () => {
    await googleSignIn();
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return {
    session,
    user: session?.user ?? null,
    loading,
    signInWithApple: handleSignInWithApple,
    signInWithGoogle: handleSignInWithGoogle,
    signOut: handleSignOut,
    isAppleAuthAvailable,
  };
};
