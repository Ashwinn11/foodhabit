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

// Tab Icons
import { HomeIcon, ScanIcon, GutIcon, ProfileIcon } from './src/components/TabIcon';

// Toast provider
import { ToastProvider } from './src/components/Toast';

// Fonts
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import {
  PlayfairDisplay_700Bold,
} from '@expo-google-fonts/playfair-display';
import { useFonts } from 'expo-font';

// State and Services
import { useAppStore } from './src/store/useAppStore';
import { supabase } from './src/config/supabase';

// Auth Screen
import { AuthScreen } from './src/screens/AuthScreen';

// Onboarding Screens
import { OnboardingGoal } from './src/screens/onboarding/OnboardingGoal';
import { OnboardingCondition } from './src/screens/onboarding/OnboardingCondition';
import { OnboardingSymptoms } from './src/screens/onboarding/OnboardingSymptoms';
import { OnboardingAnalyzing } from './src/screens/onboarding/OnboardingAnalyzing';
import { OnboardingTriggers } from './src/screens/onboarding/OnboardingTriggers';
import { OnboardingHowItHelps } from './src/screens/onboarding/OnboardingHowItHelps';
import { OnboardingReviews } from './src/screens/onboarding/OnboardingReviews';
import { OnboardingFeatures } from './src/screens/onboarding/OnboardingFeatures';
import { OnboardingCustomPlan } from './src/screens/onboarding/OnboardingCustomPlan';
import { OnboardingPaywall } from './src/screens/onboarding/OnboardingPaywall';

// Main Screens
import { HomeScreen } from './src/screens/HomeScreen';
import { ScanFoodScreen } from './src/screens/ScanFoodScreen';
import { MyGutScreen } from './src/screens/MyGutScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { PrivacyPolicyScreen } from './src/screens/PrivacyPolicyScreen';

ExpoSplashScreen.preventAutoHideAsync();

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const GutBuddyTheme = {
  ...DefaultTheme,
  dark: true,
  colors: {
    ...DefaultTheme.colors,
    primary: theme.colors.primary,
    background: theme.colors.background,
    card: theme.colors.surface,
    text: theme.colors.text,
    border: theme.colors.border,
    notification: theme.colors.primary,
  },
};

const MainTabs = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: theme.colors.primary,
      tabBarInactiveTintColor: theme.colors.textTertiary,
      tabBarLabelStyle: { fontFamily: theme.fonts.medium, fontSize: 11 },
      tabBarStyle: {
        backgroundColor: theme.colors.background,
        borderTopColor: theme.colors.border,
        paddingTop: 8,
        elevation: 0,
        shadowOpacity: 0,
      },
    }}
  >
    <Tab.Screen
      name="Home"
      component={HomeScreen}
      options={{
        tabBarIcon: ({ color, size }) => <HomeIcon color={color} size={size} />,
      }}
    />
    <Tab.Screen
      name="ScanFood"
      component={ScanFoodScreen}
      options={{
        tabBarLabel: 'Scan',
        tabBarIcon: ({ color, size }) => <ScanIcon color={color} size={size} />,
      }}
    />
    <Tab.Screen
      name="MyGut"
      component={MyGutScreen}
      options={{
        tabBarLabel: 'Journal',
        tabBarIcon: ({ color, size }) => <GutIcon color={color} size={size} />,
      }}
    />
    <Tab.Screen
      name="Profile"
      component={ProfileScreen}
      options={{
        tabBarLabel: 'Profile',
        tabBarIcon: ({ color, size }) => <ProfileIcon color={color} size={size} />,
      }}
    />
  </Tab.Navigator>
);

const OnboardingStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
      cardStyle: { backgroundColor: theme.colors.background },
    }}
  >
    <Stack.Screen name="OnboardingGoal" component={OnboardingGoal} />
    <Stack.Screen name="OnboardingCondition" component={OnboardingCondition} />
    <Stack.Screen name="OnboardingSymptoms" component={OnboardingSymptoms} />
    <Stack.Screen name="OnboardingAnalyzing" component={OnboardingAnalyzing} />
    <Stack.Screen name="OnboardingTriggers" component={OnboardingTriggers} />
    <Stack.Screen name="OnboardingHowItHelps" component={OnboardingHowItHelps} />
    <Stack.Screen name="OnboardingReviews" component={OnboardingReviews} />
    <Stack.Screen name="OnboardingFeatures" component={OnboardingFeatures} />
    <Stack.Screen name="OnboardingCustomPlan" component={OnboardingCustomPlan} />
    <Stack.Screen name="OnboardingPaywall" component={OnboardingPaywall} />
  </Stack.Navigator>
);

export default function App() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    PlayfairDisplay_700Bold,
  });

  const [isReady, setIsReady] = useState(false);
  const [session, setSession] = useState<any>(null);

  const isOnboardingCompleted = useAppStore((state) => state.isOnboardingCompleted);
  const setOnboardingCompleted = useAppStore((state) => state.setOnboardingCompleted);
  const updateOnboardingAnswers = useAppStore((state) => state.updateOnboardingAnswers);
  const resetOnboarding = useAppStore((state) => state.resetOnboarding);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      if (currentSession?.user) {
        checkOnboarding(currentSession.user.id);
      } else {
        setIsReady(true);
      }
    });

    supabase.auth.onAuthStateChange((event, currentSession) => {
      setSession(currentSession);
      if (currentSession?.user) {
        checkOnboarding(currentSession.user.id);
      } else {
        if (event === 'SIGNED_OUT') {
          resetOnboarding();
        }
        setIsReady(true);
      }
    });
  }, []);

  const checkOnboarding = async (userId: string) => {
    try {
      const { data } = await supabase
        .from('users')
        .select('onboarding_completed, onboarding_data')
        .eq('id', userId)
        .maybeSingle();

      if (data?.onboarding_completed && data?.onboarding_data) {
        let answers = data.onboarding_data;
        let dirty = false;

        // Migration A: derive avoidFoods from knownTriggers if missing.
        if (!answers.avoidFoods?.length && answers.knownTriggers?.length) {
          answers = { ...answers, avoidFoods: answers.knownTriggers };
          dirty = true;
        }

        // Migration B: derive safeFoods via AI.
        // _sfDerived flag ensures this only ever runs once per user.
        if (!answers._sfDerived && answers.knownTriggers?.length) {
          try {
            const testFoods = [
              ...answers.knownTriggers,
              'Rice', 'Chicken breast', 'Oatmeal', 'Apples', 'Bread',
            ];
            const { data: fn } = await supabase.functions.invoke('analyze-food', {
              body: {
                foods: testFoods,
                userCondition: answers.condition ?? '',
                userSymptoms: (answers.symptoms ?? []).join(', '),
                userTriggers: answers.knownTriggers.join(', '),
              },
            });
            const safe = (fn?.results ?? [])
              .filter((r: any) => r.level === 'safe')
              .map((r: any) => r.normalizedName as string);
            answers = { ...answers, safeFoods: safe, _sfDerived: true };
          } catch {
            answers = { ...answers, _sfDerived: true };
          }
          dirty = true;
        }

        if (dirty) {
          await supabase
            .from('users')
            .update({ onboarding_data: answers })
            .eq('id', userId);
        }

        // Strip internal migration flags before putting data into the typed store
        const { _sfDerived: _ignored, ...storeAnswers } = answers;
        updateOnboardingAnswers(storeAnswers);
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
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <ToastProvider>
          <NavigationContainer theme={GutBuddyTheme}>
            <Stack.Navigator
              screenOptions={{
                headerShown: false,
                cardStyle: { backgroundColor: theme.colors.background },
              }}
            >
              {!session ? (
                <>
                  <Stack.Screen name="Auth" component={AuthScreen} />
                  <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
                </>
              ) : !isOnboardingCompleted ? (
                <Stack.Screen name="Onboarding" component={OnboardingStack} />
              ) : (
                <>
                  <Stack.Screen name="MainTabs" component={MainTabs} />
                  <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
                </>
              )}
            </Stack.Navigator>
            <StatusBar style="light" translucent backgroundColor="transparent" />
          </NavigationContainer>
        </ToastProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.background,
  },
});
