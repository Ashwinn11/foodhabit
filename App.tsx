import React from 'react';
import { View, StyleSheet, ActivityIndicator, Text as RNText } from 'react-native';
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
import { registerForPushNotificationsAsync } from './src/services/notificationService';
import { AuthScreen, ProfileScreen, HomeScreen, CameraScreen, ResultScreen, PaywallScreen, OnboardingScreen } from './src/screens';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AuthCallbackScreen from './src/screens/AuthCallbackScreen';
import { theme } from './src/theme';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.colors.brand.background,
          borderTopColor: 'rgba(255, 255, 255, 0.1)',
          borderTopWidth: 1,
          paddingBottom: 8,
          paddingTop: 8,
          height: 60,
        },
        tabBarActiveTintColor: theme.colors.brand.cream,
        tabBarInactiveTintColor: 'rgba(255, 255, 255, 0.5)',
        tabBarLabelStyle: {
          fontSize: 12,
          fontFamily: theme.fontFamily.semiBold,
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

const ONBOARDING_KEY = '@gutscan_onboarding_complete';

function AppContent() {
  const { session, loading } = useAuth();
  const [hasOnboarded, setHasOnboarded] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    checkOnboarding();
  }, []);

  const checkOnboarding = async () => {
    try {
      const value = await AsyncStorage.getItem(ONBOARDING_KEY);
      setHasOnboarded(value === 'true');
    } catch {
      setHasOnboarded(true); // Skip onboarding on error
    }
  };

  const completeOnboarding = async () => {
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    setHasOnboarded(true);
  };

  // Handle auth callback on web only
  const isWeb = typeof window !== 'undefined' && window.location;
  if (isWeb && window!.location.pathname === '/auth/callback') {
    return <AuthCallbackScreen />;
  }

  if (loading || hasOnboarded === null) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.brand.coral} />
        <RNText style={{ marginTop: theme.spacing.md, color: theme.colors.text.white }}>
          Loading...
        </RNText>
      </View>
    );
  }

  // Show onboarding first (before auth)
  if (!hasOnboarded) {
    return <OnboardingScreen onComplete={completeOnboarding} />;
  }

  if (!session) {
    return <AuthScreen />;
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.colors.brand.background },
        presentation: 'modal',
      }}
    >
      <Stack.Screen name="Main" component={MainTabs} />
      <Stack.Screen name="Camera" component={CameraScreen} />
      <Stack.Screen name="Result" component={ResultScreen} />
      <Stack.Screen 
        name="Paywall" 
        component={PaywallScreen}
        options={{ presentation: 'modal', gestureEnabled: true }}
      />
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

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.brand.coral} />
      </View>
    );
  }

  const NavigationTheme = {
    dark: true,
    colors: {
      primary: theme.colors.brand.coral,
      background: theme.colors.brand.background,
      card: theme.colors.brand.cream,
      text: theme.colors.text.white,
      border: theme.colors.brand.cream,
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
        <StatusBar style="light" backgroundColor={theme.colors.brand.background} />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: theme.colors.brand.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
});