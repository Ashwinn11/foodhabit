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

  // Check for existing session on mount
  useEffect(() => {
    checkUser();

    // Listen to auth state changes
    const subscription = onAuthStateChange((authUser) => {
      setUser(authUser);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const checkUser = async () => {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch (err) {
      console.error('Error checking user:', err);
    } finally {
      setLoading(false);
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
    setLoading(true);
    setError(null);

    try {
      const authUser = await signInWithApple();
      setUser(authUser);
    } catch (err: any) {
      setError(err as AuthError);
      console.error('Apple Sign In error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSignInWithGoogle = async () => {
    setLoading(true);
    setError(null);

    try {
      const authUser = await signInWithGoogle();
      setUser(authUser);
    } catch (err: any) {
      setError(err as AuthError);
      console.error('Google Sign In error:', err);
    } finally {
      setLoading(false);
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
