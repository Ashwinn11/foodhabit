import * as WebBrowser from 'expo-web-browser';
import * as Crypto from 'expo-crypto';
import * as AppleAuthentication from 'expo-apple-authentication';
import { supabase, getSupabaseRedirectUrl } from '../../config/supabase';
import type { AuthError } from '../../types/auth';

// Complete the browser session when returning from the browser
WebBrowser.maybeCompleteAuthSession();

/**
 * Sign in with Apple - Standard Supabase pattern
 * Just calls Supabase auth, listener handles state updates
 */
export const signInWithApple = async (): Promise<void> => {
  // Generate nonce for security
  const rawNonce = generateRandomNonce();
  const hashedNonce = await hashNonce(rawNonce);

  // Get Apple credentials
  const credential = await AppleAuthentication.signInAsync({
    requestedScopes: [
      AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
      AppleAuthentication.AppleAuthenticationScope.EMAIL,
    ],
    nonce: hashedNonce,
  });

  if (!credential.identityToken) {
    throw new Error('No identity token received from Apple');
  }

  // Sign in to Supabase - listener will handle session state
  const { error } = await supabase.auth.signInWithIdToken({
    provider: 'apple',
    token: credential.identityToken,
    nonce: rawNonce,
  });

  if (error) throw error;
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
 * Sign in with Google - Handles both PKCE and implicit flow
 */
export const signInWithGoogle = async (): Promise<void> => {
  // Handle web vs mobile
  if (typeof window !== 'undefined' && window.location) {
    // Web: Use direct OAuth redirect
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          prompt: 'select_account',
        },
      },
    });

    if (error) throw error;
    if (!data.url) throw new Error('No OAuth URL returned');

    // Direct redirect on web
    window.location.href = data.url;
    return;
  }

  // Mobile: Use WebBrowser for OAuth
  const redirectUrl = getSupabaseRedirectUrl();

  // Start OAuth flow
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: redirectUrl,
      queryParams: {
        prompt: 'select_account',
      },
    },
  });

  if (error) throw error;
  if (!data.url) throw new Error('No OAuth URL returned');

  // Open browser for OAuth
  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);

  if (result.type === 'cancel') {
    throw new Error('Sign in was canceled');
  }

  if (result.type !== 'success') {
    throw new Error('OAuth flow failed');
  }

  // Parse callback URL - handle both PKCE (code) and implicit (tokens) flow
  const url = new URL(result.url);

  // Check query params for code (PKCE flow)
  const queryParams = new URLSearchParams(url.search);
  const code = queryParams.get('code');

  if (code) {
    // PKCE flow: exchange code for session
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
    if (exchangeError) throw exchangeError;
    return;
  }

  // Check hash for tokens (implicit flow fallback)
  const hashParams = new URLSearchParams(url.hash.replace('#', ''));
  const accessToken = hashParams.get('access_token');
  const refreshToken = hashParams.get('refresh_token');

  if (accessToken && refreshToken) {
    // Implicit flow: set session with tokens
    const { error: setError } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
    if (setError) throw setError;
    return;
  }

  // No code or tokens found
  throw new Error('No authorization code or tokens in callback URL');
};

