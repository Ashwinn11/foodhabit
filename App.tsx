import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
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
import AuthScreen from './src/screens/AuthScreen';
import RootNavigator from './src/navigation/RootNavigator';
import OnboardingNavigator from './src/screens/onboarding/OnboardingNavigator';
import { hasCompletedOnboarding } from './src/services/gutHarmony/userService';
import { theme } from './src/theme';

function AppContent() {
  const { session, loading, user } = useAuth();
  const [onboardingComplete, setOnboardingComplete] = useState<boolean | null>(null);

  // Check if user has completed onboarding
  useEffect(() => {
    const checkOnboarding = async () => {
      if (user?.id) {
        try {
          const completed = await hasCompletedOnboarding(user.id);
          setOnboardingComplete(completed);
        } catch (error) {
          console.error('Error checking onboarding:', error);
          setOnboardingComplete(false);
        }
      } else {
        // User not authenticated yet
        setOnboardingComplete(null);
      }
    };

    checkOnboarding();
  }, [user?.id]);

  // Show loading while auth is initializing
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.brand.primary} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  // Not signed in - show auth screen
  if (!session) {
    return <AuthScreen />;
  }

  // Signed in but onboarding status unknown - show loading
  if (onboardingComplete === null) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.brand.primary} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  // Signed in but onboarding not complete - show onboarding
  if (!onboardingComplete) {
    return (
      <OnboardingNavigator
        onComplete={() => setOnboardingComplete(true)}
      />
    );
  }

  // Signed in and onboarded - show main app
  return <RootNavigator />;
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
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  // Custom Navigation Theme to match the new design system
  const NavigationTheme = {
    dark: true,
    colors: {
      primary: theme.colors.brand.primary,
      background: theme.colors.background.screen, // Dark Blue
      card: theme.colors.background.card,         // Slightly lighter blue
      text: theme.colors.text.primary,           // White
      border: theme.colors.border.main,           // Subtle white border
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
  loadingText: {
    ...theme.typography.body,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.md,
  },
});