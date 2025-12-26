import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import {
  useFonts,
  Nunito_300Light,
  Nunito_400Regular,
  Nunito_500Medium,
  Nunito_600SemiBold,
  Nunito_700Bold,
} from '@expo-google-fonts/nunito';
import { useAuth } from './src/hooks/useAuth';
import { AuthScreen, ProfileScreen } from './src/screens';
import { theme } from './src/theme';
import { Text } from './src/components';

function AppContent() {
  const { session, loading } = useAuth();

  // Show loading while auth is initializing
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.brand.primary} />
        <Text variant="body" color="secondary" style={{ marginTop: theme.spacing.md }}>
          Loading...
        </Text>
      </View>
    );
  }

  // Simple flow: Not signed in → AuthScreen, Signed in → ProfileScreen
  return session ? <ProfileScreen /> : <AuthScreen />;
}

export default function App() {
  const [fontsLoaded] = useFonts({
    Nunito_300Light,
    Nunito_400Regular,
    Nunito_500Medium,
    Nunito_600SemiBold,
    Nunito_700Bold,
  });

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.brand.primary} />
      </View>
    );
  }

  // Custom Navigation Theme
  const NavigationTheme = {
    dark: true,
    colors: {
      primary: theme.colors.brand.primary,
      background: theme.colors.background.screen,
      card: theme.colors.background.card,
      text: theme.colors.text.primary,
      border: theme.colors.border.main,
      notification: theme.colors.brand.primary,
    },
    fonts: {
      regular: { fontFamily: theme.fontFamily.regular, fontWeight: '400' as const },
      bold: { fontFamily: theme.fontFamily.bold, fontWeight: '700' as const },
      heavy: { fontFamily: theme.fontFamily.bold, fontWeight: '700' as const },
      medium: { fontFamily: theme.fontFamily.medium, fontWeight: '500' as const },
      thin: { fontFamily: theme.fontFamily.light, fontWeight: '300' as const },
    },
  };

  return (
    <SafeAreaProvider>
      <NavigationContainer theme={NavigationTheme}>
        <AppContent />
        <StatusBar style="light" backgroundColor={theme.colors.background.primary} />
      </NavigationContainer>
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
});