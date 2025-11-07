import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Button, Alert, Platform, TouchableOpacity, ActivityIndicator } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from './src/hooks/useAuth';
import { useEffect, useState } from 'react';
import { getAllRedirectUrls } from './src/config/supabase';
import {
  useFonts,
  Poppins_300Light,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins';
import { theme, r } from './src/theme';

function AppContent() {
  const { user, loading, error, signInWithApple, signInWithGoogle, signOut, isAppleAuthAvailable } = useAuth();
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

  if (loading && !user) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color={theme.colors.primary[500]} />
        <Text style={styles.loadingText}>Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <Text style={styles.title}>Food Habit</Text>

      {user ? (
        <View style={styles.userContainer}>
          <Text style={styles.welcomeText}>Welcome!</Text>
          {user.name && <Text style={styles.userText}>Name: {user.name}</Text>}
          {user.email && <Text style={styles.userText}>Email: {user.email}</Text>}
          <Text style={styles.userText}>Provider: {user.provider}</Text>

          <Button title="Sign Out" onPress={signOut} disabled={loading} />
        </View>
      ) : (
        <View style={styles.authButtons}>
          <Text style={styles.subtitle}>Sign in to continue</Text>

          {appleAuthAvailable && Platform.OS === 'ios' && (
            <View style={styles.buttonContainer}>
              <AppleAuthentication.AppleAuthenticationButton
                buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
                buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
                cornerRadius={5}
                style={styles.appleButton}
                onPress={handleAppleSignIn}
              />
            </View>
          )}

          <View style={styles.buttonContainer}>
            <Button
              title={loading ? 'Signing in...' : 'Sign in with Google'}
              onPress={handleGoogleSignIn}
              disabled={loading}
            />
          </View>

          {__DEV__ && (
            <TouchableOpacity onPress={handleShowRedirectUrl} style={styles.debugButton}>
              <Text style={styles.debugText}>Show Supabase Redirect URL</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      <StatusBar style="auto" />

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

export default function App() {
  const [fontsLoaded] = useFonts({
    Poppins_300Light,
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary[500]} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <AppContent />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
    alignItems: 'center',
    justifyContent: 'center',
    padding: r.adaptiveSpacing.lg,
  },
  title: {
    ...theme.typography.h1,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.lg,
  },
  subtitle: {
    ...theme.typography.h4,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.lg,
  },
  authButtons: {
    width: '100%',
    maxWidth: r.scaleWidth(300),
    alignItems: 'center',
  },
  buttonContainer: {
    width: '100%',
    marginVertical: theme.spacing.md,
  },
  appleButton: {
    width: '100%',
    height: r.scaleHeight(44),
  },
  userContainer: {
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  welcomeText: {
    ...theme.typography.h2,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.lg,
  },
  userText: {
    ...theme.typography.body,
    color: theme.colors.text.primary,
    marginVertical: theme.spacing.xs,
  },
  loadingText: {
    ...theme.typography.body,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.md,
  },
  debugButton: {
    marginTop: theme.spacing.lg,
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
    bottom: r.scaleHeight(40),
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
