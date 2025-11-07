import { useState, useEffect } from 'react';
import { Platform } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import { AuthUser, AuthError } from '../types/auth';
import {
  signInWithApple,
  signInWithGoogle,
  signOut as supabaseSignOut,
  getCurrentUser,
  onAuthStateChange,
} from '../services/auth';

export interface UseAuthReturn {
  user: AuthUser | null;
  loading: boolean;
  error: AuthError | null;
  signInWithApple: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  isAppleAuthAvailable: () => Promise<boolean>;
}

/**
 * Authentication hook for managing user authentication with Supabase
 * Supports Apple Sign In (native) and Google OAuth
 */
export const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<AuthError | null>(null);

  // Track state changes for debugging
  useEffect(() => {
    console.log('🔄 [useAuth] State changed:', {
      hasUser: !!user,
      userEmail: user?.email,
      loading,
      hasError: !!error,
    });
  }, [user, loading, error]);

  // Check for existing session on mount
  useEffect(() => {
    console.log('🚀 [useAuth] Initializing auth hook...');
    checkUser();

    // Listen to auth state changes from Supabase
    console.log('👂 [useAuth] Setting up auth state listener...');
    const subscription = onAuthStateChange((authUser) => {
      console.log('📣 [useAuth] Auth state changed from listener:', authUser?.email || 'null');
      setUser(authUser);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => {
      console.log('🧹 [useAuth] Cleaning up auth listener');
      subscription.unsubscribe();
    };
  }, []);

  const checkUser = async () => {
    console.log('🔍 [useAuth] Checking for existing user session...');
    try {
      const currentUser = await getCurrentUser();
      console.log('✅ [useAuth] User session check complete:', currentUser?.email || 'no session');
      setUser(currentUser);
    } catch (err) {
      console.error('❌ [useAuth] Error checking user:', err);
    } finally {
      setLoading(false);
      console.log('✅ [useAuth] Initial loading complete');
    }
  };

  const isAppleAuthAvailable = async (): Promise<boolean> => {
    if (Platform.OS !== 'ios') {
      return false;
    }
    try {
      return await AppleAuthentication.isAvailableAsync();
    } catch (error) {
      console.error('Error checking Apple Auth availability:', error);
      return false;
    }
  };

  const handleSignInWithApple = async () => {
    setError(null);
    console.log('⏱️  [useAuth] Starting Apple sign-in...');

    try {
      const authUser = await signInWithApple();
      console.log('✅ [useAuth] Apple sign-in successful, updating state...');
      console.log('👤 [useAuth] User:', authUser.email);

      // CRITICAL: Update both user and loading states immediately
      // This ensures App.tsx navigation logic works correctly
      setUser(authUser);
      setLoading(false); // Ensure loading is false after successful auth

      console.log('✅ [useAuth] State updated - user authenticated and loading=false');
    } catch (err: any) {
      console.error('❌ [useAuth] Apple Sign In error:', err);
      setError(err as AuthError);
      throw err; // Re-throw so AuthScreen's finally block can handle it
    }
  };

  const handleSignInWithGoogle = async () => {
    setError(null);
    console.log('⏱️  [useAuth] Starting Google sign-in...');

    try {
      const authUser = await signInWithGoogle();
      console.log('✅ [useAuth] Google sign-in successful, updating state...');
      console.log('👤 [useAuth] User:', authUser.email);

      // CRITICAL: Update both user and loading states immediately
      // This ensures App.tsx navigation logic works correctly
      setUser(authUser);
      setLoading(false); // Ensure loading is false after successful auth

      console.log('✅ [useAuth] State updated - user authenticated and loading=false');
    } catch (err: any) {
      console.error('❌ [useAuth] Google Sign In error:', err);
      setError(err as AuthError);
      throw err; // Re-throw so AuthScreen's finally block can handle it
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    setError(null);

    try {
      await supabaseSignOut();
      setUser(null);
    } catch (err: any) {
      setError(err as AuthError);
      console.error('Sign out error:', err);
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    error,
    signInWithApple: handleSignInWithApple,
    signInWithGoogle: handleSignInWithGoogle,
    signOut: handleSignOut,
    isAppleAuthAvailable,
  };
};
