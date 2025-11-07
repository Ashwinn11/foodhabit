import * as AppleAuthentication from 'expo-apple-authentication';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import { Platform } from 'react-native';
import { supabase, getSupabaseRedirectUrl } from '../../config/supabase';
import { AuthUser, AuthError, AuthProvider } from '../../types/auth';

// Complete the browser session when returning from the browser
WebBrowser.maybeCompleteAuthSession();

/**
 * Sign in with Apple using Supabase
 * This uses native Apple Sign In and exchanges the token with Supabase
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

    // Get Apple credentials
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });

    // Check for required token
    if (!credential.identityToken) {
      throw {
        message: 'No identity token received from Apple',
        code: 'NO_IDENTITY_TOKEN',
      } as AuthError;
    }

    // Sign in to Supabase with Apple token
    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: 'apple',
      token: credential.identityToken,
      nonce: credential.user, // Use user ID as nonce
    });

    if (error) {
      throw {
        message: error.message,
        code: error.status?.toString(),
      } as AuthError;
    }

    if (!data.user) {
      throw {
        message: 'No user returned from Supabase',
        code: 'NO_USER',
      } as AuthError;
    }

    // Create AuthUser from Supabase user
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
    if (error.code === 'ERR_REQUEST_CANCELED') {
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
 * Sign in with Google using Supabase OAuth
 * This uses Supabase's built-in OAuth flow
 */
export const signInWithGoogle = async (): Promise<AuthUser> => {
  try {
    const redirectUrl = getSupabaseRedirectUrl();

    console.log('Starting Google OAuth with redirect URL:', redirectUrl);

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

    console.log('Opening OAuth URL in browser...');

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

    console.log('OAuth redirect received, getting session...');

    // After successful redirect, wait a moment for Supabase to process the session
    await new Promise(resolve => setTimeout(resolve, 500));

    // Get the session - Supabase automatically handles the URL parsing
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

    if (sessionError) {
      throw {
        message: sessionError.message,
        code: 'SESSION_ERROR',
      } as AuthError;
    }

    if (!sessionData.session || !sessionData.session.user) {
      // If no session yet, try to get the user directly
      const { data: userData, error: userError } = await supabase.auth.getUser();

      if (userError || !userData.user) {
        throw {
          message: 'No session returned from Supabase after OAuth',
          code: 'NO_SESSION',
        } as AuthError;
      }

      // Get session again
      const { data: retrySession } = await supabase.auth.getSession();

      if (!retrySession.session) {
        throw {
          message: 'Failed to establish session after OAuth',
          code: 'NO_SESSION',
        } as AuthError;
      }

      const authUser: AuthUser = {
        id: userData.user.id,
        email: userData.user.email || null,
        name: userData.user.user_metadata?.full_name || userData.user.user_metadata?.name || undefined,
        givenName: userData.user.user_metadata?.given_name || undefined,
        familyName: userData.user.user_metadata?.family_name || undefined,
        photo: userData.user.user_metadata?.avatar_url || userData.user.user_metadata?.picture || undefined,
        provider: 'google',
        session: retrySession.session,
        supabaseUser: userData.user,
      };

      return authUser;
    }

    const user = sessionData.session.user;

    // Create AuthUser from Supabase user
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

    console.log('Google sign in successful');
    return authUser;
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
