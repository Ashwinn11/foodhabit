import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Platform, Alert, ActivityIndicator } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import { useAuth } from '../hooks/useAuth';
import { getAllRedirectUrls } from '../config/supabase';
import { theme, r } from '../theme';
import { Container, Text, Button } from '../components';

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
      <Container center variant="grouped">
        <ActivityIndicator size="large" color={theme.colors.primary[500]} />
        <Text variant="body" color="secondary" style={styles.loadingText}>
          Signing in...
        </Text>
      </Container>
    );
  }

  return (
    <Container variant="grouped" center>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text variant="h1" align="center" style={styles.title}>
            Food Habit
          </Text>
          <Text variant="subtitle1" color="secondary" align="center" style={styles.subtitle}>
            Track your eating habits and build healthier routines
          </Text>
        </View>

        <View style={styles.authButtons}>
          {appleAuthAvailable && Platform.OS === 'ios' && (
            <View style={styles.buttonContainer}>
              <AppleAuthentication.AppleAuthenticationButton
                buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
                buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
                cornerRadius={theme.borderRadius.pill}
                style={styles.appleButton}
                onPress={handleAppleSignIn}
              />
            </View>
          )}

          <Button
            title="Continue with Google"
            onPress={handleGoogleSignIn}
            variant="primary"
            size="large"
            fullWidth
            disabled={loading}
            loading={loading}
          />

          {__DEV__ && (
            <Button
              title="Show Redirect URL"
              onPress={handleShowRedirectUrl}
              variant="ghost"
              size="small"
              style={styles.debugButton}
            />
          )}
        </View>
      </View>

      {__DEV__ && (
        <View style={styles.devInfo}>
          <Text variant="caption" color="tertiary">
            Using Supabase Auth
          </Text>
        </View>
      )}
    </Container>
  );
}

const styles = StyleSheet.create({
  content: {
    width: '100%',
    maxWidth: r.scaleWidth(400),
    alignItems: 'center',
  },
  header: {
    marginBottom: r.adaptiveSpacing['4xl'],
    width: '100%',
  },
  title: {
    marginBottom: theme.spacing.md,
  },
  subtitle: {
    marginTop: theme.spacing.sm,
  },
  authButtons: {
    width: '100%',
    gap: theme.spacing.lg,
  },
  buttonContainer: {
    width: '100%',
    marginBottom: theme.spacing.md,
  },
  appleButton: {
    width: '100%',
    height: r.scaleHeight(56),
  },
  loadingText: {
    marginTop: theme.spacing.lg,
  },
  debugButton: {
    marginTop: theme.spacing.xl,
  },
  devInfo: {
    position: 'absolute',
    bottom: r.scaleHeight(20),
    alignSelf: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.fill.secondary,
    borderRadius: theme.borderRadius.pill,
  },
});
