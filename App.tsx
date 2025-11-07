import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Button, Alert, Platform, TouchableOpacity } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import Constants from 'expo-constants';
import { useAuth } from './src/hooks/useAuth';
import { useEffect, useState } from 'react';
import { showRedirectUris, logRedirectUris } from './src/utils/showRedirectUris';

// TODO: Replace with your Google OAuth Client ID
// Get this from Google Cloud Console (console.cloud.google.com)
const GOOGLE_CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID_HERE';

// Detect if we're running in Expo Go (development)
const isExpoGo = Constants.appOwnership === 'expo';

export default function App() {
  const { user, loading, error, signInWithApple, signInWithGoogle, signOut, isAppleAuthAvailable } = useAuth();
  const [appleAuthAvailable, setAppleAuthAvailable] = useState(false);

  useEffect(() => {
    checkAppleAuth();
    // Log redirect URIs on startup for easy configuration
    logRedirectUris();
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
    if (GOOGLE_CLIENT_ID === 'YOUR_GOOGLE_CLIENT_ID_HERE') {
      Alert.alert(
        'Configuration Required',
        'Please update GOOGLE_CLIENT_ID in App.tsx with your Google OAuth client ID from Google Cloud Console.'
      );
      return;
    }

    await signInWithGoogle({
      clientId: GOOGLE_CLIENT_ID,
      useProxy: isExpoGo, // Use Expo's auth proxy for Expo Go, custom scheme for standalone builds
    });
  };

  const handleShowRedirectUris = () => {
    showRedirectUris();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Food Habit</Text>

      {user ? (
        <View style={styles.userContainer}>
          <Text style={styles.welcomeText}>Welcome!</Text>
          {user.name && <Text style={styles.userText}>Name: {user.name}</Text>}
          {user.email && <Text style={styles.userText}>Email: {user.email}</Text>}
          <Text style={styles.userText}>Provider: {user.provider}</Text>

          <Button title="Sign Out" onPress={signOut} />
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
            <TouchableOpacity onPress={handleShowRedirectUris} style={styles.debugButton}>
              <Text style={styles.debugText}>Show Redirect URIs</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      <StatusBar style="auto" />

      {__DEV__ && (
        <View style={styles.devInfo}>
          <Text style={styles.devInfoText}>
            Mode: {isExpoGo ? 'Expo Go (Dev)' : 'Standalone Build'}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 20,
    color: '#666',
  },
  authButtons: {
    width: '100%',
    maxWidth: 300,
    alignItems: 'center',
  },
  buttonContainer: {
    width: '100%',
    marginVertical: 10,
  },
  appleButton: {
    width: '100%',
    height: 44,
  },
  userContainer: {
    alignItems: 'center',
    padding: 20,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  userText: {
    fontSize: 16,
    marginVertical: 5,
  },
  debugButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
  },
  debugText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  devInfo: {
    position: 'absolute',
    bottom: 40,
    padding: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
  },
  devInfoText: {
    fontSize: 10,
    color: '#666',
  },
});
