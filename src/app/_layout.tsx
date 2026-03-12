import React, { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useFontLoader } from '@/theme/fonts';
import { ToastProvider } from '@/components/ui/Toast';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/lib/supabase';
import Purchases from 'react-native-purchases';
import * as Notifications from 'expo-notifications';
import '../../global.css';

import { useSubscriptionStore } from '@/store/subscriptionStore';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import AsyncStorage from '@react-native-async-storage/async-storage';

SplashScreen.preventAutoHideAsync();

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

function useProtectedRoute(isPremium: boolean, isSubLoading: boolean): void {
    const { session, profile, isInitialized, user } = useAuthStore();
    const segments = useSegments();
    const router = useRouter();

    useEffect(() => {
        if (!isInitialized) return;

        // Only wait for subscription sync if we have a user (to decide between tabs and paywall)
        if (user && isSubLoading) return;

        const inAuthGroup = segments[0] === '(auth)';
        const inOnboardingGroup = segments[0] === '(onboarding)';
        const inLegalGroup = segments[0] === 'legal';
        const onPaywall = segments[segments.length - 1] === 'paywall';

        if (!session) {
            if (!inAuthGroup && !inLegalGroup) {
                router.replace('/(auth)');
            }
        } else if (!profile?.onboarding_complete) {
            if (!inOnboardingGroup) {
                router.replace('/(onboarding)/welcome');
            }
        } else if (!isPremium) {
            if (!onPaywall && !inLegalGroup) {
                router.replace('/(onboarding)/paywall');
            }
        } else {
            if (inAuthGroup || inOnboardingGroup) {
                router.replace('/(tabs)');
            }
        }
    }, [session, profile?.onboarding_complete, isInitialized, segments, isPremium, isSubLoading]);
}

export default function RootLayout(): React.JSX.Element | null {
    const fontsLoaded = useFontLoader();
    const { initialize, setSession, isInitialized, user } = useAuthStore();
    const { sync: syncSubscription, initializeListener, isLoading: isSubLoading, isPremium } = useSubscriptionStore();
    const segments = useSegments();
    const segmentsRef = React.useRef(segments);

    // Unified Initialization
    useEffect(() => {
        async function runInit() {
            try {
                // 1. Get last known user for RevenueCat instant hydration
                const lastUserId = await AsyncStorage.getItem('last_user_id');
                const rcKey = process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY;

                // 2. Configure Purchases immediately with identity
                if (rcKey) {
                    Purchases.configure({
                        apiKey: rcKey,
                        appUserID: lastUserId || undefined
                    });
                    initializeListener();
                }

                // 3. Await Auth (crucial for routing)
                await initialize();

                // 4. Identity Sync
                const currentUser = useAuthStore.getState().user;
                const { sync: syncSubscription, setLoading } = useSubscriptionStore.getState();

                if (currentUser?.id) {
                    // Check if identity changed since configuration
                    if (currentUser.id !== lastUserId) {
                        setLoading(true); // Re-enter loading state for new identity
                        await Purchases.logIn(currentUser.id);
                        await AsyncStorage.setItem('last_user_id', currentUser.id);
                    }
                    // Final verification of premium status for THIS user
                    await syncSubscription();
                } else {
                    await AsyncStorage.removeItem('last_user_id');
                    // Logged-out: clear loading immediately so render guard doesn't block
                    setLoading(false);
                    syncSubscription(); // background, non-blocking
                }
            } catch (error) {
                console.error('[RootLayout] Initialization error:', error);
                // SAFETY: Always clear loading so the render guard doesn't block forever
                useSubscriptionStore.getState().setLoading(false);
            }
        }

        runInit();

        // Safety fallback: Hide splash screen after 6 seconds no matter what
        const timeout = setTimeout(() => {
            SplashScreen.hideAsync().catch(() => { });
        }, 6000);

        return () => {
            clearTimeout(timeout);
        };
    }, []);

    // Session Management (Supabase listener)
    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            await setSession(session);
        });
        return () => subscription.unsubscribe();
    }, []);

    // NOTE: Subscription sync is handled inside runInit above.
    // A separate useEffect here would race against runInit and reset isLoading,
    // causing the blank screen render guard to block indefinitely.
    // Post-login syncs happen via the RevenueCat listener (initializeListener).

    useEffect(() => {
        segmentsRef.current = segments;
    }, [segments]);

    // Handle Splash Screen Hiding
    useEffect(() => {
        // Condition: We need fonts, we need Auth determination.
        // If there is a USER, we MUST wait for the sub sync to guard against paywall flickers.
        const isLoadingSub = user && isSubLoading;
        const isReady = fontsLoaded && isInitialized && !isLoadingSub;

        if (!isReady) return;

        // Instant hide 
        SplashScreen.hideAsync().catch(() => { });
    }, [fontsLoaded, isInitialized, isSubLoading, user]);

    // Subscriptions (Profile, Notifications)
    useEffect(() => {
        if (!user?.id) return;

        const profileSub = supabase
            .channel('global-profile-updates')
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${user.id}` }, (payload) => {
                if (payload.new) useAuthStore.setState({ profile: payload.new as any });
            })
            .subscribe();

        const insightSub = supabase
            .channel('global-insight-notifications')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'ai_insights', filter: `user_id=eq.${user.id}` }, (payload) => {
                const currentSegments = segmentsRef.current;
                if (currentSegments[currentSegments.length - 1] !== 'progress') {
                    Notifications.scheduleNotificationAsync({
                        content: {
                            title: 'New Gut Insight 🧠',
                            body: payload.new.title || 'Tap to see your new pattern discovery!',
                            data: { type: 'insight', id: payload.new.id },
                        },
                        trigger: null,
                    });
                }
            })
            .subscribe();

        const recipeSub = supabase
            .channel('global-recipe-notifications')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'recipes', filter: `user_id=eq.${user.id}` }, (payload) => {
                const currentSegments = segmentsRef.current;
                if (currentSegments[currentSegments.length - 1] !== 'recipes') {
                    Notifications.scheduleNotificationAsync({
                        content: {
                            title: 'New Recipe Ready 🍲',
                            body: `Try our custom: ${payload.new.title}`,
                            data: { type: 'recipe', id: payload.new.id },
                        },
                        trigger: null,
                    });
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(profileSub);
            supabase.removeChannel(insightSub);
            supabase.removeChannel(recipeSub);
        };
    }, [user?.id]);

    useProtectedRoute(isPremium, isSubLoading);

    // Render Guard: Keep native splash screen mounted until we are CERTAIN about routing
    const isLoadingSub = user && isSubLoading;
    if (!fontsLoaded || !isInitialized || isLoadingSub) return null;

    return (
        <ErrorBoundary>
            <GestureHandlerRootView style={{ flex: 1 }}>
                <StatusBar style="dark" />
                <ToastProvider>
                    <Stack screenOptions={{ headerShown: false }}>
                        <Stack.Screen name="(tabs)" />
                        <Stack.Screen name="(auth)" />
                        <Stack.Screen name="(onboarding)" />
                        <Stack.Screen name="legal/privacy" options={{ presentation: 'modal' }} />
                        <Stack.Screen name="legal/terms" options={{ presentation: 'modal' }} />
                        <Stack.Screen name="scanner/index" />
                    </Stack>
                </ToastProvider>
            </GestureHandlerRootView>
        </ErrorBoundary>
    );
}
