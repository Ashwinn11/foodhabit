import React, { useState } from 'react';
import {
  View, StyleSheet, TouchableOpacity, Linking, Alert, Platform,
  Image, ActivityIndicator, Pressable,
} from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as WebBrowser from 'expo-web-browser';
import * as Crypto from 'expo-crypto';
import Svg, { Path } from 'react-native-svg';
import { Screen } from '../components/Screen';
import { Text } from '../components/Text';
import { theme } from '../theme/theme';
import { supabase } from '../config/supabase';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';

const REDIRECT_URI = 'foodhabit://auth/callback';

const GoogleIcon = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24">
    <Path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <Path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <Path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
    <Path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </Svg>
);

const AppleIcon = () => (
  <Svg width={15} height={18} viewBox="0 0 814 1000">
    <Path
      fill={theme.colors.bg}
      d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-57.8-155.5-127.4C46 376.7 0 248.7 0 122.7c0-70.5 27.4-141.8 77.7-188.6 50.3-46.8 126.9-74.6 205.8-74.6 79.4 0 152 27.4 203 27.4s123.7-27.4 203-27.4c57.5 0 116.4 22.1 162.2 61zm-234.5-161.5c3.9-48.1-13.7-96.8-45.3-130.2-31.6-33.3-78.6-57.5-125.6-57.5-1.9 0-3.9.1-5.8.2 1.9 49.4 21.4 97.4 53 130.8 31.5 33.3 78.8 57.4 123.7 56.7z"
    />
  </Svg>
);

const AuthButton = ({
  onPress, loading, label, icon, primary,
}: {
  onPress: () => void; loading: boolean; label: string;
  icon?: React.ReactNode; primary?: boolean;
}) => (
  <Pressable
    onPress={onPress}
    disabled={loading}
    style={[styles.authBtn, primary ? styles.authBtnPrimary : styles.authBtnGhost]}
  >
    {loading
      ? <ActivityIndicator color={primary ? theme.colors.bg : theme.colors.textPrimary} size="small" />
      : (
        <>
          {icon && <View>{icon}</View>}
          <Text
            variant="label"
            style={{ color: primary ? theme.colors.bg : theme.colors.textPrimary, fontSize: 15, letterSpacing: 0.2 }}
          >
            {label}
          </Text>
        </>
      )
    }
  </Pressable>
);

