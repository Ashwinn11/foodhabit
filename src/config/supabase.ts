import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

const isExpoGo = Constants.appOwnership === 'expo';

export const getSupabaseRedirectUrl = (): string => {
  if (isExpoGo) {
    const expoUsername = Constants.expoConfig?.owner;
    const expoSlug = Constants.expoConfig?.slug || 'foodhabit';

    if (!expoUsername) {
      throw new Error('Expo username not configured in app.json');
    }

    return `https://auth.expo.io/@${expoUsername}/${expoSlug}/--/auth/callback`;
  }

  return 'foodhabit://auth/callback';
};

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
