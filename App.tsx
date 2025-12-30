import React from 'react';
import { StyleSheet, ActivityIndicator, Text as RNText } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import * as ExpoSplashScreen from 'expo-splash-screen';
import { BackgroundBlobs } from './src/components';
import {
  useFonts,
  Nunito_300Light,
  Nunito_400Regular,
  Nunito_500Medium,
  Nunito_600SemiBold,
  Nunito_700Bold,
} from '@expo-google-fonts/nunito';
import { useAuth } from './src/hooks/useAuth';
import { registerForPushNotificationsAsync } from './src/services/notificationService';
import { initializeRevenueCat, loginUser } from './src/services/revenueCatService';
import { AuthScreen, ProfileScreen, HomeScreen, CameraScreen, ResultScreen, RevenueCatPaywall, OnboardingScreen, SplashScreen, TermsOfServiceScreen, PrivacyPolicyScreen, SupportScreen, MealsHistoryScreen, MealDetailScreen, HowItWorksScreen } from './src/screens';

import { theme } from './src/theme';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { getUserProfile, setOnboardingComplete } from './src/services/databaseService';

// Keep the native splash screen visible while we fetch resources
ExpoSplashScreen.preventAutoHideAsync();

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.colors.brand.backgroundGradientEnd,
          borderTopColor: 'rgba(255, 255, 255, 0.1)',
          borderTopWidth: 1,
          paddingBottom: 8,
          paddingTop: 8,
          height: 65,
        },
        tabBarActiveTintColor: theme.colors.brand.coral,
        tabBarInactiveTintColor: 'rgba(255, 255, 255, 0.5)',
        tabBarLabelStyle: {
          fontSize: 12,
          fontFamily: theme.fontFamily.semiBold,
          marginTop: -4,
        },
      }}
    >
      <Tab.Screen 
        name="HomeTab" 
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen 
        name="MealsTab" 
        component={MealsHistoryScreen}
        options={{
          tabBarLabel: 'Meals',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="restaurant" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen 
        name="ProfileTab" 
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

function AppContent() {
  const { session, loading } = useAuth();
  const [hasOnboarded, setHasOnboarded] = React.useState<boolean | null>(null);
  const [checkingOnboarding, setCheckingOnboarding] = React.useState(false);
  const [showSplash, setShowSplash] = React.useState(true);

  React.useEffect(() => {
    // Reset onboarding state when session changes
    setHasOnboarded(null);
  }, [session?.user?.id]);

  React.useEffect(() => {
    const checkOnboarding = async () => {
      if (loading) return;

      if (!session) {
        setHasOnboarded(false);
        return;
      }

      // Prevent duplicate checks
      if (checkingOnboarding) return;
      setCheckingOnboarding(true);

      try {
        // Fetch profile from DB and check onboarding flag
        const profile = await getUserProfile();
        setHasOnboarded(profile?.onboarding_complete ?? false);
      } catch (error) {
        console.error('Error checking onboarding:', error);
        setHasOnboarded(false);
      } finally {
        setCheckingOnboarding(false);
      }
    };

    checkOnboarding();
  }, [session, loading]);

  // Initialize RevenueCat when user is authenticated
  React.useEffect(() => {
    const setupRevenueCat = async () => {
      if (session?.user?.id) {
        try {
          await initializeRevenueCat(session.user.id);
          await loginUser(session.user.id);
        } catch (error) {
          console.error('Failed to initialize RevenueCat:', error);
        }
      }
    };

    setupRevenueCat();
  }, [session?.user?.id]);

  const completeOnboarding = async () => {
    setHasOnboarded(true);
    await setOnboardingComplete(true);
  };

  // Show custom splash screen first
  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  if (loading || hasOnboarded === null) {
    return (
      <LinearGradient
        colors={[theme.colors.brand.backgroundGradientStart, theme.colors.brand.backgroundGradientEnd]}
        style={styles.loadingContainer}
      >
        <BackgroundBlobs />
        <ActivityIndicator size="large" color={theme.colors.brand.coral} />
        <RNText style={{ marginTop: theme.spacing.md, color: theme.colors.text.white }}>
          Loading...
        </RNText>
      </LinearGradient>
    );
  }

  // Return the appropriate screen based on auth/onboarding state
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: 'transparent' },
        animation: 'slide_from_right', 
      }}
    >
      {!session ? (
        // Auth flow - Terms and Privacy accessible
        <>
          <Stack.Screen 
            name="Auth" 
            component={AuthScreen}
            options={{ presentation: 'card' }}
          />
          <Stack.Screen 
            name="TermsOfService" 
            component={TermsOfServiceScreen}
            options={{ presentation: 'card', gestureEnabled: true }}
          />
          <Stack.Screen 
            name="PrivacyPolicy" 
            component={PrivacyPolicyScreen}
            options={{ presentation: 'card', gestureEnabled: true }}
          />
        </>
      ) : !hasOnboarded ? (
        // Onboarding flow
        <Stack.Screen 
          name="Onboarding" 
          options={{ presentation: 'card' }}
        >
          {(props) => <OnboardingScreen {...props} onComplete={completeOnboarding} />}
        </Stack.Screen>
      ) : (
        // Main app flow
        <>
          <Stack.Screen 
            name="Main" 
            component={MainTabs} 
            options={{ presentation: 'card' }}
          />
          <Stack.Screen 
            name="Camera" 
            component={CameraScreen} 
            options={{ presentation: 'card' }}
          />
          <Stack.Screen 
            name="Result" 
            component={ResultScreen} 
            options={{ 
              presentation: 'modal',
              gestureEnabled: true,
            }}
          />
          <Stack.Screen 
            name="Paywall" 
            component={RevenueCatPaywall}
            options={{ presentation: 'modal', gestureEnabled: true }}
          />
          <Stack.Screen 
            name="MealDetail" 
            component={MealDetailScreen}
            options={{ presentation: 'card', gestureEnabled: true }}
          />
          <Stack.Screen 
            name="TermsOfService" 
            component={TermsOfServiceScreen}
            options={{ presentation: 'card', gestureEnabled: true }}
          />
          <Stack.Screen 
            name="PrivacyPolicy" 
            component={PrivacyPolicyScreen}
            options={{ presentation: 'card', gestureEnabled: true }}
          />
           <Stack.Screen
             name="HowItWorks"
             component={HowItWorksScreen}
             options={{ presentation: 'card', gestureEnabled: true }}
           />
           <Stack.Screen
             name="Support"
             component={SupportScreen}
             options={{ presentation: 'card', gestureEnabled: true }}
           />
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    Nunito_300Light,
    Nunito_400Regular,
    Nunito_500Medium,
    Nunito_600SemiBold,
    Nunito_700Bold,
  });

  React.useEffect(() => {
    registerForPushNotificationsAsync();
  }, []);

  React.useEffect(() => {
    // Hide native splash screen once fonts are loaded
    if (fontsLoaded) {
      ExpoSplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return (
      <LinearGradient
        colors={[theme.colors.brand.backgroundGradientStart, theme.colors.brand.backgroundGradientEnd]}
        style={styles.loadingContainer}
      >
        <BackgroundBlobs />
        <ActivityIndicator size="large" color={theme.colors.brand.coral} />
      </LinearGradient>
    );
  }

  const NavigationTheme = {
    dark: true,
    colors: {
      primary: theme.colors.brand.coral,
      background: theme.colors.brand.backgroundGradientStart,
      card: theme.colors.brand.backgroundGradientEnd,
      text: theme.colors.text.white,
      border: 'rgba(255, 255, 255, 0.1)',
      notification: theme.colors.brand.coral,
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

          <StatusBar style="light" backgroundColor={theme.colors.brand.backgroundGradientStart} />

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

  