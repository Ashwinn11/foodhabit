import * as AppleAuthentication from 'expo-apple-authentication';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import * as Crypto from 'expo-crypto';
import { Platform } from 'react-native';
import { supabase, getSupabaseRedirectUrl } from '../../config/supabase';
import { AuthUser, AuthError, AuthProvider } from '../../types/auth';

// Complete the browser session when returning from the browser
WebBrowser.maybeCompleteAuthSession();

/**
 * Sign in with Apple using Supabase
 * This uses native Apple Sign In and exchanges the token with Supabase.
 *
 * IMPORTANT: Apple Sign In has unique behaviors:
 * - Full name is ONLY provided on first sign in
 * - Subsequent sign ins: fullName will be null, must use stored metadata
 * - User ID remains constant across sign ins
 * - Nonce is required for security to prevent replay attacks
 */
export const signInWithApple = async (): Promise<AuthUser> => {
  try {
    // Check if Apple Auth is available
    if (Platform.OS !== 'ios') {
      throw {
        message: 'Apple Sign In is only available on iOS',
        code: 'PLATFORM_NOT_SUPPORTED',
      } as AuthError;
    }

    const isAvailable = await AppleAuthentication.isAvailableAsync();
    if (!isAvailable) {
      throw {
        message: 'Apple Sign In is not available on this device',
        code: 'NOT_AVAILABLE',
      } as AuthError;
    }

    // CRITICAL: Generate cryptographic nonce to prevent replay attacks
    // The nonce must be:
    // 1. Random and unique for each sign-in attempt
    // 2. Hashed (SHA256) when sent to Apple
    // 3. Raw when sent to Supabase for verification
    const rawNonce = generateRandomNonce();
    const hashedNonce = await hashNonce(rawNonce);

    // Get Apple credentials with hashed nonce
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
      nonce: hashedNonce, // Pass hashed nonce to Apple
    });

    // Check for required token
    if (!credential.identityToken) {
      throw {
        message: 'No identity token received from Apple',
        code: 'NO_IDENTITY_TOKEN',
      } as AuthError;
    }

    // Sign in to Supabase with Apple token and raw nonce
    // Supabase will verify that the nonce in the token matches the one we provide
    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: 'apple',
      token: credential.identityToken,
      nonce: rawNonce, // Pass raw nonce for Supabase verification
    });

    if (error) {
      throw {
        message: error.message || 'Failed to sign in with Supabase',
        code: error.status?.toString() || 'SUPABASE_ERROR',
      } as AuthError;
    }

    if (!data.user) {
      throw {
        message: 'No user returned from Supabase',
        code: 'NO_USER',
      } as AuthError;
    }

    // Create AuthUser from Supabase user
    // Note: credential.fullName is only populated on FIRST sign in
    // On subsequent sign ins, use the stored user metadata
    const authUser: AuthUser = {
      id: data.user.id,
      email: data.user.email || credential.email || null,
      name: credential.fullName
        ? `${credential.fullName.givenName || ''} ${credential.fullName.familyName || ''}`.trim()
        : data.user.user_metadata?.full_name || undefined,
      givenName: credential.fullName?.givenName || data.user.user_metadata?.given_name || undefined,
      familyName: credential.fullName?.familyName || data.user.user_metadata?.family_name || undefined,
      provider: 'apple',
      session: data.session || undefined,
      supabaseUser: data.user,
    };

    return authUser;
  } catch (error: any) {
    console.error('Apple Sign In error:', error);

    if (error.code === 'ERR_REQUEST_CANCELED') {
      console.log('User canceled Apple Sign In');
      throw {
        message: 'Sign in was canceled',
        code: error.code,
      } as AuthError;
    }

    if (error.message && error.code) {
      throw error as AuthError;
    }

    throw {
      message: error.message || 'Failed to sign in with Apple',
      code: error.code || 'UNKNOWN_ERROR',
    } as AuthError;
  }
};

/**
 * Generate a random nonce for security
 * The nonce prevents replay attacks by ensuring each sign-in is unique
 */
const generateRandomNonce = (): string => {
  // Generate a random string suitable for use as a nonce
  // Using Math.random() with a large character set
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let nonce = '';
  for (let i = 0; i < 32; i++) {
    nonce += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return nonce;
};

/**
 * Hash a nonce using SHA256
 * Apple requires the nonce to be hashed before sending it to their authentication service
 */
const hashNonce = async (nonce: string): Promise<string> => {
  try {
    const hashed = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      nonce
    );
    return hashed;
  } catch (error) {
    console.error('Error hashing nonce:', error);
    throw {
      message: 'Failed to hash nonce for Apple Sign In',
      code: 'HASH_ERROR',
    } as AuthError;
  }
};

/**
 * Sign in with Google using Supabase OAuth
 * This uses Supabase's built-in OAuth flow
 */
