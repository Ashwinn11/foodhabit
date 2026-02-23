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

// Fonts
import { Inter_400Regular, Inter_500Medium, Inter_700Bold } from '@expo-google-fonts/inter';
import { 
  PlayfairDisplay_400Regular, 
  PlayfairDisplay_500Medium, 
  PlayfairDisplay_600SemiBold, 
  PlayfairDisplay_700Bold,
  PlayfairDisplay_400Regular_Italic 
} from '@expo-google-fonts/playfair-display';
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
    primary: theme.colors.primary,
    background: theme.colors.background,
    card: theme.colors.surface,
    text: theme.colors.text.primary,
    border: theme.colors.border,
    notification: theme.colors.secondary,
  },
};

const MainTabs = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: theme.colors.primary,
      tabBarInactiveTintColor: theme.colors.text.secondary,
      tabBarLabelStyle: { fontFamily: theme.typography.fonts.medium, fontSize: 11 },
      tabBarStyle: {
        backgroundColor: theme.colors.background,
        borderTopColor: theme.colors.divider,
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
        tabBarLabel: 'My Gut',
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
            <Stack.Navigator screenOptions={{ headerShown: false, cardStyle: { backgroundColor: theme.colors.background } }}>
  
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
    PlayfairDisplay_400Regular,
    PlayfairDisplay_500Medium,
    PlayfairDisplay_600SemiBold,
    PlayfairDisplay_700Bold,
    PlayfairDisplay_400Regular_Italic,
  });

  const [isReady, setIsReady] = useState(false);
  const [session, setSession] = useState<any>(null);
  
  const isOnboardingCompleted = useAppStore(state => state.isOnboardingCompleted);
  const setOnboardingCompleted = useAppStore(state => state.setOnboardingCompleted);
  const updateOnboardingAnswers = useAppStore(state => state.updateOnboardingAnswers);
  const resetOnboarding = useAppStore(state => state.resetOnboarding);

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

        // Migration B: derive safeFoods via AI (same call as OnboardingTriggers).
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
            // AI unavailable — safe list stays empty; user discovers via scanning
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

          <NavigationContainer theme={GutBuddyTheme}>

            <Stack.Navigator screenOptions={{ headerShown: false, cardStyle: { backgroundColor: theme.colors.background } }}>

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

      backgroundColor: theme.colors.background,

    },

    loadingContainer: {

      flex: 1,

      alignItems: 'center',

      justifyContent: 'center',

      backgroundColor: theme.colors.background,

    },

  });

  