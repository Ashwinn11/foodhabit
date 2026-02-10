import React from 'react';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import * as ExpoSplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AppNavigator, AuthNavigator, OnboardingNavigator } from './src/navigation';
import { colors } from './src/theme';
import { useAuth } from './src/hooks/useAuth';
import { GlobalModal } from './src/components/Modal/GlobalModal';
import { GlobalToast } from './src/components/Toast/GlobalToast';
import { NotificationManager } from './src/components/NotificationManager';
import { RevenueCatService } from './src/services/revenueCatService';

import { Fredoka_400Regular, Fredoka_500Medium, Fredoka_600SemiBold, Fredoka_700Bold } from '@expo-google-fonts/fredoka';
import { useFonts } from 'expo-font';
import { analyticsService } from './src/analytics/analyticsService';

// Keep the native splash screen visible while we fetch resources
ExpoSplashScreen.preventAutoHideAsync();

// Gut Buddy Light Theme
const GutBuddyTheme = {
  ...DefaultTheme,
  dark: false,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.pink,
    background: colors.background,
    card: colors.white,
    text: colors.black,
    border: colors.border,
    notification: colors.pink,
  },
};

// Initialize RevenueCat as early as possible
RevenueCatService.initialize();

export default function App() {
  const { session, loading: authLoading } = useAuth();
  
  const [fontsLoaded] = useFonts({
    'Fredoka-Regular': Fredoka_400Regular,
    'Fredoka-Medium': Fredoka_500Medium,
    'Fredoka-SemiBold': Fredoka_600SemiBold,
    'Fredoka-Bold': Fredoka_700Bold,
  });

  const [isReady, setIsReady] = React.useState(false);
  const [dataLoaded, setDataLoaded] = React.useState(false);
  const [onboardingComplete, setOnboardingComplete] = React.useState(false);
  const [refreshKey, setRefreshKey] = React.useState(0);

  // Initialize Services
  React.useEffect(() => {
    // Listen for custom event to refresh onboarding status
    const handleRefresh = () => {
      console.log('🔄 Refreshing onboarding status...');
      setRefreshKey(prev => prev + 1);
    };
    
    // @ts-ignore - using global event emitter
    global.refreshOnboardingStatus = handleRefresh;
    
    return () => {
      // @ts-ignore
      delete global.refreshOnboardingStatus;
    };
  }, []);

  // Sync RevenueCat session & Analytics
  const prevSessionRef = React.useRef<string | null>(null);

  React.useEffect(() => {
    const currentUserId = session?.user?.id || null;
    const prevUserId = prevSessionRef.current;

    if (currentUserId && currentUserId !== prevUserId) {
      RevenueCatService.logIn(currentUserId);
      analyticsService.setUserId(currentUserId);
      prevSessionRef.current = currentUserId;
    } else if (!currentUserId && prevUserId && !authLoading) {
      RevenueCatService.logOut();
      prevSessionRef.current = null;
    }
  }, [session, authLoading]);


  // Load user data and onboarding status
  React.useEffect(() => {
    const loadData = async () => {
      // Wait for Auth and Fonts
      if (authLoading || !fontsLoaded) return;

      if (session?.user?.id) {
        try {
          const { supabase } = await import('./src/config/supabase');
          
          // Check onboarding
          const { data: userProfile } = await supabase
            .from('users')
            .select('onboarding_completed')
            .eq('id', session.user.id)
            .single();

          setOnboardingComplete(userProfile?.onboarding_completed || false);
          
          // Load other user data
          const { loadUserDataFromDatabase } = await import('./src/utils/loadUserData');
          await loadUserDataFromDatabase();
          
          // Load completed tasks from local storage
          const { useGutStore } = await import('./src/store');
          await useGutStore.getState().loadCompletedTasks();
          
          setDataLoaded(true);

          // NOTE: We do NOT force a network refresh here anymore. 
          // It's handled by the 5-min interval or the Specific Paywall screens.

        } catch (e) {
          console.error("Error loading initial data:", e);
        }
      }
      
      // We are ready to show the app (either Auth screen or Main app)
      setIsReady(true);
      await ExpoSplashScreen.hideAsync();
    };

    loadData();
  }, [authLoading, fontsLoaded, session?.user?.id, refreshKey]);

  const linking: any = {
    prefixes: ['foodhabit://'],
    config: {
      screens: {
        Main: {
          screens: {
            HomeTab: 'home',
            HistoryTab: 'history',
            InsightsTab: 'insights',
          },
        },
        AddEntry: 'add-entry',
        Notifications: 'notifications',
      },
    },
  };

  // 1. Show Loading until everything is ready
  if (!isReady || (session && !dataLoaded)) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.pink} />
      </View>
    );
  }

  // 2. Determine which Navigator to show
  const getRootComponent = () => {
    if (!session) {
      return <AuthNavigator />;
    }
    if (!onboardingComplete) {
      return <OnboardingNavigator />;
    }
    return <AppNavigator />;
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <NavigationContainer theme={GutBuddyTheme} linking={linking}>
          {getRootComponent()}
          
          <NotificationManager />
          <GlobalModal />
          <GlobalToast />
          <StatusBar style="dark" translucent backgroundColor="transparent" />
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
});