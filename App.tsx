import React from 'react';
import { StyleSheet, ActivityIndicator, Text as RNText, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import * as ExpoSplashScreen from 'expo-splash-screen';
import { useAuth } from './src/hooks/useAuth';
import { AuthScreen, ProfileScreen } from './src/screens';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Keep the native splash screen visible while we fetch resources
ExpoSplashScreen.preventAutoHideAsync();

const Stack = createNativeStackNavigator();

function AppContent() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: '#1a1a1a' }]}>
        <ActivityIndicator size="large" color="#FF7664" />
        <RNText style={{ marginTop: 16, color: '#fff' }}>
          Loading...
        </RNText>
      </View>
    );
  }

  // Return the appropriate screen based on auth state
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: 'transparent' },
        animation: 'slide_from_right',
      }}
    >
      {!session ? (
        // Auth flow
        <Stack.Screen
          name="Auth"
          component={AuthScreen}
          options={{ presentation: 'card' }}
        />
      ) : (
        // Main app flow - Profile screen
        <Stack.Screen
          name="Profile"
          component={ProfileScreen}
          options={{ presentation: 'card' }}
        />
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  React.useEffect(() => {
    // Hide native splash screen immediately as we're not loading fonts anymore
    ExpoSplashScreen.hideAsync();
  }, []);

  const NavigationTheme = {
    dark: true,
    colors: {
      primary: '#FF7664',
      background: '#1a1a1a',
      card: '#2a2a2a',
      text: '#fff',
      border: 'rgba(255, 255, 255, 0.1)',
      notification: '#FF7664',
    },
    fonts: {
      regular: { fontFamily: 'System', fontWeight: '400' as const },
      bold: { fontFamily: 'System', fontWeight: '700' as const },
      heavy: { fontFamily: 'System', fontWeight: '700' as const },
      medium: { fontFamily: 'System', fontWeight: '500' as const },
      thin: { fontFamily: 'System', fontWeight: '300' as const },
    },
  };

  return (
    <SafeAreaProvider>
      <NavigationContainer theme={NavigationTheme}>
        <AppContent />
        <StatusBar style="light" backgroundColor="#1a1a1a" />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});