import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Image,
  Linking,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as WebBrowser from 'expo-web-browser';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../theme/theme';
import { Text } from '../components/Text';
import { Icon } from '../components/Icon';
import { GoogleIcon } from '../components/GoogleIcon';
import { AppleIcon } from '../components/AppleIcon';
import { authService } from '../services/authService';
import { supabase, getSupabaseRedirectUrl } from '../config/supabase';

const TERMS_URL = 'https://briefly.live/gutbuddy/terms-of-service';

WebBrowser.maybeCompleteAuthSession();

export const AuthScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState<'apple' | 'google' | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAppleSignIn = async () => {
    setError(null);
    setLoading('apple');
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      if (credential.identityToken) {
        await authService.signInWithApple(credential.identityToken);
      }
    } catch (e: any) {
      if (e.code !== 'ERR_REQUEST_CANCELED') {
        setError('Sign-in failed. Please try again.');
      }
    } finally {
      setLoading(null);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading('google');
    try {
      const redirectTo = getSupabaseRedirectUrl();
      const { data, error: oauthErr } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo },
      });
      if (oauthErr) throw oauthErr;
      if (data?.url) {
        const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
        if (result.type === 'success' && result.url) {
          const fragment = result.url.split('#')[1] ?? '';
          const params = new URLSearchParams(fragment);
          const accessToken = params.get('access_token');
          const refreshToken = params.get('refresh_token');
          if (accessToken && refreshToken) {
            const { error: sessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });
            if (sessionError) throw sessionError;
          }
        }
      }
    } catch (e: any) {
      setError('Sign-in failed. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar style="light" />

      {/* Hero */}
      <View style={styles.hero}>
        <View style={styles.logoContainer}>
          <Image source={require('../../assets/icon.webp')} style={styles.logoImage} />
        </View>
        <Text variant="display" align="center" style={styles.brand}>
          GutBuddy
        </Text>
        <Text variant="display" align="center" style={styles.headline}>
          Eat out freely.{'\n'}Feel good after.
        </Text>
        <Text variant="body" color={theme.colors.textSecondary} align="center" style={styles.sub}>
          GutBuddy learns your gut and tells you exactly what to order.
        </Text>
      </View>

      {/* Auth card */}
      <View style={styles.card}>
        <View style={styles.actions}>
          {Platform.OS === 'ios' && (
            <TouchableOpacity
              style={[styles.appleButton, loading === 'apple' && styles.buttonDisabled]}
              onPress={handleAppleSignIn}
              disabled={!!loading}
              activeOpacity={0.85}
            >
              {loading === 'apple' ? (
                <Icon name="Loader" size={20} color="#fff" />
              ) : (
                <AppleIcon size={20} color="#fff" />
              )}
              <Text variant="bodySmall" color="#fff" style={styles.appleLabel}>
                Sign in with Apple
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.googleButton, loading === 'google' && styles.buttonDisabled]}
            onPress={handleGoogleSignIn}
            disabled={!!loading}
            activeOpacity={0.85}
          >
            {loading === 'google' ? (
              <Icon name="Loader" size={20} color={theme.colors.primaryForeground} />
            ) : (
              <GoogleIcon size={20} />
            )}
            <Text variant="bodySmall" color={theme.colors.primaryForeground} style={styles.googleLabel}>
              Sign in with Google
            </Text>
          </TouchableOpacity>

          {error && (
            <Text variant="caption" color={theme.colors.danger} align="center">
              {error}
            </Text>
          )}
        </View>

        <Text variant="caption" color={theme.colors.textTertiary} align="center" style={styles.legal}>
          By continuing, you agree to our{' '}
          <Text variant="caption" color={theme.colors.primary} onPress={() => navigation.navigate('PrivacyPolicy')}>
            Privacy Policy
          </Text>
          {' '}and{' '}
          <Text variant="caption" color={theme.colors.primary} onPress={() => Linking.openURL(TERMS_URL)}>
            Terms of Service
          </Text>
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  hero: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.xl,
    gap: theme.spacing.md,
  },
  logoContainer: {
    width: 88,
    height: 88,
    borderRadius: theme.radius.xl,
    backgroundColor: theme.colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginBottom: theme.spacing.xs,
    ...theme.shadows.glow,
  },
  logoImage: {
    width: 88,
    height: 88,
  },
  brand: {
    fontFamily: theme.fonts.display,
  },
  headline: {
    lineHeight: 46,
  },
  sub: {
    maxWidth: 280,
    lineHeight: 26,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: theme.radius.xxl,
    borderTopRightRadius: theme.radius.xxl,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.xl,
    paddingBottom: theme.spacing.xxxl,
    gap: theme.spacing.lg,
  },
  actions: {
    gap: theme.spacing.md,
  },
  appleButton: {
    height: 52,
    borderRadius: theme.radius.full,
    backgroundColor: '#000',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  appleLabel: {
    fontFamily: theme.fonts.semibold,
  },
  googleButton: {
    height: 52,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    ...theme.shadows.glow,
  },
  googleLabel: {
    fontFamily: theme.fonts.semibold,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  legal: {
    lineHeight: 18,
  },
});
