import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Button, Alert, Platform } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import { useAuth } from './src/hooks/useAuth';
import { useEffect, useState } from 'react';

// TODO: Replace with your Google OAuth Client ID
// Get this from Google Cloud Console (console.cloud.google.com)
const GOOGLE_CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID_HERE';

export default function App() {
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
    if (GOOGLE_CLIENT_ID === 'YOUR_GOOGLE_CLIENT_ID_HERE') {
      Alert.alert(
        'Configuration Required',
        'Please update GOOGLE_CLIENT_ID in App.tsx with your Google OAuth client ID from Google Cloud Console.'
      );
      return;
    }

    await signInWithGoogle({
      clientId: GOOGLE_CLIENT_ID,
    });
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
        </View>
      )}

      <StatusBar style="auto" />
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
});