export const signInWithGoogle = async (): Promise<AuthUser> => {
  try {
    const redirectUrl = getSupabaseRedirectUrl();

    // Start the OAuth flow with Supabase
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
        skipBrowserRedirect: false,
      },
    });

    if (error) {
      throw {
        message: error.message,
        code: error.status?.toString(),
      } as AuthError;
    }

    if (!data.url) {
      throw {
        message: 'No OAuth URL returned from Supabase',
        code: 'NO_URL',
      } as AuthError;
    }

    // Open the OAuth URL in a browser
    const result = await WebBrowser.openAuthSessionAsync(
      data.url,
      redirectUrl
    );

    if (result.type === 'cancel') {
      throw {
        message: 'Sign in was canceled',
        code: 'ERR_REQUEST_CANCELED',
      } as AuthError;
    }

    if (result.type !== 'success') {
      throw {
        message: 'OAuth flow failed',
        code: 'OAUTH_FAILED',
      } as AuthError;
    }

    // Extract the URL from the result
    const responseUrl = result.url;

    // Parse URL parameters
    const url = new URL(responseUrl);
    const params = new URLSearchParams(url.search || url.hash.replace('#', '?'));

    // Check for error
    const error_description = params.get('error_description');
    if (error_description) {
      throw {
        message: error_description,
        code: 'OAUTH_ERROR',
      } as AuthError;
    }

    // Get auth code or tokens from URL
    const code = params.get('code');
    const access_token = params.get('access_token');
    const refresh_token = params.get('refresh_token');

    // If we have an authorization code, exchange it for a session
    if (code) {
      const { data: sessionData, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

      if (exchangeError) {
        throw {
          message: exchangeError.message,
          code: 'EXCHANGE_ERROR',
        } as AuthError;
      }

      if (!sessionData.session || !sessionData.session.user) {
        throw {
          message: 'No session returned after code exchange',
          code: 'NO_SESSION',
        } as AuthError;
      }

      const user = sessionData.session.user;

      const authUser: AuthUser = {
        id: user.id,
        email: user.email || null,
        name: user.user_metadata?.full_name || user.user_metadata?.name || undefined,
        givenName: user.user_metadata?.given_name || undefined,
        familyName: user.user_metadata?.family_name || undefined,
        photo: user.user_metadata?.avatar_url || user.user_metadata?.picture || undefined,
        provider: 'google',
        session: sessionData.session,
        supabaseUser: user,
      };

      return authUser;
    }

    // If we have tokens directly, set the session
    if (access_token && refresh_token) {
      // Add timeout protection to prevent infinite hanging
      const setSessionPromise = supabase.auth.setSession({
        access_token,
        refresh_token,
      });

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('setSession timeout - request took too long')), 15000)
      );

      let sessionData;
      let setError = null;

      try {
        const result = await Promise.race([setSessionPromise, timeoutPromise]) as any;
        sessionData = result;
        if (result?.error) {
          setError = result.error;
        }
      } catch (timeoutError) {
        throw {
          message: 'Session setup timed out. Check your network connection and Supabase configuration.',
          code: 'SESSION_TIMEOUT',
        } as AuthError;
      }

      if (setError) {
        throw {
          message: setError.message,
          code: 'SET_SESSION_ERROR',
        } as AuthError;
      }

      if (!sessionData || !sessionData.session) {
        throw {
          message: 'No session returned after setting tokens',
          code: 'NO_SESSION',
        } as AuthError;
      }

      if (!sessionData.session.user) {
        throw {
          message: 'No user in session after setting tokens',
          code: 'NO_USER_IN_SESSION',
        } as AuthError;
      }

      const user = sessionData.session.user;

      const authUser: AuthUser = {
        id: user.id,
        email: user.email || null,
        name: user.user_metadata?.full_name || user.user_metadata?.name || undefined,
        givenName: user.user_metadata?.given_name || undefined,
        familyName: user.user_metadata?.family_name || undefined,
        photo: user.user_metadata?.avatar_url || user.user_metadata?.picture || undefined,
        provider: 'google',
        session: sessionData.session,
        supabaseUser: user,
      };

      return authUser;
    }

    // If no code or tokens, something went wrong
    throw {
      message: 'No authorization code or tokens in OAuth callback URL',
      code: 'NO_AUTH_DATA',
    } as AuthError;
  } catch (error: any) {
    console.error('Google Sign In error:', error);

    if (error.message && error.code) {
      throw error as AuthError;
    }

    throw {
      message: error.message || 'Failed to sign in with Google',
      code: error.code || 'UNKNOWN_ERROR',
    } as AuthError;
  }
};

/**
 * Sign out from Supabase
 */
export const signOut = async (): Promise<void> => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw {
      message: error.message,
      code: error.status?.toString(),
    } as AuthError;
  }
};

/**
 * Get the current session from Supabase
 */
export const getCurrentSession = async () => {
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    console.error('Error getting session:', error);
    return null;
  }
  return data.session;
};

/**
 * Get the current user from Supabase
 */
export const getCurrentUser = async (): Promise<AuthUser | null> => {
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    return null;
  }

  const user = data.user;
  const session = await getCurrentSession();

  // Determine provider from user metadata
  const provider = user.app_metadata?.provider ||
                   (user.user_metadata?.iss?.includes('apple') ? 'apple' : 'google') as AuthProvider;

  const authUser: AuthUser = {
    id: user.id,
    email: user.email || null,
    name: user.user_metadata?.full_name || user.user_metadata?.name || undefined,
    givenName: user.user_metadata?.given_name || undefined,
    familyName: user.user_metadata?.family_name || undefined,
    photo: user.user_metadata?.avatar_url || user.user_metadata?.picture || undefined,
    provider,
    session: session || undefined,
    supabaseUser: user,
  };

  return authUser;
};

/**
 * Listen to auth state changes
 */
export const onAuthStateChange = (callback: (user: AuthUser | null) => void) => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
    if (session?.user) {
      const authUser = await getCurrentUser();
      callback(authUser);
    } else {
      callback(null);
    }
  });

  return subscription;
};
