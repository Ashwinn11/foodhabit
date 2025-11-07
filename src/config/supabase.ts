import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import * as AuthSession from 'expo-auth-session';

// TODO: Replace with your Supabase project credentials
// Get these from: https://supabase.com/dashboard/project/_/settings/api
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

// Create the redirect URL for OAuth
// Supabase will redirect back to this URL after authentication
const redirectTo = AuthSession.makeRedirectUri({
  scheme: 'foodhabit',
  path: 'auth/callback',
});

// Create Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    // Store session in memory (you can implement custom storage if needed)
    storage: undefined,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Export redirect URL for configuration
export const getSupabaseRedirectUrl = () => redirectTo;

// Log the redirect URL for easy configuration
console.log('=== SUPABASE REDIRECT URL ===');
console.log('Add this to your Supabase project settings:');
console.log(redirectTo);
console.log('============================');
