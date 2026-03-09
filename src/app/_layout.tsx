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
    const { session, profile, isInitialized } = useAuthStore();
    const segments = useSegments();
    const router = useRouter();

    useEffect(() => {
        if (!isInitialized || isSubLoading) return;

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

    // Initializations
    useEffect(() => {
        initialize();
        const cleanupListener = initializeListener();

        // Safety fallback: Hide splash screen after 5 seconds no matter what
        const timeout = setTimeout(() => {
            SplashScreen.hideAsync().catch(() => { });
        }, 5000);

        return () => {
            cleanupListener();
            clearTimeout(timeout);
        };
    }, []);

    // Session Management
    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            await setSession(session);
        });
        return () => subscription.unsubscribe();
    }, []);

    // RevenueCat Configure
    useEffect(() => {
        const rcKey = process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY;
        if (rcKey) {
            Purchases.configure({ apiKey: rcKey });
            syncSubscription(); // Initial sync
        }
    }, []);

    // Sync Subscription when user changes
    useEffect(() => {
        if (user?.id) {
            Purchases.logIn(user.id)
                .then(() => syncSubscription())
                .catch(console.error);
        } else {
            syncSubscription();
        }
    }, [user?.id]);

    useEffect(() => {
        segmentsRef.current = segments;
    }, [segments]);

    // Handle Splash Screen
    useEffect(() => {
        if (fontsLoaded && isInitialized && !isSubLoading) {
            SplashScreen.hideAsync();
        }
    }, [fontsLoaded, isInitialized, isSubLoading]);

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

    if (!fontsLoaded || !isInitialized) return null;

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
