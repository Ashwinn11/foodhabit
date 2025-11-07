import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import * as AuthSession from 'expo-auth-session';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

// TODO: Replace with your Supabase project credentials
// Get these from: https://supabase.com/dashboard/project/_/settings/api
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

// Detect if we're running in Expo Go (development)
const isExpoGo = Constants.appOwnership === 'expo';

/**
 * CRITICAL: Google OAuth does NOT accept exp:// URLs
 *
 * Get the appropriate redirect URL based on environment:
 * - Expo Go (Dev): https://auth.expo.io/@username/slug/--/auth/callback
 * - Standalone: foodhabit://auth/callback
 *
 * Both formats are accepted by Google OAuth and Supabase.
 */
export const getSupabaseRedirectUrl = (): string => {
  if (isExpoGo) {
    // For Expo Go development with Google OAuth
    // MUST use https://auth.expo.io proxy (Google doesn't accept exp://)
    const expoUsername = Constants.expoConfig?.owner;
    const expoSlug = Constants.expoConfig?.slug || 'foodhabit';

    if (!expoUsername) {
      console.warn('⚠️  Expo username not found. Run: npx expo whoami');
      console.warn('Using fallback URL - Google OAuth may not work until you set up your Expo account');
      // Fallback to makeRedirectUri as last resort
      return AuthSession.makeRedirectUri({
        scheme: undefined,
        useProxy: true,
        path: 'auth/callback',
      });
    }

    // Generate proper Expo auth proxy URL that Google accepts
    return `https://auth.expo.io/@${expoUsername}/${expoSlug}/--/auth/callback`;
  }

  // For standalone builds, use custom scheme
  // Format: foodhabit://auth/callback (accepted by Google OAuth)
  return 'foodhabit://auth/callback';
};

// Create Supabase client with AsyncStorage for session persistence
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Get all possible redirect URLs for configuration
export const getAllRedirectUrls = () => {
  const expoUsername = Constants.expoConfig?.owner || 'YOUR_EXPO_USERNAME';
  const expoSlug = Constants.expoConfig?.slug || 'foodhabit';

  // Expo Go proxy URL (HTTPS - accepted by Google OAuth)
  const expoGoUrl = `https://auth.expo.io/@${expoUsername}/${expoSlug}/--/auth/callback`;

  // Standalone app URL (custom scheme - accepted by Google OAuth)
  const standaloneUrl = 'foodhabit://auth/callback';

  // Current URL being used
  const currentUrl = getSupabaseRedirectUrl();

  return {
    expoGo: expoGoUrl,
    standalone: standaloneUrl,
    current: currentUrl,
    expoUsername,
  };
};

// Log the redirect URLs for easy configuration
const urls = getAllRedirectUrls();
console.log('=== SUPABASE REDIRECT URLs ===');
console.log(`Current mode: ${isExpoGo ? 'Expo Go (Development)' : 'Standalone Build'}`);
console.log('\n🔑 CRITICAL: Google OAuth requires proper URLs (NOT exp://)');
console.log('\nAdd BOTH URLs to your Supabase project:');
console.log(`✅ Expo Go (Dev): ${urls.expoGo}`);
if (urls.expoUsername === 'YOUR_EXPO_USERNAME') {
  console.log('   ⚠️  SETUP REQUIRED: Run "npx expo whoami" to get your username');
  console.log('   ⚠️  Without username, Google OAuth will NOT work in Expo Go');
}
console.log(`✅ Standalone: ${urls.standalone}`);
console.log('\n📍 Currently using:', urls.current);
console.log('\n📖 Setup: https://docs.expo.dev/guides/authentication/#google');
console.log('===============================');
