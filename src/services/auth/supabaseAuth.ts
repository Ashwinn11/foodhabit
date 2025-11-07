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
 * Sign in with Apple - Standard Supabase pattern
 * Just calls Supabase auth, listener handles state updates
 */
export const signInWithApple = async (): Promise<void> => {
  console.log('🍎 Starting Apple Sign In...');

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

  console.log('✅ Apple credentials received');
  console.log('Email:', credential.email);
  console.log('User ID:', credential.user);

  if (!credential.identityToken) {
    throw new Error('No identity token received from Apple');
  }

  // Sign in to Supabase - listener will handle session state
  console.log('🔄 Calling Supabase signInWithIdToken...');
  const { data, error } = await supabase.auth.signInWithIdToken({
    provider: 'apple',
    token: credential.identityToken,
    nonce: rawNonce,
  });

  if (error) {
    console.error('❌ Supabase sign-in error:', error);
    throw error;
  }

  console.log('✅ Supabase sign-in successful');
  if (data.user) {
    console.log('User ID from Supabase:', data.user.id);
    console.log('User email from Supabase:', data.user.email);
  }
  if (data.session) {
    console.log('Session created:', !!data.session);
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
 * Sign in with Google - Handles both PKCE and implicit flow
 */
export const signInWithGoogle = async (): Promise<void> => {
  const redirectUrl = getSupabaseRedirectUrl();
  console.log('🔐 Starting Google OAuth...');
  console.log('Redirect URL:', redirectUrl);

  // Start OAuth flow
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: redirectUrl,
    },
  });

  if (error) throw error;
  if (!data.url) throw new Error('No OAuth URL returned');

  console.log('Opening browser for OAuth...');
  // Open browser for OAuth
  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);

  if (result.type === 'cancel') {
    throw new Error('Sign in was canceled');
  }

  if (result.type !== 'success') {
    throw new Error('OAuth flow failed');
  }

  console.log('✅ OAuth callback received');
  console.log('Callback URL:', result.url);

  // Parse callback URL - handle both PKCE (code) and implicit (tokens) flow
  const url = new URL(result.url);
  console.log('URL search:', url.search);
  console.log('URL hash:', url.hash);

  // Check query params for code (PKCE flow)
  const queryParams = new URLSearchParams(url.search);
  const code = queryParams.get('code');

  if (code) {
    console.log('✅ Found authorization code (PKCE flow)');
    // PKCE flow: exchange code for session
    const { data: sessionData, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
    if (exchangeError) {
      console.error('❌ Code exchange error:', exchangeError);
      throw exchangeError;
    }
    console.log('✅ Session created from code exchange');
    if (sessionData.user) {
      console.log('User ID:', sessionData.user.id);
      console.log('User email:', sessionData.user.email);
    }
    return;
  }

  // Check hash for tokens (implicit flow fallback)
  const hashParams = new URLSearchParams(url.hash.replace('#', ''));
  const accessToken = hashParams.get('access_token');
  const refreshToken = hashParams.get('refresh_token');

  if (accessToken && refreshToken) {
    console.log('✅ Found tokens in hash (implicit flow)');
    // Implicit flow: set session with tokens
    const { data: sessionData, error: setError } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
    if (setError) {
      console.error('❌ Set session error:', setError);
      throw setError;
    }
    console.log('✅ Session created from tokens');
    if (sessionData.user) {
      console.log('User ID:', sessionData.user.id);
      console.log('User email:', sessionData.user.email);
    }
    return;
  }

  // No code or tokens found
  console.error('❌ No code or tokens found in callback');
  console.error('All query params:', Array.from(queryParams.entries()));
  console.error('All hash params:', Array.from(hashParams.entries()));
  throw new Error('No authorization code or tokens in callback URL');
};

