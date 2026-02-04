import React from 'react';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import * as ExpoSplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AppNavigator, AuthNavigator, OnboardingNavigator } from './src/navigation';
import { SubscriptionRequiredScreen } from './src/screens/SubscriptionRequiredScreen';
import { colors } from './src/theme';
import { useAuth } from './src/hooks/useAuth';
import { GlobalModal } from './src/components/Modal/GlobalModal';
import { GlobalToast } from './src/components/Toast/GlobalToast';
import { NotificationManager } from './src/components/NotificationManager';
import { RevenueCatService } from './src/services/revenueCatService';

import { useFonts, Chewy_400Regular } from '@expo-google-fonts/chewy';
import { Fredoka_400Regular, Fredoka_500Medium, Fredoka_600SemiBold, Fredoka_700Bold } from '@expo-google-fonts/fredoka';

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
    'Chewy': Chewy_400Regular,
    'Fredoka-Regular': Fredoka_400Regular,
    'Fredoka-Medium': Fredoka_500Medium,
    'Fredoka-SemiBold': Fredoka_600SemiBold,
    'Fredoka-Bold': Fredoka_700Bold,
  });

  const [isReady, setIsReady] = React.useState(false);
  const [dataLoaded, setDataLoaded] = React.useState(false);
  const [onboardingComplete, setOnboardingComplete] = React.useState(false);
  const [isPremium, setIsPremium] = React.useState(false);
  const [hadPreviousAccess, setHadPreviousAccess] = React.useState(false);
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

  // Sync RevenueCat session
  const prevSessionRef = React.useRef<string | null>(null);
  
  React.useEffect(() => {
    const currentUserId = session?.user?.id || null;
    const prevUserId = prevSessionRef.current;
    
    if (currentUserId && currentUserId !== prevUserId) {
      RevenueCatService.logIn(currentUserId);
      prevSessionRef.current = currentUserId;
    } else if (!currentUserId && prevUserId && !authLoading) {
      RevenueCatService.logOut();
      prevSessionRef.current = null;
    }
  }, [session, authLoading]);

  // Reactive premium status check (No more polling!)
  React.useEffect(() => {
    if (!session?.user?.id) return;

    // Listen for real-time changes from RevenueCat (Webhooks-style)
    const unsubscribe = RevenueCatService.addCustomerInfoUpdateListener((customerInfo: any) => {
      console.log('💎 RevenueCat: CustomerInfo updated');
      const { REVENUECAT_PAYWALL_ID } = require('./src/services/revenueCatService');
      const hasPremium = customerInfo.entitlements.active[REVENUECAT_PAYWALL_ID] !== undefined;
      
      if (hasPremium !== isPremium) {
        console.log(`💎 Premium status changed: ${hasPremium}`);
        setIsPremium(hasPremium);
        // Force a data reload to update the navigation state
        setRefreshKey(prev => prev + 1);
      }
    });

    return () => unsubscribe();
  }, [session?.user?.id, isPremium]);

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
          
          // Check premium (CACHED - way faster)
          const premiumStatus = await RevenueCatService.isPremium(false);
          setIsPremium(premiumStatus);
          
          // Hard paywall enforcement
          if (userProfile?.onboarding_completed && !premiumStatus) {
            setHadPreviousAccess(true);
            setOnboardingComplete(false);
          } else {
            setHadPreviousAccess(false);
            setOnboardingComplete(userProfile?.onboarding_completed || false);
          }
          
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
    if (hadPreviousAccess && !isPremium) {
      return <SubscriptionRequiredScreen />;
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