export const AuthScreen = () => {
  const [appleLoading, setAppleLoading]   = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleAppleSignIn = async () => {
    setAppleLoading(true);
    try {
      const rawNonce    = Math.random().toString(36).substring(2);
      const hashedNonce = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, rawNonce);
      const credential  = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
        nonce: hashedNonce,
      });
      if (!credential.identityToken) throw new Error('No identity token from Apple.');
      const { error } = await supabase.auth.signInWithIdToken({
        provider: 'apple', token: credential.identityToken, nonce: rawNonce,
      });
      if (error) throw error;
    } catch (e: any) {
      if (e.code === 'ERR_REQUEST_CANCELED') return;
      Alert.alert('Apple Sign In Failed', e.message);
    } finally { setAppleLoading(false); }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: REDIRECT_URI, skipBrowserRedirect: true },
      });
      if (error || !data.url) throw error ?? new Error('No auth URL.');
      const result = await WebBrowser.openAuthSessionAsync(data.url, REDIRECT_URI);
      if (result.type === 'success' && result.url) {
        const fragment    = result.url.includes('#') ? result.url.split('#')[1] : result.url.split('?')[1];
        const params      = new URLSearchParams(fragment);
        const accessToken  = params.get('access_token');
        const refreshToken = params.get('refresh_token');
        if (!accessToken || !refreshToken) throw new Error('No tokens in redirect URL.');
        const { error: sessionError } = await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
        if (sessionError) throw sessionError;
      }
    } catch (e: any) {
      Alert.alert('Google Sign In Failed', e.message);
    } finally { setGoogleLoading(false); }
  };

  return (
    <Screen padding={true}>

      {/* Brand — small, confident, top-left */}
      <Animated.View entering={FadeIn.delay(200).duration(600)} style={styles.brand}>
        <View style={styles.logoRing}>
          <Image source={require('../../assets/icon.png')} style={styles.logo} />
        </View>
        <Text variant="caption" style={styles.wordmark}>GUTBUDDY</Text>
      </Animated.View>

      {/* Hero — owns the vertical space */}
      <Animated.View entering={FadeInDown.delay(500).duration(900).springify()} style={styles.hero}>
        <Text variant="hero" style={styles.headline}>
          Eat{'\n'}
          <Text style={styles.accentWord}>without</Text>{'\n'}
          fear.
        </Text>
        <Text variant="body" style={styles.sub}>
          Your gut has a pattern. We decode it — so you know exactly what's safe before every bite.
        </Text>
      </Animated.View>

      {/* Proof strip */}
      <Animated.View entering={FadeIn.delay(900).duration(600)} style={styles.proof}>
        <View style={styles.proofDot} />
        <Text style={styles.proofText}>2,400+ people eating freely  </Text>
        {[0,1,2,3,4].map(i => <Text key={i} style={styles.star}>★</Text>)}
      </Animated.View>

      {/* Auth buttons */}
      <Animated.View entering={FadeInUp.delay(1100).duration(700).springify()} style={styles.bottom}>
        {Platform.OS === 'ios' && (
          <>
            <AuthButton primary onPress={handleAppleSignIn} loading={appleLoading} label="Continue with Apple" icon={<AppleIcon />} />
            <View style={{ height: theme.spacing.md }} />
          </>
        )}
        <AuthButton onPress={handleGoogleSignIn} loading={googleLoading} label="Continue with Google" icon={<GoogleIcon />} />

        <View style={styles.terms}>
          <Text variant="caption" style={styles.termsText}>By continuing you agree to our </Text>
          <TouchableOpacity onPress={() => Linking.openURL('https://gutbuddy.com/terms')}>
            <Text variant="caption" style={styles.termsLink}>Terms</Text>
          </TouchableOpacity>
          <Text variant="caption" style={styles.termsText}> & </Text>
          <TouchableOpacity onPress={() => Linking.openURL('https://gutbuddy.com/privacy')}>
            <Text variant="caption" style={styles.termsLink}>Privacy</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

    </Screen>
  );
};

const styles = StyleSheet.create({
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    paddingTop: theme.spacing.md,
  },
  logoRing: {
    width: 40,
    height: 40,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(224,93,76,0.3)',
  },
  logo: { width: 40, height: 40 },
  wordmark: {
    color: theme.colors.textSecondary,
    letterSpacing: 3,
  },
  hero: {
    flex: 1,
    justifyContent: 'center',
    paddingBottom: theme.spacing.xl,
  },
  headline: {
    marginBottom: theme.spacing.xl,
    color: theme.colors.textPrimary,
  },
  accentWord: {
    color: theme.colors.coral,
    fontFamily: 'PlayfairDisplay_400Regular_Italic',
    fontSize: 44,
    lineHeight: 52,
  },
  sub: {
    color: theme.colors.textSecondary,
    lineHeight: 26,
    maxWidth: 300,
  },
  proof: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xxxl,
  },
  proofDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: theme.colors.coral,
    marginRight: theme.spacing.sm,
  },
  proofText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  star: { color: theme.colors.amber, fontSize: 12 },
  bottom: { paddingBottom: theme.spacing.sm },
  authBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.lg + 2,
    paddingHorizontal: theme.spacing.xxxl,
    borderRadius: theme.radii.full,
  },
  authBtnPrimary: {
    backgroundColor: theme.colors.coral,
    shadowColor: theme.colors.coral,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 8,
  },
  authBtnGhost: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  terms: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginTop: theme.spacing.xxxl,
  },
  termsText: { color: theme.colors.textSecondary, textTransform: 'none', letterSpacing: 0, fontSize: 11 },
  termsLink: { color: theme.colors.coral, textTransform: 'none', letterSpacing: 0, fontSize: 11 },
});
