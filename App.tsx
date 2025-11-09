import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import {
  useFonts,
  Poppins_300Light,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins';
import { useAuth } from './src/hooks/useAuth';
import { profileService } from './src/services/profile/profileService';
import AuthScreen from './src/screens/AuthScreen';
import TabNavigator from './src/navigation/TabNavigator';
import { OnboardingNavigator } from './src/screens/onboarding/OnboardingNavigator';
import { theme } from './src/theme';

function AppContent() {
  const { session, loading, user } = useAuth();
  const [isOnboarded, setIsOnboarded] = useState<boolean | null>(null);
  const [checkingOnboarding, setCheckingOnboarding] = useState(false);

  // Check onboarding status when user authenticates
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (user?.id) {
        try {
          const completed = await profileService.hasCompletedOnboarding(user.id);
          setIsOnboarded(completed);
        } catch (error) {
          console.error('Error checking onboarding status:', error);
          // Default to false if there's an error (show onboarding)
          setIsOnboarded(false);
        } finally {
          setCheckingOnboarding(false);
        }
      } else {
        setCheckingOnboarding(false);
      }
    };

    if (session && !loading && user?.id) {
      setCheckingOnboarding(true);
      checkOnboardingStatus();
    } else if (!session || !user?.id) {
      // Not authenticated, don't check onboarding
      setCheckingOnboarding(false);
      setIsOnboarded(null);
    }
  }, [session, loading, user?.id]);

  // Loading states
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary[500]} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  // No session - show auth screen
  if (!session) {
    return <AuthScreen />;
  }

  // Session exists but we're still checking onboarding status
  if (checkingOnboarding) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary[500]} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  // Session exists but onboarding status is unknown (shouldn't happen)
  if (isOnboarded === null) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary[500]} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  // Not onboarded - show onboarding flow
  if (!isOnboarded) {
    return (
      <OnboardingNavigator
        onComplete={() => {
          // Onboarding complete, show main app
          setIsOnboarded(true);
        }}
      />
    );
  }

  // Onboarded - show main app
  return <TabNavigator />;
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
      <NavigationContainer>
        <AppContent />
        <StatusBar style="auto" />
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
