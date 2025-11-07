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
 * Get the appropriate redirect URL based on environment
 * - Expo Go: Uses Expo's auth proxy (https://auth.expo.io/...)
 * - Standalone: Uses custom scheme (foodhabit://auth/callback)
 */
export const getSupabaseRedirectUrl = (): string => {
  if (isExpoGo) {
    // For Expo Go, use Expo's auth proxy
    return AuthSession.makeRedirectUri({
      useProxy: true,
      path: 'auth/callback',
    });
  }

  // For standalone builds, use custom scheme
  return AuthSession.makeRedirectUri({
    scheme: 'foodhabit',
    path: 'auth/callback',
  });
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
  const expoGoUrl = AuthSession.makeRedirectUri({
    useProxy: true,
    path: 'auth/callback',
  });

  const standaloneUrl = AuthSession.makeRedirectUri({
    scheme: 'foodhabit',
    path: 'auth/callback',
  });

  return {
    expoGo: expoGoUrl,
    standalone: standaloneUrl,
    current: getSupabaseRedirectUrl(),
  };
};

// Log the redirect URLs for easy configuration
const urls = getAllRedirectUrls();
console.log('=== SUPABASE REDIRECT URLs ===');
console.log(`Current mode: ${isExpoGo ? 'Expo Go (Development)' : 'Standalone Build'}`);
console.log('\nAdd BOTH URLs to your Supabase project settings:');
console.log('1. Expo Go (Dev):', urls.expoGo);
console.log('2. Standalone:', urls.standalone);
console.log('\nCurrently using:', urls.current);
console.log('===============================');
