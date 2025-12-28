import React, { useEffect, useState } from 'react';
import { ActivityIndicator } from 'react-native';
import { supabase } from '../config/supabase';
import { theme } from '../theme';
import { Container, Text } from '../components';

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
      <Container center>
        <ActivityIndicator size="large" color={theme.colors.brand.coral} />
        <Text variant="body" style={{ marginTop: theme.spacing.md, color: theme.colors.text.white }}>
          Completing sign in...
        </Text>
      </Container>
    );
  }

  if (error) {
    return (
      <Container center>
        <Text variant="body" style={{ color: theme.colors.brand.coral, textAlign: 'center', paddingHorizontal: theme.spacing.lg }}>
          Error: {error}
        </Text>
        <Text 
          variant="body"
          style={{ color: theme.colors.brand.cream, marginTop: theme.spacing.md, textDecorationLine: 'underline' }}
          onPress={() => typeof window !== 'undefined' && (window.location.href = '/')}
        >
          Return to app
        </Text>
      </Container>
    );
  }

  return null;
};

export default AuthCallback;