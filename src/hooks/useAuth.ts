import { useState } from 'react';
import { Platform } from 'react-native';
import { AuthUser, AuthError } from '../types/auth';
import {
  signInWithApple,
  isAppleAuthAvailable,
} from '../services/auth/appleAuth';
import {
  signInWithGoogle,
  GoogleAuthConfig,
} from '../services/auth/googleAuth';

export interface UseAuthReturn {
  user: AuthUser | null;
  loading: boolean;
  error: AuthError | null;
  signInWithApple: () => Promise<void>;
  signInWithGoogle: (config: GoogleAuthConfig) => Promise<void>;
  signOut: () => void;
  isAppleAuthAvailable: () => Promise<boolean>;
}

/**
 * Authentication hook for managing user authentication
 * Supports Apple Sign In (native) and Google OAuth (web)
 */
export const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<AuthError | null>(null);

  const handleSignInWithApple = async () => {
    setLoading(true);
    setError(null);

    try {
      const isAvailable = await isAppleAuthAvailable();

      if (!isAvailable) {
        throw {
          message: 'Apple Sign In is not available on this device',
          code: 'NOT_AVAILABLE',
        } as AuthError;
      }

      const authUser = await signInWithApple();
      setUser(authUser);
    } catch (err: any) {
      setError(err as AuthError);
      console.error('Apple Sign In error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSignInWithGoogle = async (config: GoogleAuthConfig) => {
    setLoading(true);
    setError(null);

    try {
      const authUser = await signInWithGoogle(config);
      setUser(authUser);
    } catch (err: any) {
      setError(err as AuthError);
      console.error('Google Sign In error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = () => {
    setUser(null);
    setError(null);
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
