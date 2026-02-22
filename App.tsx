import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import * as ExpoSplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Theme
import { theme } from './src/theme/theme';

// Fonts
import { Inter_400Regular, Inter_500Medium, Inter_700Bold } from '@expo-google-fonts/inter';
import { useFonts } from 'expo-font';

// State and Services
import { useAppStore } from './src/store/useAppStore';
import { supabase } from './src/config/supabase';

// Screens
import { AuthScreen } from './src/screens/AuthScreen';
import { OnboardingGoal } from './src/screens/OnboardingGoal';
import { OnboardingCondition } from './src/screens/OnboardingCondition';
import { OnboardingSymptoms } from './src/screens/OnboardingSymptoms';
import { OnboardingTriggers } from './src/screens/OnboardingTriggers';
import { OnboardingResults } from './src/screens/OnboardingResults';
import { OnboardingSocialProof } from './src/screens/OnboardingSocialProof';
import { OnboardingCustomPlan } from './src/screens/OnboardingCustomPlan';
import { HomeScreen } from './src/screens/HomeScreen';
import { ScanFoodScreen } from './src/screens/ScanFoodScreen';
import { MyGutScreen } from './src/screens/MyGutScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';

ExpoSplashScreen.preventAutoHideAsync();

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const GutBuddyTheme = {
  ...DefaultTheme,
  dark: true,
  colors: {
    ...DefaultTheme.colors,
    primary: theme.colors.coral,
    background: theme.colors.bg,
    card: theme.colors.surface,
    text: theme.colors.textPrimary,
    border: theme.colors.border,
    notification: theme.colors.coral,
  },
};

const MainTabs = () => (
  <Tab.Navigator screenOptions={{ headerShown: false, tabBarStyle: { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.border } }}>
    <Tab.Screen name="Home" component={HomeScreen} />
    <Tab.Screen name="ScanFood" component={ScanFoodScreen} />
    <Tab.Screen name="MyGut" component={MyGutScreen} />
    <Tab.Screen name="Profile" component={ProfileScreen} />
  </Tab.Navigator>
);

const OnboardingStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false, cardStyle: { backgroundColor: theme.colors.bg } }}>
    <Stack.Screen name="OnboardingGoal" component={OnboardingGoal} />
    <Stack.Screen name="OnboardingCondition" component={OnboardingCondition} />
    <Stack.Screen name="OnboardingSymptoms" component={OnboardingSymptoms} />
    <Stack.Screen name="OnboardingTriggers" component={OnboardingTriggers} />
    <Stack.Screen name="OnboardingResults" component={OnboardingResults} />
    <Stack.Screen name="OnboardingSocialProof" component={OnboardingSocialProof} />
    <Stack.Screen name="OnboardingCustomPlan" component={OnboardingCustomPlan} />
  </Stack.Navigator>
);

export default function App() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_700Bold,
  });

  const [isReady, setIsReady] = useState(false);
  const [session, setSession] = useState<any>(null);
  
  const isOnboardingCompleted = useAppStore(state => state.isOnboardingCompleted);
  const setOnboardingCompleted = useAppStore(state => state.setOnboardingCompleted);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      if (currentSession?.user) {
        checkOnboarding(currentSession.user.id);
      } else {
        setIsReady(true);
      }
    });

    supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession);
      if (currentSession?.user) {
        checkOnboarding(currentSession.user.id);
      } else {
        setIsReady(true);
      }
    });
  }, []);

  const checkOnboarding = async (userId: string) => {
    try {
      const { data } = await supabase
        .from('users')
        .select('onboarding_data')
        .eq('id', userId)
        .maybeSingle();
      
      if (data?.onboarding_data) {
        setOnboardingCompleted(true);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsReady(true);
    }
  };

  useEffect(() => {
    if (isReady && fontsLoaded) {
      ExpoSplashScreen.hideAsync();
    }
  }, [isReady, fontsLoaded]);

  if (!isReady || !fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.coral} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <NavigationContainer theme={GutBuddyTheme}>
          <Stack.Navigator screenOptions={{ headerShown: false, cardStyle: { backgroundColor: theme.colors.bg } }}>
            {!session ? (
              <Stack.Screen name="Auth" component={AuthScreen} />
            ) : !isOnboardingCompleted ? (
              <Stack.Screen name="Onboarding" component={OnboardingStack} />
            ) : (
              <Stack.Screen name="MainTabs" component={MainTabs} />
            )}
          </Stack.Navigator>
          <StatusBar style="light" translucent backgroundColor="transparent" />
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.bg,
  },
});