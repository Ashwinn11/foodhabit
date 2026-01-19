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

function AppContent() {
  const { session, loading } = useAuth();
  
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
  const [refreshKey, setRefreshKey] = React.useState(0);

  React.useEffect(() => {
    RevenueCatService.initialize();
    
    // Initialize sync service
    import('./src/services/syncService').then(({ syncService }) => {
      syncService.initialize();
    });
    
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
    } else if (!currentUserId && prevUserId && !loading) {
      RevenueCatService.logOut();
      prevSessionRef.current = null;
    }
  }, [session, loading]);

  // Load user data and onboarding status from database
  React.useEffect(() => {
    const loadData = async () => {
      if (!loading && fontsLoaded && session?.user?.id) {
        const { supabase } = await import('./src/config/supabase');
        
        // Check onboarding status from database
        const { data: userProfile } = await supabase
          .from('users')
          .select('onboarding_completed')
          .eq('id', session.user.id)
          .single();
        
        console.log('📊 Onboarding status from DB:', userProfile?.onboarding_completed);
        setOnboardingComplete(userProfile?.onboarding_completed || false);
        
        // Load other user data
        const { loadUserDataFromDatabase } = await import('./src/utils/loadUserData');
        await loadUserDataFromDatabase();
        
        setDataLoaded(true);
        setIsReady(true);
        ExpoSplashScreen.hideAsync();
      } else if (!loading && fontsLoaded && !session) {
        setIsReady(true);
        ExpoSplashScreen.hideAsync();
      }
    };
    loadData();
  }, [loading, fontsLoaded, session?.user?.id, refreshKey]); // Re-run when refreshKey changes

  if (loading || !isReady || (session && !dataLoaded)) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.pink} />
      </View>
    );
  }

  // Show auth screen if not logged in
  if (!session) {
    return <AuthNavigator />;
  }

  // Show onboarding if not complete (database is source of truth)
  if (!onboardingComplete) {
    return <OnboardingNavigator />;
  }

  // Show main app
  return <AppNavigator />;
}

export default function App() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <NavigationContainer theme={GutBuddyTheme}>
          <AppContent />
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
    backgroundColor: colors.background,
  },
});