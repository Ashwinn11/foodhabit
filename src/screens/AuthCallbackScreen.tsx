import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { supabase } from '../config/supabase';
import { theme } from '../theme';

const AuthCallback: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }

        if (data.session) {
          // Successfully authenticated, redirect to home
          if (typeof window !== 'undefined') {
            window.location.href = '/';
          }
        } else {
          // Check URL params for PKCE code first
          const urlParams = new URLSearchParams(window!.location.search);
          const code = urlParams.get('code');
          
          if (code) {
            const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
            if (exchangeError) throw exchangeError;
            if (typeof window !== 'undefined') {
              window.location.href = '/';
            }
            return;
          }

          // Check hash for tokens (implicit flow - used by Google OAuth on web)
          const hashParams = new URLSearchParams(window!.location.hash.replace('#', ''));
          const accessToken = hashParams.get('access_token');
          const refreshToken = hashParams.get('refresh_token');

          if (accessToken && refreshToken) {
            // Set session with tokens from hash
            const { error: setError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });
            if (setError) throw setError;
            if (typeof window !== 'undefined') {
              window.location.href = '/';
            }
            return;
          }

          throw new Error('No session, authorization code, or tokens found');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Authentication failed');
      } finally {
        setLoading(false);
      }
    };

    handleCallback();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.brand.background }}>
        <ActivityIndicator size="large" color={theme.colors.brand.coral} />
        <Text style={{ marginTop: theme.spacing.md, color: theme.colors.text.white }}>
          Completing sign in...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.brand.background }}>
        <Text style={{ color: theme.colors.brand.coral, textAlign: 'center', paddingHorizontal: theme.spacing.lg }}>
          Error: {error}
        </Text>
        <Text 
          style={{ color: theme.colors.brand.cream, marginTop: theme.spacing.md, textDecorationLine: 'underline' }}
          onPress={() => typeof window !== 'undefined' && (window.location.href = '/')}
        >
          Return to app
        </Text>
      </View>
    );
  }

  return null;
};

export default AuthCallback;