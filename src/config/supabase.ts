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
 * Get Expo username from multiple sources
 * Priority:
 * 1. Constants.expoConfig.owner (set in app.json)
 * 2. Constants.manifest?.owner (fallback)
 * 3. Constants.manifest2?.extra?.expoGo?.owner (EAS fallback)
 */
const getExpoUsername = (): string | undefined => {
  // Try expoConfig first (app.json)
  const owner = Constants.expoConfig?.owner;

  if (owner && owner !== 'YOUR_EXPO_USERNAME') {
    return owner;
  }

  // Try manifest fallback
  // @ts-ignore - manifest is legacy but might still work
  const manifestOwner = Constants.manifest?.owner;
  if (manifestOwner && manifestOwner !== 'YOUR_EXPO_USERNAME') {
    return manifestOwner;
  }

  // Try manifest2 EAS fallback
  // @ts-ignore
  const manifest2Owner = Constants.manifest2?.extra?.expoGo?.owner;
  if (manifest2Owner && manifest2Owner !== 'YOUR_EXPO_USERNAME') {
    return manifest2Owner;
  }

  return undefined;
};

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
    const expoUsername = getExpoUsername();
    const expoSlug = Constants.expoConfig?.slug || 'foodhabit';

    if (!expoUsername) {
      console.error('❌ CRITICAL: Expo username not configured!');
      console.error('📝 REQUIRED SETUP:');
      console.error('   1. Run: npx expo whoami (to see your username)');
      console.error('   2. Open: app.json');
      console.error('   3. Set "owner": "your-expo-username"');
      console.error('   4. Restart: npx expo start --clear');
      console.error('');
      console.error('⚠️  Google OAuth will NOT work until owner is configured!');
      console.error('⚠️  Current URL uses exp:// which is REJECTED by Google');

      // Return exp:// as fallback (will fail OAuth but app won't crash)
      return AuthSession.makeRedirectUri({
        scheme: 'exp',
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
  const expoUsername = getExpoUsername() || 'YOUR_EXPO_USERNAME';
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

/**
 * Log OAuth configuration details (only on app initialization)
 * Call this from your root component to get setup guidance
 */
export const logOAuthConfig = () => {
  const urls = getAllRedirectUrls();
  console.log('\n=== SUPABASE REDIRECT URLs ===');
  console.log(`Current mode: ${isExpoGo ? 'Expo Go (Development)' : 'Standalone Build'}`);
  console.log('\n🔑 CRITICAL: Google OAuth requires proper URLs (NOT exp://)');
  console.log('\nAdd BOTH URLs to your Supabase project:');
  console.log(`✅ Expo Go (Dev): ${urls.expoGo}`);
  if (urls.expoUsername === 'YOUR_EXPO_USERNAME') {
    console.log('');
    console.log('⚠️  ═══════════════════════════════════════════════════');
    console.log('⚠️  SETUP REQUIRED: Configure Expo Username');
    console.log('⚠️  ═══════════════════════════════════════════════════');
    console.log('   1. Run: npx expo whoami');
    console.log('   2. Copy your username');
    console.log('   3. Open: app.json');
    console.log('   4. Replace: "owner": "YOUR_EXPO_USERNAME"');
    console.log('      With: "owner": "your-actual-username"');
    console.log('   5. Restart: npx expo start --clear');
    console.log('');
    console.log('   ❌ Without this, Google OAuth will NOT work!');
    console.log('⚠️  ═══════════════════════════════════════════════════');
  }
  console.log(`✅ Standalone: ${urls.standalone}`);
  console.log('\n📍 Currently using:', urls.current);
  console.log('\n📖 Setup: https://docs.expo.dev/guides/authentication/#google');
  console.log('===============================\n');
};
