import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Platform, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as AppleAuthentication from 'expo-apple-authentication';
import { useAuth } from '../hooks/useAuth';
import { getAllRedirectUrls } from '../config/supabase';
import { theme, r } from '../theme';

export default function AuthScreen() {
  const { loading, error, signInWithApple, signInWithGoogle, isAppleAuthAvailable } = useAuth();
  const [appleAuthAvailable, setAppleAuthAvailable] = useState(false);

  useEffect(() => {
    checkAppleAuth();
  }, []);

  const checkAppleAuth = async () => {
    const available = await isAppleAuthAvailable();
    setAppleAuthAvailable(available);
  };

  useEffect(() => {
    if (error) {
      Alert.alert('Authentication Error', error.message);
    }
  }, [error]);

  const handleAppleSignIn = async () => {
    await signInWithApple();
  };

  const handleGoogleSignIn = async () => {
    await signInWithGoogle();
  };

  const handleShowRedirectUrl = () => {
    const urls = getAllRedirectUrls();

    const message = `Add BOTH URLs to your Supabase project:\n\n1. Expo Go (Dev):\n${urls.expoGo}\n\n2. Standalone Build:\n${urls.standalone}\n\nCurrently using:\n${urls.current}\n\nGo to: Authentication > URL Configuration > Redirect URLs`;

    Alert.alert(
      'Supabase Redirect URLs',
      message,
      [
        {
          text: 'Copy to Console',
          onPress: () => {
            console.log('=== SUPABASE REDIRECT URLs ===');
            console.log('Expo Go (Dev):', urls.expoGo);
            console.log('Standalone:', urls.standalone);
            console.log('Current:', urls.current);
            console.log('============================');
          }
        },
        { text: 'OK' },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color={theme.colors.primary[500]} />
        <Text style={styles.loadingText}>Signing in...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
      <View style={styles.content}>
        <Text style={styles.title}>Food Habit</Text>
        <Text style={styles.subtitle}>Sign in to continue</Text>

        <View style={styles.authButtons}>
          {appleAuthAvailable && Platform.OS === 'ios' && (
            <View style={styles.buttonContainer}>
              <AppleAuthentication.AppleAuthenticationButton
                buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
                buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
                cornerRadius={theme.borderRadius.md}
                style={styles.appleButton}
                onPress={handleAppleSignIn}
              />
            </View>
          )}

          <TouchableOpacity
            style={[
              styles.googleButton,
              loading && styles.googleButtonDisabled
            ]}
            onPress={handleGoogleSignIn}
            disabled={loading}
          >
            <Text style={styles.googleButtonText}>
              {loading ? 'Signing in...' : 'Sign in with Google'}
            </Text>
          </TouchableOpacity>

          {__DEV__ && (
            <TouchableOpacity onPress={handleShowRedirectUrl} style={styles.debugButton}>
              <Text style={styles.debugText}>Show Supabase Redirect URL</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {__DEV__ && (
        <View style={styles.devInfo}>
          <Text style={styles.devInfoText}>
            Using Supabase Auth
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: r.adaptiveSpacing.lg,
  },
  title: {
    ...theme.typography.h1,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  subtitle: {
    ...theme.typography.h4,
    color: theme.colors.text.secondary,
    marginBottom: r.adaptiveSpacing.xl,
  },
  authButtons: {
    width: '100%',
    maxWidth: r.scaleWidth(320),
    alignItems: 'center',
  },
  buttonContainer: {
    width: '100%',
    marginBottom: theme.spacing.md,
  },
  appleButton: {
    width: '100%',
    height: r.scaleHeight(50),
  },
  googleButton: {
    width: '100%',
    height: r.scaleHeight(50),
    backgroundColor: theme.colors.primary[500],
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.md,
  },
  googleButtonDisabled: {
    backgroundColor: theme.colors.neutral[300],
  },
  googleButtonText: {
    ...theme.typography.button,
    color: theme.colors.text.inverse,
    textTransform: 'none',
  },
  loadingText: {
    ...theme.typography.body,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.md,
  },
  debugButton: {
    marginTop: theme.spacing.xl,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borderRadius.sm,
  },
  debugText: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
  devInfo: {
    position: 'absolute',
    bottom: r.scaleHeight(20),
    alignSelf: 'center',
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borderRadius.sm,
  },
  devInfoText: {
    ...theme.typography.caption,
    fontSize: r.adaptiveFontSize.xs,
    color: theme.colors.text.secondary,
  },
});
