import React, { useState, useEffect } from 'react';
import { View, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { useRouter, useNavigation } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import RevenueCatUI from 'react-native-purchases-ui';
import * as Notifications from 'expo-notifications';
import { useAuthStore } from '@/store/authStore';
import { colors } from '@/theme';

export default function PaywallScreen(): React.JSX.Element {
    const router = useRouter();
    const navigation = useNavigation();
    const { updateProfile } = useAuthStore();
    const [finishing, setFinishing] = useState(false);

    const completeOnboarding = async (): Promise<void> => {
        setFinishing(true);
        try {
            await updateProfile({ onboarding_complete: true });
            Notifications.scheduleNotificationAsync({
                content: {
                    title: "You're All Set! 🎉",
                    body: "Welcome to Gut Buddy Pro. We're ready to find your triggers.",
                },
                trigger: null,
            });
            router.replace('/(tabs)');
        } catch (error) {
            console.error('Onboarding complete error:', error);
            router.replace('/(tabs)');
        }
    };

    return (
        <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.bg }}>
            {/* Native RevenueCat Paywall */}
            <RevenueCatUI.Paywall
                options={{
                    displayCloseButton: true,
                }}
                onDismiss={() => {
                    if (navigation.canGoBack()) {
                        router.back();
                    } else {
                        // Fallback to the plan screen if no history
                        router.replace('/(onboarding)/plan');
                    }
                }}
                onPurchaseCompleted={completeOnboarding}
                onRestoreCompleted={completeOnboarding}
            />
            {finishing && (
                <View style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(255,255,255,0.7)', justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color={colors.primary.DEFAULT} />
                </View>
            )}
        </SafeAreaView>
    );
}
