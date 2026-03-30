import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
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
import { PostHogProvider } from 'posthog-react-native';
import { posthog, analytics } from '@/lib/posthog';

import { useSubscriptionStore } from '@/store/subscriptionStore';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AnimatedMascot from '@/components/AnimatedMascot';
import { Text } from '@/components/ui/Text';

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
    const { sync: syncSubscription, initializeListener, isLoading: isSubLoading, hasLoaded: subHasLoaded, isPremium } = useSubscriptionStore();
    const segments = useSegments();
    const segmentsRef = React.useRef(segments);
    const [fontFallbackReady, setFontFallbackReady] = React.useState(false);

    const fontsReady = fontsLoaded || fontFallbackReady;

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
                const { sync: syncSubscription, setLoading, markLoaded, loadCachedState } = useSubscriptionStore.getState();

                if (currentUser?.id) {
                    // Check if identity changed since configuration
                    if (currentUser.id !== lastUserId) {
                        setLoading(true); // Re-enter loading state for new identity
                        await Purchases.logIn(currentUser.id);
                        await AsyncStorage.setItem('last_user_id', currentUser.id);
                    } else {
                        // Same identity, try to load cached premium state immediately!
                        await loadCachedState();
                    }

                    // Identify user in PostHog
                    const profile = useAuthStore.getState().profile;
                    analytics.userIdentified(currentUser.id, {
                        email: currentUser.email,
                        name: profile?.full_name ?? undefined,
                        plan: useSubscriptionStore.getState().isPremium ? 'premium' : 'free',
                    });

                    // Release the router guard immediately so app loads instantly
                    markLoaded();
                    // Start true sync in the background (non-blocking)
                    syncSubscription();

                } else {
                    await AsyncStorage.removeItem('last_user_id');
                    analytics.userSignedOut();
                    // Logged-out: clear loading immediately so render guard doesn't block
                    markLoaded();
                    syncSubscription(); // background, non-blocking
                }
            } catch (error) {
                console.error('[RootLayout] Initialization error:', error);
                // SAFETY: Always clear loading so the render guard doesn't block forever
                useSubscriptionStore.getState().markLoaded();
            }
        }

        runInit();

        // Safety fallback: Hide splash screen after 6 seconds no matter what
        const timeout = setTimeout(() => {
            SplashScreen.hideAsync().catch(() => { });
        }, 6000);

        // Fail open if startup state stalls. Better to render with fallback state
        // than block the app behind auth/subscription/font loading indefinitely.
        const startupTimeout = setTimeout(() => {
            if (!useAuthStore.getState().isInitialized) {
                useAuthStore.setState({
                    session: null,
                    user: null,
                    profile: null,
                    isLoading: false,
                    isInitialized: true,
                });
            }

            if (useSubscriptionStore.getState().isLoading) {
                useSubscriptionStore.getState().markLoaded();
            }

            setFontFallbackReady(true);
            SplashScreen.hideAsync().catch(() => { });
        }, 9000);

        return () => {
            clearTimeout(timeout);
            clearTimeout(startupTimeout);
        };
    }, []);

    // Session Management (Supabase listener)
    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            await setSession(session);
        });
        return () => subscription.unsubscribe();
    }, []);

    // PostHog: Re-identify whenever profile loads/changes (profile comes in after auth)
    const { profile } = useAuthStore();
    useEffect(() => {
        if (!user?.id) return;
        analytics.userIdentified(user.id, {
            email: user.email,
            name: profile?.full_name ?? undefined,
            plan: isPremium ? 'premium' : 'free',
        });
    }, [user?.id, profile?.full_name, isPremium]);

    // NOTE: Subscription sync is handled inside runInit above.
    // A separate useEffect here would race against runInit and reset isLoading,
    // causing the blank screen render guard to block indefinitely.
    // Post-login syncs happen via the RevenueCat listener (initializeListener).

    useEffect(() => {
        segmentsRef.current = segments;
    }, [segments]);

    // Handle Splash Screen Hiding
    // Unblock once: fonts loaded + auth resolved + sub has had at least one sync attempt
    useEffect(() => {
        const isReady = fontsReady && isInitialized && (!user || subHasLoaded);
        if (!isReady) return;
        SplashScreen.hideAsync().catch(() => { });
    }, [fontsReady, isInitialized, subHasLoaded, user]);

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
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'ai_insights', filter: `user_id=eq.${user.id}` }, async (payload) => {
                const currentSegments = segmentsRef.current;
                const { status } = await Notifications.getPermissionsAsync();
                const notificationsOn = useAuthStore.getState().profile?.notifications_enabled;
                if (status === 'granted' && notificationsOn && currentSegments[currentSegments.length - 1] !== 'progress') {
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
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'recipes', filter: `user_id=eq.${user.id}` }, async (payload) => {
                const currentSegments = segmentsRef.current;
                const { status } = await Notifications.getPermissionsAsync();
                const notificationsOn = useAuthStore.getState().profile?.notifications_enabled;
                if (status === 'granted' && notificationsOn && currentSegments[currentSegments.length - 1] !== 'recipes') {
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

    // Render Guard: Block until fonts + auth resolved + sub has attempted at least one sync
    if (!fontsReady || !isInitialized || (user && !subHasLoaded)) {
        return (
            <View style={{ flex: 1, backgroundColor: '#F8F7F4', alignItems: 'center', justifyContent: 'center', gap: 12, paddingHorizontal: 32 }}>
                <AnimatedMascot expression="happy" size={96} />
                <Text variant="heading" color="#2D7A52" style={{ marginTop: 8, textAlign: 'center', width: '100%' }}>Gut Buddy</Text>
                <Text variant="caption" color="#6B7280" style={{ textAlign: 'center', width: '100%' }}>Finding your triggers...</Text>
                <ActivityIndicator size="small" color="#2D7A52" style={{ marginTop: 8 }} />
            </View>
        );
    }

    return (
        <PostHogProvider client={posthog} autocapture>
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
        </PostHogProvider>
    );
}
