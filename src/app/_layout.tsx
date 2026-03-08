import React, { useEffect } from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useFontLoader } from '@/theme/fonts';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/lib/supabase';
import Purchases from 'react-native-purchases';
import { useSubscription } from '@/hooks/useSubscription';
import '../../global.css';

SplashScreen.preventAutoHideAsync();

function useProtectedRoute(isPremium: boolean, isSubLoading: boolean): void {
    const { session, profile, isInitialized } = useAuthStore();
    const segments = useSegments();
    const router = useRouter();

    useEffect(() => {
        if (!isInitialized || isSubLoading) return;

        const inAuthGroup = segments[0] === '(auth)';
        const inOnboardingGroup = segments[0] === '(onboarding)';
        const onPaywall = segments[segments.length - 1] === 'paywall';

        if (!session) {
            if (!inAuthGroup) {
                router.replace('/(auth)');
            }
        } else if (!profile?.onboarding_complete) {
            if (!inOnboardingGroup) {
                router.replace('/(onboarding)/welcome');
            }
        } else if (!isPremium) {
            // HARD PAYWALL: Onboarding complete but no subscription
            if (!onPaywall) {
                router.replace('/(onboarding)/paywall');
            }
        } else {
            // Authenticated, Onboarding complete AND Premium
            if (inAuthGroup || inOnboardingGroup) {
                router.replace('/(tabs)');
            }
        }
    }, [session, profile, isInitialized, segments, isPremium, isSubLoading]);
}

export default function RootLayout(): React.JSX.Element | null {
    const fontsLoaded = useFontLoader();
    const { initialize, setSession, isInitialized } = useAuthStore();

    useEffect(() => {
        initialize();
    }, []);

    // Listen for auth state changes
    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            await setSession(session);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    // Initialize RevenueCat
    useEffect(() => {
        const initRC = async (): Promise<void> => {
            const rcKey = process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY;
            if (rcKey) {
                Purchases.configure({ apiKey: rcKey });
            }
        };
        initRC();
    }, []);

    // RevenueCat login when user is authenticated
    const { user } = useAuthStore();
    useEffect(() => {
        if (user?.id) {
            Purchases.logIn(user.id).catch(console.error);
        }
    }, [user?.id]);

    const { isPremium, isLoading: isSubLoading } = useSubscription();

    useEffect(() => {
        if (fontsLoaded && isInitialized && !isSubLoading) {
            SplashScreen.hideAsync();
        }
    }, [fontsLoaded, isInitialized, isSubLoading]);

    useProtectedRoute(isPremium, isSubLoading);

    if (!fontsLoaded || !isInitialized) {
        return null;
    }

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <StatusBar style="dark" />
            <Slot />
        </GestureHandlerRootView>
    );
}
